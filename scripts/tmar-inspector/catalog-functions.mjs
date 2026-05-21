import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const includeExtensions = new Set(['.js', '.gs', '.html']);
const includeDirs = ['src', 'gas'];
const includeFiles = ['TMAR-Accrual-Ledger.html', 'index.html'];
const skipDirs = new Set(['.git', 'node_modules', '.venv', '_archive', 'backup_20260228', 'OG files']);

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!skipDirs.has(entry.name)) {
        walk(fullPath, files);
      }
      continue;
    }

    const ext = path.extname(entry.name);
    if (includeExtensions.has(ext)) {
      files.push(fullPath);
    }
  }

  return files;
}

function classifySurface(filePath) {
  if (filePath.includes(`${path.sep}gas${path.sep}`) || filePath.endsWith('.gs')) return 'gas';
  if (filePath.endsWith('.html')) return 'html';
  return 'src';
}

function extractFunctions(content) {
  const lines = content.split(/\r?\n/);
  const functions = [];

  const patterns = [
    /^\s*export\s+function\s+([A-Za-z0-9_]+)\s*\(/,
    /^\s*async\s+function\s+([A-Za-z0-9_]+)\s*\(/,
    /^\s*function\s+([A-Za-z0-9_]+)\s*\(/
  ];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        functions.push({
          functionName: match[1],
          line: i + 1,
          signature: line.trim()
        });
        break;
      }
    }
  }

  return functions;
}

function main() {
  const targets = [];

  for (const dir of includeDirs) {
    targets.push(...walk(path.join(root, dir)));
  }

  for (const fileName of includeFiles) {
    const fullPath = path.join(root, fileName);
    if (fs.existsSync(fullPath)) {
      targets.push(fullPath);
    }
  }

  const uniqueTargets = Array.from(new Set(targets));
  const inventory = [];

  for (const filePath of uniqueTargets) {
    const content = fs.readFileSync(filePath, 'utf8');
    const functions = extractFunctions(content);
    inventory.push({
      file: path.relative(root, filePath).replace(/\\/g, '/'),
      appSurface: classifySurface(filePath),
      functionCount: functions.length,
      functions
    });
  }

  inventory.sort((a, b) => b.functionCount - a.functionCount);

  const totalFunctions = inventory.reduce((sum, file) => sum + file.functionCount, 0);
  const bySurface = inventory.reduce((acc, file) => {
    acc[file.appSurface] = (acc[file.appSurface] || 0) + file.functionCount;
    return acc;
  }, {});

  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      filesScanned: inventory.length,
      totalFunctions,
      bySurface
    },
    files: inventory
  };

  const outputDir = path.join(root, 'docs', 'reports');
  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, 'tmar-function-catalog.json');
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));

  console.log(`Function catalog generated: ${path.relative(root, outputPath)}`);
  console.log(`Files scanned: ${report.summary.filesScanned}`);
  console.log(`Total functions: ${report.summary.totalFunctions}`);
}

main();
