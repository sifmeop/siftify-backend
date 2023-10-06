import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength
} from 'class-validator'

export class SignUpDto {
  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  @MaxLength(10)
  username: string

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(25)
  password: string

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(25)
  @Matches('password')
  confirmPassword: string
}
