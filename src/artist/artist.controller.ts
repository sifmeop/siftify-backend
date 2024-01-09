import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query
} from '@nestjs/common'
import { Artist, User } from '@prisma/client'
import { GetCurrentUserId, Public } from 'src/common/decorators'
import { ArtistService } from './artist.service'
import { CreateArtistDto } from './dto'

@Controller('artist')
export class ArtistController {
  constructor(private readonly artistService: ArtistService) {}

  @Public()
  @Get('/')
  getArtist(@Query('artistId') artistId: string) {
    return this.artistService.getArtist(artistId)
  }

  @Get('/all')
  getAllArtists(): Promise<Artist[]> {
    return this.artistService.getAllArtists()
  }

  @Post('/')
  @HttpCode(HttpStatus.OK)
  createArtist(
    @Body() body: CreateArtistDto,
    @GetCurrentUserId() userId: string
  ): Promise<User> {
    return this.artistService.createArtist(body, userId)
  }
}
