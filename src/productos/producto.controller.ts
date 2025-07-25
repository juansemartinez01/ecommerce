import { Controller, Get, Post, Body, Param, Query, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { FiltroProductoDto } from './dto/filtro-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { Public } from 'src/auth/isPublic';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { Categoria } from './entidades/categoria.entity';
import { Color } from './entidades/color.entity';
import { CreateColorDto } from './dto/create-color.dto';
import { Talle } from './entidades/talle.entity';
import { CreateTalleDto } from './dto/create-talle.dto';

@Controller('productos')
export class ProductosController {
  constructor(private readonly service: ProductosService) {}

  @Post()
  crear(@Body() dto: CreateProductoDto) {
    return this.service.crearProducto(dto);
  }

  @Public()
  @Get()
  listar(@Query() filtros: FiltroProductoDto) {
    return this.service.listar(filtros);
  }

  

  @Public()
  @Get('talles/all')
  obtenerTalles() {
    return this.service.obtenerTalles();
  }

  @Public()
  @Get('colores/all')
  obtenerColores() {
    return this.service.obtenerColores();
  }

  @Public()
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

  //Categoria
  @Post('categorias')
  crearCategoria(@Body() dto: CreateCategoriaDto): Promise<Categoria> {
    return this.service.crearCategoria(dto);
  }

  @Patch('categorias/:id/baja')
  borrarCategoriaLogica(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.borrarCategoriaLogicamente(id);
  }

  @Public()
  @Get('categorias/activas')
  getCategoriasActivas(): Promise<Categoria[]> {
    return this.service.obtenerCategoriasActivas();
  }

  @Public()
  @Get('categorias/all')
  obtenerCategorias() {
    return this.service.obtenerCategorias();
  }

  //Colores

  @Post('colores')
crearColor(@Body() dto: CreateColorDto): Promise<Color> {
  return this.service.crearColor(dto);
}

@Patch('colores/:id/baja')
borrarColor(@Param('id', ParseIntPipe) id: number): Promise<void> {
  return this.service.borrarColorLogicamente(id);
}

@Public()
@Get('colores/activos')
getColoresActivos(): Promise<Color[]> {
  return this.service.obtenerColoresActivos();
}

@Public()
@Get('colores/all')
getColoresTodos(): Promise<Color[]> {
  return this.service.obtenerColores();
}

//Talles

@Post('talles')
crearTalle(@Body() dto: CreateTalleDto): Promise<Talle> {
  return this.service.crearTalle(dto);
}

@Patch('talles/:id/baja')
borrarTalle(@Param('id', ParseIntPipe) id: number): Promise<void> {
  return this.service.borrarTalleLogicamente(id);
}

@Public()
@Get('talles/activos')
getTallesActivos(): Promise<Talle[]> {
  return this.service.obtenerTallesActivos();
}

@Public()
@Get('talles/all')
getTallesTodos(): Promise<Talle[]> {
  return this.service.obtenerTalles();
}
}
