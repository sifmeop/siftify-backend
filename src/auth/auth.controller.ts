import { Body, Controller, Post } from '@nestjs/common'
import { SignInType } from 'src/types/sign-up.type'
import { Public } from './auth.guard'
import { AuthService } from './auth.service'
import { SignUpDto } from './dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/sign-up')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto)
  }

  @Post('/sign-in')
  signIn(@Body() signInDto: SignInType) {
    return this.authService.signIn(signInDto)
  }

  @Post('/logout')
  logout() {
    return this.authService.logout()
  }

  @Post('/refresh')
  refreshTokens() {
    return this.authService.refreshTokens()
  }
}
