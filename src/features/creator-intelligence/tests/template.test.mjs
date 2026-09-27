import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import ts from 'typescript';

// Run the same TypeScript modules as the app without adding a test framework dependency.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const memory = new Map();
const localStorage = {
  getItem: key => memory.get(key) ?? null,
  setItem: (key, value) => memory.set(key, value),
  removeItem: key => memory.delete(key),
};
const modules = new Map();
function load(relative) {
  const filename = path.resolve(root, relative);
  if (modules.has(filename)) return modules.get(filename).exports;
  const source = fs.readFileSync(filename, 'utf8');
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = { exports: {} };
  modules.set(filename, module);
  const require = specifier => {
    if (specifier === 'react') return { useState: () => [0, () => {}], useEffect: () => {} };
    const target = specifier.startsWith('@/') ? path.resolve(root, 'src', specifier.slice(2)) : path.resolve(path.dirname(filename), specifier);
    return load(path.relative(root, `${target}.ts`));
  };
  vm.runInNewContext('(function(require, module, exports, localStorage, structuredClone) {' + js + '\n})', { Date, Math, Set, Map, console })(require, module, module.exports, localStorage, structuredClone);
  return module.exports;
}

const { buildTemplate, proposeEdit } = load('src/features/creator-intelligence/services/mockGenerationService.ts');
const input = (referenceIds, duration = '30s') => ({ referenceIds, duration, contentType: 'reel', tone: 'educational' });

test('template uses chosen catalog sources and format, rather than a fixed draft', () => {
  const a = buildTemplate(input(['v4', 'r1'], '90s'));
  const b = buildTemplate(input(['v2']));
  assert.match(a.title, /Creator Economy/);
  assert.match(a.script, /The Creator Economy Is Broken/);
  assert.match(a.coreMessage, /This AI trick saves me/);
  assert.equal(a.scenes.at(-1).duration, '63-90s');
  assert.equal(a.references.length, 2);
  assert.equal(b.references[0].id, 'v2');
  assert.notEqual(a.hook, b.hook);
  assert.throws(() => buildTemplate(input(['unknown'])), /Add a catalog video/);
});

test('local edits are proposals; unsupported commands do not pretend to update', () => {
  const draft = buildTemplate(input(['v4']));
  const { response, proposedDraft } = proposeEdit('make the hook shorter', draft);
  assert.ok(response.changes?.length);
  assert.notEqual(proposedDraft.hook, draft.hook);
  assert.equal(draft.scenes[0].dialogue, draft.hook);
  assert.equal(proposeEdit('write in my voice', draft).proposedDraft, null);
});

test('storyboard/bookmarks survive module reloading via local storage', () => {
  load('src/shared/state/creator.store.ts').creatorStore.updateProfile({ name: 'Test Creator' });
  const storyboard = load('src/features/creator-intelligence/services/storyboardService.ts').storyboardService;
  const bookmarks = load('src/features/creator-intelligence/services/bookmarkService.ts').bookmarkService;
  storyboard.add('v4');
  bookmarks.toggle('r1');
  modules.delete(path.resolve(root, 'src/features/creator-intelligence/services/storyboardService.ts'));
  modules.delete(path.resolve(root, 'src/features/creator-intelligence/services/bookmarkService.ts'));
  assert.equal(load('src/features/creator-intelligence/services/storyboardService.ts').storyboardService.getItems()[0].contentId, 'v4');
  assert.equal(load('src/features/creator-intelligence/services/bookmarkService.ts').bookmarkService.isBookmarked('r1'), true);
});

test('store keeps proposed edits separate until approval and supports discard', async () => {
  const { ciStore } = load('src/features/creator-intelligence/state/creatorIntelligenceStore.ts');
  await ciStore.startGeneration();
  const original = ciStore.getState().generatedDraft;
  await ciStore.sendCopilotMessage('make hook shorter');
  assert.equal(ciStore.getState().generatedDraft, original);
  assert.ok(ciStore.getState().proposedDraft);
  ciStore.rejectProposedDraft();
  assert.equal(ciStore.getState().generatedDraft, original);
  await ciStore.sendCopilotMessage('make hook shorter');
  ciStore.approveProposedDraft();
  assert.notEqual(ciStore.getState().generatedDraft.hook, original.hook);
});

test('project store persists a complete blueprint for the Home project list', () => {
  const { projectStore } = load('src/shared/state/project.store.ts');
  const blueprint = buildTemplate(input(['v6', 'r8']));
  const project = projectStore.addProject({ title: blueprint.title, description: blueprint.coreMessage, blueprint });
  assert.equal(projectStore.getActiveProject().id, project.id);
  assert.equal(projectStore.getActiveProject().blueprint.references[1].id, 'r8');
  modules.delete(path.resolve(root, 'src/shared/state/project.store.ts'));
  const reloaded = load('src/shared/state/project.store.ts').projectStore;
  assert.equal(reloaded.getProjects()[0].blueprint.script, blueprint.script);
});
