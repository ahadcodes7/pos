import { buildTemplateDatabase, removeDatabaseFiles } from "../tests/setup/db-template";

/** Builds the migrated template database once per run; workers copy it per test. */
export default function globalSetup() {
  const template = buildTemplateDatabase();
  process.env.E2E_TEMPLATE_DB = template;
  return () => removeDatabaseFiles(template);
}
