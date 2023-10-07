import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  ValidationArguments,
  ValidationOptions,
  registerDecorator
} from 'class-validator'

export class SignUpDto {
  @IsNotEmpty({ message: 'Почта не должна быть пуста' })
  @IsEmail()
  email: string

  @IsNotEmpty({ message: 'Username не должен быть пустым' })
  @IsString()
  @MinLength(4)
  @MaxLength(10)
  username: string

  @IsNotEmpty({ message: 'Пароль не должен быть пустым' })
  @IsString()
  @MinLength(8, { message: 'Пароль должен содержать минимум 8 символов' })
  @MaxLength(24, { message: 'Пароль должен содержать максимум 24 символов' })
  password: string

  @IsNotEmpty({ message: 'Пароль не должен быть пустым' })
  @IsString()
  @MinLength(8, { message: 'Пароль должен содержать минимум 8 символов' })
  @MaxLength(24, { message: 'Пароль должен содержать максимум 24 символов' })
  @IsEqualTo('password', {
    message: 'Пароль и подтверждение пароля должны совпадать'
  })
  confirmPassword: string
}

export class SignInDto {
  @IsNotEmpty({ message: 'Почта не должна быть пуста' })
  @IsEmail()
  email: string

  @IsNotEmpty({ message: 'Пароль не должен быть пустым' })
  @IsString()
  @MinLength(8, { message: 'Пароль должен содержать минимум 8 символов' })
  @MaxLength(24, { message: 'Пароль должен содержать максимум 24 символов' })
  password: string
}

function IsEqualTo(property: string, validationOptions?: ValidationOptions) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      name: 'isEqualTo',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints
          const relatedValue = (args.object as unknown)[relatedPropertyName]
          return value === relatedValue
        }
      }
    })
  }
}
