import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthenticatedRequestUser } from '../types/authenticated-request-user';

interface JwtAccessPayload {
  sub: string;
  email: string;
  role: AuthenticatedRequestUser['role'];
}

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt-access') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('app.jwt.secret')!,
    });
  }

  validate(payload: JwtAccessPayload): AuthenticatedRequestUser {
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
