import { Controller, Get, Query } from '@nestjs/common'
import { Public } from 'src/common/decorators'
import { SearchService } from './search.service'

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Public()
  @Get('/')
  search(@Query('value') value: string) {
    return this.searchService.search(value)
  }
}
