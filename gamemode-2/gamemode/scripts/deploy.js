
const fs = require("fs");
const path = require("path");

const BOILERPLATE = path.join(__dirname, "..");
const RAGEMP_SERVER = path.join(BOILERPLATE, "..", "ragemp-server");

const copies = [
    { src: "packages/server", dest: "packages/server" },
    { src: "client_packages", dest: "client_packages" }
];

// Server package needs node_modules at runtime (typeorm, pg, dotenv, etc.)
const nodeModulesSrc = path.join(BOILERPLATE, "node_modules");
const nodeModulesDest = path.join(RAGEMP_SERVER, "packages", "server", "node_modules");

console.log("Deploying to ragemp-server...\n");

for (const { src, dest } of copies) {
    const srcPath = path.join(BOILERPLATE, src);
    const destPath = path.join(RAGEMP_SERVER, dest);

    if (!fs.existsSync(srcPath)) {
        console.warn(`  Skip ${src}: not found (run build first)`);
        continue;
    }

    try {
        fs.cpSync(srcPath, destPath, { recursive: true });
        console.log(`  Copied ${src} -> ragemp-server/${dest}`);

        // Delete source folder after copy
        fs.rmSync(srcPath, { recursive: true, force: true });
    } catch (err) {
        console.error(`  Failed to copy or delete ${src}:`, err.message);
        process.exit(1);
    }
}

// Copy node_modules so the server package can require() typeorm, pg, dotenv, etc.
if (fs.existsSync(nodeModulesSrc)) {
    try {
        if (fs.existsSync(nodeModulesDest)) fs.rmSync(nodeModulesDest, { recursive: true, force: true });
        fs.cpSync(nodeModulesSrc, nodeModulesDest, { recursive: true });
        console.log("  Copied node_modules -> ragemp-server/packages/server/node_modules");
    } catch (err) {
        console.error("  Failed to copy node_modules:", err.message);
        process.exit(1);
    }
}

// Special case: if packages/server was the source, check if parent packages folder is empty and delete it
const packagesPath = path.join(BOILERPLATE, "packages");
if (fs.existsSync(packagesPath) && fs.readdirSync(packagesPath).length === 0) {
    fs.rmSync(packagesPath, { recursive: true, force: true });
}

console.log("\nDeploy complete.");
