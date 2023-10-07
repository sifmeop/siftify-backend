import { createParamDecorator } from '@nestjs/common'
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host'

export const GetCurrentUserId = createParamDecorator(
  (data: undefined, context: ExecutionContextHost): string => {
    const request = context.switchToHttp().getRequest()
    return request.user['sub']
  }
)
