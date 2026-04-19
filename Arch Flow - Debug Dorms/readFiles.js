const fs = require("fs");
const path = require("path");

const ignoredFolders = ["node_modules", ".git"];
const allowedExtensions = [".js", ".ts", ".py", ".java"];

function readFiles(dirPath, fileList = []) {
  const items = fs.readdirSync(dirPath);

  items.forEach((item) => {
    const fullPath = path.join(dirPath, item);

    // skip unwanted folders
    if (ignoredFolders.some(folder => fullPath.includes(folder))) {
      return;
    }

    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      readFiles(fullPath, fileList);
    } else {
      const ext = path.extname(fullPath);

      if (!allowedExtensions.includes(ext)) return;

      try {
        const content = fs.readFileSync(fullPath, "utf-8");

        fileList.push({
          filePath: fullPath,
          fileName: path.basename(fullPath),
          extension: ext,
          folder: path.dirname(fullPath),
          content: content.slice(0, 500)
        });

      } catch (err) {
        // skip unreadable files
      }
    }
  });

  return fileList; // ✅ INSIDE FUNCTION
}

module.exports = readFiles;