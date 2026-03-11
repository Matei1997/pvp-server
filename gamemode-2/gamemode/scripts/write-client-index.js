/**
 * RageMP requires a root index.js in client_packages that loads the client bundle.
 * Without it, no client code runs — so no login screen, no CEF, no UI.
 */
const fs = require("fs");
const path = require("path");

const clientPackages = path.join(__dirname, "..", "client_packages");
const indexPath = path.join(clientPackages, "index.js");
const content = "require('./app');\n";

if (!fs.existsSync(clientPackages)) {
    fs.mkdirSync(clientPackages, { recursive: true });
}
fs.writeFileSync(indexPath, content);
console.log("  Wrote client_packages/index.js (RageMP client entry)");
