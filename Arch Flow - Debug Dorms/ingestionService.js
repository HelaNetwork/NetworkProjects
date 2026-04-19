const cloneRepo = require("./cloneRepo");
const readFiles = require("./readFiles");

async function ingestRepo(repoUrl) {
  // clone once
  await cloneRepo(repoUrl);

  const files = readFiles("./repo");

  return {
    files: files,
    folders: []
  };
}

module.exports = ingestRepo;