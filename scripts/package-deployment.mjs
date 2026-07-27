import { spawnSync } from "node:child_process";
import {
  accessSync,
  constants,
  existsSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, extname, join, resolve, sep } from "node:path";

const projectRoot = process.cwd();
const packageJsonPath = join(projectRoot, "package.json");
const deploymentDocPath = join(projectRoot, "DEPLOYMENT.md");

const fail = (message, details = []) => {
  const error = new Error(message);
  error.details = details;
  throw error;
};

const readText = (filePath) => readFileSync(filePath, "utf8");
const fileExists = (relativePath) => existsSync(join(projectRoot, relativePath));

if (!existsSync(packageJsonPath)) {
  fail("No package.json was found in the current directory.", [
    "Run this command from the project root.",
  ]);
}

const packageJson = JSON.parse(readText(packageJsonPath));
const projectName = String(packageJson.name || basename(projectRoot))
  .replace(/^@/, "")
  .replace(/[^a-zA-Z0-9._-]+/g, "-")
  .replace(/^-+|-+$/g, "") || "website";
const zipFilename = `${projectName}-deploy.zip`;
const zipPath = join(projectRoot, zipFilename);
const temporaryZipPath = join(tmpdir(), `.${projectName}-deploy-${process.pid}.zip`);

function detectPackageManager() {
  const declared = String(packageJson.packageManager || "").split("@")[0];
  const lockfiles = [
    ["npm", "package-lock.json"],
    ["pnpm", "pnpm-lock.yaml"],
    ["yarn", "yarn.lock"],
    ["bun", "bun.lock"],
    ["bun", "bun.lockb"],
  ];

  if (["npm", "pnpm", "yarn", "bun"].includes(declared)) {
    return { name: declared, lockfile: lockfiles.find(([name]) => name === declared)?.[1] ?? null };
  }

  const detected = lockfiles.find(([, lockfile]) => fileExists(lockfile));
  if (!detected) {
    fail("No supported package-manager lockfile was found.", [
      "Expected package-lock.json, pnpm-lock.yaml, yarn.lock, bun.lock, or bun.lockb.",
      "Create and commit a lockfile before packaging so builds are reproducible.",
    ]);
  }

  return { name: detected[0], lockfile: detected[1] };
}

function detectFramework() {
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  const has = (dependency) => Boolean(dependencies[dependency]);

  if (has("next") || fileExists("next.config.js") || fileExists("next.config.mjs") || fileExists("next.config.ts")) {
    return { id: "next", label: "Next.js" };
  }
  if (has("nuxt") || fileExists("nuxt.config.js") || fileExists("nuxt.config.ts")) {
    return { id: "nuxt", label: "Nuxt" };
  }
  if (has("@sveltejs/kit") || fileExists("svelte.config.js")) {
    return { id: "sveltekit", label: "SvelteKit" };
  }
  if (has("astro") || fileExists("astro.config.mjs") || fileExists("astro.config.ts")) {
    return { id: "astro", label: "Astro" };
  }
  if (has("vite") || fileExists("vite.config.js") || fileExists("vite.config.ts")) {
    if (has("react")) return { id: "vite", label: "Vite + React" };
    if (has("vue")) return { id: "vite", label: "Vite + Vue" };
    if (has("svelte")) return { id: "vite", label: "Vite + Svelte" };
    return { id: "vite", label: "Vite" };
  }
  if (has("react-scripts")) return { id: "cra", label: "Create React App" };
  if (has("react")) return { id: "react", label: "React" };
  if (has("vue")) return { id: "vue", label: "Vue" };
  return { id: "javascript", label: "JavaScript / static site" };
}

function walkFiles(directory, acceptedExtensions = null) {
  if (!existsSync(directory)) return [];
  const files = [];

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".git") continue;
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(entryPath, acceptedExtensions));
    } else if (!acceptedExtensions || acceptedExtensions.has(extname(entry.name))) {
      files.push(entryPath);
    }
  }

  return files;
}

function sourceContains(pattern) {
  const sourceFiles = walkFiles(join(projectRoot, "src"), new Set([".js", ".jsx", ".ts", ".tsx", ".vue", ".svelte"]));
  return sourceFiles.some((filePath) => pattern.test(readText(filePath)));
}

function detectDeploymentType(framework) {
  if (framework.id === "next") {
    const configPath = ["next.config.js", "next.config.mjs", "next.config.ts"].find(fileExists);
    const config = configPath ? readText(join(projectRoot, configPath)) : "";
    const serverFeaturePaths = ["app/api", "pages/api", "middleware.js", "middleware.ts"];
    const usesServerFeatures = serverFeaturePaths.some(fileExists)
      || sourceContains(/\bgetServerSideProps\b|["']use server["']/);
    const isExport = /\boutput\s*:\s*["']export["']/.test(config);
    return {
      isStatic: isExport && !usesServerFeatures,
      reason: usesServerFeatures
        ? "Server-side Next.js features were detected."
        : isExport
          ? "Next.js static export is configured."
          : "Next.js static export is not configured.",
    };
  }

  if (framework.id === "nuxt") {
    return {
      isStatic: Boolean(packageJson.scripts?.generate),
      reason: packageJson.scripts?.generate
        ? "A Nuxt static generation script is available."
        : "Nuxt is treated as server-rendered unless a static generate script is configured.",
    };
  }

  if (framework.id === "sveltekit") {
    const config = fileExists("svelte.config.js") ? readText(join(projectRoot, "svelte.config.js")) : "";
    const adapterStatic = config.includes("@sveltejs/adapter-static");
    return {
      isStatic: adapterStatic,
      reason: adapterStatic
        ? "SvelteKit uses adapter-static."
        : "SvelteKit is treated as server-rendered unless adapter-static is configured.",
    };
  }

  if (framework.id === "astro") {
    const configPath = ["astro.config.mjs", "astro.config.ts"].find(fileExists);
    const config = configPath ? readText(join(projectRoot, configPath)) : "";
    const serverOutput = /\boutput\s*:\s*["']server["']/.test(config);
    return {
      isStatic: !serverOutput,
      reason: serverOutput ? "Astro server output is configured." : "Astro uses static output.",
    };
  }

  return {
    isStatic: true,
    reason: `${framework.label} produces static browser assets.`,
  };
}

function detectSpaFallback() {
  return sourceContains(
    /\bBrowserRouter\b|\bcreateBrowserRouter\b|\bcreateWebHistory\b|\bpushState\b/,
  );
}

function configuredViteOutDir() {
  const configPath = ["vite.config.js", "vite.config.ts", "vite.config.mjs"].find(fileExists);
  if (!configPath) return null;
  const match = readText(join(projectRoot, configPath)).match(/\boutDir\s*:\s*["']([^"']+)["']/);
  return match?.[1] ?? null;
}

function outputCandidates(framework) {
  const candidates = [];
  const viteOutDir = framework.id === "vite" ? configuredViteOutDir() : null;
  if (viteOutDir) candidates.push(viteOutDir);

  const frameworkCandidates = {
    next: ["out"],
    nuxt: [".output/public", "dist"],
    sveltekit: ["build"],
    astro: ["dist"],
    vite: ["dist"],
    cra: ["build"],
    react: ["build", "dist"],
    vue: ["dist"],
    javascript: ["dist", "build", "out"],
  };

  candidates.push(...(frameworkCandidates[framework.id] ?? ["dist", "build", "out"]));
  return [...new Set(candidates)];
}

function buildInvocation(packageManager) {
  const executable = packageManager.name;
  const args = packageManager.name === "yarn" ? ["build"] : ["run", "build"];
  return {
    executable,
    args,
    display: [executable, ...args].join(" "),
  };
}

function runBuild(invocation) {
  if (!packageJson.scripts?.build) {
    fail('package.json does not define a "build" script.', [
      "Add the framework's production build command to package.json before packaging.",
    ]);
  }

  console.log(`\nBuilding production site with: ${invocation.display}\n`);
  const result = spawnSync(invocation.executable, invocation.args, {
    cwd: projectRoot,
    env: process.env,
    stdio: "inherit",
  });

  if (result.error) {
    fail(`Could not start ${invocation.executable}: ${result.error.message}`, [
      `Confirm ${invocation.executable} is installed and available in PATH.`,
      `Confirm ${packageManager.lockfile} and package.json are valid.`,
    ]);
  }
  if (result.status !== 0) {
    fail(`Production build failed with exit code ${result.status}.`, [
      "Review the build error printed above.",
      "Likely correction points: package.json, the framework configuration, or the source file named in the build error.",
    ]);
  }
}

function detectOutputDirectory(framework) {
  const candidates = outputCandidates(framework);
  for (const candidate of candidates) {
    const candidatePath = resolve(projectRoot, candidate);
    if (!candidatePath.startsWith(`${projectRoot}${sep}`)) continue;
    if (existsSync(candidatePath) && statSync(candidatePath).isDirectory()) {
      return { relativePath: candidate, absolutePath: candidatePath };
    }
  }

  fail("The build finished, but no supported output directory was found.", [
    `Checked: ${candidates.join(", ")}.`,
    "Confirm the output directory in the framework configuration and add it to outputCandidates() if it is custom.",
  ]);
}

function validateOutput(outputDirectory) {
  const indexPath = join(outputDirectory.absolutePath, "index.html");
  if (!existsSync(indexPath) || !statSync(indexPath).isFile()) {
    fail(`The deployment output is invalid: ${outputDirectory.relativePath}/index.html is missing.`, [
      "A static hosting package must have index.html at its root.",
      "Confirm the project is configured for static output.",
    ]);
  }
  if (statSync(indexPath).size === 0) {
    fail(`The deployment output is invalid: ${outputDirectory.relativePath}/index.html is empty.`);
  }

  const indexHtml = readText(indexPath);
  const assetReferences = [];
  const tagPattern = /<(?:script|link|img|source)\b[^>]*(?:src|href)=["']([^"'?#]+)[^"']*["'][^>]*>/gi;
  for (const match of indexHtml.matchAll(tagPattern)) {
    const reference = match[1];
    if (/^(?:https?:|data:|mailto:|tel:|#)/i.test(reference)) continue;
    assetReferences.push(reference);
  }

  const missingAssets = assetReferences.filter((reference) => {
    const decoded = decodeURIComponent(reference);
    const assetPath = decoded.startsWith("/")
      ? join(outputDirectory.absolutePath, decoded.slice(1))
      : resolve(dirname(indexPath), decoded);
    return !existsSync(assetPath);
  });

  if (missingAssets.length > 0) {
    fail("The built index references files that are missing from the deployment output.", [
      ...missingAssets.map((asset) => `Missing: ${asset}`),
      "Check Vite public assets and base-path configuration.",
    ]);
  }

  const files = walkFiles(outputDirectory.absolutePath);
  if (files.length < 2) {
    fail("The deployment output contains index.html but no supporting production files.");
  }

  return files.length;
}

function addSpaFallback(outputDirectory) {
  const htaccessPath = join(outputDirectory.absolutePath, ".htaccess");
  const rules = `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
`;
  writeFileSync(htaccessPath, rules);
}

function createZip(outputDirectory) {
  rmSync(temporaryZipPath, { force: true });
  const result = spawnSync("zip", ["-q", "-r", temporaryZipPath, ".", "-x", "*.DS_Store"], {
    cwd: outputDirectory.absolutePath,
    encoding: "utf8",
  });

  if (result.error) {
    fail(`Could not create the ZIP: ${result.error.message}`, [
      "Install the standard zip command-line utility and run the packaging command again.",
    ]);
  }
  if (result.status !== 0) {
    fail(`The zip utility failed with exit code ${result.status}.`, [
      result.stderr?.trim() || "Check file permissions and available disk space.",
    ]);
  }

  accessSync(temporaryZipPath, constants.R_OK);
  if (statSync(temporaryZipPath).size === 0) {
    fail("The generated ZIP is empty.");
  }

  const inspection = spawnSync("unzip", ["-Z1", temporaryZipPath], { encoding: "utf8" });
  if (inspection.error || inspection.status !== 0) {
    fail("The generated ZIP could not be verified.", [
      inspection.error?.message || inspection.stderr?.trim() || "The unzip utility returned an error.",
    ]);
  }

  const entries = inspection.stdout.split(/\r?\n/).filter(Boolean);
  if (!entries.includes("index.html")) {
    fail("The generated ZIP is invalid: index.html is not at the ZIP root.");
  }
  if (entries.some((entry) => entry === `${outputDirectory.relativePath}/` || entry.startsWith(`${outputDirectory.relativePath}/`))) {
    fail(`The generated ZIP incorrectly contains the ${outputDirectory.relativePath}/ parent folder.`);
  }

  rmSync(zipPath, { force: true });
  renameSync(temporaryZipPath, zipPath);
  return entries;
}

function deploymentMarkdown({
  framework,
  packageManager,
  invocation,
  outputDirectory,
  deploymentType,
  spaFallback,
}) {
  const routing = spaFallback
    ? "Single-page application. History-routing fallback is required and `.htaccess` is included in the deployment ZIP."
    : "Static multi-page routing. No SPA fallback file is added.";
  const apacheNotes = spaFallback
    ? "The included `.htaccess` sends requests for paths that are not real files or directories to `index.html`. Apache must have `mod_rewrite` enabled and allow overrides."
    : "No rewrite fallback is required for this build.";
  const nginxRule = spaFallback
    ? `\`\`\`nginx
location / {
  try_files $uri $uri/ /index.html;
}
\`\`\``
    : "Serve files normally from the configured document root; no catch-all rewrite is required.";

  return `# Deployment

This file is generated by \`${packageManager.name} run deploy:package\`.

## Detected project

| Setting | Value |
| --- | --- |
| Framework | ${framework.label} |
| Package manager | ${packageManager.name} (${packageManager.lockfile}) |
| Existing production build | \`${invocation.display}\` |
| Build output | \`${outputDirectory.relativePath}/\` |
| Deployment type | ${deploymentType.isStatic ? "Static website" : "Node.js server required"} |
| Routing | ${routing} |
| Deployment ZIP | \`${zipFilename}\` |

${deploymentType.reason}

## Create the deployment package

From the project root:

\`\`\`bash
${packageManager.name} run deploy:package
\`\`\`

The command runs the existing production build, validates the output, adds only the required generated routing fallback, and creates:

\`\`\`text
${zipPath}
\`\`\`

The ZIP contains the contents of \`${outputDirectory.relativePath}/\` directly. Do not upload the source project, \`node_modules/\`, or the \`${outputDirectory.relativePath}/\` parent directory.

## Files to upload

Extract \`${zipFilename}\` into the hosting account's public document root. The ZIP root contains \`index.html\`, production assets, public media, and the generated \`.htaccess\` routing fallback.

Common document-root names include \`public_html/\`, \`httpdocs/\`, \`htdocs/\`, \`www/\`, and \`web/\`. Use the directory assigned to the target domain or subdomain by the hosting control panel.

## FTP or SFTP

1. Create the domain or subdomain in the hosting panel and note its document root.
2. Connect with the host name, port, user name, and password or SSH key supplied by the provider. Prefer SFTP on port 22 when available.
3. Open the assigned public document root.
4. Upload the **contents** of the ZIP so \`index.html\` is directly inside that directory.
5. Keep \`.htaccess\` visible and uploaded; some FTP clients hide dotfiles.
6. Visit the domain and test the home page, a deep route, images, fonts, and browser refresh.

## cPanel

Open **Domains** to confirm the domain's document root, then use **File Manager** to open that directory. Upload \`${zipFilename}\`, extract it there, confirm that \`index.html\` is at the document root, and delete the uploaded ZIP from the server after extraction.

## Plesk

Open **Websites & Domains**, select the domain, and open **Files** at its document root (commonly \`httpdocs/\`). Upload and extract \`${zipFilename}\`, then confirm that \`index.html\` and \`.htaccess\` are directly in that directory.

## Apache routing

${apacheNotes}

## Nginx routing

Nginx does not read \`.htaccess\`. Ask the server administrator to add this rule to the domain's server block:

${nginxRule}

Reload Nginx after validating the configuration.

## Custom domain or subdomain

For a custom domain, point the DNS records to the hosting provider as instructed by that provider, assign the domain to the document root containing this build, and enable HTTPS.

For a subdomain such as \`project.reframestudio.es\`:

1. Create \`project\` in the DNS zone (usually an \`A\` record to the server IP or a \`CNAME\` supplied by the host).
2. Add the subdomain in cPanel, Plesk, or the provider dashboard.
3. Assign a dedicated document root.
4. Extract the deployment ZIP into that root.
5. Issue or enable an SSL certificate after DNS resolves.

This build uses root-relative asset URLs (for example, \`/assets/\` and \`/media/\`). Deploy it at the root of a domain or subdomain. Hosting it under a path such as \`example.com/project/\` requires an intentional Vite base-path and router-basename change, which this workflow does not make because it would alter current application routing.

## GitHub and Vercel

The editable source project can remain in GitHub. Vercel can continue building from the repository with the existing \`vercel.json\` SPA rewrite. The generated ZIP is intended for static/shared hosting and does not need a Node.js process.

## Requirements and limitations

- Static hosting must serve \`index.html\` and all bundled assets without renaming them.
- Apache hosting must allow the included \`.htaccess\` rules for deep-link refreshes.
- Nginx hosting requires the equivalent server rule shown above.
- The site must be deployed at a domain or subdomain root unless its asset and router base paths are deliberately reconfigured.
- No database, API route, server action, middleware, authentication server, or runtime image-processing service is required by this build.
`;
}

const packageManager = detectPackageManager();
const framework = detectFramework();
const deploymentType = detectDeploymentType(framework);
const spaFallback = detectSpaFallback();
const invocation = buildInvocation(packageManager);

console.log("Detected deployment configuration:");
console.log(`  Framework:       ${framework.label}`);
console.log(`  Package manager: ${packageManager.name} (${packageManager.lockfile})`);
console.log(`  Build command:   ${invocation.display}`);
console.log(`  Deployment type: ${deploymentType.isStatic ? "static" : "Node.js server required"}`);
console.log(`  SPA fallback:    ${spaFallback ? "required" : "not required"}`);

try {
  rmSync(zipPath, { force: true });
  rmSync(temporaryZipPath, { force: true });

  if (!deploymentType.isStatic) {
    const placeholderOutput = { relativePath: "(server build)", absolutePath: projectRoot };
    writeFileSync(
      deploymentDocPath,
      deploymentMarkdown({
        framework,
        packageManager,
        invocation,
        outputDirectory: placeholderOutput,
        deploymentType,
        spaFallback: false,
      }),
    );
    fail("This project requires a Node.js-compatible host, so no static deployment ZIP was created.", [
      deploymentType.reason,
      "See DEPLOYMENT.md for the detected hosting requirement.",
    ]);
  }

  runBuild(invocation);
  const outputDirectory = detectOutputDirectory(framework);
  const fileCount = validateOutput(outputDirectory);

  if (spaFallback) addSpaFallback(outputDirectory);

  const zipEntries = createZip(outputDirectory);
  writeFileSync(
    deploymentDocPath,
    deploymentMarkdown({
      framework,
      packageManager,
      invocation,
      outputDirectory,
      deploymentType,
      spaFallback,
    }),
  );

  console.log("\nDeployment package created successfully.");
  console.log(`  Output directory: ${outputDirectory.absolutePath}`);
  console.log(`  Validated files:  ${fileCount}`);
  console.log(`  ZIP entries:      ${zipEntries.length}`);
  console.log(`  Hosting:          static${spaFallback ? " SPA with routing fallback" : ""}`);
  console.log(`  ZIP path:         ${zipPath}`);
} catch (error) {
  rmSync(temporaryZipPath, { force: true });
  rmSync(zipPath, { force: true });
  console.error(`\nDeployment packaging failed: ${error.message}`);
  for (const detail of error.details ?? []) console.error(`  - ${detail}`);
  console.error("\nNo deployment ZIP was created.");
  process.exitCode = 1;
}
