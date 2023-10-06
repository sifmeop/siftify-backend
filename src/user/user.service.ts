import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUser(id: string) {
    return await this.prisma.user.findFirst({
      where: { id }
    })
  }
}
