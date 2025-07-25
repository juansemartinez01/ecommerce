// src/auth/auth.controller.ts
import { Controller, Post, Req, Body, UseGuards, Get, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Request } from 'express';
import { Public } from './isPublic';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registro')
  async registro(
    @Body('nombre') nombre: string,
    @Body('email') email: string,
    @Body('clave') clave: string,
  ) {
    return this.authService.registrar(nombre, email, clave);
  }

  @Public()
@Post('login')
async login(
  @Body('email') email: string,
  @Body('clave') clave: string,
) {
  const user = await this.authService.validateUser(email, clave);

  if (!user) {
    throw new UnauthorizedException('Credenciales inválidas');
  }

  return this.authService.login(user);
}


  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: Request) {
    return req.user;
  }
}
