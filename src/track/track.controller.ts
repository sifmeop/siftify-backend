import { Controller, Get } from '@nestjs/common'
import { Public } from 'src/common/decorators'
import { TrackService } from './track.service'

@Controller('track')
export class TrackController {
  constructor(private readonly trackService: TrackService) {}

  @Public()
  @Get('/all')
  getAllTracks() {
    return this.trackService.getAllTracks()
  }
}
