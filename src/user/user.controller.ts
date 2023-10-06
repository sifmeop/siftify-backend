import { Controller, Get, Param } from '@nestjs/common'
import { Public } from 'src/auth/auth.guard'
import { UserService } from './user.service'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Get()
  getUsers() {
    return 'asd'
  }

  @Get(':id')
  getUser(@Param() id: string) {
    return this.userService.getUser(id)
  }
}
