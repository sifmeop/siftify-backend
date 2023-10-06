import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { Role } from 'src/enums/role.enum'
import { SignInType } from 'src/types/sign-up.type'
import { PrismaService } from '../prisma/prisma.service'
import { SignUpDto } from './dto'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const user = await this.prisma.user.findFirst({
      where: { email: signUpDto.email }
    })

    if (user) {
      throw new HttpException(
        `Email ${signUpDto.email} already exists`,
        HttpStatus.CONFLICT
      )
    }

    let uId = 1

    const lastUser = await this.prisma.user.findFirst({
      orderBy: { uId: 'desc' }
    })

    if (lastUser) uId = lastUser.uId + 1

    const payload = { sub: uId, username: signUpDto.username }

    const newUser = await this.prisma.user.create({
      data: {
        uId,
        email: signUpDto.email,
        role: Role.User,
        username: signUpDto.username,
        password: await bcrypt.hash(signUpDto.password, 10),
        access_token: await this.jwtService.signAsync(payload)
      }
    })

    return newUser
  }

  async signIn(signInDto: SignInType) {
    return ''
  }

  async logout() {
    return ''
  }

  async refreshTokens() {
    return ''
  }
}
