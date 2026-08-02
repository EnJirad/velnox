import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

export interface UploadResult {
  url: string;
  publicId: string;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

@Injectable()
export class UploadsService {
  private configured = false;

  constructor(private readonly configService: ConfigService) {}

  private ensureConfigured() {
    if (this.configured) return;
    cloudinary.config({
      cloud_name: this.configService.get<string>('app.cloudinary.name'),
      api_key: this.configService.get<string>('app.cloudinary.key'),
      api_secret: this.configService.get<string>('app.cloudinary.secret'),
    });
    this.configured = true;
  }

  async uploadImage(file: Express.Multer.File | undefined, folder: string): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('No file was uploaded');
    }
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG, PNG, WEBP, or GIF images are allowed');
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException('Image must be 5MB or smaller');
    }

    this.ensureConfigured();

    return new Promise<UploadResult>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: `velnox/${folder}`, resource_type: 'image' },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error('Cloudinary upload failed'));
            return;
          }
          resolve({ url: result.secure_url, publicId: result.public_id });
        },
      );
      stream.end(file.buffer);
    });
  }
}
