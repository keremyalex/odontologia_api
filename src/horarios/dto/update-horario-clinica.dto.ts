import { PartialType } from '@nestjs/swagger';
import { CreateHorarioClinicaDto } from './create-horario-clinica.dto';

export class UpdateHorarioClinicaDto extends PartialType(CreateHorarioClinicaDto) {}
