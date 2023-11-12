import { Controller, Get, Param } from '@nestjs/common'
import { Public } from 'src/common/decorators'
import { ArtistService } from './artist.service'

@Controller('artist')
export class ArtistController {
  constructor(private readonly artistService: ArtistService) {}

  @Public()
  @Get('/:id')
  getAllTracks(@Param('id') id: string) {
    return this.artistService.getArtist(id)
  }
}
