import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './database/typeorm.config';

import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ProductosModule } from './productos/productos.module';
import { CarritoModule } from './carrito/carrito.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { DescuentosModule } from './descuentos/descuentos.module';
import { FilesModule } from './files/files.module';
import { ConfigModule } from '@nestjs/config';
import { MercadoPagoModule } from './mercadopago/mercadopago.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UsuariosModule,
    ProductosModule,
    CarritoModule,
    PedidosModule,
    DescuentosModule,
    FilesModule,
    MercadoPagoModule,
  ],
})
export class AppModule {}
