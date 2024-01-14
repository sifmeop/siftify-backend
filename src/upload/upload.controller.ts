import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors
} from '@nestjs/common'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { GetCurrentUserId } from 'src/common/decorators'
import { Upload, UploadDtoBody } from 'src/types/upload.interface'
import { UploadService } from './upload.service'

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('/track')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'cover', maxCount: 1 },
        { name: 'tracksFiles', maxCount: 30 }
      ],
      {
        storage: diskStorage({
          destination: (req, file, callback) => {
            callback(null, './public/temporarily-uploads')
          },
          filename: (req, file, callback) => {
            const filename = file.originalname
            callback(null, filename)
          }
        })
      }
    )
  )
  uploadTrack(
    @GetCurrentUserId() userId: string,
    @UploadedFiles() files: Upload,
    @Body() artistDto: UploadDtoBody
  ) {
    return this.uploadService.uploadTrack(userId, files, artistDto)
  }
}
