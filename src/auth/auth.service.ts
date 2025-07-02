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

  async registrar(nombre: string, email: string, clave: string) {
    const existente = await this.usuarioRepo.findOneBy({ email });
    if (existente) throw new UnauthorizedException('Email ya registrado');

    const claveHash = await bcrypt.hash(clave, 10);
    const nuevoUsuario = this.usuarioRepo.create({ nombre, email, claveHash });
    const usuario = await this.usuarioRepo.save(nuevoUsuario);

    return {
      token: this.jwtService.sign({ sub: usuario.id, email }),
    };
  }

  async login(email: string, clave: string) {
    const usuario = await this.usuarioRepo.findOneBy({ email });
    if (!usuario) throw new UnauthorizedException('Credenciales inválidas');

    const esValido = await bcrypt.compare(clave, usuario.claveHash);
    if (!esValido) throw new UnauthorizedException('Credenciales inválidas');

    return {
      token: this.jwtService.sign({ sub: usuario.id, email }),
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
