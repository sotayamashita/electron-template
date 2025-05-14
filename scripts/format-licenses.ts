import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");

// License details interface
interface LicenseDetails {
  licenses: string;
  repository?: string;
  publisher?: string;
  email?: string;
  path: string;
  licenseFile?: string;
  version?: string;
}

// License JSON format
interface LicenseJson {
  [packageName: string]: LicenseDetails;
}

// Load license JSON file
const licensesJsonPath = path.join(rootDir, "resources", "licenses.json");
const licensesHtmlPath = path.join(rootDir, "resources", "licenses.html");

try {
  const licensesJson = JSON.parse(
    fs.readFileSync(licensesJsonPath, "utf8"),
  ) as LicenseJson;

  let html = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
    <style> body { padding: 20px; }</style>
  </head>
  <body>
    <article class="container mx-auto prose">
      <h2>Third-Party Software Licenses</h2>
      <p>This project makes use of the following third party libraries:</p>`;

  Object.entries(licensesJson)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([packageName, details]) => {
      const { licenseFile } = details;

      html += `<h3>${packageName}</h3>`;

      if (licenseFile && fs.existsSync(licenseFile)) {
        const licenseText = fs.readFileSync(licenseFile, "utf8");
        html += `<pre>${escapeHtml(licenseText)}</pre>`;
      }
    });

  html += `
    </article>
  </body>
</html>
`;

  fs.writeFileSync(licensesHtmlPath, html);
  console.log(`✅ Generated licenses HTML at ${licensesHtmlPath}`);
} catch (error) {
  console.error("Error generating licenses HTML:", error);
  process.exit(1);
}

/**
 * Escapes HTML special characters in a string
 * @param unsafe - The string to be escaped
 * @returns The escaped string
 */
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
