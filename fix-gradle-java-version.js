const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, search, replace) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  const newContent = content.replace(new RegExp(search, 'g'), replace);
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✔ Corregido: ${filePath}`);
  }
}

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(path.join(__dirname, 'android'), file => {
  if (file.endsWith('.gradle')) {
    replaceInFile(file, 'JavaVersion.VERSION_21', 'JavaVersion.VERSION_17');
  }
});

console.log('✔ Todas las versiones de Java corregidas a VERSION_17 en archivos .gradle'); 