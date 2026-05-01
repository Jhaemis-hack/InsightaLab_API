import { StatusCodes } from "http-status-codes";
import { createJwtToken, createRefreshToken, hash } from "../../helpers/refreshToken";
import { customUnathorizedError } from "../../utils/custom_errors";
import refresh from "./models/refresh";
import staffProfile from "./models/staff";
import { verifyCodeChallenge } from "../../helpers/pkce";
import dotenv from "dotenv";
import { GitHubTokenResponse, GitHubUser } from "../../libs/types/globalTypes";
import { v7 as uuid7 } from "uuid";
import RequestService from "../../utils/request";
import axios from "axios";

dotenv.config();

export class AuthService {
  GITHUB_CLIENT_ID;
  GITHUB_CLIENT_SECRET;
  request;

  constructor() {
    this.GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
    this.GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!;
    this.request = new RequestService();
  }

  async handleWebCallback(code: string) {
    const backendCallbackUrl = `${process.env.BACKEND_URL}/auth/github/callback`;

    const githubToken = await this.#exchangeCodeForGitHubToken(code, backendCallbackUrl);
    const githubUser = await this.#fetchGitHubUser(githubToken);
    const user = await this.#upsertUser(githubUser);
    const { accessToken, refreshToken } = await this.#issueBothTokens(user);

    return {
      status_code: StatusCodes.OK,
      status: "success",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url,
        role: user.role,
      },
    };
  }

  async handleCliCallback(params: {
    code: string;
    code_verifier: string;
    code_challenge: string;
    redirect_uri: string;
  }) {
    const { code, code_verifier, code_challenge, redirect_uri } = params;

    // Verify PKCE — code_verifier must match code_challenge
    const pkceValid = verifyCodeChallenge(code_verifier, code_challenge);
    if (!pkceValid) {
      return {
        status_code: StatusCodes.UNAUTHORIZED,
        status: "error",
        message: "Invalid PKCE verification",
      };
    }

    const githubToken = await this.#exchangeCodeForGitHubToken(code, redirect_uri);
    const githubUser = await this.#fetchGitHubUser(githubToken);
    const user = await this.#upsertUser(githubUser);

    const { accessToken, refreshToken } = await this.#issueBothTokens(user);

    return {
      status_code: StatusCodes.OK,
      status: "success",
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url,
        role: user.role,
      },
    };
  }

  async refreshTokenAuthService(payload: any, refreshToken: string) {
    const tokenHash = await hash(refreshToken);
    const storedToken = await refresh.findOne({
      tokenHash,
      jti: payload?.jti,
      tokenExpiresAt: { $gt: new Date() },
    });

    if (!storedToken) {
      await refresh.findOneAndUpdate({ userId: payload.sub, tokenHash, jti: payload?.jti }, { revoked: true });
      return { success: false, message: "Token reuse detected" };
    }

    storedToken.revoked = true;
    storedToken.revokedAt = new Date();
    await storedToken.save();

    const staff = await staffProfile.findOne({ id: payload.sub });

    if (!staff) {
      throw customUnathorizedError("UnAuthorized staff");
    }

    const newJTI = crypto.randomUUID();
    const newRefreshToken = createRefreshToken({
      sub: staff.id,
      jti: newJTI,
    });

    await refresh.create({
      userId: staff.id,
      jti: newJTI,
      revoked: false,
      tokenHash: await hash(newRefreshToken),
      tokenExpiresAt: storedToken.tokenExpiresAt,
    });

    const token = createJwtToken({ sub: staff.id, username: staff.username, role: staff.role });

    return { success: true, message: "success", newRefreshToken, accessToken: token };
  }

  async logout(userId: string) {
    await refresh.findOneAndUpdate({ userId, revoked: false }, { revoked: true });

    return { status_code: StatusCodes.OK, status: "success", message: "Logged out successfully" };
  }

  async getMe(userId: string) {
    const user = await staffProfile.findOne({ id: userId });
    if (!user) {
      return {
        status_code: StatusCodes.NOT_FOUND,
        status: "error",
        message: "User not found",
      };
    }
    return {
      status_code: StatusCodes.OK,
      status: "success",
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url,
        role: user.role,
        is_active: user.is_active,
        created_at: user.created_at,
      },
    };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  async #exchangeCodeForGitHubToken(code: string, redirectUri: string): Promise<string> {
    const response = await axios.post<GitHubTokenResponse>(
      "https://github.com/login/oauth/access_token",
      {
        client_id: this.GITHUB_CLIENT_ID,
        client_secret: this.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
      },
      { headers: { Accept: "application/json" } },
    );

    if (!response?.data?.access_token) {
      throw new Error("GitHub did not return an access token");
    }

    return response.data?.access_token;
  }

  async #fetchGitHubUser(githubToken: string): Promise<GitHubUser> {
    const response = await axios.get<GitHubUser>("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github+json",
      },
    });
    return response.data;
  }

  async #upsertUser(githubUser: GitHubUser) {
    let staff = await staffProfile.findOne({ github_id: String(githubUser.id) });

    if (!staff) {
      staff = await staffProfile.create({
        id: uuid7(),
        github_id: String(githubUser.id),
        username: githubUser.login,
        email: githubUser.email,
        avatar_url: githubUser.avatar_url,
        role: "analyst",
      });
    } else {
      // Keep user info in sync with GitHub
      staff.username = githubUser.login;
      staff.email = githubUser.email!;
      staff.avatar_url = githubUser.avatar_url;
      await staff.save();
    }

    return staff;
  }

  async #issueBothTokens(staff: InstanceType<typeof staffProfile>) {
    const accessToken = createJwtToken({ sub: staff.id, username: staff.username, role: staff.role });

    const presentDate = new Date();
    const next7Days = presentDate.setDate(presentDate.getDate() + 7);
    const newJTI = crypto.randomUUID();
    const newRefreshToken = createRefreshToken({
      sub: staff.id,
      jti: newJTI,
    });

    await refresh.create({
      userId: staff.id,
      jti: newJTI,
      revoked: false,
      tokenHash: await hash(newRefreshToken),
      tokenExpiresAt: next7Days,
    });

    return { accessToken, refreshToken: newRefreshToken };
  }
}
