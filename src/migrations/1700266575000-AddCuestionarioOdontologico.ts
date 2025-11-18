import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCuestionarioOdontologico1700266575000 implements MigrationInterface {
    name = 'AddCuestionarioOdontologico1700266575000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "historias" ADD "cuestionario_odontologico" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "historias" DROP COLUMN "cuestionario_odontologico"`);
    }
}