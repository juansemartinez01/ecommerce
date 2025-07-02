import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entidades/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario])],
  exports: [TypeOrmModule], // 👈 exportamos para que lo use el módulo auth
})
export class UsuariosModule {}
