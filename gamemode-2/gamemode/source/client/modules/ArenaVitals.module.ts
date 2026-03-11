import { Browser } from "@classes/Browser.class";

let lastHealth = -1;
let lastArmor = -1;

mp.events.add("render", () => {
    if (Browser.currentPage !== "arena_hud") return;

    const player = mp.players.local;
    if (!player || !mp.players.exists(player)) return;

    // GTA health: 0-200 (200=full) or 0-100 in some builds; normalize to 0-100
    const rawHealth = player.getHealth();
    const health = rawHealth > 100 ? Math.min(100, rawHealth - 100) : Math.min(100, rawHealth);
    const armor = Math.max(0, Math.min(100, player.getArmour?.() ?? player.armour ?? 0));

    if (health === lastHealth && armor === lastArmor) return;
    lastHealth = health;
    lastArmor = armor;

    mp.events.call("client::eventManager", "cef::arena:setVitals", { health, armor });
});
