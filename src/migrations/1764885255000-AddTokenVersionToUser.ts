import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTokenVersionToUser1764885255000 implements MigrationInterface {
  name = 'AddTokenVersionToUser1764885255000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "token_version" integer NOT NULL DEFAULT 0`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "token_version"`);
  }
}
