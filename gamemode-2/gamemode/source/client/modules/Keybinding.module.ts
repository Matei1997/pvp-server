import { InteractablePed } from "@classes/InteractablePed.class";
import { Browser } from "@classes/Browser.class";
import { ChatAPI } from "@classes/Chat.class";
import { Client } from "@classes/Client.class";
import { PlayerKeybind } from "@classes/Keybind.class";
import { EntityRaycast } from "@classes/Raycast.class";
import { CEFPages } from "@assets/CEFPages.asset";

function playerPressEscape() {
    if (mp.game.ui.isPauseMenuActive()) return;

    if (mp.players.local.getVariable("usingItem")) {
        return mp.events.callRemote("server::inventory:cancelAction");
    }

    if (!Browser.currentPage) return;

    switch (Browser.currentPage) {
        case "interactionMenu": {
            Browser.processEvent("cef::hud:setInteraction", { isActive: false, items: [] });
            Browser.closePage();
            break;
        }
        case "chat": {
            if (ChatAPI.chatOpen) ChatAPI.close();
            return;
        }
        default: {
            if (CEFPages[Browser.currentPage].close) {
                Browser.closePage();
            }
        }
    }
}

PlayerKeybind.addKeybind({ keyCode: 27, up: false }, playerPressEscape, "Close Pages");

const toggleAdminPanel = () => {
    const adminLevel = mp.players.local.getVariable("adminLevel");
    if (!adminLevel || adminLevel <= 0) {
        mp.gui.chat.push("~r~You don't have admin access.");
        return;
    }
    if (Browser.currentPage === "admin") {
        Browser.closePage();
    } else {
        Browser.openAdminPanel();
    }
};
PlayerKeybind.addKeybind({ keyCode: 115, up: false }, toggleAdminPanel, "Admin panel (F4)");
PlayerKeybind.addKeybind({ keyCode: 116, up: false }, toggleAdminPanel, "Admin panel (F5)");

PlayerKeybind.addKeybind(
    { keyCode: 113, up: false },
    () => {
        if (!mp.players.local.getVariable("loggedin") || Client.isDead) return;
        // F2 only toggles cursor across the whole server (no player menu)
        Browser.toggleCursorForClick();
    },
    "Toggle cursor (F2)"
);

// Hold right-click: in wardrobe = orbit camera; in F3 main menu clothing = rotate character
PlayerKeybind.addKeybind(
    { keyCode: 2, up: false },
    () => {
        if (Browser.currentPage === "wardrobe") {
            Browser.wardrobeCameraHeld = true;
            mp.gui.cursor.show(false, false);
        } else if (Browser.currentPage === "mainmenu" && Browser.mainMenuClothingActive) {
            Browser.mainMenuClothingRotateHeld = true;
            mp.gui.cursor.show(false, false);
        }
    },
    "Wardrobe / clothing rotate hold"
);
PlayerKeybind.addKeybind(
    { keyCode: 2, up: true },
    () => {
        if (Browser.currentPage === "wardrobe" && Browser.wardrobeCameraHeld) {
            Browser.wardrobeCameraHeld = false;
            mp.gui.cursor.show(true, true);
        } else if (Browser.mainMenuClothingRotateHeld) {
            Browser.mainMenuClothingRotateHeld = false;
            mp.gui.cursor.show(true, true);
        }
    },
    "Wardrobe / clothing rotate release"
);

// Arena item keybinds: 5 = Medkit, 6 = Plate
PlayerKeybind.addKeybind(
    { keyCode: 53, up: false },
    () => {
        if (Browser.currentPage !== "arena_hud") return;
        mp.events.callRemote("server::arena:useItem", JSON.stringify({ item: "medkit" }));
    },
    "Arena: Use Medkit (5)"
);
PlayerKeybind.addKeybind(
    { keyCode: 54, up: false },
    () => {
        if (Browser.currentPage !== "arena_hud") return;
        mp.events.callRemote("server::arena:useItem", JSON.stringify({ item: "plate" }));
    },
    "Arena: Use Plate (6)"
);

PlayerKeybind.addKeybind(
    { keyCode: 71, up: false },
    async () => {
        if (Browser.currentPage && Browser.currentPage !== "interactionMenu") return;
        const local = mp.players.local;

        // On-foot: G enters passenger seat (front right) when looking at a vehicle.
        if (!local.vehicle) {
            const ent = EntityRaycast.entity;
            if (ent && ent.type === "vehicle") {
                const vehicle = ent as VehicleMp;
                // seat: -1 driver, 0 front passenger
                try {
                    mp.game.task.taskEnterVehicle(local.handle, vehicle.handle, 3000, 0, 2.0, 1, 0);
                } catch {
                    // ignore
                }
                return;
            }
        }

        // In vehicle: keep interaction menu (driver only).
        if (local.vehicle && local.vehicle.getPedInSeat(-1) === local.handle) {
            mp.events.callRemote("server::interaction:vehicle", local.vehicle.remoteId);
            return;
        }

        // Otherwise: interact with targeted entity.
        if (!EntityRaycast.entity) return;
        mp.events.callRemote(EntityRaycast.entity.type === "player" ? "server::interaction:player" : "server::interaction:vehicle", EntityRaycast.entity.remoteId);
    },
    "Enter passenger seat / interact (G)"
);

PlayerKeybind.addKeybind(
    { keyCode: 69, up: false },
    async () => {
        if (ChatAPI.chatOpen || Browser.currentPage || mp.players.local.getVariable("isDead") || mp.players.local.vehicle) return;
        const ped = InteractablePed.getClosest();
        if (!ped) return;
        ped.onKeyPress.constructor.name === "AsyncFunction" ? await ped.onKeyPress() : ped.onKeyPress();
    },
    "Interact with NPC"
);

PlayerKeybind.addKeybind(
    { keyCode: 69, up: false },
    () => {
        if (ChatAPI.chatOpen || Browser.currentPage || !Client.canAcceptDeath || !mp.players.local.getVariable("isDead")) return;
        mp.events.callRemote("server::player:acceptDeath");
        Client.canAcceptDeath = false;
    },
    "Accept death"
);

PlayerKeybind.addKeybind(
    { keyCode: 20, up: false },
    () => {
        if (Browser.currentPage === "arena_hud") {
            mp.events.call("client::eventManager", "cef::arena:toggleScoreboard", {});
        }
    },
    "Hopouts scoreboard (Caps)"
);

PlayerKeybind.addKeybind(
    { keyCode: 18, up: false },
    () => {
        if (Browser.currentPage === "arena_hud") {
            Browser.toggleCursorForClick();
        }
    },
    "Hopouts cursor toggle (Alt)"
);

// Arena item keybinds: 5 = Medkit, 6 = Plate
PlayerKeybind.addKeybind(
    { keyCode: 53, up: false },
    () => {
        if (Browser.currentPage !== "arena_hud") return;
        mp.events.callRemote("server::arena:useItem", JSON.stringify({ item: "medkit" }));
    },
    "Arena: Use Medkit (5)"
);
PlayerKeybind.addKeybind(
    { keyCode: 54, up: false },
    () => {
        if (Browser.currentPage !== "arena_hud") return;
        mp.events.callRemote("server::arena:useItem", JSON.stringify({ item: "plate" }));
    },
    "Arena: Use Plate (6)"
);

PlayerKeybind.addKeybind(
    { keyCode: 114, up: false },
    () => {
        if (!mp.players.local.getVariable("loggedin") || Client.isDead) return;
        if (Browser.currentPage === "mainmenu") {
            Browser.closePage();
        } else if (!Browser.currentPage || Browser.currentPage === "hud" || Browser.currentPage === "arena_hud" || Browser.currentPage === "arena_lobby" || Browser.currentPage === "arena_voting") {
            Browser.processEvent("cef::system:setPage", "mainmenu");
        }
    },
    "Toggle menu (F3)"
);
