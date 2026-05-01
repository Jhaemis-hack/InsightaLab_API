import { Request, Response } from "express";
import mongoose from "mongoose";
import { controllerError, customBadRequestError, customUnathorizedError } from "../../utils/custom_errors";
import { StatusCodes } from "http-status-codes";
import { createJwtToken, verifyRefreshToken } from "../../helpers/refreshToken";
import { AuthService } from "./auth.service";

const authService = new AuthService();

export const redirectToGitHub = (req: Request, res: Response) => {
  try {
    const { source, state, code_challenge, redirect_uri } = req.query as Record<string, string>;

    if (!state) throw customBadRequestError("Missing state parameter");

    const params = new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID!,
      redirect_uri: `${process.env.BACKEND_URL}/auth/github/callback`,
      scope: "read:user user:email",
      state,
    });

    // Store source + pkce context in a short-lived session cookie
    // so the callback handler knows what to do
    res.cookie("oauth_source", source ?? "web", { httpOnly: true, maxAge: 10 * 60 * 1000 });
    res.cookie("oauth_state", state, { httpOnly: true, maxAge: 10 * 60 * 1000 });
    res.cookie("oauth_code_challenge", code_challenge ?? "", { httpOnly: true, maxAge: 10 * 60 * 1000 });
    res.cookie("oauth_redirect_uri", redirect_uri ?? "", { httpOnly: true, maxAge: 10 * 60 * 1000 });

    return res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
  } catch (error: any) {
    controllerError(res, error);
  }
};

// ─── GET /auth/github/callback ────────────────────────────────────────────────
// GitHub always redirects here. We branch on source cookie.

export const handleGitHubCallback = async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query as { code: string; state: string };

    // Validate state matches what we stored
    const storedState = req.cookies?.oauth_state;
    if (!state || state !== storedState) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: "error",
        message: "Invalid OAuth state — possible CSRF attempt",
      });
    }

    const source = req.cookies?.oauth_source ?? "web";
    const codeChallenge = req.cookies?.oauth_code_challenge ?? "";
    const redirectUri = req.cookies?.oauth_redirect_uri ?? "";

    // Clear the short-lived oauth cookies
    res.clearCookie("oauth_source");
    res.clearCookie("oauth_state");
    res.clearCookie("oauth_code_challenge");
    res.clearCookie("oauth_redirect_uri");

    if (source === "cli") {
      // CLI: redirect back to localhost with code + challenge
      // The CLI's local server captures this and calls POST /auth/cli/callback
      const callbackParams = new URLSearchParams({
        code,
        code_challenge: codeChallenge,
      });
      return res.redirect(`${redirectUri}?${callbackParams.toString()}`);
    }

    // Web: exchange code here and set HTTP-only cookies
    const response = await authService.handleWebCallback(code);
    const { status_code, accessToken, refreshToken, ...rest } = response as any;

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      path: "/api/auth/refresh/token",
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    return res.redirect(`${process.env.WEB_PORTAL_URL}/dashboard`);
  } catch (error: any) {
    controllerError(res, error);
  }
};

// ─── POST /auth/cli/callback ──────────────────────────────────────────────────
// Called by the CLI after it captures the localhost redirect.
// Body: { code, code_verifier, code_challenge, redirect_uri }

export const handleCliCallback = async (req: Request, res: Response) => {
  try {
    const { code, code_verifier, code_challenge, redirect_uri } = req.body;

    if (!code) throw customBadRequestError("Missing code");
    if (!code_verifier) throw customBadRequestError("Missing code_verifier");
    if (!code_challenge) throw customBadRequestError("Missing code_challenge");
    if (!redirect_uri) throw customBadRequestError("Missing redirect_uri");

    const response = await authService.handleCliCallback({
      code,
      code_verifier,
      code_challenge,
      redirect_uri,
    });

    const statusCode = response.status_code;
    delete (response as any).status_code;
    return res.status(statusCode ?? StatusCodes.OK).json(response);
  } catch (error: any) {
    controllerError(res, error);
  }
};

export const authenticateRefreshToken = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const refreshToken = req?.cookies?.refresh_token ?? req?.body?.refresh_token;

    if (!refreshToken) {
      throw customUnathorizedError("Authentication required");
    }

    const payload = verifyRefreshToken(refreshToken);

    if (!payload?.jti || !payload?.sub) {
      throw customUnathorizedError("Invalid refresh token");
    }

    const data = await authService.refreshTokenAuthService(payload, refreshToken);

    if (!data.success) {
      throw customUnathorizedError(data.message);
    }

    res.cookie("refresh_token", data.newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      path: "/api/auth/refresh/token",
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    res.cookie("access_token", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    const response = {
      status: "success",
      message: "Access token refreshed.",
    };
    return res.status(StatusCodes.OK).json(response);
  } catch (error: any) {
    await session.abortTransaction();
    controllerError(res, error);
  } finally {
    await session.endSession();
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.sub;

    if (!userId) throw customBadRequestError("Not authenticated");

    const response = await authService.logout(userId);
    const statusCode = response.status_code;
    delete (response as any).status_code;

    // Clear web cookies if present
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

    return res.status(statusCode ?? StatusCodes.OK).json(response);
  } catch (error: any) {
    controllerError(res, error);
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.sub;
    if (!userId) throw customBadRequestError("Not authenticated");

    const response = await authService.getMe(userId);
    const statusCode = response.status_code;
    delete (response as any).status_code;
    return res.status(statusCode ?? StatusCodes.OK).json(response);
  } catch (error: any) {
    controllerError(res, error);
  }
};
