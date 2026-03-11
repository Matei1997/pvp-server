/**
 * Parses Menyoo outfit XMLs (UltimateOutfitPack style) into our wardrobe format.
 * Usage: node scripts/parseMenyooOutfits.js "C:\path\to\Outfit" [--output path/to/outfitPresets.json]
 * Output: { presets: [ { name, gender, clothes: { hats, masks, tops, pants, shoes } } ] }
 * Menyoo: PedProps _0 = hat, PedComps _1=mask _4=pants _6=shoes _11=tops. Format "drawable,texture"; -1,-1 = none.
 */

const fs = require("fs");
const path = require("path");

function parseDrawableTexture(str) {
    if (!str || str === "-1,-1") return null;
    const [d, t] = str.split(",").map((s) => parseInt(s.trim(), 10));
    if (isNaN(d) || d < 0) return null;
    return { drawable: d, texture: isNaN(t) || t < 0 ? 0 : t };
}

function parseOneXml(content, filePath) {
    const comps = {};
    const props = {};
    const compMatch = content.match(/<PedComps>([\s\S]*?)<\/PedComps>/);
    if (compMatch) {
        for (let i = 0; i <= 11; i++) {
            const m = compMatch[1].match(new RegExp(`<_${i}>([^<]+)</_${i}>`));
            if (m) comps[i] = m[1].trim();
        }
    }
    const propMatch = content.match(/<PedProps>([\s\S]*?)<\/PedProps>/);
    if (propMatch) {
        for (let i = 0; i <= 9; i++) {
            const m = propMatch[1].match(new RegExp(`<_${i}>([^<]+)</_${i}>`));
            if (m) props[i] = m[1].trim();
        }
    }
    const hat = parseDrawableTexture(props[0]);
    const mask = parseDrawableTexture(comps[1]);
    const pants = parseDrawableTexture(comps[4]);
    const shoes = parseDrawableTexture(comps[6]);
    const tops = parseDrawableTexture(comps[11]);
    const clothes = {
        hats: hat || { drawable: 0, texture: 0 },
        masks: mask || { drawable: 0, texture: 0 },
        tops: tops || { drawable: 15, texture: 0 },
        pants: pants || { drawable: 21, texture: 0 },
        shoes: shoes || { drawable: 34, texture: 0 }
    };
    const normalized = filePath.replace(/\\/g, "/");
    const gender = normalized.toLowerCase().includes("!female") ? "female" : "male";
    const baseName = path.basename(filePath, ".xml").replace(/\s+/g, " ").trim();
    return { name: baseName, gender, clothes, fileName: path.basename(filePath) };
}

function walkDir(dir, out, baseDir) {
    baseDir = baseDir || dir;
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) walkDir(full, out, baseDir);
        else if (e.name.toLowerCase().endsWith(".xml")) {
            try {
                const content = fs.readFileSync(full, "utf8");
                const preset = parseOneXml(content, full);
                const rel = path.relative(baseDir, path.dirname(full)).replace(/\\/g, "/");
                const parts = rel ? rel.split("/").filter(Boolean) : [];
                const folderLabel = parts.slice(-1)[0] || "";
                preset.name = folderLabel ? `${folderLabel} - ${preset.name}` : preset.name;
                out.push(preset);
            } catch (err) {
                console.warn("Skip " + full + ": " + err.message);
            }
        }
    }
}

const outfitDir = process.argv[2];
if (!outfitDir) {
    console.log("Usage: node parseMenyooOutfits.js <path-to-Outfit-folder> [--output file.json]");
    process.exit(1);
}
const outPath = process.argv[3] === "--output" ? process.argv[4] : path.join(__dirname, "../frontend/src/assets/outfitPresets.generated.json");
const presets = [];
walkDir(path.resolve(outfitDir), presets, path.resolve(outfitDir));
presets.sort((a, b) => a.name.localeCompare(b.name));
const result = { presets };
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(result, null, 2), "utf8");
console.log("Wrote " + presets.length + " presets to " + outPath);
