import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Historia } from '../entities/historia.entity';
import { CreateHistoriaDto } from './dto/create-historia.dto';
import { UpdateHistoriaDto } from './dto/update-historia.dto';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { AccionAuditoria } from '../entities/auditoria.entity';

@Injectable()
export class HistoriasService {
  constructor(
    @InjectRepository(Historia)
    private historiaRepository: Repository<Historia>,
    private auditoriaService: AuditoriaService,
  ) {}

  async create(createHistoriaDto: CreateHistoriaDto, usuarioId: number): Promise<Historia> {
    // Procesar el cuestionario según el tipo que se envíe
    let cuestionarioFinal: any;
    
    if (createHistoriaDto.cuestionarioCompleto) {
      // Cuestionario nuevo estructurado (formato completo)
      cuestionarioFinal = {
        tipo: 'completo',
        version: '2.0',
        data: createHistoriaDto.cuestionarioCompleto,
        fechaCreacion: new Date().toISOString()
      };
    } else if (createHistoriaDto.cuestionario) {
      // Cuestionario con valores directos (formato simplificado)
      cuestionarioFinal = {
        tipo: 'directo',
        version: '2.1',
        data: createHistoriaDto.cuestionario,
        fechaCreacion: new Date().toISOString()
      };
    } else {
      // Si no hay ningún cuestionario, crear uno vacío
      cuestionarioFinal = {
        tipo: 'vacio',
        version: '1.0',
        data: { motivoConsulta: 'No especificado' },
        fechaCreacion: new Date().toISOString()
      };
    }

    const historia = this.historiaRepository.create({
      pacienteId: createHistoriaDto.pacienteId,
      cuestionario: cuestionarioFinal,
      creadoPor: usuarioId,
    });

    const savedHistoria = await this.historiaRepository.save(historia);
    
    // Registrar en auditoría
    await this.auditoriaService.registrarAccion(
      'historias',
      savedHistoria.id,
      AccionAuditoria.INSERT,
      null,
      savedHistoria,
      usuarioId,
    );

    return this.findOne(savedHistoria.id);
  }

  async findAll(): Promise<Historia[]> {
    return this.historiaRepository.find({
      relations: ['paciente', 'creador'],
    });
  }

  async findByPaciente(pacienteId: number): Promise<Historia[]> {
    return this.historiaRepository.find({
      where: { pacienteId },
      relations: ['paciente', 'creador'],
      order: { creadoAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Historia> {
    const historia = await this.historiaRepository.findOne({
      where: { id },
      relations: ['paciente', 'creador'],
    });

    if (!historia) {
      throw new NotFoundException(`Historia clínica con ID ${id} no encontrada`);
    }

    return historia;
  }

  async update(id: number, updateHistoriaDto: UpdateHistoriaDto, usuarioId: number): Promise<Historia> {
    const historiaAnterior = await this.findOne(id);
    
    // Preparar los datos para actualización
    const datosActualizacion: any = {
      creadoPor: usuarioId, // Actualizamos quien modificó
    };
    
    // Solo actualizar observaciones si se proporciona
    if (updateHistoriaDto.observaciones !== undefined) {
      datosActualizacion.observaciones = updateHistoriaDto.observaciones;
    }
    
    // Actualizar cuestionario si se proporciona uno nuevo
    if (updateHistoriaDto.cuestionarioCompleto) {
      datosActualizacion.cuestionario = {
        tipo: 'completo',
        version: '2.0',
        data: updateHistoriaDto.cuestionarioCompleto,
        fechaModificacion: new Date().toISOString(),
        versionAnterior: historiaAnterior.cuestionario
      };
    } else if (updateHistoriaDto.cuestionario) {
      datosActualizacion.cuestionario = {
        tipo: 'legacy',
        version: '1.0',
        data: updateHistoriaDto.cuestionario,
        fechaModificacion: new Date().toISOString(),
        versionAnterior: historiaAnterior.cuestionario
      };
    }

    // TypeORM no puede manejar directamente objetos complejos en update
    // Usamos merge para crear la entidad completa y save para actualizar
    const historiaActualizada = this.historiaRepository.merge(historiaAnterior, datosActualizacion);

    const historiaNueva = await this.historiaRepository.save(historiaActualizada);
    
    // Registrar en auditoría
    await this.auditoriaService.registrarAccion(
      'historias',
      id,
      AccionAuditoria.UPDATE,
      historiaAnterior,
      historiaNueva,
      usuarioId,
    );

    return historiaNueva;
  }

  async remove(id: number, usuarioId: number): Promise<void> {
    const historia = await this.findOne(id);
    
    await this.historiaRepository.remove(historia);
    
    // Registrar en auditoría
    await this.auditoriaService.registrarAccion(
      'historias',
      id,
      AccionAuditoria.DELETE,
      historia,
      null,
      usuarioId,
    );
  }

  async getCuestionarioTemplate(): Promise<any> {
    // Devolver el template del cuestionario basado en el archivo JSON
    return {
      antecedentesFamiliares: [
        { pregunta: "Padre con vida?", tipo: "si_no", campo: "padreConVida" },
        { pregunta: "Enfermedad que padece o padeció (padre)", tipo: "texto", campo: "enfermedadPadre" },
        { pregunta: "Madre con vida?", tipo: "si_no", campo: "madreConVida" },
        { pregunta: "Enfermedad que padece o padeció (madre)", tipo: "texto", campo: "enfermedadMadre" },
        { pregunta: "Hermanos?", tipo: "mixto", detalle: "Sanos?", campo: "hermanos" },
        { pregunta: "Sufre de alguna enfermedad?", tipo: "mixto", detalle: "De qué?", campo: "sufreEnfermedad" },
        { pregunta: "Hace algún tratamiento médico?", tipo: "mixto", detalle: "Cuál?", campo: "haceTratamientoMedico" },
        { pregunta: "Qué medicamentos consume habitualmente?", tipo: "texto", campo: "medicamentosHabituales" },
        { pregunta: "Qué medicamentos ha consumido en los últimos 5 años?", tipo: "texto", campo: "medicamentosUltimos5Anos" }
      ],
      habitosYAntecedentesMedicos: [
        { pregunta: "Realiza algún deporte?", tipo: "si_no", campo: "realizaDeporte" },
        { pregunta: "Nota algún malestar al realizarlo?", tipo: "si_no", campo: "malestarDeporte" },
        { pregunta: "Es alérgico a alguna droga?", tipo: "si_no", campo: "alergiaDroga" },
        { pregunta: "Es alérgico a la anestesia?", tipo: "si_no", campo: "alergiaAnestesia" },
        { pregunta: "Es alérgico a la penicilina?", tipo: "si_no", campo: "alergiaPenicilina" },
        { pregunta: "Es alérgico a otros medicamentos?", tipo: "texto", campo: "alergiaOtrosMedicamentos" },
        { pregunta: "Cuando le sacan una muela o se lastima, cicatriza bien?", tipo: "si_no", campo: "cicatrizaBien" },
        { pregunta: "Cuando se lastima, sangra mucho?", tipo: "si_no", campo: "sangraMucho" },
        { pregunta: "Tiene problema de colágeno (hiperaxitud)?", tipo: "si_no", campo: "problemaColageno" },
        { pregunta: "Antecedentes de fiebre reumática?", tipo: "si_no", campo: "fiebreReumatica" },
        { pregunta: "Se encuentra con alguna medicación?", tipo: "texto", campo: "seEncuentraConMedicacion" },
        { pregunta: "Es diabético?", tipo: "si_no", campo: "esDiabetico" },
        { pregunta: "Está controlado?", tipo: "mixto", detalle: "Con qué?", campo: "diabetesControlada" },
        { pregunta: "Tiene algún problema cardíaco?", tipo: "mixto", detalle: "Cuál?", campo: "problemaCardiaco" },
        { pregunta: "Toma seguido aspirina y/o anticoagulante?", tipo: "mixto", detalle: "Con qué frecuencia?", campo: "tomaAspirinaAnticoagulante" },
        { pregunta: "Tiene presión alta?", tipo: "si_no", campo: "presionAlta" },
        { pregunta: "Chagas?", tipo: "si_no", campo: "chagas" },
        { pregunta: "Está en tratamiento por Chagas?", tipo: "si_no", campo: "tratamientoChagas" },
        { pregunta: "Tiene problemas renales?", tipo: "si_no", campo: "problemasRenales" },
        { pregunta: "Úlcera gástrica?", tipo: "si_no", campo: "ulceraGastrica" },
        { pregunta: "Tuvo hepatitis?", tipo: "si_no", campo: "tuvoHepatitis" },
        { pregunta: "Tipo de hepatitis", tipo: "texto", campo: "tipoHepatitis" },
        { pregunta: "Tiene algún problema hepático?", tipo: "mixto", detalle: "Cuál?", campo: "problemaHepatico" },
        { pregunta: "Tuvo convulsiones?", tipo: "si_no", campo: "tuvoConvulsiones" },
        { pregunta: "Es epiléptico?", tipo: "si_no", campo: "esEpileptico" },
        { pregunta: "Medicación que toma", tipo: "texto", campo: "medicacionQueToma" },
        { pregunta: "Ha tenido Sífilis o Gonorrea?", tipo: "si_no", campo: "sifilis" },
        { pregunta: "Otra enfermedad infecto-contagiosa?", tipo: "si_no", campo: "otraEnfermedadInfectocontagiosa" },
        { pregunta: "Tuvo transfusiones?", tipo: "si_no", campo: "tuvoTransfusiones" },
        { pregunta: "Fue operado alguna vez?", tipo: "mixto", detalle: "De qué y cuándo?", campo: "fueOperado" },
        { pregunta: "Tiene algún problema respiratorio?", tipo: "mixto", detalle: "Cuál?", campo: "problemaRespiratorio" },
        { pregunta: "Fuma?", tipo: "si_no", campo: "fuma" },
        { pregunta: "Está embarazada?", tipo: "mixto", detalle: "De cuántos meses?", campo: "estaEmbarazada" },
        { pregunta: "Otra enfermedad o recomendación de su médico?", tipo: "texto", campo: "otraEnfermedadRecomendacion" },
        { pregunta: "Realiza tratamiento homeopático, acupuntura u otro?", tipo: "mixto", detalle: "Cuál?", campo: "tratamientoHomeopatico" },
        { pregunta: "Médico clínico", tipo: "texto", campo: "medicoClinico" },
        { pregunta: "Clínica/Hospital para derivación", tipo: "texto", campo: "clinicaHospital" }
      ],
      tiposRespuesta: {
        si_no: {
          descripcion: "Respuesta de Sí o No",
          estructura: { respuesta: "boolean" }
        },
        texto: {
          descripcion: "Respuesta en texto libre",
          estructura: { respuesta: "string (opcional)" }
        },
        mixto: {
          descripcion: "Respuesta Sí/No con detalle adicional",
          estructura: { respuesta: "boolean", detalle: "string (opcional)" }
        }
      }
    };
  }
}