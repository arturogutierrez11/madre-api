import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class InternalApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const apiKey = request.headers['x-internal-api-key'];

    if (!apiKey) {
      throw new UnauthorizedException('Internal API key missing');
    }

    if (apiKey !== process.env.INTERNAL_API_KEY) {
      throw new UnauthorizedException('Invalid internal API key');
    }

    return true;
  }
}
