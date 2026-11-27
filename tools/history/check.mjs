import {readFileSync} from 'node:fs';
import {parseRegistry} from './registry.mjs';

// Fixed project input. No downloading, publication, arbitrary file traversal or
// credential access; nonempty real chapters need an external editorial workflow.
const registry = parseRegistry(readFileSync(new URL('../../content-intake/history/registry.json', import.meta.url), 'utf8'));
console.log(JSON.stringify({
  schema: registry.schema, status: registry.status,
  entities: registry.entities.length, sources: registry.sources.length,
  claims: registry.claims.length, relations: registry.relations.length,
  chapters: registry.chapters.length, publicationAuthorized: false
}, null, 2));
