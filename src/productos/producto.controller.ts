import { Controller, Get, Post, Body, Param, Query, Patch, Delete } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { FiltroProductoDto } from './dto/filtro-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@Controller('productos')
export class ProductosController {
  constructor(private readonly service: ProductosService) {}

  @Post()
  crear(@Body() dto: CreateProductoDto) {
    return this.service.crearProducto(dto);
  }

  @Get()
  listar(@Query() filtros: FiltroProductoDto) {
    return this.service.listar(filtros);
  }

  @Get('categorias/all')
  obtenerCategorias() {
    return this.service.obtenerCategorias();
  }

  @Get('talles/all')
  obtenerTalles() {
    return this.service.obtenerTalles();
  }

  @Get('colores/all')
  obtenerColores() {
    return this.service.obtenerColores();
  }

  @Get(':id')
  obtenerPorId(@Param('id') id: string) {
    return this.service.obtenerPorId(+id);
  }

  @Patch(':id')
  actualizar(@Param('id') id: number, @Body() dto: UpdateProductoDto) {
    return this.service.modificarProducto(id, dto);
  }

  @Delete(':id')
  eliminar(@Param('id') id: number) {
    return this.service.eliminarProducto(id);
  }
}
