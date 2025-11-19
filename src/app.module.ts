import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User, Paciente, Turno, Historia, Odontograma, Adjunto, Auditoria, Especialidad, HorarioClinica, FranjaHoraria } from './entities';
import { AuthModule } from './auth/auth.module';
import { PacientesModule } from './pacientes/pacientes.module';
import { TurnosModule } from './turnos/turnos.module';
import { HistoriasModule } from './historias/historias.module';
import { OdontogramasModule } from './odontogramas/odontogramas.module';
import { AdjuntosModule } from './adjuntos/adjuntos.module';
import { AuditoriaModule } from './auditoria/auditoria.module';
import { EspecialidadesModule } from './especialidades/especialidades.module';
import { HorariosModule } from './horarios/horarios.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbHost = configService.get('DATABASE_HOST');
        const dbPort = configService.get('DATABASE_PORT');
        const dbUsername = configService.get('DATABASE_USERNAME');
        const dbPassword = configService.get('DATABASE_PASSWORD');
        const dbName = configService.get('DATABASE_NAME');

        // Validar que las variables de entorno estén configuradas
        if (!dbHost || !dbPort || !dbUsername || !dbPassword || !dbName) {
          throw new Error('Faltan variables de entorno de la base de datos. Revisa tu archivo .env');
        }

        return {
          type: 'postgres',
          host: dbHost,
          port: +dbPort,
          username: dbUsername,
          password: dbPassword,
          database: dbName,
          entities: [User, Paciente, Turno, Historia, Odontograma, Adjunto, Auditoria, Especialidad, HorarioClinica, FranjaHoraria],
          synchronize: true, // Solo para desarrollo, en producción usar migraciones
          logging: false,
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    PacientesModule,
    TurnosModule,
    HistoriasModule,
    OdontogramasModule,
    AdjuntosModule,
    AuditoriaModule,
    EspecialidadesModule,
    HorariosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
