import { execSync } from 'child_process';
import fs from 'fs';

// Read version from package.json
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
const version = pkg.version;
const imageBase = 'sajitss/difinest';

console.log(`\n📦 Building & Releasing DifiNest Docker Image v${version}...\n`);

try {
  // 1. Build image with dual tags: versioned tag (e.g. v1.0.0 / 1.0.0) + latest
  console.log(`🔨 Building image tagged as ${imageBase}:${version} and ${imageBase}:latest...`);
  execSync(`docker build -t ${imageBase}:${version} -t ${imageBase}:v${version} -t ${imageBase}:latest .`, { stdio: 'inherit' });

  // 2. Push versioned tags and latest to Docker Hub
  console.log(`\n🚀 Pushing ${imageBase}:${version} to Docker Hub...`);
  execSync(`docker push ${imageBase}:${version}`, { stdio: 'inherit' });

  console.log(`\n🚀 Pushing ${imageBase}:v${version} to Docker Hub...`);
  execSync(`docker push ${imageBase}:v${version}`, { stdio: 'inherit' });

  console.log(`\n🚀 Pushing ${imageBase}:latest to Docker Hub...`);
  execSync(`docker push ${imageBase}:latest`, { stdio: 'inherit' });

  console.log(`\n✅ Release complete: ${imageBase}:${version} and ${imageBase}:latest published successfully!\n`);
} catch (err) {
  console.error('\n❌ Release failed:', err.message);
  process.exit(1);
}
