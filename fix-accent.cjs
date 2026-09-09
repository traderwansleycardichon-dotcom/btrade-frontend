const fs = require('fs');
const path = require('path');

const dirs = [
  'src/pages/app',
  'src/components/layout',
  'src/components/admin',
  'src/components/modals',
  'src/components/todo',
  'src/components/dashboard',
  'src/components/simulator',
  'src/components/finance',
  'src/components/trading'
];

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

let files = [];
dirs.forEach(d => {
  if (fs.existsSync(d)) files = files.concat(walk(d));
});

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  let lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if ((lines[i].includes('bg-accent') || lines[i].includes('bg-win') || lines[i].includes('bg-loss') || lines[i].includes('bg-blue-') || lines[i].includes('bg-green-') || lines[i].includes('bg-red-')) && lines[i].includes('text-txt')) {
      if (!lines[i].includes('text-txt-')) { // dont replace text-txt-2
         lines[i] = lines[i].replace(/text-txt/g, 'text-white');
      }
    }
  }
  content = lines.join('\n');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed accent', file);
  }
});
