import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { CarritoService } from './carrito.service';
import { AddCarritoItemDto } from './dto/add-carrito-item.dto';

@Controller('carrito')
export class CarritoController {
  constructor(private readonly service: CarritoService) {}

  @Get(':usuarioId')
  obtenerCarrito(@Param('usuarioId') usuarioId: string) {
    const usuario = { id: +usuarioId } as any;
    return this.service.obtenerCarrito(usuario);
  }

  @Post(':usuarioId/agregar')
  agregarItem(@Param('usuarioId') usuarioId: string, @Body() dto: AddCarritoItemDto) {
    const usuario = { id: +usuarioId } as any;
    return this.service.agregarItem(usuario, dto);
  }

  @Delete(':usuarioId/eliminar/:itemId')
  eliminarItem(@Param('usuarioId') usuarioId: string, @Param('itemId') itemId: string) {
    const usuario = { id: +usuarioId } as any;
    return this.service.eliminarItem(usuario, +itemId);
  }
}
