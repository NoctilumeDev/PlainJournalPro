import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const requiredFiles = [
  "README.md",
  "LICENSE",
  "CODE_OF_CONDUCT.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
];
const implementationMarkers = [
  "pom.xml",
  "build.gradle",
  "build.gradle.kts",
  "go.mod",
  "Cargo.toml",
  "package.json",
  "pyproject.toml",
  "src",
  "cmd",
  "internal",
];

function fail(message) {
  failures.push(message);
}

function listFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === ".git") return [];
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(absolute) : [absolute];
  });
}

for (const relative of requiredFiles) {
  if (!fs.existsSync(path.join(root, relative))) fail(`Missing required file: ${relative}`);
}

for (const relative of implementationMarkers) {
  if (fs.existsSync(path.join(root, relative))) {
    fail(`Planning identity must be updated before implementation is added: ${relative}`);
  }
}

const files = listFiles(root);
const textExtensions = new Set(["", ".md", ".yml", ".yaml", ".json", ".mjs"]);
const textFiles = files.filter((file) => textExtensions.has(path.extname(file).toLowerCase()));
const markdownFiles = textFiles.filter((file) => path.extname(file).toLowerCase() === ".md");
const linkPattern = /\[[^\]]+\]\(([^)]+)\)/g;
const sensitivePatterns = [
  { name: "Windows user path", pattern: /[A-Za-z]:\\Users\\/ },
  { name: "Unix home path", pattern: /\/(?:Users|home)\/[^/\s]+\// },
  { name: "private key", pattern: /BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY/ },
  { name: "GitHub token", pattern: /\bgh[pousr]_[A-Za-z0-9]{20,}\b/ },
];

for (const file of textFiles) {
  const relative = path.relative(root, file).replaceAll(path.sep, "/");
  const content = fs.readFileSync(file, "utf8");
  if (!content.endsWith("\n")) fail(`${relative}: missing final newline`);
  content.split(/\r?\n/).forEach((line, index) => {
    if (/[ \t]+$/.test(line)) fail(`${relative}:${index + 1}: trailing whitespace`);
  });
  for (const { name, pattern } of sensitivePatterns) {
    if (pattern.test(content)) fail(`${relative}: contains ${name}`);
  }
}

for (const file of markdownFiles) {
  const relative = path.relative(root, file).replaceAll(path.sep, "/");
  const content = fs.readFileSync(file, "utf8");
  for (const match of content.matchAll(linkPattern)) {
    const target = match[1].trim();
    if (/^(?:https?:\/\/|mailto:|#)/.test(target)) continue;
    const pathname = decodeURIComponent(target.split("#", 1)[0]);
    if (!pathname) continue;
    if (!fs.existsSync(path.resolve(path.dirname(file), pathname))) {
      fail(`${relative}: broken relative link ${target}`);
    }
  }
}

const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
for (const statement of [
  "**规划与参考架构阶段，尚未进入生产实现。**",
  "后续代码、测试证据、Issue、Release 和版本历史均独立维护。",
  "https://github.com/NoctilumeDev/PlainJournal",
]) {
  if (!readme.includes(statement)) fail(`README.md: public identity statement is missing: ${statement}`);
}

const contributing = fs.readFileSync(path.join(root, "CONTRIBUTING.md"), "utf8");
if (!contributing.includes("尚未进入生产实现")) {
  fail("CONTRIBUTING.md: planning-stage contribution boundary is missing");
}

const security = fs.readFileSync(path.join(root, "SECURITY.md"), "utf8");
if (!security.includes("没有可部署应用、服务端点或演示账号")) {
  fail("SECURITY.md: planning-stage security boundary is missing");
}

const conduct = fs.readFileSync(path.join(root, "CODE_OF_CONDUCT.md"), "utf8");
if (!conduct.includes("PlainJournalPro")) fail("CODE_OF_CONDUCT.md: repository name is missing");

if (failures.length > 0) {
  console.error(`Repository verification failed with ${failures.length} issue(s):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(
  `Planning repository verification passed: ${textFiles.length} text files, ${markdownFiles.length} Markdown files.`,
);
