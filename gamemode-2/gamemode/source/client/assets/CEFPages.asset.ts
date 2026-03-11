interface ICefPages {
    [key: string]: {
        blur: boolean;
        radar: boolean;
        pause: boolean;
        controls: boolean;
        close: boolean;
        freezeCamera?: boolean;
        /** When false, hide cursor (for gameplay overlays like arena_hud) */
        cursor?: boolean;
    };
}
const CEFPages: ICefPages = {
    chat: { blur: false, radar: true, pause: true, controls: true, close: false },
    auth: { blur: false, radar: false, pause: false, controls: true, close: false },
    creator: { blur: false, radar: false, pause: false, controls: true, close: true },
    selectcharacter: { blur: true, radar: false, pause: false, controls: true, close: false },
    hud: { blur: false, radar: true, pause: false, controls: true, close: false },
    interactionMenu: { blur: false, radar: true, pause: false, controls: false, close: true },
    nativemenu: { blur: false, radar: true, pause: false, controls: false, close: true },
    settings: { blur: true, radar: false, pause: true, controls: true, close: true },
    playerMenu: { blur: true, radar: false, pause: true, controls: true, close: true },
    wardrobe: { blur: false, radar: true, pause: false, controls: false, close: true },
    mainmenu: { blur: false, radar: false, pause: false, controls: true, close: true, freezeCamera: false },
    arena_lobby: { blur: true, radar: false, pause: false, controls: true, close: true },
    arena_voting: { blur: true, radar: false, pause: false, controls: true, close: true },
    arena_hud: { blur: false, radar: true, pause: false, controls: false, close: false, cursor: false },
    loadout: { blur: true, radar: false, pause: false, controls: true, close: true },
    clothing: { blur: false, radar: true, pause: false, controls: false, close: true },
    admin: { blur: true, radar: false, pause: true, controls: true, close: true },
    report: { blur: true, radar: false, pause: true, controls: true, close: true },
    tuner: { blur: false, radar: true, pause: false, controls: false, close: true }
};
export { CEFPages };
