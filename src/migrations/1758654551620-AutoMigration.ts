import { MigrationInterface, QueryRunner } from 'typeorm';

export class AutoMigration1758654551620 implements MigrationInterface {
  name = 'AutoMigration1758654551620';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "lastName"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "last_name" character varying NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user" ADD "password" character varying NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "password"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "last_name"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "lastName" character varying NOT NULL`);
  }
}