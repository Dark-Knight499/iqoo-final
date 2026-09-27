import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
function environment(seed = {}) {
  const memory = new Map(Object.entries(seed).map(([key, value]) => [`creator_ai_${key}`, JSON.stringify(value)]));
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
  const read = key => JSON.parse(memory.get(`creator_ai_${key}`) ?? 'null');
  return { load, read, modules };
}

const creatorPath = 'src/shared/state/creator.store.ts';
const projectPath = 'src/shared/state/project.store.ts';
const storyboardPath = 'src/features/creator-intelligence/services/storyboardService.ts';
const bookmarkPath = 'src/features/creator-intelligence/services/bookmarkService.ts';
const ciPath = 'src/features/creator-intelligence/state/creatorIntelligenceStore.ts';

test('blank first visit, named workspace persists, and switching restores only its profile', () => {
  const env = environment({ creator_profile: { id: 'fixture', name: 'Fixture' } });
  const creator = env.load(creatorPath).creatorStore;
  assert.equal(creator.get().id, '');
  assert.equal(creator.get().name, '');
  assert.equal(creator.listWorkspaces().length, 0);
  creator.beginNewWorkspace();
  assert.equal(creator.get().id, '');
  assert.equal(creator.get().dna.voice, '');
  creator.updateProfile({ name: 'One' });
  const one = creator.get().id;
  creator.updateProfile({ niche: 'Video' });
  creator.beginNewWorkspace();
  assert.equal(creator.listWorkspaces().length, 1);
  creator.updateProfile({ name: 'Two' });
  const two = creator.get().id;
  assert.notEqual(one, two);
  assert.equal(creator.switchWorkspace('missing'), false);
  assert.equal(creator.switchWorkspace(one), true);
  assert.equal(creator.get().niche, 'Video');
  creator.saveWorkspace();
  assert.equal(env.read('active_creator_id'), one);
  env.modules.delete(path.resolve(root, creatorPath));
  assert.equal(env.load(creatorPath).creatorStore.get().id, one);
});

test('projects, imported media, storyboard, bookmarks and drafts stay in their workspace', () => {
  const env = environment();
  const creator = env.load(creatorPath).creatorStore;
  const projects = env.load(projectPath).projectStore;
  const storyboard = env.load(storyboardPath).storyboardService;
  const bookmarks = env.load(bookmarkPath).bookmarkService;
  const ci = env.load(ciPath).ciStore;
  creator.updateProfile({ name: 'First' });
  const first = creator.get().id;
  const imported = projects.addProject({ title: 'Import', mediaId: 'media-123' });
  ci.addToStoryboard('v4');
  ci.toggleBookmark('r1');
  ci.setSearchQuery('test');
  ci.linkProjectForPlanning(imported.id);
  creator.beginNewWorkspace();
  assert.equal(projects.getProjects().length, 0);
  assert.equal(projects.getActiveProject(), undefined);
  assert.equal(ci.getState().searchQuery, '');
  creator.updateProfile({ name: 'Second' });
  const second = creator.get().id;
  assert.equal(projects.getProjects().length, 0);
  assert.equal(storyboard.getCount(), 0);
  assert.equal(bookmarks.isBookmarked('r1'), false);
  assert.equal(ci.getState().savedProjectId, null);
  assert.equal(ci.getState().generationInput.referenceIds.length, 0);
  projects.updateProject(imported.id, { title: 'Stolen', creatorId: second, mediaId: 'other' });
  projects.setActiveProjectId(imported.id);
  const secondProject = projects.addProject({ title: 'Second', creatorId: first });
  assert.equal(secondProject.creatorId, second);
  projects.updateActiveProject({ creatorId: first, title: 'Updated' });
  assert.equal(projects.getActiveProject().creatorId, second);
  creator.switchWorkspace(first);
  assert.equal(projects.getProjects().length, 1);
  assert.equal(projects.getActiveProject().id, imported.id);
  assert.equal(projects.getActiveProject().mediaId, 'media-123');
  assert.equal(ci.getState().storyboardItems[0].contentId, 'v4');
  assert.equal(ci.getState().bookmarkedIds[0], 'r1');
  assert.equal(ci.getState().generationInput.referenceIds[0], 'v4');
  env.modules.delete(path.resolve(root, projectPath));
  env.modules.delete(path.resolve(root, storyboardPath));
  env.modules.delete(path.resolve(root, bookmarkPath));
  assert.equal(env.load(projectPath).projectStore.getProjects()[0].mediaId, 'media-123');
  assert.equal(env.load(storyboardPath).storyboardService.getCount(), 1);
  assert.equal(env.load(bookmarkPath).bookmarkService.isBookmarked('r1'), true);
});

test('onboarded legacy owner alone receives unowned projects and old saved selections', () => {
  const profile = { id: 'old-owner', name: 'Existing Creator' };
  const project = { id: 'old-project', title: 'Saved Import', mediaId: 'original-media', thumbnailUrl: '', clips: [] };
  const oldItem = { id: 'item', contentId: 'v2', addedAt: 1 };
  const env = environment({ has_onboarded: true, creator_profile: profile, projects_list: [project], ci_storyboard: [oldItem], ci_bookmarks: ['v2'] });
  const creator = env.load(creatorPath).creatorStore;
  const projects = env.load(projectPath).projectStore;
  const storyboard = env.load(storyboardPath).storyboardService;
  const bookmarks = env.load(bookmarkPath).bookmarkService;
  assert.equal(creator.listWorkspaces()[0].id, 'old-owner');
  assert.equal(projects.getProjects()[0].creatorId, 'old-owner');
  assert.equal(projects.getProjects()[0].mediaId, 'original-media');
  assert.equal(storyboard.getItems()[0].contentId, 'v2');
  assert.equal(bookmarks.isBookmarked('v2'), true);
  creator.beginNewWorkspace();
  creator.updateProfile({ name: 'New owner' });
  assert.equal(projects.getProjects().length, 0);
  assert.equal(storyboard.getCount(), 0);
  assert.equal(bookmarks.getAll().length, 0);
  assert.equal(env.read('ci_storyboard_old-owner')[0].contentId, 'v2');
});

test('unowned legacy entries without an onboarded profile never attach to a new creator', () => {
  const env = environment({ projects_list: [{ id: 'unowned', title: 'Old' }], ci_storyboard: [{ id: 'old', contentId: 'v4' }], ci_bookmarks: ['v4'] });
  const creator = env.load(creatorPath).creatorStore;
  creator.updateProfile({ name: 'New' });
  assert.equal(env.load(projectPath).projectStore.getProjects().length, 0);
  assert.equal(env.load(storyboardPath).storyboardService.getCount(), 0);
  assert.equal(env.load(bookmarkPath).bookmarkService.getAll().length, 0);
});

test('switching workspaces cancels an in-flight copilot response and clears transient planning state', async () => {
  const env = environment();
  const creator = env.load(creatorPath).creatorStore;
  creator.updateProfile({ name: 'First' });
  const ci = env.load(ciPath).ciStore;
  const generation = env.load('src/features/creator-intelligence/services/mockGenerationService.ts').generationService;
  ci.addToStoryboard('v4');
  await ci.startGeneration();
  let finish;
  generation.chat = () => new Promise(resolve => { finish = resolve; });
  const pending = ci.sendCopilotMessage('make hook shorter');
  ci.setSelectedContent('v4');
  creator.beginNewWorkspace();
  creator.updateProfile({ name: 'Second' });
  finish({ response: { id: 'stale', role: 'ai', text: 'Old response', timestamp: 1 }, proposedDraft: { title: 'Old draft' } });
  await pending;
  assert.equal(ci.getState().searchQuery, '');
  assert.equal(ci.getState().selectedContentId, null);
  assert.equal(ci.getState().generationLoading, false);
  assert.equal(ci.getState().generatedDraft, null);
  assert.equal(ci.getState().proposedDraft, null);
  assert.equal(ci.getState().copilotMessages.length, 0);
});
