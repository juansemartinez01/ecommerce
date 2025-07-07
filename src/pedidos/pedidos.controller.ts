import { Body, Controller, Get, Param, Post } from '@nestjs/common';
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

  @Post('cancelar/:id')
async cancelar(@Param('id') id: number) {
  return this.service.cancelarPedido(+id);
}
}
