const fs = require('fs');
const path = require('path');

// Change this to the folder you want to index
const folderPath = './maps';
const outputFile = 'fileIndex.json';

function indexFiles(folder) {
  const files = fs.readdirSync(folder, { withFileTypes: true });
  const fileIndex = {};

  let counter = 1;
  files.forEach(file => {
    if (file.isFile()) {
      fileIndex[counter] = {
        name: path.parse(file.name).name.replace("_", " "), // filename without extension
        path: path.join(folder, file.name)
      };
      counter++;
    }
  });

  return fileIndex;
}

const indexedFiles = indexFiles(folderPath);

// Write the JSON to a file
fs.writeFileSync(outputFile, JSON.stringify(indexedFiles, null, 2));

console.log(`Indexed ${Object.keys(indexedFiles).length} files. Saved to ${outputFile}`);
