import type { TestProject } from "vitest/node";
import { buildTemplateDatabase, removeDatabaseFiles } from "./db-template";

declare module "vitest" {
  export interface ProvidedContext {
    templateDbFile: string;
  }
}

/** Runs once per `vitest` run of the main project: builds the migrated template database. */
export default function setup(project: TestProject) {
  const templateDbFile = buildTemplateDatabase();
  project.provide("templateDbFile", templateDbFile);
  return () => removeDatabaseFiles(templateDbFile);
}
