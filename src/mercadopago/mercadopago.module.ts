import { Module } from '@nestjs/common';
import { MercadoPagoController } from './mercadopago.controller';

@Module({
  controllers: [MercadoPagoController],
})
export class MercadoPagoModule {}
