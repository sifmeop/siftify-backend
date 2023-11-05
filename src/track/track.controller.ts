import { Body, Controller, Get, Post } from '@nestjs/common'
import { Public } from 'src/common/decorators'
import { FavoriteTrackDto } from 'src/types/track.interface'
import { TrackService } from './track.service'

@Controller('track')
export class TrackController {
  constructor(private readonly trackService: TrackService) {}

  @Public()
  @Get('/all')
  getAllTracks() {
    return this.trackService.getAllTracks()
  }

  @Public()
  @Post('/favorite/add')
  addTrackToFavorites(@Body() body: FavoriteTrackDto) {
    return this.trackService.addTrackToFavorites(body)
  }

  @Public()
  @Post('/favorite/remove')
  removeTrackFromFavorites(@Body() body: { id: string }) {
    return this.trackService.removeTrackFromFavorites(body.id)
  }
}
