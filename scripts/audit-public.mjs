import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const excludedDirectories = new Set([
  '.git', '.next', '.astro', '.vercel', 'node_modules', 'coverage', 'playwright-report', 'test-results'
]);
const excludedFiles = new Set([
  'package-lock.json', 'npm-shrinkwrap.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lock', 'bun.lockb'
]);
const rules = [
  ['private-key', /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/i],
  ['credential', /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b|\bgh[pousr]_[A-Za-z0-9]{20,}\b|\bxox[baprs]-[A-Za-z0-9-]{10,}\b/],
  ['credential', /(?<![\w$.])(?:api[_-]?key|access[_-]?token|client[_-]?secret|password|passwd|secret)\s*[:=]\s*["']?[A-Za-z0-9/+=._-]{8,}/i],
  ['authenticated-url', /\bhttps?:\/\/[^\s/@:]+:[^\s/@]+@[^\s/]+/i],
  ['authenticated-url', /[?&](?:access_token|auth|api_key|token|password)=([^&#\s]{8,})/i],
  ['internal-address', /(?<![\w.])(?:10\.(?:\d{1,3}\.){2}\d{1,3}|192\.168\.(?:\d{1,3}\.)\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.(?:\d{1,3}\.)\d{1,3})(?![\w.])/],
  ['internal-address', /\bhttps?:\/\/(?:[a-z0-9-]+\.)+(?:local|lan|home\.arpa)\b(?::\d{1,5})?/i]
];

function isText(buffer) {
  return !buffer.includes(0);
}

function scanFile(file) {
  let buffer;
  try {
    buffer = fs.readFileSync(file);
  } catch {
    return [{ file, category: 'unreadable-file' }];
  }
  if (!isText(buffer)) return [];

  const text = buffer.toString('utf8');
  const findings = [];
  for (const [category, pattern] of rules) {
    pattern.lastIndex = 0;
    if (pattern.test(text)) findings.push({ file, category });
  }
  return findings;
}

function walk(directory, findings) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) continue;
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!excludedDirectories.has(entry.name)) walk(file, findings);
      continue;
    }
    if (!entry.isFile() || excludedFiles.has(entry.name) || /\.(?:lock|log)$/i.test(entry.name)) continue;
    findings.push(...scanFile(file));
  }
}

const findings = [];
walk(root, findings);
if (findings.length) {
  for (const { file, category } of findings) {
    console.error(`${path.relative(root, file).split(path.sep).join('/')}\t${category}`);
  }
  console.error(`Public-content audit found ${findings.length} issue(s); values are intentionally omitted.`);
  process.exitCode = 1;
} else {
  console.log('Public-content audit found no configured secret or internal-access patterns. This heuristic is not proof that content is safe.');
}
