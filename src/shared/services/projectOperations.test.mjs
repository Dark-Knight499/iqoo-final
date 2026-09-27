import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import ts from 'typescript';

const source = readFileSync(fileURLToPath(new URL('./projectOperations.ts', import.meta.url)), 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const module = { exports: {} };
vm.runInNewContext(`(function(exports) { ${js}\n})`, { Date, Math, Number })(module.exports);
const { proposeOpeningTrim, validTrim, applyProposedTrim } = module.exports;

const project = () => ({ id: 'sample', mediaId: 'stored-file', durationSeconds: 8,
  trimStartSeconds: 0, trimEndSeconds: 8, blueprint: { format: { duration: '30s' } }, appliedOperations: [] });

test('blueprint suggests a bounded source range without changing the original', () => {
  const source = project();
  const proposal = proposeOpeningTrim(source);
  assert.deepEqual(JSON.parse(JSON.stringify(proposal)), { start: 0, end: 8, origin: 'blueprint' });
  assert.equal(source.trimEndSeconds, 8);
  assert.throws(() => proposeOpeningTrim({ ...source, mediaId: undefined }), /Attach a real source/);
});

test('preview does not alter export range; apply records the reviewed trim and invalidates previous render', () => {
  const source = { ...project(), proposedTrim: { start: 1.2, end: 3.5, origin: 'manual' }, lastExport: { name: 'old.mp4', exportedAt: 'yesterday' } };
  assert.equal(source.trimStartSeconds, 0);
  assert.equal(source.trimEndSeconds, 8);
  const changed = applyProposedTrim(source, '2026-01-01T00:00:00Z');
  assert.equal(changed.trimStartSeconds, 1.2);
  assert.equal(changed.trimEndSeconds, 3.5);
  assert.equal(changed.appliedOperations[0].type, 'trim');
  assert.equal(changed.lastExport, undefined);
  assert.equal(source.trimEndSeconds, 8);
  assert.ok(source.proposedTrim);
});

test('invalid or missing proposals cannot be applied', () => {
  for (const proposal of [{ start: 3, end: 9 }, { start: -1, end: 2 }, { start: 4, end: 4 }, { start: NaN, end: 5 }]) {
    assert.equal(validTrim(project(), proposal.start, proposal.end), false);
    assert.throws(() => applyProposedTrim({ ...project(), proposedTrim: proposal }), /valid proposed range/);
  }
  assert.throws(() => applyProposedTrim(project()), /valid proposed range/);
});
