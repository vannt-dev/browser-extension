import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const releaseType = process.argv[2] || 'patch'; // 'patch' | 'minor' | 'major'

if (!['patch', 'minor', 'major'].includes(releaseType)) {
  console.error('❌ Invalid release type! Use: npm run release [patch|minor|major]');
  process.exit(1);
}

console.log(`⚡ Starting automated release workflow (${releaseType})...`);

// 1. Bump version in package.json
const pkgPath = path.resolve('package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
const versionParts = pkg.version.split('.').map(Number);

if (releaseType === 'patch') versionParts[2] += 1;
if (releaseType === 'minor') { versionParts[1] += 1; versionParts[2] = 0; }
if (releaseType === 'major') { versionParts[0] += 1; versionParts[1] = 0; versionParts[2] = 0; }

const newVersion = versionParts.join('.');
pkg.version = newVersion;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log(`✅ Bumped version to v${newVersion}`);

// 2. Also update manifest.json version
const manifestPath = path.resolve('manifest.json');
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  manifest.version = newVersion;
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`✅ Updated manifest.json version to v${newVersion}`);
}

// 3. Run unit tests & package zip
console.log('🧪 Running tests and packaging ZIP release...');
execSync('npm run zip', { stdio: 'inherit' });

// 4. Git commit & tag
const tag = `v${newVersion}`;
console.log(`🏷️ Creating Git tag ${tag}...`);

try {
  execSync('git add .', { stdio: 'inherit' });
  execSync(`git commit -m "chore(release): ${tag}"`, { stdio: 'inherit' });
  execSync(`git tag -a ${tag} -m "Release ${tag}"`, { stdio: 'inherit' });
  console.log(`🚀 Pushing commits and tag ${tag} to GitHub...`);
  execSync('git push origin main --follow-tags', { stdio: 'inherit' });
  console.log(`\n🎉 THÀNH CÔNG! Đã phát hành phiên bản ${tag} và đẩy lên GitHub!`);
} catch (err) {
  console.error('⚠️ Git push error:', err.message);
}
