import { AppDataSource } from './data-source';

async function main() {
  await AppDataSource.initialize();
  const executed = await AppDataSource.runMigrations();
  console.log(
    executed.length
      ? `Applied migrations: ${executed.map((m) => m.name).join(', ')}`
      : 'No pending migrations.',
  );
  await AppDataSource.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
