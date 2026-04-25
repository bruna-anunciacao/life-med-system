import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  private readonly SENSITIVE_KEYS = new Set([
    'password',
    'confirmPassword',
    'currentPassword',
    'newPassword',
    'token',
    'accessToken',
    'refreshToken',
    'secret',
    'authorization',
  ]);

  private sanitizeBody(body: Record<string, unknown>): Record<string, unknown> {
    if (!body || typeof body !== 'object' || Array.isArray(body)) return body;
    const sanitized = { ...body };
    for (const key of Object.keys(sanitized)) {
      if (this.SENSITIVE_KEYS.has(key)) sanitized[key] = '[REDACTED]';
    }
    return sanitized;
  }

  private pickHeaders(headers: Record<string, unknown>) {
    const SAFE = ['content-type', 'user-agent', 'origin', 'referer', 'accept'];
    return Object.fromEntries(
      SAFE.filter((k) => headers[k] !== undefined).map((k) => [k, headers[k]]),
    );
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const { method, url, body, ip } = req;
    const startTime = Date.now();

    let bodyStr = '[unserializable]';
    try {
      bodyStr = JSON.stringify(
        this.sanitizeBody(body as Record<string, unknown>),
      );
    } catch {}

    this.logger.log(
      `[REQUEST]  ${method} ${url} | IP: ${ip} | Headers: ${JSON.stringify(this.pickHeaders(req.headers as Record<string, unknown>))} | Body: ${bodyStr}`,
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const res = context.switchToHttp().getResponse();
          this.logger.log(
            `[RESPONSE] ${method} ${url} | Status: ${res.statusCode} | ${Date.now() - startTime}ms`,
          );
        },
        error: (err: { status?: number; message?: string }) => {
          this.logger.warn(
            `[RESPONSE] ${method} ${url} | Status: ${err?.status ?? 500} | ${Date.now() - startTime}ms | Error: ${err?.message}`,
          );
        },
      }),
    );
  }
}
