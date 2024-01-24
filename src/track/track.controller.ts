import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { GetCurrentUserId } from 'src/common/decorators'
import { TrackService } from './track.service'

@Controller('track')
export class TrackController {
  constructor(private readonly trackService: TrackService) {}

  @Get('/')
  getTrack(@Query('trackId') trackId: string) {
    return this.trackService.getTrack(trackId)
  }

  @Get('/all')
  getAllTracks(@GetCurrentUserId() userId: string) {
    return this.trackService.getAllTracks(userId)
  }

  @Post('/listening')
  listeningTrack(@Body() body: { id: string }) {
    return this.trackService.listeningTrack(body.id)
  }

  @Get('/favorites')
  getFavoriteTracks(@GetCurrentUserId() userId: string) {
    return this.trackService.getFavoriteTracks(userId)
  }

  @Post('/favorite/add')
  addTrackToFavorites(
    @GetCurrentUserId() userId: string,
    @Body() body: { trackId: string }
  ) {
    return this.trackService.addTrackToFavorites(userId, body.trackId)
  }

  @Post('/favorite/remove')
  removeTrackFromFavorites(
    @GetCurrentUserId() userId: string,
    @Body() body: { trackId: string }
  ) {
    return this.trackService.removeTrackFromFavorites(userId, body.trackId)
  }
}
