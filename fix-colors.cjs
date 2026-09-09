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

  content = content.replace(/text-white\/30/g, 'text-txt-3');
  content = content.replace(/text-white\/40/g, 'text-txt-2');
  content = content.replace(/text-white\/60/g, 'text-txt-2');
  content = content.replace(/text-white\/70/g, 'text-txt-2');
  content = content.replace(/text-white\/80/g, 'text-txt-2');
  content = content.replace(/text-white\/10/g, 'text-txt-3');
  content = content.replace(/text-white\/50/g, 'text-txt-2');
  
  content = content.replace(/bg-white\/5/g, 'dark:bg-white/5 bg-black/5');
  content = content.replace(/bg-white\/10/g, 'dark:bg-white/10 bg-black/10');
  content = content.replace(/bg-white\/20/g, 'dark:bg-white/20 bg-black/20');
  
  content = content.replace(/border-white\/5/g, 'border-border');
  content = content.replace(/border-white\/10/g, 'border-border');
  content = content.replace(/border-white\/20/g, 'border-border');

  content = content.replace(/text-white/g, 'text-txt');
  content = content.replace(/bg-accent\s+text-txt/g, 'bg-accent text-white');
  content = content.replace(/bg-accent-hover\s+text-txt/g, 'bg-accent-hover text-white');
  content = content.replace(/bg-win\s+text-txt/g, 'bg-win text-white');
  content = content.replace(/bg-loss\s+text-txt/g, 'bg-loss text-white');
  content = content.replace(/bg-blue-600\s+text-txt/g, 'bg-blue-600 text-white');
  content = content.replace(/bg-red-500\s+text-txt/g, 'bg-red-500 text-white');
  content = content.replace(/bg-green-500\s+text-txt/g, 'bg-green-500 text-white');
  content = content.replace(/bg-indigo-600\s+text-txt/g, 'bg-indigo-600 text-white');
  content = content.replace(/text-txt\/\d+/g, 'text-txt-2');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed', file);
  }
});
