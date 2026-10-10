import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(__dirname, '..');
const SKIP_DIRS = new Set([
  'node_modules',
  '.expo',
  'android',
  'ios',
  'coverage',
  '.git',
  '__tests__',
]);
const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);

function collectSources(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) collectSources(path.join(dir, entry.name), out);
    } else if (EXTENSIONS.has(path.extname(entry.name))) {
      out.push(path.join(dir, entry.name));
    }
  }
  return out;
}

describe('icon library migration', () => {
  const files = collectSources(ROOT);
  const needle = ['Font', 'Awesome'].join('');

  it('scans a meaningful set of source files', () => {
    expect(files.length).toBeGreaterThan(20);
    expect(files.some((f) => f.includes(`${path.sep}old${path.sep}`))).toBe(true);
    expect(files.some((f) => f.endsWith('test-screen.tsx'))).toBe(true);
  });

  it('has zero FontAwesome imports or usages in app source', () => {
    const offenders = files
      .filter((f) => fs.readFileSync(f, 'utf8').includes(needle))
      .map((f) => path.relative(ROOT, f));

    expect(offenders).toEqual([]);
  });

  it('removed SportIcons but kept SocialIcons brand SVGs', () => {
    const dir = path.join(ROOT, 'components', 'LevelAssessment');
    expect(fs.existsSync(path.join(dir, 'SportIcons.tsx'))).toBe(false);
    expect(fs.existsSync(path.join(dir, 'SocialIcons.tsx'))).toBe(true);
  });
});
