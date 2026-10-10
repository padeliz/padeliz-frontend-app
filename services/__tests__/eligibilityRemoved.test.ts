import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(__dirname, '../..');
const SOURCE_DIRS = ['app', 'components', 'services', 'utils', 'lib', 'types', 'context'];

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '__tests__' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

describe('eligibility is removed', () => {
  it.each([
    '@/services/eligibility',
    '@/services/eligibilityMaps',
    '@/services/hooks/useEligibility',
    '@/app/event/eligibility-check',
  ])('no longer ships %s', (mod) => {
    expect(() => require(mod)).toThrow();
  });

  it('has no Eligibility component folder', () => {
    expect(fs.existsSync(path.join(ROOT, 'components/Eligibility'))).toBe(false);
  });

  it('does not mention eligibility in screens, services, hooks or types', () => {
    const offenders = SOURCE_DIRS.flatMap((d) => walk(path.join(ROOT, d))).filter((file) =>
      /eligibility/i.test(fs.readFileSync(file, 'utf8'))
    );
    expect(offenders.map((f) => path.relative(ROOT, f))).toEqual([]);
  });
});
