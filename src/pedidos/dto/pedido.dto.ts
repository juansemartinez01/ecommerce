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

  @Expose()
  @Type(() => PedidoItemDto)
  items: PedidoItemDto[];
}
