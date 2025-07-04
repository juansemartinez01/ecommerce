import { Controller, Post, Get, UseGuards, Req } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('pedidos')
@UseGuards(JwtAuthGuard)
export class PedidosController {
  constructor(private readonly service: PedidosService) {}

  @Post()
  confirmar(@Req() req) {
    return this.service.confirmarPedido(req.user);
  }

  @Get()
  listar(@Req() req) {
    return this.service.obtenerPedidos(req.user);
  }
}
