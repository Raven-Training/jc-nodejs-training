import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameCreatedAtToCreated_AtInUser1758654551620 implements MigrationInterface {
  name = 'RenameCreatedAtToCreated_AtInUser1758654551620';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "createdAt" TO "created_at"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "created_at" TO "createdAt"`);
  }
}
