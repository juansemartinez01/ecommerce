import { Expose, Type } from 'class-transformer';
import { PedidoItemDto } from './pedido-item.dto';

export class PedidoDto {
  @Expose()
  id: number;

  @Expose()
  total: number;

  @Expose()
  estado: string;

  @Expose()
  fechaHora: Date;

  // 🧾 Ítems del pedido
  @Expose()
  @Type(() => PedidoItemDto)
  items: PedidoItemDto[];

  // 👤 Datos del cliente
  @Expose()
  nombreCliente?: string;

  @Expose()
  apellidoCliente?: string;

  @Expose()
  emailCliente?: string;

  @Expose()
  telefonoCliente?: string;

  // 🏠 Datos de envío
  @Expose()
  nombreEnvio?: string;

  @Expose()
  direccionEnvio?: string;

  @Expose()
  codigoPostalEnvio?: string;

  @Expose()
  ciudadEnvio?: string;

  @Expose()
  provinciaEnvio?: string;

  @Expose()
  aclaracionesEnvio?: string;

  @Expose()
metodoPago: string;

@Expose()
estadoPago: string;

@Expose()
estadoPedido: string;

}
