import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { ConfirmarPedidoDto } from './dto/confirmar-pedido.dto';
import { UpdateEstadoPedidoDto } from './dto/update-estado-pedido.dto';

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

  @Patch(':id/estado')
  actualizarEstado(
    @Param('id') id: string,
    @Body() dto: UpdateEstadoPedidoDto,
  ) {
    return this.service.actualizarEstado(+id, dto.estado);
  }

  @Post('cancelar/:id')
  async cancelar(@Param('id') id: number) {
    return this.service.cancelarPedido(+id);
  }
}
