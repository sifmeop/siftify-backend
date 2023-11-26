import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { GetCurrentUserId, Public } from 'src/common/decorators'
import { TrackService } from './track.service'

@Controller('track')
export class TrackController {
  constructor(private readonly trackService: TrackService) {}

  @Public()
  @Get('/')
  getTrack(@Query('trackId') trackId: string) {
    return this.trackService.getTrack(trackId)
  }

  @Public()
  @Get('/all')
  getAllTracks(@Query('userId') userId: string) {
    return this.trackService.getAllTracks(userId)
  }

  @Public()
  @Post('/listening')
  listeningTrack(@Body() body: { id: string }) {
    return this.trackService.listeningTrack(body.id)
  }

  @Post('/favorite/add')
  addTrackToFavorites(
    @GetCurrentUserId() userId: string,
    @Body() body: { trackId: string }
  ) {
    return this.trackService.addTrackToFavorites(userId, body.trackId)
  }

  @Post('/favorite/remove')
  removeTrackFromFavorites(@Body() body: { id: string }) {
    return this.trackService.removeTrackFromFavorites(body.id)
  }
}
