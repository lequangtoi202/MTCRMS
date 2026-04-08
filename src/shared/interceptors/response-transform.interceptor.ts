import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface ResponseBody<T> {
  message?: string;
  data?: T;
  meta?: Record<string, unknown>;
}

@Injectable()
export class ResponseTransformInterceptor<T>
  implements NestInterceptor<T, unknown>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();

    return next.handle().pipe(
      map((body: T | ResponseBody<T>) => {
        if (
          typeof body === 'object' &&
          body !== null &&
          ('data' in body || 'message' in body || 'meta' in body)
        ) {
          const typedBody = body as ResponseBody<T>;

          return {
            success: true,
            message: typedBody.message ?? 'Request successful',
            data: typedBody.data ?? null,
            meta: typedBody.meta ?? null,
            timestamp: new Date().toISOString(),
            path: request.url,
          };
        }

        return {
          success: true,
          message: 'Request successful',
          data: body,
          meta: null,
          timestamp: new Date().toISOString(),
          path: request.url,
        };
      }),
    );
  }
}
