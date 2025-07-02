import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Pedido } from './pedido.entity';
import { Producto } from 'src/productos/entidades/producto.entity';
import { Talle } from 'src/productos/entidades/talle.entity';

@Entity()
export class PedidoItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Pedido, pedido => pedido.items, { onDelete: 'CASCADE' })
  pedido: Pedido;

  @ManyToOne(() => Producto)
  producto: Producto;

  @ManyToOne(() => Talle)
  talle: Talle;

  @Column('int')
  cantidad: number;

  @Column('decimal', { precision: 10, scale: 2 })
  precioUnitario: number;
}
