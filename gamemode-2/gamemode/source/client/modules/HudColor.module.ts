/**
 * Team-based HUD colors (weapon wheel, pause menu accent).
 * Based on https://github.com/Dankyss/RageMP-Custom-Hud-Colour-and-Title
 */
const REPLACE_HUD_COLOUR = "0xF314CF4F0211894E";
const HUD_MICHAEL = 143;
const HUD_FREEMODE = 116;

const TEAM_COLORS = {
    red: { r: 220, g: 60, b: 60 },
    blue: { r: 60, g: 120, b: 220 }
};

const DEFAULT_COLOR = { r: 255, g: 255, b: 255 };

function applyHudColor(r: number, g: number, b: number) {
    mp.game.invoke(REPLACE_HUD_COLOUR, HUD_MICHAEL, r, g, b, 255);
    mp.game.invoke(REPLACE_HUD_COLOUR, HUD_FREEMODE, r, g, b, 255);
}

mp.events.add("client::arena:setTeam", (team: "red" | "blue") => {
    const color = TEAM_COLORS[team];
    if (color) applyHudColor(color.r, color.g, color.b);
});

mp.events.add("client::arena:clearTeam", () => {
    applyHudColor(DEFAULT_COLOR.r, DEFAULT_COLOR.g, DEFAULT_COLOR.b);
});
