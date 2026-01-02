import { NextFunction, Request, Response } from "express";
import multer from "multer";
import path from "path";
// import { errorResMsg } from "../lib/response.js";

//multer config
const storage = multer.diskStorage({});

const fileFilter = (req: Request, file: Express.Multer.File, cb: (error: Error | null, acceptFile?: boolean) => void) => {
    let ext = path.extname(file.originalname).toLowerCase();
    if (ext != ".jpg" && ext != ".jpeg" && ext != ".png") {
        cb(new Error("File type not supported"), false);
        return;
    }
    cb(null, true);
};

const limits = {
  fileSize: 1024 * 500, // 5 kb
};

const upload = multer({ storage, fileFilter, limits });

export const uploadMiddleware = (req: Request, res: Response, next: NextFunction, upload: any) => {
  upload(req, res, function (err:any) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
    //   return errorResMsg(res, 400, err.message);
    } else if (err) {
      // An unknown error occurred when uploading.
    //   return errorResMsg(res, 400, err.message);
    }
    // Everything went fine.
    next();
  });
};

export default upload;
