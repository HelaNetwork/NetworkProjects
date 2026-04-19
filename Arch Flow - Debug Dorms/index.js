const cloneRepo = require("./cloneRepo");
const readFiles = require("./readFiles");
const fs = require("fs");

async function main() {
  // run only once
  // await cloneRepo("https://github.com/expressjs/express");

  const files = readFiles("./repo");

  const finalOutput = {
    files: files,
    folders: []
  };

  fs.writeFileSync("output.json", JSON.stringify(finalOutput, null, 2));

  console.log("Sample file:");
  console.log(finalOutput.files[0]);

  console.log("Total files:", finalOutput.files.length);
}

main();