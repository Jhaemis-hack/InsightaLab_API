import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

export async function CloudImageUpload(file: any, folder: any) {
  return new Promise(resolve => {
    cloudinary.uploader.upload(
      file,
      {
        resource_type: "auto",
        folder: folder,
      },
      (err, result: any) => {
        if (!err) {
          resolve({
            url: result.url,
            public_id: result.public_id,
          });
        } else {
          throw err;
        }
      },
    );
  }).catch(error => {
    throw error;
  });
}
