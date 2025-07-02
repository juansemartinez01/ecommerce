import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ProductoTalle } from './producto-talle.entity';

@Entity()
export class Talle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nombre: string; // XS, S, M, L, etc.

  @OneToMany(() => ProductoTalle, pt => pt.talle)
  productos: ProductoTalle[];
}
