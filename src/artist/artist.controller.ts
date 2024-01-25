import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors
} from '@nestjs/common'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import { Artist, User } from '@prisma/client'
import { diskStorage } from 'multer'
import { GetCurrentUserId } from 'src/common/decorators'
import { IUploadCover } from 'src/types/upload.interface'
import { ArtistService } from './artist.service'
import { CreateArtistDto } from './dto'

@Controller('artist')
export class ArtistController {
  constructor(private readonly artistService: ArtistService) {}

  @Get('/')
  getArtist(@Query('artistId') artistId: string) {
    return this.artistService.getArtist(artistId)
  }

  @Get('/top-tracks')
  getTopTracks(@Query('artistId') artistId: string) {
    return this.artistService.getTopTracks(artistId)
  }

  @Get('/all')
  getAllArtists(): Promise<Artist[]> {
    return this.artistService.getAllArtists()
  }

  @Post('/')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'cover', maxCount: 1 }], {
      storage: diskStorage({
        destination: (req, file, callback) => {
          callback(null, `./public/temporarily-uploads`)
        },
        filename: (req, file, callback) => {
          const filename = file.originalname
          callback(null, filename)
        }
      })
    })
  )
  @HttpCode(HttpStatus.OK)
  createArtist(
    @GetCurrentUserId() userId: string,
    @UploadedFiles() file: IUploadCover,
    @Body() body: CreateArtistDto
  ): Promise<User> {
    return this.artistService.createArtist(body, file, userId)
  }
}
