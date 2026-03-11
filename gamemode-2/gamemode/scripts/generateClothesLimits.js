/**
 * Generates clothes slider limits from gta5-dlcs (https://github.com/BlorisL/gta5-dlcs).
 * Fetches basegame JSON and computes max drawable/texture per category for creator & wardrobe.
 * Usage: node scripts/generateClothesLimits.js [--output frontend/src/assets/clothesLimits.generated.json]
 */

const https = require("https");
const fs = require("fs");
const path = require("path");

const BASE = "https://raw.githubusercontent.com/BlorisL/gta5-dlcs/main/basegame";
const FILES = {
    tops: ["basegame-clothes-top-male.json", "basegame-clothes-top-female.json"],
    pants: ["basegame-clothes-legs-male.json", "basegame-clothes-legs-female.json"],
    shoes: ["basegame-clothes-shoes-male.json", "basegame-clothes-shoes-female.json"],
    masks: ["basegame-clothes-mask-male.json", "basegame-clothes-mask-female.json"],
    hats: ["basegame-clothes-accessory-male.json", "basegame-clothes-accessory-female.json"] // prop 0 / accessory
};

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode !== 200) return reject(new Error(`${url} ${res.statusCode}`));
            let body = "";
            res.on("data", (c) => (body += c));
            res.on("end", () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    reject(e);
                }
            });
        }).on("error", reject);
    });
}

function computeMax(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return { maxDrawable: 0, maxTexture: 0 };
    let maxD = 0, maxT = 0;
    for (const o of arr) {
        const d = o.absolute ?? o.drawable ?? 0;
        const t = o.texture ?? 0;
        if (d > maxD) maxD = d;
        if (t > maxT) maxT = t;
    }
    return { maxDrawable: maxD, maxTexture: Math.min(maxT, 255) };
}

async function main() {
    const outArg = process.argv.indexOf("--output");
    const outPath = outArg !== -1 ? process.argv[outArg + 1] : path.join(__dirname, "../frontend/src/assets/clothesLimits.generated.json");

    const limits = {
        hats: { maxDrawable: 150, maxTexture: 20 },
        masks: { maxDrawable: 200, maxTexture: 20 },
        tops: { maxDrawable: 250, maxTexture: 25 },
        pants: { maxDrawable: 100, maxTexture: 20 },
        shoes: { maxDrawable: 100, maxTexture: 15 }
    };

    for (const [category, fileNames] of Object.entries(FILES)) {
        let maxD = 0, maxT = 0;
        for (const file of fileNames) {
            try {
                const url = `${BASE}/${file}`;
                const data = await fetchJson(url);
                const { maxDrawable, maxTexture } = computeMax(data);
                if (maxDrawable > maxD) maxD = maxDrawable;
                if (maxTexture > maxT) maxT = maxTexture;
            } catch (e) {
                console.warn(`[generateClothesLimits] ${file}: ${e.message}`);
            }
        }
        if (maxD > 0 || maxT > 0) {
            limits[category].maxDrawable = Math.max(limits[category].maxDrawable, maxD);
            limits[category].maxTexture = Math.max(limits[category].maxTexture, Math.min(maxT, 255));
        }
    }

    const dir = path.dirname(outPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(limits, null, 2), "utf8");
    console.log(`Wrote ${outPath}`);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
