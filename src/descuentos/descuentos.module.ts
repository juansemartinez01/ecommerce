import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Descuento } from './entidades/descuento.entity';
import { DescuentosService } from './descuentos.service';
import { DescuentosController } from './descuentos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Descuento])],
  providers: [DescuentosService],
  controllers: [DescuentosController],
})
export class DescuentosModule {}
