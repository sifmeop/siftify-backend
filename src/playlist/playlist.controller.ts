import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { GetCurrentUserId } from 'src/common/decorators'
import { PlaylistService } from './playlist.service'

@Controller('playlist')
export class PlaylistController {
  constructor(private readonly playlistService: PlaylistService) {}

  @Get()
  getAllMediaLibrary(@GetCurrentUserId() userId: string) {
    return this.playlistService.getAllPlaylists(userId)
  }

  @Get(':id')
  getPlaylistById(
    @GetCurrentUserId() userId: string,
    @Param('id') playlistId: string
  ) {
    return this.playlistService.getPlaylistById(userId, playlistId)
  }

  @Post()
  createPlaylist(@GetCurrentUserId() userId: string) {
    return this.playlistService.createPlaylist(userId)
  }

  @Put()
  togglePinPlaylist(
    @GetCurrentUserId() userId: string,
    @Body() body: { playlistId: string; isFixed: boolean }
  ) {
    return this.playlistService.togglePinPlaylist(userId, body)
  }

  @Delete()
  deletePlaylist(
    @GetCurrentUserId() userId: string,
    @Body() body: { playlistId: string }
  ) {
    return this.playlistService.deletePlaylist(userId, body.playlistId)
  }
}
