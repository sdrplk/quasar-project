// Import required modules
const bytenode = require("bytenode");
const path = require("path");
const fs = require("fs");
const { spawnSync } = require("child_process");

const appDir = path.join(
  __dirname,
  "dist",
  "electron",
  "Quasar App-win32-x64",
  "resources"
);
const folderPath = path.join(appDir, "app");

// Create the folder
fs.mkdir(folderPath, { recursive: true }, (err) => {
  if (err) {
    console.error(`Error creating folder: ${err}`);
    return;
  }
  console.log(`Folder created successfully at ${folderPath}`);
});
// Unpack the asar archive
console.log("Unpacking the asar archive...");
spawnSync("npx", [
  "asar",
  "extract",
  path.join(appDir, "app.asar"),
  path.join(appDir, "app"),
]);

// Encrypt all JavaScript files with Bytenode
console.log("Encrypting all JavaScript files with Bytenode...");

const encryptFile = (filePath) => {
  const sourceFile = filePath;
  const outputFile = filePath + "c";

  bytenode.compileFile(sourceFile, outputFile);

  console.log(sourceFile, outputFile);
  fs.renameSync(sourceFile, outputFile);
  // fs.unlinkSync(sourceFile);
};

const encryptDirectory = (dirPath) => {
  console.log("dirPath", dirPath);
  const files = fs.readdirSync(dirPath);

  files.forEach(function (file) {
    const filePath = path.join(dirPath, file);

    if (fs.statSync(filePath).isDirectory()) {
      if (file === "node_modules") {
        return; // skip node_modules directory
      }
      encryptDirectory(filePath);
    } else if (path.extname(file) === ".js") {
      console.log(`Encrypting ${filePath}...`);
      encryptFile(filePath);
    }
  });
};

encryptDirectory(path.join(appDir, "app"));

// Repack the asar archive
console.log("Repacking the asar archive...");
spawnSync("npx", [
  "asar",
  "pack",
  path.join(appDir, "app"),
  path.join(appDir, "app.asar"),
  "--asar-unpack",
]);

console.log("Encryption complete.");
