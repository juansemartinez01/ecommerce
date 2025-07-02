import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('registro')
  async registro(
    @Body('nombre') nombre: string,
    @Body('email') email: string,
    @Body('clave') clave: string,
  ) {
    return this.service.registrar(nombre, email, clave);
  }

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('clave') clave: string,
  ) {
    return this.service.login(email, clave);
  }
}
