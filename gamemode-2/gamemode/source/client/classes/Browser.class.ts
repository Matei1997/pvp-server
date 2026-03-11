import { Utils } from "@shared/Utils.module";
import { CEFPages } from "@assets/CEFPages.asset";

// INPUT_COVER (44) omitted so Q can be used for cover/peek next to walls
const disabledControls = [
    0, 30, 31, 21, 36, 22, 38, 71, 72, 59, 60, 42, 43, 85, 86, 75, 15, 14, 228, 229, 348, 156, 199, 204, 172, 173, 199, 178, 244, 220, 221, 218, 219, 16, 17, 200, 202, 322
];

/**
 * Manages the browser interface and related operations.
 */
class _Browser {
    private readonly url: string = "http://package2/dist/index.html";
    mainUI: BrowserMp;
    currentPage: string | undefined;
    /** Last HUD-like page (hud, arena_hud, etc.) so we can keep radar/scaleform when page is briefly undefined (e.g. after closing map). */
    lastBasePage: string = "hud";
    /** When true (right-click held in wardrobe), hide cursor to allow camera orbit */
    wardrobeCameraHeld: boolean = false;
    /** When true (F2 pressed), show cursor for clicking UI like "leave" in hopouts */
    cursorOverrideForClick: boolean = false;
    /** True when main menu clothing tab is active (CEF sends scene showPlayer) */
    mainMenuClothingActive: boolean = false;
    /** True when right-click held in main menu clothing to rotate character */
    mainMenuClothingRotateHeld: boolean = false;

    /**
     * Initializes the browser and sets up event handlers.
     */
    constructor() {
        mp.console.logWarning("Browser && background initialized!");
        mp.gui.chat.show(false);

        this.mainUI = mp.browsers.new(this.url);
        this.mainUI.markAsChat();
        this.currentPage = undefined;
        mp.gui.chat.activate(true);
        this.processEvent("cef::chat:setActive", true);

        mp.events.add("client::eventManager::emitServer", this.emitServer.bind(this));
        mp.events.add("client::eventManager::emitClient", this.emitClient.bind(this));

        mp.events.add("client::eventManager", this.processEvent.bind(this));

        mp.events.add("client::cef:start", this.startPage.bind(this));
        mp.events.add("client::cef:close", this.closePage.bind(this));

        mp.events.add("render", this.onTick.bind(this));

        mp.events.add("playerQuit", this.playerQuit.bind(this));
    }

    /**
     * Called every frame to apply disable control actions.
     * Re-applies cursor when CEF is open (fixes cursor disappearing after alt-tab).
     */
    onTick() {
        mp.game.controls.applyDisableControlActionBatch();
        if (this.currentPage) {
            const params = CEFPages[this.currentPage];
            const showCursor = (params?.cursor !== false || this.cursorOverrideForClick) && !(this.currentPage === "wardrobe" && this.wardrobeCameraHeld);
            mp.gui.cursor.show(showCursor, showCursor);
        } else if (this.cursorOverrideForClick) {
            mp.gui.cursor.show(true, true);
        }
    }

    /** F2: Single toggle for cursor visible (UI) vs hidden (game). Force state so cursor never gets stuck. */
    toggleCursorForClick(): boolean {
        this.cursorOverrideForClick = !this.cursorOverrideForClick;
        mp.gui.cursor.show(this.cursorOverrideForClick, this.cursorOverrideForClick);
        return this.cursorOverrideForClick;
    }

    /**
     * Activates or deactivates the main browser UI.
     * @param {boolean} toggle - Whether to activate or deactivate the UI.
     * @returns {boolean} - The current active state of the UI.
     */
    activate(toggle: boolean): boolean {
        if (!this.mainUI) return false;
        this.mainUI.active = toggle;
        return this.mainUI.active;
    }

    /**
     * Processes an event by name and forwards arguments to the browser UI.
     * @param {string} eventName - The name of the event to process.
     * @param {...any} args - The arguments to pass to the event handler.
     */
    processEvent(eventName: string, ...args: any): void {
        if (!eventName || !this.mainUI) return;

        if (eventName === "cef::system:setPage") {
            this.startPage(args[0]);
        }

        if (this.mainUI && eventName.includes("cef::")) {
            const event = eventName.split("cef::")[1];
            const argsString = args.map((arg: string) => JSON.stringify(arg)).join(", ");

            const script = `
                window.callHandler("${event}", ${argsString})
            `;
            this.mainUI.execute(script);
        } else return mp.console.logWarning("Error calling event: " + eventName + " it does not exists.");
    }

    /**
     * Closes the current page in the browser UI.
     */
    closePage(): void {
        if (!this.mainUI || !mp.browsers.exists(this.mainUI)) return;
        const page = this.currentPage;
        if (!page) return;

        const pageData = CEFPages[page];
        this.currentPage = undefined;
        this.wardrobeCameraHeld = false;
        this.mainMenuClothingRotateHeld = false;
        this.cursorOverrideForClick = false;
        mp.gui.cursor.show(false, false);

        if (page === "wardrobe") {
            mp.events.call("client::wardrobeCamera:stop");
        }
        mp.events.callRemote("server::player:closeCEF", page);
        if (pageData.blur) {
            mp.game.graphics.transitionFromBlurred(1);
        }

        mp.game.ui.displayRadar(true);
        mp.gui.cursor.show(false, false);

        mp.game.controls.setDisableControlActionBatch(false, []);
        if (!mp.players.local.getVariable("noclip")) mp.players.local.freezePosition(false);

        if (this.mainUI && mp.browsers.exists(this.mainUI)) {
            this.mainUI.call("cef::eventManager", "system:setPage", this.lastBasePage);
        }
    }

    /**
     * Opens the admin panel (F4/F5). Ensures browser is active and CEF receives setPage.
     */
    openAdminPanel(): void {
        if (!this.mainUI || !mp.browsers.exists(this.mainUI)) return;
        this.mainUI.active = true;
        this.startPage("admin");
        this.mainUI.execute(`window.callHandler("system:setPage", "admin")`);
    }

    /**
     * Starts a new page in the browser UI.
     * @param {string} pageName - The name of the page to start.
     */
    startPage(pageName: string): void {
        const params = CEFPages[pageName];
        if (!params) return;
        const isBasePage = pageName === "hud" || pageName === "arena_hud" || pageName === "arena_lobby" || pageName === "arena_voting";
        if (isBasePage) {
            this.lastBasePage = pageName;
        }

        if (typeof params.radar !== "undefined") mp.game.ui.displayRadar(params.radar);
        if (params.controls) {
            mp.game.controls.setDisableControlActionBatch(false, disabledControls);
        } else {
            mp.game.controls.setDisableControlActionBatch(false, []);
        }
        if (params.freezeCamera) mp.players.local.freezePosition(params.freezeCamera);
        mp.gui.cursor.show(params.cursor !== false, params.cursor !== false);

        setTimeout(() => {
            if (params.blur) {
                mp.game.graphics.transitionToBlurred(1);
            } else mp.game.graphics.transitionFromBlurred(1);
        }, 100);

        this.currentPage = pageName;
        mp.events.callRemote("server::player:setCefPage", pageName);
    }

    /**
     * Emits an event to the server with the given data.
     * @param {any} receivedData - The data to send to the server.
     */
    emitServer(receivedData: any): void {
        let data = Utils.tryParse(receivedData);
        let { event, args } = data;
        Array.isArray(args) ? (args.length === 1 ? mp.events.callRemote(event, JSON.stringify(args[0])) : mp.events.callRemote(event, JSON.stringify(args))) : mp.events.callRemote(event, args);
        Utils.clientDebug(`[SERVER EMIT]: "${event.split(":")[2]}", "${event.split(":")[3]}" -> ${JSON.stringify(args)}`);
    }

    /**
     * Emits an event to the client with the given data.
     * @param {any} receivedData - The data to send to the client.
     */
    emitClient(receivedData: any): void {
        let data = Utils.tryParse(receivedData);
        let { event, args } = data;
        if (Array.isArray(args)) {
            mp.events.call(event, ...args);
        } else {
            mp.events.call(event, args);
        }
        Utils.clientDebug("[CLIENT EMIT]: " + event + " " + JSON.stringify(args));
    }

    playerQuit(player: PlayerMp) {
        if (player.remoteId === mp.players.local.remoteId) {
            if (this.mainUI && mp.browsers.exists(this.mainUI)) {
                this.mainUI.destroy();
            }
        }
    }
}

export const Browser = new _Browser();
