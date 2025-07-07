import { Body, Controller, Get, Post } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { ConfirmarPedidoDto } from './dto/confirmar-pedido.dto';

@Controller('pedidos')
export class PedidosController {
  constructor(private readonly service: PedidosService) {}

  @Post()
  confirmar(@Body() dto: ConfirmarPedidoDto) {
    return this.service.confirmarPedido(dto);
  }

  @Get()
  listarTodos() {
    return this.service.listarTodos();
  }
}
