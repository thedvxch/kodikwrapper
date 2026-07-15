#!/usr/bin/env node
// generates a changelog section from conventional commits since the previous tag.
//
//   node scripts/changelog.mjs          # print notes for HEAD to stdout
//   node scripts/changelog.mjs --write  # also prepend the section into CHANGELOG.md
//
// commit grouping follows conventional commits (feat/fix/... : subject). the
// `chore: v<x>` bump commit and merge commits are skipped.
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const sh = (cmd) => execSync(cmd, { encoding: 'utf8' }).trim();

const version = JSON.parse(readFileSync('package.json', 'utf8')).version;
const date = new Date().toISOString().slice(0, 10);

// previous tag (excluding HEAD's own tag if it exists); empty => whole history
let prevTag = '';
try {
  prevTag = execSync(`git describe --tags --abbrev=0 --exclude=v${version}`, {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'ignore'],
  }).trim();
} catch {
  prevTag = '';
}
const range = prevTag ? `${prevTag}..HEAD` : 'HEAD';

// %s = subject, %h = short hash; %x1f is a unit separator
const log = sh(`git log ${range} --no-merges --pretty=format:%s%x1f%h`);

// type -> section heading (hype, lowercase). unlisted types fall into "changed".
const sections = {
  feat: 'added',
  fix: 'fixed',
  perf: 'changed',
  refactor: 'changed',
  docs: 'changed',
  chore: 'changed',
};
const order = ['added', 'fixed', 'changed'];

const buckets = { added: [], fixed: [], changed: [] };
const commitRe = /^(?<type>\w+)(?:\((?<scope>[^)]+)\))?(?<breaking>!)?:\s(?<subject>.+)$/;

for (const line of log.split('\n')) {
  if (!line) continue;
  const [subject, hash] = line.split('\x1f');
  // skip the version-bump commit itself
  if (/^chore:\s*v\d+\.\d+\.\d+$/.test(subject)) continue;

  const m = subject.match(commitRe);
  if (!m) {
    buckets.changed.push({ text: subject, hash });
    continue;
  }
  const { type, scope, breaking, subject: msg } = m.groups;
  const heading = breaking ? 'changed' : (sections[type] ?? 'changed');
  const prefix = scope ? `**${scope}**: ` : '';
  buckets[heading].push({ text: `${breaking ? '**breaking** ' : ''}${prefix}${msg}`, hash });
}

let section = `## [${version}] - ${date}\n`;
for (const heading of order) {
  const items = buckets[heading];
  if (!items.length) continue;
  section += `\n### ${heading}\n`;
  for (const { text, hash } of items) section += `- ${text} (${hash})\n`;
}

process.stdout.write(section + '\n');

if (process.argv.includes('--write')) {
  const path = 'CHANGELOG.md';
  const current = readFileSync(path, 'utf8');
  // insert the new section right after the "## [unreleased]" block, or at the top
  const marker = /\n## \[/;
  const idx = current.search(marker);
  const updated = idx === -1 ? `${section}\n${current}` : current.slice(0, idx + 1) + section + '\n' + current.slice(idx + 1);
  writeFileSync(path, updated);
  process.stderr.write(`changelog: wrote ${version} section into ${path}\n`);
}
