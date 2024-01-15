import { Controller, Get, Param } from '@nestjs/common'
import { AlbumService } from './album.service'

@Controller('album')
export class AlbumController {
  constructor(private readonly albumService: AlbumService) {}

  @Get(':id')
  getAlbumById(@Param('id') id: string) {
    return this.albumService.getAlbumById(id)
  }
}
