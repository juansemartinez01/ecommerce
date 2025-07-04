import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Carrito } from './carrito.entity';
import { ProductoColorTalle } from 'src/productos/entidades/producto-color-talle.entity';

@Entity()
export class CarritoItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Carrito, carrito => carrito.items, { onDelete: 'CASCADE' })
  carrito: Carrito;

  @ManyToOne(() => ProductoColorTalle, { eager: true })
  productoCombinacion: ProductoColorTalle;

  @Column('int')
  cantidad: number;
}
