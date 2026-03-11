import { RageShared, StringifiedObject } from "./index";

export namespace CefData {
    export namespace Interfaces {
        export interface CefEventMap {
            system: {
                setPage: string;
            };
            notify: {
                show: { type: RageShared.Enums.NotifyType; message: string; skin: "light" | "dark" | "colored" };
            };
            player: {
                setCharacters: RageShared.Players.Interfaces.ICharacters[];
            };
            hud: {
                setInteraction: RageShared.Interfaces.InteractionData;
                setVehicleData: { key: keyof RageShared.Vehicles.Interfaces.SpeedometerData; data: any };
                showInteractionButton: RageShared.Interfaces.IInteractButton | null;
            };
            nativemenu: {
                setData: RageShared.Interfaces.INativeMenu;
            };
            chat: {
                setCommands: string[];
            };
            inventory: {
                setVisible: boolean;
                setClothes: { [key: number]: RageShared.Inventory.Interfaces.IBaseItem | null };
                setInventory: { [key: string]: { [key: number]: RageShared.Inventory.Interfaces.IBaseItem | null } };
                setQuickUseItems: { [key: number]: { component: string; id: number } | null };
                setDroppedItems: { [key: number]: RageShared.Inventory.Interfaces.IBaseItem | null };
                setMaxWeight: number;
            };
            auth: {};
            wardrobe: {
                setClothes: {
                    hats?: { drawable: number; texture: number };
                    masks?: { drawable: number; texture: number };
                    tops?: { drawable: number; texture: number };
                    pants?: { drawable: number; texture: number };
                    shoes?: { drawable: number; texture: number };
                };
            };
            report: {
                setData: Record<string, unknown>;
                setMyReports: unknown[];
                setReports: unknown[];
                setReportDetail: { report: unknown };
                newReport: null;
                newChatMessage: { reportId: number };
            };
            mainmenu: {
                playError: { message: string };
                setPlayerData: { name: string };
                setArenaMaps: { maps: { id: string; name: string }[] };
            };
            loadout: {
                presetsLoaded: { presets: { weaponName: string; components: number[] }[] };
            };
            tuner: {
                setData: { vehicleId: number; mods: Record<number, number> };
            };
            playerList: {
                setPlayers: { id: number; name: string; ping: number }[];
            };
            arena: {
                setLobby: {
                    state: "waiting" | "voting" | "starting";
                    queueSize?: number;
                    players: { id: number; name: string; ready: boolean }[];
                    countdown: number;
                    voteMaps: { id: string; name: string; votes: number }[];
                    voteEndsAt: number;
                    myVote?: string | null;
                };
                setVoting: {
                    state: "voting";
                    queueSize?: number;
                    players: { id: number; name: string; ready: boolean }[];
                    countdown: number;
                    voteMaps: { id: string; name: string; votes: number }[];
                    voteEndsAt: number;
                    myVote?: string | null;
                };
                setMatch: {
                    mapId: string;
                    mapName: string;
                    queueSize?: number;
                    redTeam: { id: number; name: string }[];
                    blueTeam: { id: number; name: string }[];
                    dimension: number;
                    redScore?: number;
                    blueScore?: number;
                    currentRound?: number;
                    roundsToWin?: number;
                    timeLeft?: number;
                };
                matchUpdate: {
                    state: string;
                    redScore: number;
                    blueScore: number;
                    currentRound: number;
                    roundsToWin: number;
                    weaponName: string;
                    redAlive: number;
                    blueAlive: number;
                    redTeam: { id: number; name: string; kills: number; deaths: number; alive: boolean; health?: number; armor?: number }[];
                    blueTeam: { id: number; name: string; kills: number; deaths: number; alive: boolean; health?: number; armor?: number }[];
                    timeLeft: number;
                };
                roundStart: {
                    round: number;
                    weaponName: string;
                    warmupTime: number;
                    redScore: number;
                    blueScore: number;
                    roundsToWin: number;
                };
                roundEnd: {
                    winner: "red" | "blue" | "draw";
                    redScore: number;
                    blueScore: number;
                    round: number;
                    roundsToWin: number;
                };
                zoneUpdate: {
                    centerX: number;
                    centerY: number;
                    radius: number;
                    phase: number;
                    totalPhases: number;
                    phaseTimeLeft: number;
                    dps: number;
                };
                itemCounts: { medkits: number; plates: number };
                itemCastStart: { item: "medkit" | "plate"; castTime: number };
                itemCastComplete: { item: "medkit" | "plate" };
                itemCastCancel: {};
                setVitals: { health: number; armor: number };
                outOfBounds: { active: boolean; timeLeft: number };
                killFeed: { killer: string; victim: string };
                youKill: { victim: string };
                youDied: { killer: string };
                leftMatch: null;
                matchEnd: {
                    redScore: number;
                    blueScore: number;
                    redTeam: { id: number; name: string; kills: number; deaths: number }[];
                    blueTeam: { id: number; name: string; kills: number; deaths: number }[];
                    winner: "red" | "blue" | "draw";
                };
            };
        }
        export interface IncomingCEFEvents {
            inventory: {
                onMoveItem: (player: PlayerMp, data: StringifiedObject<RageShared.Inventory.Interfaces.IMoveItem>) => void;
                onUseItem: (player: PlayerMp, data: StringifiedObject<RageShared.Inventory.Interfaces.IUseItem>) => void;
                onGiveItem: (player: PlayerMp, data: StringifiedObject<{ playerId: number; item: RageShared.Inventory.Interfaces.IBaseItem; source: { slot: string } }>) => void;
                onDropItem: (player: PlayerMp, data: StringifiedObject<RageShared.Inventory.Interfaces.IDropItem>) => void;
                onSplitItem: (player: PlayerMp, data: StringifiedObject<RageShared.Inventory.Interfaces.ISplitItem>) => void;
                confirmItemDrop: (player: PlayerMp) => void;
                onCancelItemDrop: (player: PlayerMp) => void;
                onOpenItem: (player: PlayerMp, data: StringifiedObject<RageShared.Inventory.Interfaces.IOpenItem>) => void;
            };

            auth: {
                register: (player: PlayerMp, data: StringifiedObject<{ username: string; email: string; password: string; confirmPassword: string }>) => void;
                loginPlayer: (player: PlayerMp, data: StringifiedObject<{ username: string; password: string }>) => void;
            };

            creator: {
                navigation: (player: PlayerMp, data: string) => void;
                create: (player: PlayerMp, data: StringifiedObject<RageShared.Players.Interfaces.CreatorData>) => void;
            };

            settings: {
                changePassword: (player: PlayerMp, data: StringifiedObject<{ old: string; new: string }>) => void;
            };

            chat: {
                sendMessage: (player: PlayerMp, message: string) => void;
            };

            hud: {
                interactResult: (player: PlayerMp, type: string) => void;
            };

            wardrobe: {
                open: (player: PlayerMp) => void;
                getClothes: (player: PlayerMp) => void;
                save: (player: PlayerMp, data: string) => void;
                saveInline: (player: PlayerMp, data: string) => void;
                close: (player: PlayerMp) => void;
            };

            mainmenu: {
                playFreeroam: (player: PlayerMp) => void;
                playArena: (player: PlayerMp, data?: StringifiedObject<{ size?: number; map?: string; mode?: string }>) => void;
                getArenaMaps: (player: PlayerMp) => void;
            };

            arena: {
                joinQueue: (player: PlayerMp, data?: StringifiedObject<{ size?: number }>) => void;
                leaveQueue: (player: PlayerMp) => void;
                leaveMatch: (player: PlayerMp) => void;
                vote: (player: PlayerMp, data: StringifiedObject<{ mapId: string }>) => void;
                useItem: (player: PlayerMp, data: StringifiedObject<{ item: "medkit" | "plate" }>) => void;
            };

            loadout: {
                getPresets: (player: PlayerMp) => void;
                savePreset: (player: PlayerMp, data: string) => void;
            };

            tuner: {
                applyMod: (player: PlayerMp, data: StringifiedObject<{ vehicleId: number; modIndex: number; value: number }>) => void;
                close: (player: PlayerMp) => void;
            };
        }
    }
    export namespace Enums {}
}
