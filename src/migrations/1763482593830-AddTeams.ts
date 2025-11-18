import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTeams1763482593830 implements MigrationInterface {
  name = 'AddTeams1763482593830';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "teams" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "team_type" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer NOT NULL, CONSTRAINT "PK_7e5523774a38b08a6236d322403" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "team_pokemons" ("team_id" integer NOT NULL, "pokemon_purchase_id" integer NOT NULL, CONSTRAINT "PK_61c389063aab714c29848c98144" PRIMARY KEY ("team_id", "pokemon_purchase_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1004631a47433b5d32b2c38faa" ON "team_pokemons" ("team_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_176349ec62fec864f0c8c94bd2" ON "team_pokemons" ("pokemon_purchase_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "teams" ADD CONSTRAINT "FK_5dd7d34e6410bba0db7bcc1e045" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_pokemons" ADD CONSTRAINT "FK_1004631a47433b5d32b2c38faae" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_pokemons" ADD CONSTRAINT "FK_176349ec62fec864f0c8c94bd25" FOREIGN KEY ("pokemon_purchase_id") REFERENCES "pokemon_purchase"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "team_pokemons" DROP CONSTRAINT "FK_176349ec62fec864f0c8c94bd25"`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_pokemons" DROP CONSTRAINT "FK_1004631a47433b5d32b2c38faae"`,
    );
    await queryRunner.query(`ALTER TABLE "teams" DROP CONSTRAINT "FK_5dd7d34e6410bba0db7bcc1e045"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_176349ec62fec864f0c8c94bd2"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_1004631a47433b5d32b2c38faa"`);
    await queryRunner.query(`DROP TABLE "team_pokemons"`);
    await queryRunner.query(`DROP TABLE "teams"`);
  }
}
