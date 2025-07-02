import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';
import { Usuario } from 'src/usuarios/entidades/usuario.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'secreto_jwt', // 🔐 reemplazar con .env en producción
    });
  }

  async validate(payload: { sub: number }): Promise<Usuario> {
    return this.authService.validarUsuario(payload.sub);
  }
}
