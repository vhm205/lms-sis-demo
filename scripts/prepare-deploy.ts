import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const EXCLUDE_DIRS = new Set([
  'node_modules', 
  '.next', 
  '.git', 
  'dist', 
  'build',
  '.agents',
  '.claude',
  '.cursor',
  '.devin',
  '.gemini',
  '.vercel',
  'scripts'
]);

const EXCLUDE_FILES = new Set([
  'dev.db-journal', 
  'deploy_payload.json', 
  '.DS_Store',
  'tsconfig.tsbuildinfo',
  'package-lock.json',
  'AGENTS.md',
  'CLAUDE.md',
  '.next-dev.log',
  '.mcp.json'
]);

interface FileItem {
  file: string;
  data: string;
  encoding?: 'utf-8' | 'base64';
}

function scanDir(dir: string, baseDir: string = ROOT): FileItem[] {
  const items: FileItem[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith('.DS_Store')) continue;
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');

    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name) || entry.name.startsWith('.')) continue;
      items.push(...scanDir(fullPath, baseDir));
    } else {
      if (EXCLUDE_FILES.has(entry.name)) continue;
      if (entry.name.endsWith('.tsbuildinfo') || entry.name.endsWith('.log')) continue;
      // Skip dev.db in root, but allow prisma/dev.db
      if (relPath === 'dev.db') continue;

      const isBinary = /\.(png|jpg|jpeg|gif|ico|woff|woff2|ttf|eot|db)$/i.test(entry.name);
      if (isBinary) {
        const buffer = fs.readFileSync(fullPath);
        items.push({
          file: relPath,
          data: buffer.toString('base64'),
          encoding: 'base64',
        });
      } else {
        const content = fs.readFileSync(fullPath, 'utf-8');
        items.push({
          file: relPath,
          data: content,
          encoding: 'utf-8',
        });
      }
    }
  }

  return items;
}

const files = scanDir(ROOT);
console.log(`Scanned ${files.length} clean files for deployment.`);

const payload = {
  name: 'lms-sis-demo',
  target: 'production',
  teamId: 'team_yKbheipMhNEKI2yk2z2xjKXr',
  files,
};

fs.writeFileSync(path.join(ROOT, 'deploy_payload.json'), JSON.stringify(payload));
console.log('Saved deploy_payload.json successfully.');
