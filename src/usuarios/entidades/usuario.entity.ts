import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Carrito } from 'src/carrito/entidades/carrito.entity';

@Entity()
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  nombre: string;

  @Column()
  claveHash: string;

  @OneToMany(() => Carrito, carrito => carrito.usuario)
  carritos: Carrito[];
}
