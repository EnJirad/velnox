import {
  BadRequestException,
  Controller,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';

const ALLOWED_FOLDERS = ['products', 'avatars', 'shops'];

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder = 'products',
  ) {
    if (!ALLOWED_FOLDERS.includes(folder)) {
      throw new BadRequestException('Invalid upload folder');
    }
    return this.uploadsService.uploadImage(file, folder);
  }
}
