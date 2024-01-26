import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFiles,
  UseInterceptors
} from '@nestjs/common'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { GetCurrentUserId } from 'src/common/decorators'
import { IEditPlaylist, IEditPlaylistFile } from 'src/types/playlist.interface'
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

  @Post('/track/add')
  addTrackToPlaylist(@Body() body: { playlistId: string; trackId: string }) {
    return this.playlistService.addTrackToPlaylist(body)
  }

  @Delete('/track/remove')
  removeTrackFromPlaylist(
    @Body() body: { playlistId: string; trackId: string }
  ) {
    return this.playlistService.removeTrackFromPlaylist(body)
  }

  @Put('/edit')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'cover', maxCount: 1 }], {
      storage: diskStorage({
        destination: (req, file, callback) => {
          if (file) {
            callback(null, `./public/temporarily-uploads`)
          }
        },
        filename: (req, file, callback) => {
          if (file) {
            const filename = file.originalname
            callback(null, filename)
          }
        }
      })
    })
  )
  editPlaylist(
    @UploadedFiles() file: IEditPlaylistFile,
    @GetCurrentUserId() userId: string,
    @Body() body: IEditPlaylist
  ) {
    return this.playlistService.editPlaylist(userId, body, file)
  }
}
