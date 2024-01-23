import { Controller, Get, Param } from '@nestjs/common'
import { GetCurrentUserId } from 'src/common/decorators'
import { AlbumService } from './album.service'

@Controller('album')
export class AlbumController {
  constructor(private readonly albumService: AlbumService) {}

  @Get(':id')
  getAlbumById(@GetCurrentUserId() userId: string, @Param('id') id: string) {
    return this.albumService.getAlbumById(userId, id)
  }
}
