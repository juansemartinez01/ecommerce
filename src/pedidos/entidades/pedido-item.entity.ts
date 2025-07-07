import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Pedido } from './pedido.entity';
import { ProductoColorTalle } from 'src/productos/entidades/producto-color-talle.entity';

@Entity()
export class PedidoItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Pedido, pedido => pedido.items, { onDelete: 'CASCADE' })
  pedido: Pedido;

  @ManyToOne(() => ProductoColorTalle)
  productoCombinacion: ProductoColorTalle;

  @Column('int')
  cantidad: number;

  @Column('decimal', { precision: 10, scale: 2 })
  precioUnitario: number;
}
