const fs = require("fs-extra");
const simpleGit = require("simple-git");

const git = simpleGit();

async function cloneRepo(repoUrl) {
  try {
    console.log("Cloning started...");

    // Only remove if exists
    if (await fs.pathExists("./repo")) {
      try {
        await fs.remove("./repo");
      } catch (err) {
        console.log("⚠️ Could not remove old repo, trying to continue...");
      }
    }

    await git.clone(repoUrl, "./repo", ["--depth", "1"]);

    console.log("Repo cloned successfully");

  } catch (error) {
    console.error("❌ Error cloning repo:");
    console.error(error.message);
  }
}

module.exports = cloneRepo;