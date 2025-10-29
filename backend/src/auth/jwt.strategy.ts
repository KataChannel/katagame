import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    });
  }

  async validate(payload: any) {
    const player = await this.prisma.player.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        username: true,
        email: true,
        level: true,
        resources: true,
      },
    });

    if (!player) {
      throw new UnauthorizedException('Invalid token');
    }

    return player;
  }
}
