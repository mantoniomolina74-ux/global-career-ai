
import fs from "fs";
import path from "path";

const PROJECT_NAME = "global-career-ai";

const timestamp = new Date()
  .toISOString()
  .replace(/[:.]/g, "-");

const backupRoot = "C:\\GlobalCareerAI_Backups";

const targetDir = path.join(
  backupRoot,
  `${PROJECT_NAME}_${timestamp}`
);

function copyRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      if (
        entry.name === "node_modules" ||
        entry.name === ".git"
      ) {
        continue;
      }

      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const projectRoot = process.cwd();

if (!fs.existsSync(backupRoot)) {
  fs.mkdirSync(backupRoot, {
    recursive: true,
  });
}

console.log("Creating backup...");
console.log("Target:", targetDir);

copyRecursive(projectRoot, targetDir);

console.log("Backup completed successfully!");