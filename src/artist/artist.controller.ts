import { Controller, Get, Query } from '@nestjs/common'
import { Public } from 'src/common/decorators'
import { ArtistService } from './artist.service'

@Controller('artist')
export class ArtistController {
  constructor(private readonly artistService: ArtistService) {}

  @Public()
  @Get('/')
  getAllTracks(@Query('artistId') artistId: string) {
    return this.artistService.getArtist(artistId)
  }
}
