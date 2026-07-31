import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UploadsService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(file: Express.Multer.File) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'velnox',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve({
            url: result?.secure_url,
            publicId: result?.public_id,
          });
        }
      );

      uploadStream.end(file.buffer);
    });
  }
}
