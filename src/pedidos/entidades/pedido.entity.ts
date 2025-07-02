import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { Usuario } from 'src/usuarios/entidades/usuario.entity';
import { PedidoItem } from './pedido-item.entity';

@Entity()
export class Pedido {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Usuario, usuario => usuario.id)
  usuario: Usuario;

  @OneToMany(() => PedidoItem, item => item.pedido, { cascade: true })
  items: PedidoItem[];

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column({ default: 'Pendiente' })
  estado: string;

  @CreateDateColumn()
  fechaHora: Date;
}
