import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors
} from '@nestjs/common'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { Upload, UploadArtistDto } from 'src/types/upload.interface'
import { UploadService } from './upload.service'

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('/track')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'cover', maxCount: 1 },
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
  uploadTrack(
    @UploadedFiles() files: Upload,
    @Body() artistDto: UploadArtistDto
  ) {
    return this.uploadService.uploadTrack(files, artistDto)
  }
}
