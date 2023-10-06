import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { Upload, UploadMetaInfo } from 'src/types/upload.interface'
import { UploadService } from './upload.service'

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'poster', maxCount: 1 },
        { name: 'audio', maxCount: 1 }
      ],
      {
        storage: diskStorage({
          destination: (req, file, callback) => {
            callback(null, './public')
          },
          filename: (req, file, callback) => {
            const filename = file.originalname
            callback(null, filename)
          }
        })
      }
    )
  )
  uploadMusic(
    @UploadedFile() files: Upload,
    @Body() artistDto: UploadMetaInfo
  ) {
    return this.uploadService.uploadMusic(artistDto)
  }
}
