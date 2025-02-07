const fs = require('fs');
const path = require('path');

const getAllFiles = (dirPath, arrayOfFiles: string[] = []) => {
  const files = fs.readdirSync(dirPath);

  let filesArray = arrayOfFiles;

  for (const file of files)
    if (fs.statSync(`${dirPath}/${file}`).isDirectory())
      filesArray = getAllFiles(`${dirPath}/${file}`, filesArray);
    else
      filesArray.push(path.join(path.resolve(__dirname, '..'), dirPath, file));

  return filesArray;
};

const getSizeOfFiles = (files) => {
  let size = 0;
  for (const file of files) size += fs.statSync(file).size;

  return size;
};

const srcFiles = getAllFiles('src');
const srcSize = getSizeOfFiles(srcFiles);
console.log(`The size of all files in the SRC directory is ${srcSize} bytes.`);

const distFiles = getAllFiles('dist');
const distSize = getSizeOfFiles(distFiles);
console.log(
  `The size of all files in the DIST directory is ${distSize} bytes.`
);
