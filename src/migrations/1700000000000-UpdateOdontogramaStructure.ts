import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateOdontogramaStructure1700000000000 implements MigrationInterface {
    name = 'UpdateOdontogramaStructure1700000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Agregar columna actualizado_at si no existe
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='odontogramas' AND column_name='actualizado_at'
                ) THEN
                    ALTER TABLE "odontogramas" ADD COLUMN "actualizado_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
                END IF;
            END $$;
        `);

        // Renombrar columna 'datos' a 'dientes' si existe
        await queryRunner.query(`
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='odontogramas' AND column_name='datos'
                ) THEN
                    ALTER TABLE "odontogramas" RENAME COLUMN "datos" TO "dientes";
                END IF;
            END $$;
        `);

        // Migrar datos existentes para asegurar que tienen la nueva estructura
        await queryRunner.query(`
            UPDATE "odontogramas" 
            SET "dientes" = CASE 
                WHEN "dientes"::text = '{}' OR "dientes" IS NULL THEN 
                    '[]'::jsonb
                ELSE 
                    "dientes"
            END;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revertir cambios
        await queryRunner.query(`ALTER TABLE "odontogramas" RENAME COLUMN "dientes" TO "datos"`);
        await queryRunner.query(`ALTER TABLE "odontogramas" DROP COLUMN IF EXISTS "actualizado_at"`);
    }
}