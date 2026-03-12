import * as fs from "fs";
import * as path from "path";
import { IArenaPreset } from "@shared/interfaces/ArenaPreset.interface";

const DATA_PATH = path.join(process.cwd(), "data", "arenas.json");

let presets: IArenaPreset[] = [];

function ensureDataDir(): void {
    const dir = path.dirname(DATA_PATH);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function loadPresets(): IArenaPreset[] {
    try {
        ensureDataDir();
        if (fs.existsSync(DATA_PATH)) {
            const raw = fs.readFileSync(DATA_PATH, "utf-8");
            const parsed = JSON.parse(raw);
            presets = Array.isArray(parsed) ? parsed : [];
        } else {
            presets = [];
            fs.writeFileSync(DATA_PATH, JSON.stringify([], null, 2), "utf-8");
        }
    } catch (err) {
        console.error("[Hopouts] Failed to load locations:", err);
        presets = [];
    }
    return presets;
}

export function getArenaPresets(): IArenaPreset[] {
    if (presets.length === 0) {
        loadPresets();
    }
    return presets;
}

export function saveArenaPreset(preset: IArenaPreset): boolean {
    try {
        ensureDataDir();
        const all = getArenaPresets();
        const idx = all.findIndex((p) => p.id === preset.id);
        if (idx >= 0) {
            all[idx] = preset;
        } else {
            all.push(preset);
        }
        fs.writeFileSync(DATA_PATH, JSON.stringify(all, null, 2), "utf-8");
        presets = all;
        return true;
    } catch (err) {
        console.error("[Hopouts] Failed to save location:", err);
        return false;
    }
}

loadPresets();
