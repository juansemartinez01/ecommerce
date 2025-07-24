// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from 'src/usuarios/entidades/usuario.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario) private usuarioRepo: Repository<Usuario>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
  console.log('🔍 Email recibido:', email);
  const user = await this.usuarioRepo.findOneBy({ email });
  console.log('👤 Usuario encontrado:', user);

  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.claveHash);
  console.log('🔐 Password válido:', isValid);

  if (!isValid) return null;

  const { claveHash, ...rest } = user;
  console.log('✅ Login exitoso:', rest);
  return rest;
}


  async login(user: any) {
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async registrar(nombre: string, email: string, clave: string) {
    const existente = await this.usuarioRepo.findOneBy({ email });
    if (existente) throw new UnauthorizedException('Email ya registrado');

    const claveHash = await bcrypt.hash(clave, 10);
    const nuevoUsuario = this.usuarioRepo.create({ nombre, email, claveHash });
    const usuario = await this.usuarioRepo.save(nuevoUsuario);

    const payload = { sub: usuario.id, email };
    return {
      access_token: this.jwtService.sign(payload),
      user: usuario,
    };
  }

  async validarUsuario(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepo.findOneBy({ id });
    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    return usuario;
  }
}
