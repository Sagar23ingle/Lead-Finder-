const fs = require('fs');
const path = require('path');

function getAllFiles(dir, exts = ['.tsx', '.ts']) {
  let files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      if (item.name !== 'node_modules' && item.name !== '.next' && item.name !== '.git') {
        files = files.concat(getAllFiles(full, exts));
      }
    } else if (exts.includes(path.extname(item.name))) {
      files.push(full);
    }
  }
  return files;
}

const tsxFiles = getAllFiles(path.join(__dirname, '../src'));
const classNames = new Set();

const classRegex = /className=["'`]([^"'`]+)["'`]/g;

for (const file of tsxFiles) {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = classRegex.exec(content)) !== null) {
    const raw = match[1];
    const tokens = raw.split(/\s+/);
    for (const token of tokens) {
      if (token && !token.includes('${') && !token.includes('}') && !token.includes('?') && !token.includes(':')) {
        classNames.add(token.trim());
      }
    }
  }
}

const css = fs.readFileSync(path.join(__dirname, '../src/app/globals.css'), 'utf8');

const missing = [];
const found = [];

for (const cls of Array.from(classNames).sort()) {
  // Check if class is defined in globals.css as .className
  const regex = new RegExp('\\.' + cls.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') + '(?![a-zA-Z0-9_-])');
  if (regex.test(css)) {
    found.push(cls);
  } else {
    missing.push(cls);
  }
}

console.log('=== CSS CLASS AUDIT REPORT ===');
console.log(`Total classes found in JSX/TSX: ${classNames.size}`);
console.log(`Classes matched in globals.css: ${found.length}`);
console.log(`Classes MISSING from globals.css: ${missing.length}`);
console.log('\n--- MISSING CLASSES ---');
console.log(missing.join('\n'));
