import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete,
  UseGuards,
  ParseIntPipe 
} from '@nestjs/common';
import { TurnosService } from './turnos.service';
import { CreateTurnoDto } from './dto/create-turno.dto';
import { UpdateTurnoDto } from './dto/update-turno.dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards/auth.guards';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('turnos')
@UseGuards(JwtAuthGuard)
export class TurnosController {
  constructor(private readonly turnosService: TurnosService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin', 'recepcion')
  create(@Body() createTurnoDto: CreateTurnoDto) {
    return this.turnosService.create(createTurnoDto);
  }

  @Get()
  findAll() {
    return this.turnosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.turnosService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'recepcion')
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateTurnoDto: UpdateTurnoDto
  ) {
    return this.turnosService.update(id, updateTurnoDto);
  }

  @Patch(':id/checkin')
  @UseGuards(RolesGuard)
  @Roles('admin', 'recepcion', 'estudiante', 'docente')
  checkin(@Param('id', ParseIntPipe) id: number) {
    return this.turnosService.checkin(id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.turnosService.remove(id);
  }
}