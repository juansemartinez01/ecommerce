import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Producto } from './producto.entity';

@Entity()
export class ImagenProducto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string; // URL completa de Cloudinary

  @ManyToOne(() => Producto, producto => producto.imagenes, { onDelete: 'CASCADE' })
  producto: Producto;
}
