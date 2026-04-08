import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

const REQUEST_USER_KEY = 'requestUser';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser | undefined => {
    const request = context.switchToHttp().getRequest<Request>();

    return (request as Request & Record<string, unknown>)[
      REQUEST_USER_KEY
    ] as AuthenticatedUser | undefined;
  },
);

export { REQUEST_USER_KEY };
