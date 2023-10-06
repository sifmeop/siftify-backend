import { User } from '@prisma/client'

export type SignUpType = Omit<User, 'uId' | 'role' | 'id' | 'created_at'> & {
  confirmPassword: string
}

export type SignInType = Pick<User, 'email' | 'password'>
