import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Placeholder so `migration:run` succeeds on a fresh DB.
 * Replace with real migrations when you move away from DB_SYNC / synchronize.
 */
export class Placeholder1735689600000 implements MigrationInterface {
  name = 'Placeholder1735689600000';

  public async up(_queryRunner: QueryRunner): Promise<void> {
    // no-op
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // no-op
  }
}
