import { Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Usuario } from 'src/usuarios/entidades/usuario.entity';
import { CarritoItem } from './carrito-item.entity';

@Entity()
export class Carrito {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Usuario, usuario => usuario.carritos)
  usuario: Usuario;

  @OneToMany(() => CarritoItem, item => item.carrito, { cascade: true })
  items: CarritoItem[];
}
