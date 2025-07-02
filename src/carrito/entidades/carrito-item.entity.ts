import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Carrito } from './carrito.entity';
import { Producto } from 'src/productos/entidades/producto.entity';
import { Talle } from 'src/productos/entidades/talle.entity';

@Entity()
export class CarritoItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Carrito, carrito => carrito.items, { onDelete: 'CASCADE' })
  carrito: Carrito;

  @ManyToOne(() => Producto)
  producto: Producto;

  @ManyToOne(() => Talle)
  talle: Talle;

  @Column('int')
  cantidad: number;
}
