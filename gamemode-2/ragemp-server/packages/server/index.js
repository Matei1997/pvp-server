/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./source/server/admin/AdminLog.manager.ts"
/*!*************************************************!*\
  !*** ./source/server/admin/AdminLog.manager.ts ***!
  \*************************************************/
(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.logDamageHit = logDamageHit;
exports.logKill = logKill;
exports.getRecentDamageLogsFor = getRecentDamageLogsFor;
exports.getRecentKillLogsFor = getRecentKillLogsFor;
const MAX_LOG_ENTRIES = 5000;
const damageLogs = [];
const killLogs = [];
function pushBounded(arr, entry) {
    arr.push(entry);
    if (arr.length > MAX_LOG_ENTRIES) {
        arr.shift();
    }
}
function logDamageHit(params) {
    const { attacker, victim, weaponHash, damage, distance, inArena } = params;
    if (!attacker || !victim)
        return;
    pushBounded(damageLogs, {
        timestamp: Date.now(),
        attackerId: attacker.id,
        attackerName: attacker.name,
        victimId: victim.id,
        victimName: victim.name,
        weaponHash,
        damage,
        distance,
        inArena
    });
}
function logKill(params) {
    const { killer, victim, reason, inArena } = params;
    if (!victim)
        return;
    pushBounded(killLogs, {
        timestamp: Date.now(),
        killerId: killer ? killer.id : null,
        killerName: killer ? killer.name : null,
        victimId: victim.id,
        victimName: victim.name,
        reason,
        inArena
    });
}
function matchPlayer(entryPlayerId, target) {
    return entryPlayerId === target.id;
}
function getRecentDamageLogsFor(player, limit = 20) {
    const targetId = player.id;
    const relevant = damageLogs.filter((e) => e.attackerId === targetId || e.victimId === targetId);
    return relevant.slice(-limit);
}
function getRecentKillLogsFor(player, limit = 20) {
    const targetId = player.id;
    const relevant = killLogs.filter((e) => (e.killerId !== null && matchPlayer(e.killerId, player)) || e.victimId === targetId);
    return relevant.slice(-limit);
}


/***/ },

/***/ "./source/server/api/index.ts"
/*!************************************!*\
  !*** ./source/server/api/index.ts ***!
  \************************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RAGERP = void 0;
const utils_module_1 = __webpack_require__(/*! @shared/utils.module */ "./source/shared/utils.module.ts");
const CEFEvent_class_1 = __webpack_require__(/*! @classes/CEFEvent.class */ "./source/server/classes/CEFEvent.class.ts");
const Command_class_1 = __webpack_require__(/*! @classes/Command.class */ "./source/server/classes/Command.class.ts");
const Point_class_1 = __webpack_require__(/*! @classes/Point.class */ "./source/server/classes/Point.class.ts");
const Vehicle_class_1 = __webpack_require__(/*! @classes/Vehicle.class */ "./source/server/classes/Vehicle.class.ts");
const Database_module_1 = __webpack_require__(/*! ../database/Database.module */ "./source/server/database/Database.module.ts");
const Chat_module_1 = __webpack_require__(/*! @modules/Chat.module */ "./source/server/modules/Chat.module.ts");
/**
 * Namespace for the RAGERP system.
 * @namespace RAGERP
 */
var RAGERP;
(function (RAGERP) {
    /**
     * Main data source for the application.
     * @type {object}
     */
    RAGERP.database = Database_module_1.MainDataSource;
    /**
     * Pools for different entities.
     * @type {object}
     */
    RAGERP.pools = {
        /**
         * Pool for vehicle entities.
         * @type {object}
         */
        vehicles: Vehicle_class_1.vehiclePool,
        /**
         * Pool for dynamic points.
         * @type {object}
         */
        points: Point_class_1.dynamicPointPool
    };
    /**
     * Entities available in the system.
     * @type {object}
     */
    RAGERP.entities = {
        /**
         * Dynamic Points management.
         * @type {object}
         */
        points: {
            /**
             * Pool for dynamic points.
             * @type {object}
             */
            pool: Point_class_1.dynamicPointPool,
            /**
             * Constructor for new dynamic points.
             * @type {DynamicPoint}
             */
            new: Point_class_1.DynamicPoint
        },
        /**
         * Vehicle system management.
         * @type {object}
         */
        vehicles: {
            /**
             * Pool for vehicle entities.
             * @type {object}
             */
            pool: Vehicle_class_1.vehiclePool,
            /**
             * Manager for vehicle operations.
             * @type {object}
             */
            manager: Vehicle_class_1.vehicleManager,
            /**
             * Constructor for new vehicles.
             * @type {Vehicle}
             */
            new: Vehicle_class_1.Vehicle,
            /**
             * Alias for getting a vehicle by ID.
             * @type {function}
             */
            at: Vehicle_class_1.vehicleManager.at,
            /**
             * Alias for getting a vehicle by SQL ID.
             * @type {function}
             */
            atSQL: Vehicle_class_1.vehicleManager.atSQL,
            /**
             * Method for getting the nearest vehicle.
             * @type {function}
             */
            getNearest: Vehicle_class_1.vehicleManager.getNearest
        },
        /**
         * Placeholder for door controller.
         * @type {undefined}
         */
        doors: undefined,
        /**
         * Placeholder for gates controller.
         * @type {undefined}
         */
        gates: undefined
    };
    /**
     * Utility functions.
     * @type {object}
     */
    RAGERP.utils = utils_module_1.Utils;
    /**
     * Client Event Framework events.
     * @type {object}
     */
    RAGERP.cef = CEFEvent_class_1.CefEvent;
    /**
     * Command registry.
     * @type {object}
     */
    RAGERP.commands = Command_class_1.CommandRegistry;
    /**
     * Chat methods
     * @type {object}
     */
    RAGERP.chat = Chat_module_1.Chat;
})(RAGERP || (exports.RAGERP = RAGERP = {}));


/***/ },

/***/ "./source/server/arena/Arena.module.ts"
/*!*********************************************!*\
  !*** ./source/server/arena/Arena.module.ts ***!
  \*********************************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.joinQueue = joinQueue;
exports.leaveQueue = leaveQueue;
exports.vote = vote;
exports.getLobbyState = getLobbyState;
exports.startSoloMatch = startSoloMatch;
const _api_1 = __webpack_require__(/*! @api */ "./source/server/api/index.ts");
const ArenaPresets_asset_1 = __webpack_require__(/*! ./ArenaPresets.asset */ "./source/server/arena/ArenaPresets.asset.ts");
const ArenaMatch_manager_1 = __webpack_require__(/*! ./ArenaMatch.manager */ "./source/server/arena/ArenaMatch.manager.ts");
const ArenaConfig_1 = __webpack_require__(/*! ./ArenaConfig */ "./source/server/arena/ArenaConfig.ts");
__webpack_require__(/*! ./WeaponPresets.service */ "./source/server/arena/WeaponPresets.service.ts");
const LOBBY_COUNTDOWN_SEC = 0;
const VOTING_DURATION_SEC = 0;
const queues = new Map();
let nextDimension = 1000;
ArenaConfig_1.QUEUE_SIZES.forEach((size) => {
    queues.set(size, {
        size,
        queue: [],
        lobbyPlayers: new Map(),
        lobbyState: "waiting",
        countdownInterval: null,
        votingInterval: null,
        voteMaps: [],
        voteEndsAt: 0
    });
});
function getPlayerQueue(player) {
    for (const q of queues.values()) {
        if (q.queue.some((p) => p.id === player.id))
            return q;
    }
    return null;
}
function emitLobbyToAll(q) {
    const baseData = {
        state: q.lobbyState,
        queueSize: q.size,
        players: Array.from(q.lobbyPlayers.values()).map((p) => ({
            id: p.player.id,
            name: p.player.name,
            ready: p.ready
        })),
        countdown: 0,
        voteMaps: q.voteMaps.map((m) => ({ id: m.preset.id, name: m.preset.name, votes: m.votes })),
        voteEndsAt: q.voteEndsAt
    };
    if ((q.lobbyState === "waiting" && q.countdownInterval) || q.lobbyState === "voting") {
        baseData.countdown = Math.max(0, Math.ceil((q.voteEndsAt - Date.now()) / 1000));
    }
    const event = q.lobbyState === "voting" ? "setVoting" : "setLobby";
    q.queue.forEach((p) => {
        if (mp.players.exists(p)) {
            const lp = q.lobbyPlayers.get(p.id);
            const data = { ...baseData, myVote: lp?.voteMapId ?? null };
            _api_1.RAGERP.cef.emit(p, "arena", event, data);
        }
    });
}
function startCountdown(q) {
    if (q.lobbyState !== "waiting" || q.countdownInterval)
        return;
    q.voteEndsAt = Date.now() + LOBBY_COUNTDOWN_SEC * 1000;
    q.countdownInterval = setInterval(() => {
        const remaining = Math.ceil((q.voteEndsAt - Date.now()) / 1000);
        emitLobbyToAll(q);
        if (remaining <= 0) {
            if (q.countdownInterval)
                clearInterval(q.countdownInterval);
            q.countdownInterval = null;
            startVoting(q);
        }
    }, 1000);
    emitLobbyToAll(q);
}
function startVoting(q) {
    q.lobbyState = "voting";
    const presets = (0, ArenaPresets_asset_1.getArenaPresets)();
    const preferredIds = new Set();
    q.lobbyPlayers.forEach((lp) => {
        if (lp.preferredMapId)
            preferredIds.add(lp.preferredMapId);
    });
    let candidates = presets.filter((p) => preferredIds.has(p.id));
    if (candidates.length >= 3) {
        candidates = [...candidates].sort(() => Math.random() - 0.5).slice(0, 3);
    }
    else {
        const remaining = presets.filter((p) => !preferredIds.has(p.id));
        const shuffled = remaining.sort(() => Math.random() - 0.5);
        candidates = candidates.concat(shuffled.slice(0, 3 - candidates.length));
    }
    q.voteMaps = candidates.map((p) => ({ preset: p, votes: 0 }));
    q.voteEndsAt = Date.now() + VOTING_DURATION_SEC * 1000;
    q.lobbyPlayers.forEach((lp) => {
        lp.voteMapId = null;
        if (lp.preferredMapId && q.voteMaps.some((m) => m.preset.id === lp.preferredMapId)) {
            lp.voteMapId = lp.preferredMapId;
        }
    });
    q.lobbyPlayers.forEach((lp) => {
        if (!lp.voteMapId)
            return;
        const map = q.voteMaps.find((m) => m.preset.id === lp.voteMapId);
        if (map)
            map.votes++;
    });
    q.queue.forEach((p) => {
        if (mp.players.exists(p)) {
            _api_1.RAGERP.cef.emit(p, "system", "setPage", "arena_voting");
        }
    });
    if (q.votingInterval)
        clearInterval(q.votingInterval);
    q.votingInterval = setInterval(() => {
        const remaining = Math.ceil((q.voteEndsAt - Date.now()) / 1000);
        emitLobbyToAll(q);
        if (remaining <= 0) {
            if (q.votingInterval)
                clearInterval(q.votingInterval);
            q.votingInterval = null;
            launchMatch(q);
        }
    }, 1000);
    emitLobbyToAll(q);
}
function launchMatch(q) {
    q.lobbyState = "starting";
    if (q.voteMaps.length === 0) {
        q.queue.forEach((p) => p.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "No arena locations available."));
        resetQueue(q);
        return;
    }
    let winner;
    const maxVotes = Math.max(...q.voteMaps.map((m) => m.votes), 0);
    const tied = q.voteMaps.filter((m) => m.votes === maxVotes);
    winner = tied.length > 1 || maxVotes === 0
        ? tied[Math.floor(Math.random() * tied.length)]?.preset ?? q.voteMaps[0].preset
        : q.voteMaps.find((m) => m.votes === maxVotes)?.preset ?? q.voteMaps[0].preset;
    const players = Array.from(q.lobbyPlayers.values()).map((lp) => lp.player);
    const dim = nextDimension++;
    const redTeam = [];
    const blueTeam = [];
    players.forEach((p, i) => {
        if (i % 2 === 0)
            redTeam.push(p);
        else
            blueTeam.push(p);
    });
    (0, ArenaMatch_manager_1.startMatch)(dim, winner, redTeam, blueTeam);
    const matchData = {
        mapId: winner.id,
        mapName: winner.name,
        queueSize: q.size,
        redTeam: redTeam.map((p) => ({ id: p.id, name: p.name })),
        blueTeam: blueTeam.map((p) => ({ id: p.id, name: p.name })),
        dimension: dim,
        redScore: 0,
        blueScore: 0,
        currentRound: 1,
        roundsToWin: ArenaConfig_1.ARENA_CONFIG.roundsToWin,
        timeLeft: ArenaConfig_1.ARENA_CONFIG.maxRoundTime
    };
    [...redTeam, ...blueTeam].forEach((p) => {
        if (mp.players.exists(p)) {
            _api_1.RAGERP.cef.emit(p, "arena", "setMatch", matchData);
            _api_1.RAGERP.cef.startPage(p, "arena_hud");
            _api_1.RAGERP.cef.emit(p, "system", "setPage", "arena_hud");
        }
    });
    redTeam.forEach((p) => {
        if (mp.players.exists(p))
            p.call("client::arena:setTeam", ["red"]);
    });
    blueTeam.forEach((p) => {
        if (mp.players.exists(p))
            p.call("client::arena:setTeam", ["blue"]);
    });
    resetQueue(q);
}
function resetQueue(q) {
    q.queue = [];
    q.lobbyPlayers.clear();
    q.lobbyState = "waiting";
    q.voteMaps = [];
    q.voteEndsAt = 0;
}
function joinQueue(player, size = 2, preferredMapId) {
    if (!player.character) {
        player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "No character loaded.");
        return false;
    }
    if ((0, ArenaMatch_manager_1.isPlayerInArenaMatch)(player)) {
        player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "Already in a match.");
        return false;
    }
    if (getPlayerQueue(player)) {
        player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "Already in a queue.");
        return false;
    }
    const q = queues.get(size);
    if (!q) {
        player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "Invalid queue size.");
        return false;
    }
    q.queue.push(player);
    q.lobbyPlayers.set(player.id, { player, ready: false, voteMapId: null, preferredMapId: preferredMapId ?? null });
    const neededPlayers = size * 2;
    if (q.queue.length >= neededPlayers && !q.countdownInterval) {
        startCountdown(q);
    }
    else {
        const data = {
            state: "waiting",
            queueSize: q.size,
            players: Array.from(q.lobbyPlayers.values()).map((p) => ({ id: p.player.id, name: p.player.name, ready: p.ready })),
            countdown: 0,
            voteMaps: [],
            voteEndsAt: 0,
            myVote: null
        };
        _api_1.RAGERP.cef.emit(player, "arena", "setLobby", data);
    }
    emitLobbyToAll(q);
    return true;
}
function leaveQueue(player) {
    const q = getPlayerQueue(player);
    if (!q)
        return false;
    const idx = q.queue.findIndex((p) => p.id === player.id);
    if (idx < 0)
        return false;
    q.queue.splice(idx, 1);
    q.lobbyPlayers.delete(player.id);
    const neededPlayers = q.size * 2;
    if (q.queue.length < neededPlayers && q.countdownInterval) {
        clearInterval(q.countdownInterval);
        q.countdownInterval = null;
    }
    emitLobbyToAll(q);
    return true;
}
function vote(player, mapId) {
    const q = getPlayerQueue(player);
    if (!q || q.lobbyState !== "voting")
        return false;
    const lp = q.lobbyPlayers.get(player.id);
    if (!lp)
        return false;
    const map = q.voteMaps.find((m) => m.preset.id === mapId);
    if (!map)
        return false;
    if (lp.voteMapId) {
        const prev = q.voteMaps.find((m) => m.preset.id === lp.voteMapId);
        if (prev)
            prev.votes--;
    }
    lp.voteMapId = mapId;
    map.votes++;
    emitLobbyToAll(q);
    return true;
}
function getLobbyState(size) {
    const q = queues.get(size);
    if (!q)
        return { state: "waiting", playerCount: 0 };
    return { state: q.lobbyState, playerCount: q.queue.length };
}
function startSoloMatch(player, presetId) {
    if ((0, ArenaMatch_manager_1.isPlayerInArenaMatch)(player))
        return false;
    const presets = (0, ArenaPresets_asset_1.getArenaPresets)();
    if (presets.length === 0)
        return false;
    const preset = presetId ? presets.find((p) => p.id === presetId) : presets[0];
    if (!preset)
        return false;
    const dim = nextDimension++;
    (0, ArenaMatch_manager_1.startMatch)(dim, preset, [player], []);
    const matchData = {
        mapId: preset.id,
        mapName: preset.name,
        queueSize: 2,
        redTeam: [{ id: player.id, name: player.name }],
        blueTeam: [],
        dimension: dim,
        redScore: 0,
        blueScore: 0,
        currentRound: 1,
        roundsToWin: ArenaConfig_1.ARENA_CONFIG.roundsToWin,
        timeLeft: ArenaConfig_1.ARENA_CONFIG.maxRoundTime
    };
    _api_1.RAGERP.cef.emit(player, "arena", "setMatch", matchData);
    _api_1.RAGERP.cef.startPage(player, "arena_hud");
    _api_1.RAGERP.cef.emit(player, "system", "setPage", "arena_hud");
    player.call("client::arena:setTeam", ["red"]);
    return true;
}


/***/ },

/***/ "./source/server/arena/ArenaConfig.ts"
/*!********************************************!*\
  !*** ./source/server/arena/ArenaConfig.ts ***!
  \********************************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ARENA_AMMO = exports.ITEM_CONFIG = exports.ZONE_PHASES = exports.VEHICLE_POOL = exports.WEAPON_ROTATION = exports.QUEUE_SIZES = exports.ARENA_CONFIG = void 0;
const Weapons_assets_1 = __webpack_require__(/*! @assets/Weapons.assets */ "./source/server/assets/Weapons.assets.ts");
exports.ARENA_CONFIG = {
    roundsToWin: 7,
    warmupDuration: 5, // seconds before round starts
    roundEndDelay: 4, // seconds between rounds
    matchEndDelay: 8, // seconds before returning to lobby
    startHealth: 100,
    startArmor: 100,
    maxRoundTime: 180, // 3 min per round max (zone should end it before)
};
exports.QUEUE_SIZES = [1, 2, 3, 4, 5];
exports.WEAPON_ROTATION = [
    { name: "Pistol .50", weapons: [Weapons_assets_1.weaponHash.pistol50] },
    { name: "Service Carbine + .50", weapons: [Weapons_assets_1.weaponHash.specialcarbine, Weapons_assets_1.weaponHash.pistol50] },
    { name: "Bullpup + .50", weapons: [Weapons_assets_1.weaponHash.bullpuprifle, Weapons_assets_1.weaponHash.pistol50] },
    { name: "Carbine MK II + .50", weapons: [Weapons_assets_1.weaponHash.carbinerifle_mk2, Weapons_assets_1.weaponHash.pistol50] },
    { name: "Pump Shotgun + .50", weapons: [Weapons_assets_1.weaponHash.pumpshotgun, Weapons_assets_1.weaponHash.pistol50] },
    { name: "Heavy Rifle + .50", weapons: [Weapons_assets_1.weaponHash.assaultrifle, Weapons_assets_1.weaponHash.pistol50] },
];
exports.VEHICLE_POOL = [
    "sultan", "banshee", "drafter", "omnis", "kuruma", "revolter", "buffalo"
];
exports.ZONE_PHASES = [
    { duration: 60, endRadius: 160, dps: 1 },
    { duration: 50, endRadius: 110, dps: 2 },
    { duration: 45, endRadius: 70, dps: 4 },
    { duration: 40, endRadius: 35, dps: 7 },
    { duration: 30, endRadius: 10, dps: 10 },
];
exports.ITEM_CONFIG = {
    medkit: { castTime: 4000, heal: 100, maxHp: 100, countPerRound: 3 },
    plate: { castTime: 5000, armor: 25, maxArmor: 100, countPerRound: 3 },
};
exports.ARENA_AMMO = 999;


/***/ },

/***/ "./source/server/arena/ArenaMatch.manager.ts"
/*!***************************************************!*\
  !*** ./source/server/arena/ArenaMatch.manager.ts ***!
  \***************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getMatchByDimension = getMatchByDimension;
exports.getMatchByPlayer = getMatchByPlayer;
exports.isPlayerInArenaMatch = isPlayerInArenaMatch;
exports.getTeam = getTeam;
exports.isAliveInMatch = isAliveInMatch;
exports.startMatch = startMatch;
exports.handleArenaDeath = handleArenaDeath;
exports.handleZoneDeath = handleZoneDeath;
exports.leaveMatch = leaveMatch;
exports.endMatch = endMatch;
exports.tickMatches = tickMatches;
const _api_1 = __webpack_require__(/*! @api */ "./source/server/api/index.ts");
const Player_event_1 = __webpack_require__(/*! @events/Player.event */ "./source/server/serverevents/Player.event.ts");
const ArenaConfig_1 = __webpack_require__(/*! ./ArenaConfig */ "./source/server/arena/ArenaConfig.ts");
const ZoneSystem_1 = __webpack_require__(/*! ./ZoneSystem */ "./source/server/arena/ZoneSystem.ts");
const WeaponPresets_service_1 = __webpack_require__(/*! ./WeaponPresets.service */ "./source/server/arena/WeaponPresets.service.ts");
const activeMatches = new Map();
const playerToMatch = new Map();
function getMatchByDimension(dim) {
    return activeMatches.get(dim);
}
function getMatchByPlayer(player) {
    const dim = playerToMatch.get(player.id);
    return dim !== undefined ? activeMatches.get(dim) : undefined;
}
function isPlayerInArenaMatch(player) {
    return playerToMatch.has(player.id);
}
function getTeam(match, playerId) {
    if (match.redTeam.some((p) => p.id === playerId))
        return "red";
    if (match.blueTeam.some((p) => p.id === playerId))
        return "blue";
    return null;
}
function isAliveInMatch(match, playerId) {
    const p = [...match.redTeam, ...match.blueTeam].find((x) => x.id === playerId);
    return p ? p.alive : false;
}
function getTeamPlayers(match, team) {
    return team === "red" ? match.redTeam : match.blueTeam;
}
function getAlivePlayers(match, team) {
    return getTeamPlayers(match, team).filter((p) => p.alive);
}
function pickRandomWeaponSet() {
    const entry = ArenaConfig_1.WEAPON_ROTATION[Math.floor(Math.random() * ArenaConfig_1.WEAPON_ROTATION.length)];
    return { name: entry.name, weapons: [...entry.weapons] };
}
function getZoneCenter(preset) {
    const safe = preset.safeNodes;
    if (safe && safe.length > 0) {
        return safe[Math.floor(Math.random() * safe.length)];
    }
    return preset.center;
}
function giveRoundWeapons(player, weapons) {
    player.removeAllWeapons();
    player.call("client::recoil:reset");
    weapons.forEach((hash) => {
        player.giveWeaponEx(hash, ArenaConfig_1.ARENA_AMMO, 30);
    });
    (0, WeaponPresets_service_1.applyWeaponPresets)(player, weapons);
    player.setVariable("weaponsOnBody", weapons);
}
function randomVehicleModel() {
    return ArenaConfig_1.VEHICLE_POOL[Math.floor(Math.random() * ArenaConfig_1.VEHICLE_POOL.length)];
}
function spawnTeamVehicles(match, team, spawnPoint) {
    const players = getTeamPlayers(match, team);
    const vehicleCount = Math.ceil(players.length / 2);
    for (let i = 0; i < vehicleCount; i++) {
        const model = randomVehicleModel();
        const offset = i * 6;
        const heading = spawnPoint.heading ?? 0;
        const rad = (heading * Math.PI) / 180;
        const vx = spawnPoint.x + Math.sin(rad) * offset;
        const vy = spawnPoint.y + Math.cos(rad) * offset;
        try {
            const veh = mp.vehicles.new(mp.joaat(model), new mp.Vector3(vx, vy, spawnPoint.z), {
                heading,
                dimension: match.dimension,
                locked: false,
                engine: true
            });
            match.vehicles.push(veh);
        }
        catch (e) {
            console.error(`[Arena] Failed to spawn vehicle ${model}:`, e);
        }
    }
}
function destroyMatchVehicles(match) {
    match.vehicles.forEach((veh) => {
        try {
            if (mp.vehicles.exists(veh))
                veh.destroy();
        }
        catch {
            /* ignore */
        }
    });
    match.vehicles = [];
}
function getAllMatchPlayerMps(match) {
    const ids = [...match.redTeam, ...match.blueTeam].map((p) => p.id);
    const result = [];
    ids.forEach((id) => {
        const p = mp.players.at(id);
        if (p && mp.players.exists(p))
            result.push(p);
    });
    return result;
}
/** Set arenaTeammateIds and currentTeam for voice radio and /team chat during hopouts. */
function setArenaVoiceAndTeam(match) {
    getAllMatchPlayerMps(match).forEach((p) => {
        const team = getTeam(match, p.id);
        if (!team)
            return;
        const teammates = getTeamPlayers(match, team).map((m) => m.id).filter((id) => id !== p.id);
        p.setVariable("arenaTeammateIds", teammates);
        p.setVariable("currentTeam", team);
    });
}
/** Clear arena voice/team vars when leaving match. */
function clearArenaVoiceAndTeam(player) {
    player.setVariable("arenaTeammateIds", []);
    player.setVariable("currentTeam", undefined);
}
function emitToAll(match, event, data) {
    getAllMatchPlayerMps(match).forEach((p) => {
        _api_1.RAGERP.cef.emit(p, "arena", event, data);
    });
}
function buildMatchUpdate(match) {
    const timeLeft = match.state === "active" ? Math.max(0, Math.ceil((match.roundEndsAt - Date.now()) / 1000)) : 0;
    return {
        state: match.state,
        redScore: match.redScore,
        blueScore: match.blueScore,
        currentRound: match.currentRound,
        roundsToWin: ArenaConfig_1.ARENA_CONFIG.roundsToWin,
        weaponName: match.roundWeaponSet.name,
        redAlive: getAlivePlayers(match, "red").length,
        blueAlive: getAlivePlayers(match, "blue").length,
        redTeam: match.redTeam.map((p) => {
            const mp_ = mp.players.at(p.id);
            const health = mp_ && mp.players.exists(mp_) ? Math.max(0, Math.min(100, mp_.health)) : 0;
            const armor = mp_ && mp.players.exists(mp_) ? Math.max(0, Math.min(100, mp_.armour)) : 0;
            return { id: p.id, name: p.name, kills: p.kills, deaths: p.deaths, alive: p.alive, health, armor };
        }),
        blueTeam: match.blueTeam.map((p) => {
            const mp_ = mp.players.at(p.id);
            const health = mp_ && mp.players.exists(mp_) ? Math.max(0, Math.min(100, mp_.health)) : 0;
            const armor = mp_ && mp.players.exists(mp_) ? Math.max(0, Math.min(100, mp_.armour)) : 0;
            return { id: p.id, name: p.name, kills: p.kills, deaths: p.deaths, alive: p.alive, health, armor };
        }),
        timeLeft
    };
}
function emitMatchUpdate(match) {
    emitToAll(match, "matchUpdate", buildMatchUpdate(match));
}
function emitKillFeed(match, killerName, victimName) {
    emitToAll(match, "killFeed", { killer: killerName, victim: victimName });
}
function spawnPlayerAtArena(player, spawn, dimension) {
    player.dimension = dimension;
    player.spawn(new mp.Vector3(spawn.x, spawn.y, spawn.z));
    player.heading = spawn.heading ?? 0;
    player.health = 100;
    player.armour = 100;
    player.call("client::arena:requestCollision", [spawn.x, spawn.y, spawn.z]);
}
function resetPlayerArenaState(player) {
    (0, Player_event_1.stopSpectate)(player);
    player.setVariable("isDead", false);
    if (player.character) {
        player.character.deathState = 0 /* RageShared.Players.Enums.DEATH_STATES.STATE_NONE */;
        player.character.setStoreData(player, "isDead", false);
    }
    player.setOwnVariable("deathAnim", null);
    player.stopScreenEffect("DeathFailMPIn");
}
function startMatch(dimension, preset, redTeam, blueTeam) {
    const firstWeaponSet = pickRandomWeaponSet();
    const match = {
        dimension,
        mapId: preset.id,
        mapName: preset.name,
        state: "warmup",
        redTeam: redTeam.map((p) => ({ id: p.id, name: p.name, alive: true, kills: 0, deaths: 0 })),
        blueTeam: blueTeam.map((p) => ({ id: p.id, name: p.name, alive: true, kills: 0, deaths: 0 })),
        redScore: 0,
        blueScore: 0,
        currentRound: 1,
        matchEndsAt: 0,
        roundEndsAt: 0,
        preset,
        vehicles: [],
        roundWeaponSet: firstWeaponSet
    };
    activeMatches.set(dimension, match);
    [...redTeam, ...blueTeam].forEach((p) => playerToMatch.set(p.id, dimension));
    beginRound(match);
}
function beginRound(match) {
    match.state = "warmup";
    destroyMatchVehicles(match);
    match.redTeam.forEach((p) => (p.alive = true));
    match.blueTeam.forEach((p) => (p.alive = true));
    match.roundWeaponSet = pickRandomWeaponSet();
    const weapons = match.roundWeaponSet.weapons;
    const redSpawn = match.preset.redSpawn;
    const blueSpawn = match.preset.blueSpawn;
    const medkits = ArenaConfig_1.ITEM_CONFIG.medkit.countPerRound;
    const plates = ArenaConfig_1.ITEM_CONFIG.plate.countPerRound;
    match.redTeam.forEach((mp_) => {
        const p = mp.players.at(mp_.id);
        if (p && mp.players.exists(p)) {
            resetPlayerArenaState(p);
            spawnPlayerAtArena(p, redSpawn, match.dimension);
            p.call("client::player:freeze", [true]);
            giveRoundWeapons(p, weapons);
            p.setVariable("arenaMedkits", medkits);
            p.setVariable("arenaPlates", plates);
            p.setVariable("arenaCastActive", false);
            p.setVariable("arenaEffectiveHp", 100);
            _api_1.RAGERP.cef.emit(p, "arena", "itemCounts", { medkits, plates });
            p.call("client::arena:setTeam", ["red"]);
        }
    });
    match.blueTeam.forEach((mp_) => {
        const p = mp.players.at(mp_.id);
        if (p && mp.players.exists(p)) {
            resetPlayerArenaState(p);
            spawnPlayerAtArena(p, blueSpawn, match.dimension);
            p.call("client::player:freeze", [true]);
            giveRoundWeapons(p, weapons);
            p.setVariable("arenaMedkits", medkits);
            p.setVariable("arenaPlates", plates);
            p.setVariable("arenaCastActive", false);
            p.setVariable("arenaEffectiveHp", 100);
            _api_1.RAGERP.cef.emit(p, "arena", "itemCounts", { medkits, plates });
            p.call("client::arena:setTeam", ["blue"]);
        }
    });
    spawnTeamVehicles(match, "red", match.preset.redCar);
    spawnTeamVehicles(match, "blue", match.preset.blueCar);
    emitToAll(match, "roundStart", {
        round: match.currentRound,
        weaponName: match.roundWeaponSet.name,
        warmupTime: ArenaConfig_1.ARENA_CONFIG.warmupDuration,
        redScore: match.redScore,
        blueScore: match.blueScore,
        roundsToWin: ArenaConfig_1.ARENA_CONFIG.roundsToWin
    });
    emitMatchUpdate(match);
    const zoneCenter = getZoneCenter(match.preset);
    match.zoneCenter = zoneCenter;
    const cx = Number(zoneCenter?.x ?? match.preset.center?.x ?? 0);
    const cy = Number(zoneCenter?.y ?? match.preset.center?.y ?? 0);
    const initRadius = 200;
    if (!Number.isFinite(cx) || !Number.isFinite(cy) || initRadius <= 0) {
        console.warn("[Hopouts] Invalid zone center, using preset center");
    }
    getAllMatchPlayerMps(match).forEach((p) => {
        p.call("client::arena:zoneInit", [cx, cy, initRadius]);
    });
    setArenaVoiceAndTeam(match);
    (0, ZoneSystem_1.startZone)(match.dimension, cx, cy, ArenaConfig_1.ARENA_CONFIG.warmupDuration * 1000);
    setTimeout(() => {
        if (!activeMatches.has(match.dimension))
            return;
        match.state = "active";
        match.roundEndsAt = Date.now() + ArenaConfig_1.ARENA_CONFIG.maxRoundTime * 1000;
        getAllMatchPlayerMps(match).forEach((p) => {
            p.call("client::player:freeze", [false]);
        });
        const center = match.zoneCenter ?? match.preset.center;
        emitMatchUpdate(match);
    }, ArenaConfig_1.ARENA_CONFIG.warmupDuration * 1000);
}
function checkRoundEnd(match) {
    if (match.state !== "active")
        return;
    const redAlive = getAlivePlayers(match, "red").length;
    const blueAlive = getAlivePlayers(match, "blue").length;
    if (redAlive > 0 && blueAlive > 0)
        return;
    let roundWinner;
    if (redAlive === 0 && blueAlive === 0) {
        roundWinner = "draw";
    }
    else if (redAlive === 0) {
        roundWinner = "blue";
        match.blueScore++;
    }
    else {
        roundWinner = "red";
        match.redScore++;
    }
    match.state = "round_end";
    (0, ZoneSystem_1.stopZone)(match.dimension);
    getAllMatchPlayerMps(match).forEach((p) => {
        p.call("client::arena:zoneClear");
    });
    emitToAll(match, "roundEnd", {
        winner: roundWinner,
        redScore: match.redScore,
        blueScore: match.blueScore,
        round: match.currentRound,
        roundsToWin: ArenaConfig_1.ARENA_CONFIG.roundsToWin
    });
    if (match.redScore >= ArenaConfig_1.ARENA_CONFIG.roundsToWin || match.blueScore >= ArenaConfig_1.ARENA_CONFIG.roundsToWin) {
        setTimeout(() => endMatch(match.dimension), ArenaConfig_1.ARENA_CONFIG.roundEndDelay * 1000);
    }
    else {
        setTimeout(() => {
            if (!activeMatches.has(match.dimension))
                return;
            match.currentRound++;
            beginRound(match);
        }, ArenaConfig_1.ARENA_CONFIG.roundEndDelay * 1000);
    }
}
function handleArenaDeath(victim, killer) {
    const match = getMatchByPlayer(victim);
    if (!match || match.state !== "active")
        return false;
    const victimTeam = getTeam(match, victim.id);
    if (!victimTeam)
        return false;
    const victimData = [...match.redTeam, ...match.blueTeam].find((p) => p.id === victim.id);
    if (!victimData)
        return false;
    victimData.alive = false;
    victimData.deaths++;
    if (victim.getVariable("arenaCastActive")) {
        victim.setVariable("arenaCastActive", false);
        _api_1.RAGERP.cef.emit(victim, "arena", "itemCastCancel", {});
    }
    victim.spawn(victim.position);
    victim.health = 100;
    resetPlayerArenaState(victim);
    victim.removeAllWeapons();
    let killerName = "";
    if (killer && mp.players.exists(killer)) {
        const killerTeam = getTeam(match, killer.id);
        if (killerTeam && killerTeam !== victimTeam) {
            const killerData = [...match.redTeam, ...match.blueTeam].find((p) => p.id === killer.id);
            if (killerData)
                killerData.kills++;
            killerName = killer.name;
            emitKillFeed(match, killer.name, victim.name);
            _api_1.RAGERP.cef.emit(killer, "arena", "youKill", { victim: victim.name });
        }
    }
    _api_1.RAGERP.cef.emit(victim, "arena", "youDied", { killer: killerName });
    const aliveTeammates = getAlivePlayers(match, victimTeam);
    if (aliveTeammates.length > 0) {
        const target = aliveTeammates[0];
        const targetMp = mp.players.at(target.id);
        if (targetMp && mp.players.exists(targetMp)) {
            (0, Player_event_1.startSpectate)(victim, targetMp);
        }
    }
    emitMatchUpdate(match);
    checkRoundEnd(match);
    return true;
}
function handleZoneDeath(player) {
    handleArenaDeath(player, undefined);
}
function leaveMatch(player, returnToMenu = true) {
    const match = getMatchByPlayer(player);
    if (!match)
        return false;
    playerToMatch.delete(player.id);
    // Inventory system removed - no cast cancellation needed
    // Inventory system removed - no item clearing needed
    player.dimension = 0;
    player.removeAllWeapons();
    player.call("client::player:freeze", [false]);
    (0, Player_event_1.stopSpectate)(player, false);
    player.call("client::arena:zoneClear");
    clearArenaVoiceAndTeam(player);
    match.redTeam = match.redTeam.filter((p) => p.id !== player.id);
    match.blueTeam = match.blueTeam.filter((p) => p.id !== player.id);
    const remaining = [...match.redTeam, ...match.blueTeam];
    if (remaining.length === 0) {
        destroyMatchVehicles(match);
        (0, ZoneSystem_1.stopZone)(match.dimension);
        activeMatches.delete(match.dimension);
    }
    else {
        emitMatchUpdate(match);
        if (match.state === "active")
            checkRoundEnd(match);
    }
    player.call("client::arena:clearTeam");
    if (returnToMenu) {
        _api_1.RAGERP.cef.startPage(player, "mainmenu");
        _api_1.RAGERP.cef.emit(player, "system", "setPage", "mainmenu");
    }
    _api_1.RAGERP.cef.emit(player, "arena", "leftMatch", null);
    return true;
}
function endMatch(dimension) {
    const match = activeMatches.get(dimension);
    if (!match)
        return;
    match.state = "match_end";
    (0, ZoneSystem_1.stopZone)(match.dimension);
    destroyMatchVehicles(match);
    const winner = match.redScore > match.blueScore ? "red" : match.blueScore > match.redScore ? "blue" : "draw";
    const results = {
        redScore: match.redScore,
        blueScore: match.blueScore,
        winner,
        redTeam: match.redTeam.map((p) => ({ id: p.id, name: p.name, kills: p.kills, deaths: p.deaths })),
        blueTeam: match.blueTeam.map((p) => ({ id: p.id, name: p.name, kills: p.kills, deaths: p.deaths }))
    };
    const allPlayers = getAllMatchPlayerMps(match);
    allPlayers.forEach((p) => {
        playerToMatch.delete(p.id);
        clearArenaVoiceAndTeam(p);
        // Inventory system removed - no cast cancellation needed
        p.removeAllWeapons();
        p.call("client::player:freeze", [false]);
        (0, Player_event_1.stopSpectate)(p, false);
        p.call("client::arena:zoneClear");
        _api_1.RAGERP.cef.emit(p, "arena", "matchEnd", results);
    });
    activeMatches.delete(dimension);
    setTimeout(() => {
        allPlayers.forEach((p) => {
            if (mp.players.exists(p)) {
                p.dimension = 0;
                p.call("client::arena:clearTeam");
                _api_1.RAGERP.cef.startPage(p, "mainmenu");
                _api_1.RAGERP.cef.emit(p, "system", "setPage", "mainmenu");
            }
        });
    }, ArenaConfig_1.ARENA_CONFIG.matchEndDelay * 1000);
}
function tickMatches() {
    const now = Date.now();
    activeMatches.forEach((match, dim) => {
        if (match.state === "active" && now >= match.roundEndsAt) {
            const redAlive = getAlivePlayers(match, "red").length;
            const blueAlive = getAlivePlayers(match, "blue").length;
            if (redAlive > blueAlive)
                match.redScore++;
            else if (blueAlive > redAlive)
                match.blueScore++;
            match.state = "round_end";
            (0, ZoneSystem_1.stopZone)(dim);
            getAllMatchPlayerMps(match).forEach((p) => {
                p.call("client::arena:zoneClear");
            });
            emitToAll(match, "roundEnd", {
                winner: redAlive > blueAlive ? "red" : blueAlive > redAlive ? "blue" : "draw",
                redScore: match.redScore,
                blueScore: match.blueScore,
                round: match.currentRound,
                roundsToWin: ArenaConfig_1.ARENA_CONFIG.roundsToWin
            });
            if (match.redScore >= ArenaConfig_1.ARENA_CONFIG.roundsToWin || match.blueScore >= ArenaConfig_1.ARENA_CONFIG.roundsToWin) {
                setTimeout(() => endMatch(dim), ArenaConfig_1.ARENA_CONFIG.roundEndDelay * 1000);
            }
            else {
                setTimeout(() => {
                    if (!activeMatches.has(dim))
                        return;
                    match.currentRound++;
                    beginRound(match);
                }, ArenaConfig_1.ARENA_CONFIG.roundEndDelay * 1000);
            }
        }
        else if (match.state === "active") {
            emitMatchUpdate(match);
        }
    });
}
setInterval(tickMatches, 1000);


/***/ },

/***/ "./source/server/arena/ArenaPresets.asset.ts"
/*!***************************************************!*\
  !*** ./source/server/arena/ArenaPresets.asset.ts ***!
  \***************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getArenaPresets = getArenaPresets;
exports.saveArenaPreset = saveArenaPreset;
const fs = __importStar(__webpack_require__(/*! fs */ "fs"));
const path = __importStar(__webpack_require__(/*! path */ "path"));
const DATA_PATH = path.join(process.cwd(), "data", "arenas.json");
let presets = [];
function ensureDataDir() {
    const dir = path.dirname(DATA_PATH);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}
function loadPresets() {
    try {
        ensureDataDir();
        if (fs.existsSync(DATA_PATH)) {
            const raw = fs.readFileSync(DATA_PATH, "utf-8");
            const parsed = JSON.parse(raw);
            presets = Array.isArray(parsed) ? parsed : [];
        }
        else {
            presets = [];
            fs.writeFileSync(DATA_PATH, JSON.stringify([], null, 2), "utf-8");
        }
    }
    catch (err) {
        console.error("[Hopouts] Failed to load locations:", err);
        presets = [];
    }
    return presets;
}
function getArenaPresets() {
    if (presets.length === 0) {
        loadPresets();
    }
    return presets;
}
function saveArenaPreset(preset) {
    try {
        ensureDataDir();
        const all = getArenaPresets();
        const idx = all.findIndex((p) => p.id === preset.id);
        if (idx >= 0) {
            all[idx] = preset;
        }
        else {
            all.push(preset);
        }
        fs.writeFileSync(DATA_PATH, JSON.stringify(all, null, 2), "utf-8");
        presets = all;
        return true;
    }
    catch (err) {
        console.error("[Hopouts] Failed to save location:", err);
        return false;
    }
}
loadPresets();


/***/ },

/***/ "./source/server/arena/WeaponAttachments.data.ts"
/*!*******************************************************!*\
  !*** ./source/server/arena/WeaponAttachments.data.ts ***!
  \*******************************************************/
(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WEAPON_ATTACHMENTS = void 0;
exports.getWeaponAttachments = getWeaponAttachments;
exports.calculateRecoilModifier = calculateRecoilModifier;
exports.WEAPON_ATTACHMENTS = [
    {
        weaponHash: 2578377531,
        weaponName: "weapon_pistol50",
        displayName: "Pistol .50",
        components: [
            { hash: 580369945, name: "Default Clip", category: "clip", recoilModifier: 1.0 },
            { hash: 3654528394, name: "Extended Clip", category: "clip", recoilModifier: 1.0 },
            { hash: 899381934, name: "Flashlight", category: "flashlight", recoilModifier: 1.0 },
            { hash: 2805810788, name: "Suppressor", category: "muzzle", recoilModifier: 0.95 },
            { hash: 2008591365, name: "Yusuf Amir Luxury Finish", category: "skin", recoilModifier: 1.0 },
        ]
    },
    {
        weaponHash: 3231910285,
        weaponName: "weapon_specialcarbine",
        displayName: "Special Carbine",
        components: [
            { hash: 3334989185, name: "Default Clip", category: "clip", recoilModifier: 1.0 },
            { hash: 2089537806, name: "Extended Clip", category: "clip", recoilModifier: 1.0 },
            { hash: 2076495324, name: "Flashlight", category: "flashlight", recoilModifier: 1.0 },
            { hash: 2698550338, name: "Scope", category: "scope", recoilModifier: 1.0 },
            { hash: 2805810788, name: "Suppressor", category: "muzzle", recoilModifier: 0.9 },
            { hash: 202788691, name: "Grip", category: "grip", recoilModifier: 0.8 },
            { hash: 1929467930, name: "Yusuf Amir Luxury Finish", category: "skin", recoilModifier: 1.0 },
        ]
    },
    {
        weaponHash: 2132975508,
        weaponName: "weapon_bullpuprifle",
        displayName: "Bullpup Rifle",
        components: [
            { hash: 3315675008, name: "Default Clip", category: "clip", recoilModifier: 1.0 },
            { hash: 3009973007, name: "Extended Clip", category: "clip", recoilModifier: 1.0 },
            { hash: 2076495324, name: "Flashlight", category: "flashlight", recoilModifier: 1.0 },
            { hash: 2855028148, name: "Scope", category: "scope", recoilModifier: 1.0 },
            { hash: 2205435306, name: "Suppressor", category: "muzzle", recoilModifier: 0.9 },
            { hash: 202788691, name: "Grip", category: "grip", recoilModifier: 0.8 },
            { hash: 2824322168, name: "Gilded Gun Metal Finish", category: "skin", recoilModifier: 1.0 },
        ]
    },
    {
        weaponHash: 4208062921,
        weaponName: "weapon_carbinerifle_mk2",
        displayName: "Carbine Rifle Mk II",
        components: [
            { hash: 1283078430, name: "Default Clip", category: "clip", recoilModifier: 1.0 },
            { hash: 1574296533, name: "Extended Clip", category: "clip", recoilModifier: 1.0 },
            { hash: 2076495324, name: "Flashlight", category: "flashlight", recoilModifier: 1.0 },
            { hash: 3405310959, name: "Holographic Sight", category: "scope", recoilModifier: 1.0 },
            { hash: 77277509, name: "Small Scope", category: "scope", recoilModifier: 1.0 },
            { hash: 3328927042, name: "Medium Scope", category: "scope", recoilModifier: 1.0 },
            { hash: 2205435306, name: "Suppressor", category: "muzzle", recoilModifier: 0.9 },
            { hash: 3079677681, name: "Flat Muzzle Brake", category: "muzzle", recoilModifier: 0.85 },
            { hash: 1303784126, name: "Tactical Muzzle Brake", category: "muzzle", recoilModifier: 0.82 },
            { hash: 1602080333, name: "Fat-End Muzzle Brake", category: "muzzle", recoilModifier: 0.80 },
            { hash: 3859329886, name: "Precision Muzzle Brake", category: "muzzle", recoilModifier: 0.78 },
            { hash: 3024542883, name: "Heavy Duty Muzzle Brake", category: "muzzle", recoilModifier: 0.75 },
            { hash: 3513717749, name: "Slanted Muzzle Brake", category: "muzzle", recoilModifier: 0.77 },
            { hash: 2640679034, name: "Split-End Muzzle Brake", category: "muzzle", recoilModifier: 0.79 },
            { hash: 2201368575, name: "Default Barrel", category: "barrel", recoilModifier: 1.0 },
            { hash: 2335983627, name: "Heavy Barrel", category: "barrel", recoilModifier: 0.88 },
            { hash: 2640299872, name: "Grip", category: "grip", recoilModifier: 0.8 },
        ]
    },
    {
        weaponHash: 487013001,
        weaponName: "weapon_pumpshotgun",
        displayName: "Pump Shotgun",
        components: [
            { hash: 0, name: "Default Clip", category: "clip", recoilModifier: 1.0 },
            { hash: 2076495324, name: "Flashlight", category: "flashlight", recoilModifier: 1.0 },
            { hash: 3859329886, name: "Suppressor", category: "muzzle", recoilModifier: 0.92 },
            { hash: 2732039643, name: "Yusuf Amir Luxury Finish", category: "skin", recoilModifier: 1.0 },
        ]
    },
    {
        weaponHash: 3220176749,
        weaponName: "weapon_assaultrifle",
        displayName: "Assault Rifle",
        components: [
            { hash: 3193891350, name: "Default Clip", category: "clip", recoilModifier: 1.0 },
            { hash: 2971750299, name: "Extended Clip", category: "clip", recoilModifier: 1.0 },
            { hash: 2076495324, name: "Flashlight", category: "flashlight", recoilModifier: 1.0 },
            { hash: 2855028148, name: "Scope", category: "scope", recoilModifier: 1.0 },
            { hash: 2805810788, name: "Suppressor", category: "muzzle", recoilModifier: 0.9 },
            { hash: 202788691, name: "Grip", category: "grip", recoilModifier: 0.8 },
            { hash: 1319990579, name: "Yusuf Amir Luxury Finish", category: "skin", recoilModifier: 1.0 },
        ]
    },
    {
        weaponHash: 1593441988,
        weaponName: "weapon_combatpistol",
        displayName: "Combat Pistol",
        components: [
            { hash: 119655033, name: "Default Clip", category: "clip", recoilModifier: 1.0 },
            { hash: 3596571437, name: "Extended Clip", category: "clip", recoilModifier: 1.0 },
            { hash: 899381934, name: "Flashlight", category: "flashlight", recoilModifier: 1.0 },
            { hash: 3271853210, name: "Suppressor", category: "muzzle", recoilModifier: 0.95 },
            { hash: 3328267634, name: "Yusuf Amir Luxury Finish", category: "skin", recoilModifier: 1.0 },
        ]
    },
    {
        weaponHash: 3523564046,
        weaponName: "weapon_heavypistol",
        displayName: "Heavy Pistol",
        components: [
            { hash: 222992026, name: "Default Clip", category: "clip", recoilModifier: 1.0 },
            { hash: 1694090795, name: "Extended Clip", category: "clip", recoilModifier: 1.0 },
            { hash: 899381934, name: "Flashlight", category: "flashlight", recoilModifier: 1.0 },
            { hash: 3271853210, name: "Suppressor", category: "muzzle", recoilModifier: 0.95 },
            { hash: 2053799099, name: "Etched Wood Grip Finish", category: "skin", recoilModifier: 1.0 },
        ]
    },
    {
        weaponHash: 736523883,
        weaponName: "weapon_smg",
        displayName: "SMG",
        components: [
            { hash: 643830487, name: "Default Clip", category: "clip", recoilModifier: 1.0 },
            { hash: 889916667, name: "Extended Clip", category: "clip", recoilModifier: 1.0 },
            { hash: 2041522294, name: "Drum Magazine", category: "clip", recoilModifier: 1.0 },
            { hash: 2076495324, name: "Flashlight", category: "flashlight", recoilModifier: 1.0 },
            { hash: 1006670047, name: "Scope", category: "scope", recoilModifier: 1.0 },
            { hash: 3271853210, name: "Suppressor", category: "muzzle", recoilModifier: 0.9 },
            { hash: 663517328, name: "Yusuf Amir Luxury Finish", category: "skin", recoilModifier: 1.0 },
        ]
    },
    {
        weaponHash: 171789620,
        weaponName: "weapon_combatpdw",
        displayName: "Combat PDW",
        components: [
            { hash: 1129462574, name: "Default Clip", category: "clip", recoilModifier: 1.0 },
            { hash: 859604227, name: "Extended Clip", category: "clip", recoilModifier: 1.0 },
            { hash: 1857608283, name: "Drum Magazine", category: "clip", recoilModifier: 1.0 },
            { hash: 2076495324, name: "Flashlight", category: "flashlight", recoilModifier: 1.0 },
            { hash: 2855028148, name: "Scope", category: "scope", recoilModifier: 1.0 },
            { hash: 202788691, name: "Grip", category: "grip", recoilModifier: 0.8 },
        ]
    },
    {
        weaponHash: 2210333304,
        weaponName: "weapon_carbinerifle",
        displayName: "Carbine Rifle",
        components: [
            { hash: 3334989185, name: "Default Clip", category: "clip", recoilModifier: 1.0 },
            { hash: 2089537806, name: "Extended Clip", category: "clip", recoilModifier: 1.0 },
            { hash: 2076495324, name: "Flashlight", category: "flashlight", recoilModifier: 1.0 },
            { hash: 2698550338, name: "Scope", category: "scope", recoilModifier: 1.0 },
            { hash: 2805810788, name: "Suppressor", category: "muzzle", recoilModifier: 0.9 },
            { hash: 202788691, name: "Grip", category: "grip", recoilModifier: 0.8 },
        ]
    },
    {
        weaponHash: 2937143193,
        weaponName: "weapon_advancedrifle",
        displayName: "Advanced Rifle",
        components: [
            { hash: 3193891350, name: "Default Clip", category: "clip", recoilModifier: 1.0 },
            { hash: 2971750299, name: "Extended Clip", category: "clip", recoilModifier: 1.0 },
            { hash: 2076495324, name: "Flashlight", category: "flashlight", recoilModifier: 1.0 },
            { hash: 2855028148, name: "Scope", category: "scope", recoilModifier: 1.0 },
            { hash: 2805810788, name: "Suppressor", category: "muzzle", recoilModifier: 0.9 },
            { hash: 202788691, name: "Grip", category: "grip", recoilModifier: 0.8 },
        ]
    },
    {
        weaponHash: 3800352039,
        weaponName: "weapon_assaultshotgun",
        displayName: "Assault Shotgun",
        components: [
            { hash: 2498213963, name: "Default Clip", category: "clip", recoilModifier: 1.0 },
            { hash: 2258927634, name: "Extended Clip", category: "clip", recoilModifier: 1.0 },
            { hash: 2076495324, name: "Flashlight", category: "flashlight", recoilModifier: 1.0 },
            { hash: 2205435306, name: "Suppressor", category: "muzzle", recoilModifier: 0.92 },
            { hash: 202788691, name: "Grip", category: "grip", recoilModifier: 0.8 },
        ]
    },
    {
        weaponHash: 984333226,
        weaponName: "weapon_combatshotgun",
        displayName: "Combat Shotgun",
        components: [
            { hash: 2076495324, name: "Flashlight", category: "flashlight", recoilModifier: 1.0 },
            { hash: 2205435306, name: "Suppressor", category: "muzzle", recoilModifier: 0.92 },
        ]
    },
];
const attachmentsByHash = new Map(exports.WEAPON_ATTACHMENTS.map(w => [w.weaponHash, w]));
function getWeaponAttachments(hash) {
    return attachmentsByHash.get(hash);
}
function calculateRecoilModifier(weaponHash, componentHashes) {
    const weapon = attachmentsByHash.get(weaponHash);
    if (!weapon)
        return 1.0;
    let modifier = 1.0;
    for (const ch of componentHashes) {
        const comp = weapon.components.find(c => c.hash === ch);
        if (comp)
            modifier *= comp.recoilModifier;
    }
    return modifier;
}


/***/ },

/***/ "./source/server/arena/WeaponPresets.service.ts"
/*!******************************************************!*\
  !*** ./source/server/arena/WeaponPresets.service.ts ***!
  \******************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.loadPlayerPresets = loadPlayerPresets;
exports.savePlayerPreset = savePlayerPreset;
exports.applyWeaponPresets = applyWeaponPresets;
const _api_1 = __webpack_require__(/*! @api */ "./source/server/api/index.ts");
const WeaponPreset_entity_1 = __webpack_require__(/*! @entities/WeaponPreset.entity */ "./source/server/database/entity/WeaponPreset.entity.ts");
const WeaponAttachments_data_1 = __webpack_require__(/*! ./WeaponAttachments.data */ "./source/server/arena/WeaponAttachments.data.ts");
async function loadPlayerPresets(characterId) {
    return _api_1.RAGERP.database.getRepository(WeaponPreset_entity_1.WeaponPresetEntity).find({ where: { characterId } });
}
async function savePlayerPreset(characterId, weaponName, components) {
    const repo = _api_1.RAGERP.database.getRepository(WeaponPreset_entity_1.WeaponPresetEntity);
    let preset = await repo.findOne({ where: { characterId, weaponName } });
    if (preset) {
        preset.components = components;
        await repo.save(preset);
    }
    else {
        preset = repo.create({ characterId, weaponName, components });
        await repo.save(preset);
    }
}
async function applyWeaponPresets(player, weaponHashes) {
    if (!player.character)
        return;
    const presets = await loadPlayerPresets(player.character.id);
    let combinedRecoil = 1.0;
    for (const hash of weaponHashes) {
        const attachData = (0, WeaponAttachments_data_1.getWeaponAttachments)(hash);
        if (!attachData)
            continue;
        const preset = presets.find(p => p.weaponName === attachData.weaponName);
        if (!preset || preset.components.length === 0)
            continue;
        const validComponents = preset.components.filter(ch => attachData.components.some(c => c.hash === ch));
        player.call("client::weapon:applyComponents", [hash, JSON.stringify(validComponents)]);
        const weaponRecoil = (0, WeaponAttachments_data_1.calculateRecoilModifier)(hash, validComponents);
        combinedRecoil *= weaponRecoil;
    }
    player.call("client::recoil:setModifier", [combinedRecoil]);
}
_api_1.RAGERP.cef.register("loadout", "getPresets", async (player) => {
    if (!player.character)
        return;
    const presets = await loadPlayerPresets(player.character.id);
    _api_1.RAGERP.cef.emit(player, "loadout", "presetsLoaded", {
        presets: presets.map(p => ({ weaponName: p.weaponName, components: p.components }))
    });
});
_api_1.RAGERP.cef.register("loadout", "savePreset", async (player, data) => {
    if (!player.character)
        return;
    try {
        const parsed = JSON.parse(data);
        const { weaponName, components } = parsed;
        if (!weaponName || !Array.isArray(components))
            return;
        await savePlayerPreset(player.character.id, weaponName, components);
        player.showNotify("success" /* RageShared.Enums.NotifyType.TYPE_SUCCESS */, "Loadout saved!");
    }
    catch {
        player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "Failed to save loadout.");
    }
});


/***/ },

/***/ "./source/server/arena/ZoneSystem.ts"
/*!*******************************************!*\
  !*** ./source/server/arena/ZoneSystem.ts ***!
  \*******************************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.startZone = startZone;
exports.stopZone = stopZone;
exports.getZoneState = getZoneState;
exports.tickZones = tickZones;
const _api_1 = __webpack_require__(/*! @api */ "./source/server/api/index.ts");
const ArenaConfig_1 = __webpack_require__(/*! ./ArenaConfig */ "./source/server/arena/ArenaConfig.ts");
const ArenaMatch_manager_1 = __webpack_require__(/*! ./ArenaMatch.manager */ "./source/server/arena/ArenaMatch.manager.ts");
const activeZones = new Map();
const outOfBoundsStart = new Map();
const OUT_OF_BOUNDS_RADIUS = 320;
const OUT_OF_BOUNDS_GRACE = 8;
function startZone(dimension, centerX, centerY, elapsedOffsetMs = 0) {
    if (ArenaConfig_1.ZONE_PHASES.length === 0)
        return;
    const firstPhase = ArenaConfig_1.ZONE_PHASES[0];
    const zone = {
        dimension,
        centerX,
        centerY,
        currentRadius: 200,
        targetRadius: firstPhase.endRadius,
        currentPhase: 0,
        phaseStartedAt: Date.now() - elapsedOffsetMs,
        phaseDuration: firstPhase.duration * 1000,
        dps: firstPhase.dps,
        active: true
    };
    activeZones.set(dimension, zone);
}
function stopZone(dimension) {
    activeZones.delete(dimension);
    outOfBoundsStart.clear();
}
function getZoneState(dimension) {
    return activeZones.get(dimension);
}
function advancePhase(zone) {
    zone.currentPhase++;
    if (zone.currentPhase >= ArenaConfig_1.ZONE_PHASES.length) {
        return false;
    }
    const phase = ArenaConfig_1.ZONE_PHASES[zone.currentPhase];
    zone.currentRadius = zone.targetRadius;
    zone.targetRadius = phase.endRadius;
    zone.phaseDuration = phase.duration * 1000;
    zone.phaseStartedAt = Date.now();
    zone.dps = phase.dps;
    return true;
}
function getCurrentRadius(zone) {
    const elapsed = Date.now() - zone.phaseStartedAt;
    const progress = Math.min(1, elapsed / zone.phaseDuration);
    return zone.currentRadius + (zone.targetRadius - zone.currentRadius) * progress;
}
function isInZone(zone, x, y) {
    const radius = getCurrentRadius(zone);
    const dx = x - zone.centerX;
    const dy = y - zone.centerY;
    return (dx * dx + dy * dy) <= (radius * radius);
}
function tickZones() {
    const now = Date.now();
    activeZones.forEach((zone, dim) => {
        if (!zone.active)
            return;
        const match = (0, ArenaMatch_manager_1.getMatchByDimension)(dim);
        if (!match || match.state !== "active")
            return;
        const elapsed = now - zone.phaseStartedAt;
        if (elapsed >= zone.phaseDuration) {
            if (!advancePhase(zone)) {
                zone.active = false;
            }
        }
        const radius = getCurrentRadius(zone);
        const safeRadius = Number.isFinite(radius) && radius > 0 ? Math.round(radius) : 200;
        const phaseTimeLeft = Math.max(0, Math.ceil((zone.phaseDuration - (now - zone.phaseStartedAt)) / 1000));
        const allPlayers = [...match.redTeam, ...match.blueTeam];
        const playersToKill = [];
        allPlayers.forEach((mp_) => {
            const p = mp.players.at(mp_.id);
            if (!p || !mp.players.exists(p))
                return;
            if (mp_.alive && !isInZone(zone, p.position.x, p.position.y)) {
                const currentHp = p.health;
                const newHp = currentHp - zone.dps;
                if (newHp <= 0) {
                    playersToKill.push(p);
                }
                else {
                    p.health = newHp;
                }
            }
            const dx = p.position.x - zone.centerX;
            const dy = p.position.y - zone.centerY;
            const distSq = dx * dx + dy * dy;
            if (distSq > OUT_OF_BOUNDS_RADIUS * OUT_OF_BOUNDS_RADIUS) {
                const startedAt = outOfBoundsStart.get(p.id) ?? now;
                outOfBoundsStart.set(p.id, startedAt);
                const timeLeft = Math.max(0, OUT_OF_BOUNDS_GRACE - Math.floor((now - startedAt) / 1000));
                _api_1.RAGERP.cef.emit(p, "arena", "outOfBounds", { active: true, timeLeft });
                if (timeLeft <= 0) {
                    playersToKill.push(p);
                }
            }
            else if (outOfBoundsStart.has(p.id)) {
                outOfBoundsStart.delete(p.id);
                _api_1.RAGERP.cef.emit(p, "arena", "outOfBounds", { active: false, timeLeft: 0 });
            }
            p.call("client::arena:zoneUpdate", [
                zone.centerX,
                zone.centerY,
                Math.round(radius),
                zone.currentPhase + 1,
                ArenaConfig_1.ZONE_PHASES.length,
                phaseTimeLeft,
                zone.dps
            ]);
            _api_1.RAGERP.cef.emit(p, "arena", "zoneUpdate", {
                centerX: zone.centerX,
                centerY: zone.centerY,
                radius: safeRadius,
                phase: zone.currentPhase + 1,
                totalPhases: ArenaConfig_1.ZONE_PHASES.length,
                phaseTimeLeft,
                dps: zone.dps
            });
        });
        playersToKill.forEach((p) => {
            if (mp.players.exists(p)) {
                (0, ArenaMatch_manager_1.handleZoneDeath)(p);
            }
        });
    });
}
setInterval(tickZones, 1000);


/***/ },

/***/ "./source/server/assets/Admin.asset.ts"
/*!*********************************************!*\
  !*** ./source/server/assets/Admin.asset.ts ***!
  \*********************************************/
(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.adminTeleports = void 0;
const adminTeleports = {
    lspd: new mp.Vector3(414.5832214355469, -989.611328125, 29.417924880981445),
    pillbox: new mp.Vector3(280.22662353515625, -582.34033203125, 43.279014587402344),
    bank: new mp.Vector3(226.28297424316406, 210.3422088623047, 105.53901672363281),
    cityhall: new mp.Vector3(241.82180786132812, -391.95587158203125, 46.30564880371094),
    paleto: new mp.Vector3(-433.9971923828125, 6025.0625, 31.490114212036133),
    paletobank: new mp.Vector3(-118.35197448730469, 6455.9091796875, 31.401966094970703),
    casino: new mp.Vector3(914.2948608398438, 55.01435852050781, 80.89936828613281),
    airport: new mp.Vector3(-1039.8572998046875, -2737.929443359375, 13.75472640991211),
    lspier: new mp.Vector3(-1853.55908203125, -1229.3692626953125, 13.01725959777832),
    bahama: new mp.Vector3(-1392.2113037109375, -585.1786499023438, 30.24015235900879),
    richman: new mp.Vector3(-105.57720947265625, 428.8331604003906, 113.1912612915039),
    sandy: new mp.Vector3(1861.340087890625, 3678.413330078125, 33.65660095214844),
    farmer: new mp.Vector3(2825.45751953125, 4572.54541015625, 46.50938415527344),
    army: new mp.Vector3(-2337.3369140625, 3266.97802734375, 32.827632904052734),
    taxi: new mp.Vector3(903.3555908203125, -173.010498046875, 74.07547760009766),
    gopostal: new mp.Vector3(85.86287689208984, 107.49935913085938, 79.15878295898438),
    lscustoms: new mp.Vector3(-371.1271057128906, -121.13578033447266, 38.68169403076172),
    armyship: new mp.Vector3(3080.593017578125, -4723.19775390625, 15.262296676635742)
};
exports.adminTeleports = adminTeleports;


/***/ },

/***/ "./source/server/assets/Vehicle.assets.ts"
/*!************************************************!*\
  !*** ./source/server/assets/Vehicle.assets.ts ***!
  \************************************************/
(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.vehicleClasses = exports.vehicleModelSeats = void 0;
const vehicleModelSeats = [
    { vehicleHash: 1032823388, seats: 2 },
    { vehicleHash: 2833484545, seats: 2 },
    { vehicleHash: 3950024287, seats: 2 },
    { vehicleHash: 2485144969, seats: 4 },
    { vehicleHash: 2487343317, seats: 4 },
    { vehicleHash: 524108981, seats: 0 },
    { vehicleHash: 3581397346, seats: 16 },
    { vehicleHash: 3087536137, seats: 0 },
    { vehicleHash: 2818520053, seats: 0 },
    { vehicleHash: 2657817814, seats: 0 },
    { vehicleHash: 3517691494, seats: 0 },
    { vehicleHash: 2222034228, seats: 10 },
    { vehicleHash: 1283517198, seats: 16 },
    { vehicleHash: 2391954683, seats: 4 },
    { vehicleHash: 1560980623, seats: 2 },
    { vehicleHash: 1171614426, seats: 4 },
    { vehicleHash: 3471458123, seats: 10 },
    { vehicleHash: 1074326203, seats: 2 },
    { vehicleHash: 3486135912, seats: 4 },
    { vehicleHash: 142944341, seats: 4 },
    { vehicleHash: 850565707, seats: 4 },
    { vehicleHash: 3253274834, seats: 2 },
    { vehicleHash: 2053223216, seats: 2 },
    { vehicleHash: 1126868326, seats: 2 },
    { vehicleHash: 850991848, seats: 2 },
    { vehicleHash: 2166734073, seats: 1 },
    { vehicleHash: 4246935337, seats: 1 },
    { vehicleHash: 3025077634, seats: 1 },
    { vehicleHash: 4278019151, seats: 6 },
    { vehicleHash: 2072156101, seats: 4 },
    { vehicleHash: 1739845664, seats: 4 },
    { vehicleHash: 2307837162, seats: 6 },
    { vehicleHash: 4061868990, seats: 6 },
    { vehicleHash: 121658888, seats: 4 },
    { vehicleHash: 1069929536, seats: 2 },
    { vehicleHash: 2859047862, seats: 4 },
    { vehicleHash: 3612755468, seats: 2 },
    { vehicleHash: 3990165190, seats: 4 },
    { vehicleHash: 736902334, seats: 4 },
    { vehicleHash: 1886712733, seats: 1 },
    { vehicleHash: 2598821281, seats: 2 },
    { vehicleHash: 4143991942, seats: 4 },
    { vehicleHash: 2948279460, seats: 4 },
    { vehicleHash: 3387490166, seats: 4 },
    { vehicleHash: 2551651283, seats: 4 },
    { vehicleHash: 893081117, seats: 4 },
    { vehicleHash: 1132262048, seats: 4 },
    { vehicleHash: 2006918058, seats: 4 },
    { vehicleHash: 3505073125, seats: 4 },
    { vehicleHash: 456714581, seats: 4 },
    { vehicleHash: 2549763894, seats: 4 },
    { vehicleHash: 3334677549, seats: 4 },
    { vehicleHash: 1147287684, seats: 2 },
    { vehicleHash: 3757070668, seats: 2 },
    { vehicleHash: 1876516712, seats: 2 },
    { vehicleHash: 2072687711, seats: 2 },
    { vehicleHash: 2983812512, seats: 2 },
    { vehicleHash: 3249425686, seats: 2 },
    { vehicleHash: 330661258, seats: 2 },
    { vehicleHash: 108773431, seats: 2 },
    { vehicleHash: 3288047904, seats: 1 },
    { vehicleHash: 2751205197, seats: 4 },
    { vehicleHash: 3164157193, seats: 4 },
    { vehicleHash: 1682114128, seats: 4 },
    { vehicleHash: 2633113103, seats: 2 },
    { vehicleHash: 534258863, seats: 2 },
    { vehicleHash: 37348240, seats: 2 },
    { vehicleHash: 1770332643, seats: 2 },
    { vehicleHash: 1177543287, seats: 4 },
    { vehicleHash: 3900892662, seats: 4 },
    { vehicleHash: 2164484578, seats: 1 },
    { vehicleHash: 2589662668, seats: 2 },
    { vehicleHash: 3410276810, seats: 1 },
    { vehicleHash: 80636076, seats: 2 },
    { vehicleHash: 3609690755, seats: 4 },
    { vehicleHash: 2411965148, seats: 4 },
    { vehicleHash: 3053254478, seats: 4 },
    { vehicleHash: 3003014393, seats: 2 },
    { vehicleHash: 4289813342, seats: 4 },
    { vehicleHash: 3728579874, seats: 2 },
    { vehicleHash: 3703357000, seats: 2 },
    { vehicleHash: 1127131465, seats: 4 },
    { vehicleHash: 2647026068, seats: 8 },
    { vehicleHash: 3903372712, seats: 4 },
    { vehicleHash: 4205676014, seats: 2 },
    { vehicleHash: 2299640309, seats: 2 },
    { vehicleHash: 1938952078, seats: 8 },
    { vehicleHash: 1353720154, seats: 2 },
    { vehicleHash: 1491375716, seats: 1 },
    { vehicleHash: 3157435195, seats: 4 },
    { vehicleHash: 499169875, seats: 2 },
    { vehicleHash: 1909141499, seats: 4 },
    { vehicleHash: 2016857647, seats: 2 },
    { vehicleHash: 2519238556, seats: 8 },
    { vehicleHash: 2494797253, seats: 2 },
    { vehicleHash: 884422927, seats: 4 },
    { vehicleHash: 1518533038, seats: 2 },
    { vehicleHash: 444583674, seats: 1 },
    { vehicleHash: 418536135, seats: 2 },
    { vehicleHash: 3005245074, seats: 4 },
    { vehicleHash: 886934177, seats: 4 },
    { vehicleHash: 3117103977, seats: 2 },
    { vehicleHash: 3670438162, seats: 4 },
    { vehicleHash: 4174679674, seats: 6 },
    { vehicleHash: 1051415893, seats: 2 },
    { vehicleHash: 544021352, seats: 2 },
    { vehicleHash: 1269098716, seats: 4 },
    { vehicleHash: 469291905, seats: 4 },
    { vehicleHash: 2170765704, seats: 2 },
    { vehicleHash: 914654722, seats: 4 },
    { vehicleHash: 3546958660, seats: 4 },
    { vehicleHash: 2230595153, seats: 4 },
    { vehicleHash: 321739290, seats: 4 },
    { vehicleHash: 3984502180, seats: 4 },
    { vehicleHash: 3510150843, seats: 2 },
    { vehicleHash: 475220373, seats: 2 },
    { vehicleHash: 3861591579, seats: 2 },
    { vehicleHash: 1783355638, seats: 1 },
    { vehicleHash: 904750859, seats: 6 },
    { vehicleHash: 3244501995, seats: 2 },
    { vehicleHash: 1348744438, seats: 4 },
    { vehicleHash: 3783366066, seats: 4 },
    { vehicleHash: 569305213, seats: 2 },
    { vehicleHash: 3486509883, seats: 4 },
    { vehicleHash: 2287941233, seats: 11 },
    { vehicleHash: 3917501776, seats: 2 },
    { vehicleHash: 1830407356, seats: 2 },
    { vehicleHash: 2157618379, seats: 2 },
    { vehicleHash: 2199527893, seats: 2 },
    { vehicleHash: 1507916787, seats: 2 },
    { vehicleHash: 2112052861, seats: 2 },
    { vehicleHash: 2046537925, seats: 4 },
    { vehicleHash: 2321795001, seats: 4 },
    { vehicleHash: 2667966721, seats: 4 },
    { vehicleHash: 1912215274, seats: 4 },
    { vehicleHash: 2758042359, seats: 4 },
    { vehicleHash: 2515846680, seats: 4 },
    { vehicleHash: 4175309224, seats: 4 },
    { vehicleHash: 943752001, seats: 4 },
    { vehicleHash: 2844316578, seats: 2 },
    { vehicleHash: 741586030, seats: 8 },
    { vehicleHash: 2411098011, seats: 4 },
    { vehicleHash: 3144368207, seats: 4 },
    { vehicleHash: 356391690, seats: 2 },
    { vehicleHash: 1645267888, seats: 4 },
    { vehicleHash: 1933662059, seats: 4 },
    { vehicleHash: 2360515092, seats: 2 },
    { vehicleHash: 1737773231, seats: 2 },
    { vehicleHash: 2643899483, seats: 4 },
    { vehicleHash: 3627815886, seats: 2 },
    { vehicleHash: 3087195462, seats: 2 },
    { vehicleHash: 4280472072, seats: 4 },
    { vehicleHash: 2249373259, seats: 2 },
    { vehicleHash: 3196165219, seats: 10 },
    { vehicleHash: 4067225593, seats: 2 },
    { vehicleHash: 1162065741, seats: 4 },
    { vehicleHash: 2518351607, seats: 2 },
    { vehicleHash: 782665360, seats: 2 },
    { vehicleHash: 3089277354, seats: 8 },
    { vehicleHash: 3448987385, seats: 2 },
    { vehicleHash: 2136773105, seats: 4 },
    { vehicleHash: 627094268, seats: 2 },
    { vehicleHash: 2609945748, seats: 2 },
    { vehicleHash: 3695398481, seats: 4 },
    { vehicleHash: 734217681, seats: 4 },
    { vehicleHash: 3105951696, seats: 4 },
    { vehicleHash: 989381445, seats: 2 },
    { vehicleHash: 3039514899, seats: 4 },
    { vehicleHash: 3548084598, seats: 2 },
    { vehicleHash: 2594165727, seats: 2 },
    { vehicleHash: 1221512915, seats: 4 },
    { vehicleHash: 1349725314, seats: 2 },
    { vehicleHash: 873639469, seats: 4 },
    { vehicleHash: 3172678083, seats: 2 },
    { vehicleHash: 3101863448, seats: 2 },
    { vehicleHash: 1337041428, seats: 4 },
    { vehicleHash: 2611638396, seats: 4 },
    { vehicleHash: 1922257928, seats: 8 },
    { vehicleHash: 3484649228, seats: 4 },
    { vehicleHash: 728614474, seats: 4 },
    { vehicleHash: 2817386317, seats: 4 },
    { vehicleHash: 1545842587, seats: 2 },
    { vehicleHash: 2196019706, seats: 2 },
    { vehicleHash: 1747439474, seats: 4 },
    { vehicleHash: 4080511798, seats: 4 },
    { vehicleHash: 1723137093, seats: 4 },
    { vehicleHash: 970598228, seats: 4 },
    { vehicleHash: 1123216662, seats: 4 },
    { vehicleHash: 384071873, seats: 2 },
    { vehicleHash: 699456151, seats: 2 },
    { vehicleHash: 2983726598, seats: 2 },
    { vehicleHash: 2400073108, seats: 4 },
    { vehicleHash: 1951180813, seats: 1 },
    { vehicleHash: 3286105550, seats: 4 },
    { vehicleHash: 3338918751, seats: 4 },
    { vehicleHash: 1917016601, seats: 4 },
    { vehicleHash: 1641462412, seats: 1 },
    { vehicleHash: 2218488798, seats: 1 },
    { vehicleHash: 1445631933, seats: 1 },
    { vehicleHash: 1019737494, seats: 0 },
    { vehicleHash: 3895125590, seats: 0 },
    { vehicleHash: 48339065, seats: 2 },
    { vehicleHash: 3347205726, seats: 2 },
    { vehicleHash: 464687292, seats: 2 },
    { vehicleHash: 1531094468, seats: 2 },
    { vehicleHash: 1762279763, seats: 2 },
    { vehicleHash: 2261744861, seats: 2 },
    { vehicleHash: 1941029835, seats: 10 },
    { vehicleHash: 2971866336, seats: 2 },
    { vehicleHash: 3852654278, seats: 2 },
    { vehicleHash: 516990260, seats: 2 },
    { vehicleHash: 887537515, seats: 2 },
    { vehicleHash: 2132890591, seats: 2 },
    { vehicleHash: 523724515, seats: 2 },
    { vehicleHash: 1777363799, seats: 4 },
    { vehicleHash: 2333339779, seats: 6 },
    { vehicleHash: 65402552, seats: 2 },
    { vehicleHash: 758895617, seats: 2 },
    { vehicleHash: 788045382, seats: 2 },
    { vehicleHash: 2841686334, seats: 2 },
    { vehicleHash: 4108429845, seats: 1 },
    { vehicleHash: 1127861609, seats: 1 },
    { vehicleHash: 3061159916, seats: 1 },
    { vehicleHash: 3894672200, seats: 1 },
    { vehicleHash: 3458454463, seats: 1 },
    { vehicleHash: 448402357, seats: 1 },
    { vehicleHash: 1131912276, seats: 1 },
    { vehicleHash: 4260343491, seats: 1 },
    { vehicleHash: 1672195559, seats: 2 },
    { vehicleHash: 11251904, seats: 2 },
    { vehicleHash: 2154536131, seats: 2 },
    { vehicleHash: 4180675781, seats: 2 },
    { vehicleHash: 3403504941, seats: 2 },
    { vehicleHash: 3401388520, seats: 2 },
    { vehicleHash: 2006142190, seats: 2 },
    { vehicleHash: 2623969160, seats: 2 },
    { vehicleHash: 3385765638, seats: 2 },
    { vehicleHash: 4154065143, seats: 2 },
    { vehicleHash: 3469130167, seats: 2 },
    { vehicleHash: 55628203, seats: 2 },
    { vehicleHash: 301427732, seats: 2 },
    { vehicleHash: 837858166, seats: 6 },
    { vehicleHash: 788747387, seats: 4 },
    { vehicleHash: 745926877, seats: 4 },
    { vehicleHash: 4244420235, seats: 10 },
    { vehicleHash: 1621617168, seats: 10 },
    { vehicleHash: 1394036463, seats: 10 },
    { vehicleHash: 1044954915, seats: 2 },
    { vehicleHash: 353883353, seats: 4 },
    { vehicleHash: 2634305738, seats: 4 },
    { vehicleHash: 3660088182, seats: 2 },
    { vehicleHash: 744705981, seats: 4 },
    { vehicleHash: 1949211328, seats: 4 },
    { vehicleHash: 3650256867, seats: 2 },
    { vehicleHash: 970356638, seats: 2 },
    { vehicleHash: 2172210288, seats: 1 },
    { vehicleHash: 2548391185, seats: 4 },
    { vehicleHash: 1058115860, seats: 2 },
    { vehicleHash: 3080461301, seats: 10 },
    { vehicleHash: 621481054, seats: 10 },
    { vehicleHash: 1981688531, seats: 10 },
    { vehicleHash: 3013282534, seats: 1 },
    { vehicleHash: 368211810, seats: 2 },
    { vehicleHash: 400514754, seats: 2 },
    { vehicleHash: 3251507587, seats: 4 },
    { vehicleHash: 1033245328, seats: 4 },
    { vehicleHash: 276773164, seats: 2 },
    { vehicleHash: 861409633, seats: 2 },
    { vehicleHash: 3806844075, seats: 4 },
    { vehicleHash: 290013743, seats: 4 },
    { vehicleHash: 3264692260, seats: 2 },
    { vehicleHash: 3678636260, seats: 2 },
    { vehicleHash: 771711535, seats: 1 },
    { vehicleHash: 184361638, seats: 0 },
    { vehicleHash: 1030400667, seats: 2 },
    { vehicleHash: 920453016, seats: 2 },
    { vehicleHash: 240201337, seats: 2 },
    { vehicleHash: 642617954, seats: 2 },
    { vehicleHash: 586013744, seats: 2 },
    { vehicleHash: 868868440, seats: 4 },
    { vehicleHash: 2154757102, seats: 0 },
    { vehicleHash: 3417488910, seats: 0 },
    { vehicleHash: 2715434129, seats: 0 },
    { vehicleHash: 2236089197, seats: 0 },
    { vehicleHash: 2524324030, seats: 0 },
    { vehicleHash: 390902130, seats: 0 },
    { vehicleHash: 3564062519, seats: 0 },
    { vehicleHash: 2016027501, seats: 0 },
    { vehicleHash: 2078290630, seats: 0 },
    { vehicleHash: 1784254509, seats: 0 },
    { vehicleHash: 2091594960, seats: 0 },
    { vehicleHash: 2942498482, seats: 0 },
    { vehicleHash: 712162987, seats: 0 },
    { vehicleHash: 2621610858, seats: 4 },
    { vehicleHash: 3078201489, seats: 2 },
    { vehicleHash: 2672523198, seats: 2 },
    { vehicleHash: 338562499, seats: 2 },
    { vehicleHash: 4012021193, seats: 4 },
    { vehicleHash: 3945366167, seats: 2 },
    { vehicleHash: 231083307, seats: 4 },
    { vehicleHash: 92612664, seats: 2 },
    { vehicleHash: 1488164764, seats: 4 },
    { vehicleHash: 117401876, seats: 6 },
    { vehicleHash: 2997294755, seats: 2 },
    { vehicleHash: 408192225, seats: 2 },
    { vehicleHash: 767087018, seats: 2 },
    { vehicleHash: 1341619767, seats: 2 },
    { vehicleHash: 2891838741, seats: 2 },
    { vehicleHash: 4152024626, seats: 2 },
    { vehicleHash: 486987393, seats: 4 },
    { vehicleHash: 1836027715, seats: 2 },
    { vehicleHash: 841808271, seats: 2 },
    { vehicleHash: 1373123368, seats: 4 },
    { vehicleHash: 3089165662, seats: 2 },
    { vehicleHash: 75131841, seats: 4 },
    { vehicleHash: 3863274624, seats: 2 },
    { vehicleHash: 3057713523, seats: 6 },
    { vehicleHash: 1078682497, seats: 2 },
    { vehicleHash: 3449006043, seats: 2 },
    { vehicleHash: 743478836, seats: 1 },
    { vehicleHash: 165154707, seats: 16 },
    { vehicleHash: 1824333165, seats: 1 },
    { vehicleHash: 1011753235, seats: 2 },
    { vehicleHash: 3955379698, seats: 4 },
    { vehicleHash: 4135840458, seats: 2 },
    { vehicleHash: 1265391242, seats: 2 },
    { vehicleHash: 3205927392, seats: 2 },
    { vehicleHash: 3188613414, seats: 2 },
    { vehicleHash: 3663206819, seats: 2 },
    { vehicleHash: 3705788919, seats: 2 },
    { vehicleHash: 729783779, seats: 2 },
    { vehicleHash: 2242229361, seats: 6 },
    { vehicleHash: 1077420264, seats: 5 },
    { vehicleHash: 1956216962, seats: 0 },
    { vehicleHash: 941800958, seats: 2 },
    { vehicleHash: 444171386, seats: 6 },
    { vehicleHash: 970385471, seats: 1 },
    { vehicleHash: 2434067162, seats: 9 },
    { vehicleHash: 2071877360, seats: 6 },
    { vehicleHash: 296357396, seats: 4 },
    { vehicleHash: 2198148358, seats: 3 },
    { vehicleHash: 509498602, seats: 4 },
    { vehicleHash: 4212341271, seats: 4 },
    { vehicleHash: 1753414259, seats: 2 },
    { vehicleHash: 2186977100, seats: 6 },
    { vehicleHash: 640818791, seats: 2 },
    { vehicleHash: 2922118804, seats: 4 },
    { vehicleHash: 410882957, seats: 4 },
    { vehicleHash: 3039269212, seats: 4 },
    { vehicleHash: 630371791, seats: 10 },
    { vehicleHash: 2694714877, seats: 4 },
    { vehicleHash: 833469436, seats: 4 },
    { vehicleHash: 1075432268, seats: 4 },
    { vehicleHash: 3080673438, seats: 8 },
    { vehicleHash: 2728226064, seats: 2 },
    { vehicleHash: 1987142870, seats: 2 },
    { vehicleHash: 3796912450, seats: 2 },
    { vehicleHash: 1581459400, seats: 2 },
    { vehicleHash: 784565758, seats: 2 },
    { vehicleHash: 2941886209, seats: 2 },
    { vehicleHash: 1663218586, seats: 2 },
    { vehicleHash: 2815302597, seats: 2 },
    { vehicleHash: 1070967343, seats: 4 },
    { vehicleHash: 349605904, seats: 2 },
    { vehicleHash: 2175389151, seats: 2 },
    { vehicleHash: 2504420315, seats: 2 },
    { vehicleHash: 525509695, seats: 4 },
    { vehicleHash: 1896491931, seats: 4 },
    { vehicleHash: 2254540506, seats: 4 },
    { vehicleHash: 2933279331, seats: 2 },
    { vehicleHash: 3281516360, seats: 2 },
    { vehicleHash: 2006667053, seats: 2 },
    { vehicleHash: 2068293287, seats: 2 },
    { vehicleHash: 3463132580, seats: 4 },
    { vehicleHash: 1102544804, seats: 2 },
    { vehicleHash: 2351681756, seats: 2 },
    { vehicleHash: 2634021974, seats: 2 },
    { vehicleHash: 4180339789, seats: 5 },
    { vehicleHash: 2809443750, seats: 4 },
    { vehicleHash: 1489967196, seats: 4 },
    { vehicleHash: 3406724313, seats: 4 },
    { vehicleHash: 1922255844, seats: 4 },
    { vehicleHash: 906642318, seats: 4 },
    { vehicleHash: 704435172, seats: 4 },
    { vehicleHash: 2264796000, seats: 4 },
    { vehicleHash: 3690124666, seats: 4 },
    { vehicleHash: 1878062887, seats: 4 },
    { vehicleHash: 634118882, seats: 4 },
    { vehicleHash: 470404958, seats: 4 },
    { vehicleHash: 666166960, seats: 4 },
    { vehicleHash: 908897389, seats: 4 },
    { vehicleHash: 3983945033, seats: 2 },
    { vehicleHash: 867467158, seats: 4 },
    { vehicleHash: 1448677353, seats: 4 },
    { vehicleHash: 437538602, seats: 4 },
    { vehicleHash: 2025593404, seats: 2 },
    { vehicleHash: 710198397, seats: 4 },
    { vehicleHash: 2623428164, seats: 4 },
    { vehicleHash: 1543134283, seats: 4 },
    { vehicleHash: 972671128, seats: 2 },
    { vehicleHash: 3999278268, seats: 2 },
    { vehicleHash: 633712403, seats: 2 },
    { vehicleHash: 3692679425, seats: 6 },
    { vehicleHash: 2255212070, seats: 2 },
    { vehicleHash: 3168702960, seats: 4 },
    { vehicleHash: 223258115, seats: 2 },
    { vehicleHash: 1119641113, seats: 2 },
    { vehicleHash: 2497353967, seats: 2 },
    { vehicleHash: 3395457658, seats: 2 },
    { vehicleHash: 16646064, seats: 2 },
    { vehicleHash: 2999939664, seats: 8 },
    { vehicleHash: 1203490606, seats: 4 },
    { vehicleHash: 3862958888, seats: 4 },
    { vehicleHash: 2537130571, seats: 2 },
    { vehicleHash: 1426219628, seats: 2 },
    { vehicleHash: 1274868363, seats: 2 },
    { vehicleHash: 2465164804, seats: 2 },
    { vehicleHash: 3989239879, seats: 6 },
    { vehicleHash: 1475773103, seats: 4 },
    { vehicleHash: 2449479409, seats: 4 },
    { vehicleHash: 2123327359, seats: 2 },
    { vehicleHash: 234062309, seats: 2 },
    { vehicleHash: 2194326579, seats: 1 },
    { vehicleHash: 2364918497, seats: 4 },
    { vehicleHash: 482197771, seats: 2 },
    { vehicleHash: 741090084, seats: 2 },
    { vehicleHash: 2067820283, seats: 2 },
    { vehicleHash: 819197656, seats: 2 },
    { vehicleHash: 3517794615, seats: 2 },
    { vehicleHash: 3062131285, seats: 2 },
    { vehicleHash: 683047626, seats: 4 },
    { vehicleHash: 101905590, seats: 2 },
    { vehicleHash: 3631668194, seats: 2 },
    { vehicleHash: 2191146052, seats: 2 },
    { vehicleHash: 390201602, seats: 2 },
    { vehicleHash: 86520421, seats: 2 },
    { vehicleHash: 1887331236, seats: 2 },
    { vehicleHash: 1549126457, seats: 2 },
    { vehicleHash: 3223586949, seats: 2 },
    { vehicleHash: 2736567667, seats: 2 },
    { vehicleHash: 3005788552, seats: 2 },
    { vehicleHash: 2452219115, seats: 2 },
    { vehicleHash: 3620039993, seats: 2 },
    { vehicleHash: 3685342204, seats: 1 },
    { vehicleHash: 2179174271, seats: 1 },
    { vehicleHash: 1491277511, seats: 1 },
    { vehicleHash: 1026149675, seats: 4 },
    { vehicleHash: 4039289119, seats: 2 },
    { vehicleHash: 2688780135, seats: 2 },
    { vehicleHash: 6774487, seats: 1 },
    { vehicleHash: 2035069708, seats: 2 },
    { vehicleHash: 3676349299, seats: 2 },
    { vehicleHash: 3285698347, seats: 1 },
    { vehicleHash: 3724934023, seats: 2 },
    { vehicleHash: 822018448, seats: 1 },
    { vehicleHash: 2890830793, seats: 2 },
    { vehicleHash: 1873600305, seats: 2 },
    { vehicleHash: 3889340782, seats: 1 },
    { vehicleHash: 2771538552, seats: 2 },
    { vehicleHash: 3854198872, seats: 1 },
    { vehicleHash: 196747873, seats: 2 },
    { vehicleHash: 272929391, seats: 2 },
    { vehicleHash: 2246633323, seats: 2 },
    { vehicleHash: 3812247419, seats: 2 },
    { vehicleHash: 1034187331, seats: 2 },
    { vehicleHash: 1093792632, seats: 2 },
    { vehicleHash: 1886268224, seats: 2 },
    { vehicleHash: 1074745671, seats: 2 },
    { vehicleHash: 4055125828, seats: 1 },
    { vehicleHash: 1790834270, seats: 1 },
    { vehicleHash: 2704629607, seats: 1 },
    { vehicleHash: 941494461, seats: 2 },
    { vehicleHash: 3467805257, seats: 2 },
    { vehicleHash: 3982671785, seats: 2 },
    { vehicleHash: 2645431192, seats: 5 },
    { vehicleHash: 989294410, seats: 2 },
    { vehicleHash: 2536829930, seats: 2 },
    { vehicleHash: 682434785, seats: 5 },
    { vehicleHash: 2382949506, seats: 6 },
    { vehicleHash: 1180875963, seats: 3 },
    { vehicleHash: 627535535, seats: 1 },
    { vehicleHash: 3537231886, seats: 1 },
    { vehicleHash: 2272483501, seats: 2 },
    { vehicleHash: 777714999, seats: 2 },
    { vehicleHash: 3312836369, seats: 2 },
    { vehicleHash: 2889029532, seats: 2 },
    { vehicleHash: 1234311532, seats: 2 },
    { vehicleHash: 719660200, seats: 2 },
    { vehicleHash: 3194418602, seats: 0 },
    { vehicleHash: 917809321, seats: 2 },
    { vehicleHash: 3525819835, seats: 2 },
    { vehicleHash: 1939284556, seats: 2 },
    { vehicleHash: 177270108, seats: 5 },
    { vehicleHash: 433954513, seats: 4 },
    { vehicleHash: 223240013, seats: 2 },
    { vehicleHash: 1504306544, seats: 2 },
    { vehicleHash: 387748548, seats: 2 },
    { vehicleHash: 1502869817, seats: 1 },
    { vehicleHash: 1356124575, seats: 3 },
    { vehicleHash: 2370534026, seats: 9 },
    { vehicleHash: 562680400, seats: 4 },
    { vehicleHash: 3084515313, seats: 2 },
    { vehicleHash: 1897744184, seats: 2 },
    { vehicleHash: 2413121211, seats: 1 },
    { vehicleHash: 4262731174, seats: 3 },
    { vehicleHash: 159274291, seats: 2 },
    { vehicleHash: 884483972, seats: 1 },
    { vehicleHash: 3052358707, seats: 2 },
    { vehicleHash: 4262088844, seats: 6 },
    { vehicleHash: 2771347558, seats: 1 },
    { vehicleHash: 3902291871, seats: 2 },
    { vehicleHash: 1043222410, seats: 5 },
    { vehicleHash: 2310691317, seats: 1 },
    { vehicleHash: 4252008158, seats: 2 },
    { vehicleHash: 2531412055, seats: 1 },
    { vehicleHash: 3319621991, seats: 2 },
    { vehicleHash: 2908775872, seats: 2 },
    { vehicleHash: 3287439187, seats: 1 },
    { vehicleHash: 3545667823, seats: 3 },
    { vehicleHash: 2594093022, seats: 1 },
    { vehicleHash: 1036591958, seats: 1 },
    { vehicleHash: 1565978651, seats: 1 },
    { vehicleHash: 2049897956, seats: 2 },
    { vehicleHash: 1841130506, seats: 2 },
    { vehicleHash: 1392481335, seats: 2 },
    { vehicleHash: 3296789504, seats: 2 },
    { vehicleHash: 838982985, seats: 2 },
    { vehicleHash: 3903371924, seats: 2 },
    { vehicleHash: 661493923, seats: 2 },
    { vehicleHash: 2765724541, seats: 4 },
    { vehicleHash: 2762269779, seats: 2 },
    { vehicleHash: 1352136073, seats: 2 },
    { vehicleHash: 3981782132, seats: 2 },
    { vehicleHash: 903794909, seats: 2 },
    { vehicleHash: 2215179066, seats: 2 },
    { vehicleHash: 1561920505, seats: 2 },
    { vehicleHash: 2445973230, seats: 4 },
    { vehicleHash: 1104234922, seats: 2 },
    { vehicleHash: 2859440138, seats: 4 },
    { vehicleHash: 4081974053, seats: 4 },
    { vehicleHash: 447548909, seats: 4 },
    { vehicleHash: 1181327175, seats: 4 },
    { vehicleHash: 1483171323, seats: 2 },
    { vehicleHash: 886810209, seats: 2 },
    { vehicleHash: 3602674979, seats: 2 },
    { vehicleHash: 2601952180, seats: 6 },
    { vehicleHash: 2176659152, seats: 3 },
    { vehicleHash: 408970549, seats: 3 },
    { vehicleHash: 1489874736, seats: 1 },
    { vehicleHash: 1871995513, seats: 2 },
    { vehicleHash: 15219735, seats: 2 },
    { vehicleHash: 600450546, seats: 2 },
    { vehicleHash: 1741861769, seats: 4 },
    { vehicleHash: 3884762073, seats: 4 },
    { vehicleHash: 867799010, seats: 2 },
    { vehicleHash: 4173521127, seats: 2 },
    { vehicleHash: 2174267100, seats: 2 },
    { vehicleHash: 3306466016, seats: 2 },
    { vehicleHash: 4080061290, seats: 2 },
    { vehicleHash: 1254014755, seats: 5 },
    { vehicleHash: 1115909093, seats: 2 },
    { vehicleHash: 3568198617, seats: 2 },
    { vehicleHash: 3035832600, seats: 2 },
    { vehicleHash: 3027423925, seats: 2 },
    { vehicleHash: 1046206681, seats: 2 },
    { vehicleHash: 1617472902, seats: 2 },
    { vehicleHash: 3308022675, seats: 2 },
    { vehicleHash: 3918533058, seats: 2 },
    { vehicleHash: 1031562256, seats: 2 },
    { vehicleHash: 1909189272, seats: 2 },
    { vehicleHash: 931280609, seats: 2 },
    { vehicleHash: 3160260734, seats: 2 },
    { vehicleHash: 321186144, seats: 2 },
    { vehicleHash: 3656405053, seats: 2 },
    { vehicleHash: 1692272545, seats: 1 },
    { vehicleHash: 2306538597, seats: 2 },
    { vehicleHash: 345756458, seats: 11 },
    { vehicleHash: 2069146067, seats: 1 },
    { vehicleHash: 1653666139, seats: 8 },
    { vehicleHash: 219613597, seats: 4 },
    { vehicleHash: 4240635011, seats: 4 },
    { vehicleHash: 1945374990, seats: 4 },
    { vehicleHash: 2044532910, seats: 5 },
    { vehicleHash: 3987008919, seats: 4 },
    { vehicleHash: 500482303, seats: 2 },
    { vehicleHash: 3874056184, seats: 6 },
    { vehicleHash: 2370166601, seats: 2 },
    { vehicleHash: 840387324, seats: 2 },
    { vehicleHash: 3579220348, seats: 2 },
    { vehicleHash: 1742022738, seats: 2 },
    { vehicleHash: 1239571361, seats: 2 },
    { vehicleHash: 679453769, seats: 2 },
    { vehicleHash: 1909700336, seats: 2 },
    { vehicleHash: 2482017624, seats: 1 },
    { vehicleHash: 3001042683, seats: 2 },
    { vehicleHash: 2920466844, seats: 1 },
    { vehicleHash: 2550461639, seats: 2 },
    { vehicleHash: 2233918197, seats: 2 },
    { vehicleHash: 373261600, seats: 2 },
    { vehicleHash: 2139203625, seats: 2 },
    { vehicleHash: 2403970600, seats: 2 },
    { vehicleHash: 2038858402, seats: 2 },
    { vehicleHash: 4267640610, seats: 1 },
    { vehicleHash: 3606777648, seats: 2 },
    { vehicleHash: 2919906639, seats: 2 },
    { vehicleHash: 668439077, seats: 4 },
    { vehicleHash: 2600885406, seats: 4 },
    { vehicleHash: 2252616474, seats: 4 },
    { vehicleHash: 4008920556, seats: 1 },
    { vehicleHash: 3963499524, seats: 2 },
    { vehicleHash: 3493417227, seats: 2 },
    { vehicleHash: 1009171724, seats: 2 },
    { vehicleHash: 1721676810, seats: 2 },
    { vehicleHash: 1456744817, seats: 4 },
    { vehicleHash: 3147997943, seats: 4 },
    { vehicleHash: 1542143200, seats: 4 },
    { vehicleHash: 3715219435, seats: 4 },
    { vehicleHash: 628003514, seats: 2 },
    { vehicleHash: 1537277726, seats: 2 },
    { vehicleHash: 2728360112, seats: 2 },
    { vehicleHash: 1591739866, seats: 2 },
    { vehicleHash: 4245851645, seats: 2 },
    { vehicleHash: 444994115, seats: 2 },
    { vehicleHash: 1637620610, seats: 2 },
    { vehicleHash: 3539435063, seats: 2 },
    { vehicleHash: 3126015148, seats: 4 },
    { vehicleHash: 1279262537, seats: 2 },
    { vehicleHash: 3787471536, seats: 2 },
    { vehicleHash: 2198276962, seats: 2 },
    { vehicleHash: 540101442, seats: 2 },
    { vehicleHash: 3188846534, seats: 2 },
    { vehicleHash: 2816263004, seats: 2 },
    { vehicleHash: 3847255899, seats: 2 },
    { vehicleHash: 1416466158, seats: 2 },
    { vehicleHash: 4086055493, seats: 4 },
    { vehicleHash: 916547552, seats: 1 },
    { vehicleHash: 2674840994, seats: 2 },
    { vehicleHash: 3630826055, seats: 2 },
    { vehicleHash: 2490551588, seats: 2 },
    { vehicleHash: 1934384720, seats: 2 },
    { vehicleHash: 3970348707, seats: 1 },
    { vehicleHash: 2945871676, seats: 4 },
    { vehicleHash: 1044193113, seats: 2 },
    { vehicleHash: 2465530446, seats: 4 },
    { vehicleHash: 3612858749, seats: 2 },
    { vehicleHash: 1854776567, seats: 2 },
    { vehicleHash: 3353694737, seats: 2 },
    { vehicleHash: 1323778901, seats: 2 },
    { vehicleHash: 3932816511, seats: 2 },
    { vehicleHash: 310284501, seats: 4 },
    { vehicleHash: 722226637, seats: 2 },
    { vehicleHash: 3412338231, seats: 2 },
    { vehicleHash: 1862507111, seats: 2 },
    { vehicleHash: 686471183, seats: 2 },
    { vehicleHash: 3040635986, seats: 1 },
    { vehicleHash: 2031587082, seats: 2 },
    { vehicleHash: 408825843, seats: 2 },
    { vehicleHash: 1693751655, seats: 2 },
    { vehicleHash: 301304410, seats: 2 },
    { vehicleHash: 394110044, seats: 2 },
    { vehicleHash: 872704284, seats: 2 },
    { vehicleHash: 2538945576, seats: 4 },
    { vehicleHash: 987469656, seats: 4 },
    { vehicleHash: 1284356689, seats: 4 },
    { vehicleHash: 340154634, seats: 1 },
    { vehicleHash: 2334210311, seats: 1 },
    { vehicleHash: 83136452, seats: 4 },
    { vehicleHash: 740289177, seats: 2 },
    { vehicleHash: 960812448, seats: 2 },
    { vehicleHash: 1456336509, seats: 4 },
    { vehicleHash: 3460613305, seats: 4 },
    { vehicleHash: 1118611807, seats: 2 },
    { vehicleHash: 409049982, seats: 2 },
    { vehicleHash: 3162245632, seats: 2 },
    { vehicleHash: 1492612435, seats: 1 },
    { vehicleHash: 2566281822, seats: 2 },
    { vehicleHash: 2936769864, seats: 2 },
    { vehicleHash: 3663644634, seats: 2 },
    { vehicleHash: 3456868130, seats: 4 },
    { vehicleHash: 67753863, seats: 2 },
    { vehicleHash: 2196012677, seats: 2 },
    { vehicleHash: 2172320429, seats: 2 },
    { vehicleHash: 2134119907, seats: 2 },
    { vehicleHash: 1802742206, seats: 4 },
    { vehicleHash: 3381377750, seats: 4 },
    { vehicleHash: 2484160806, seats: 2 },
    { vehicleHash: 1181339704, seats: 1 },
    { vehicleHash: 1107404867, seats: 2 },
    { vehicleHash: 1717532765, seats: 2 },
    { vehicleHash: 2802050217, seats: 1 },
    { vehicleHash: 4192631813, seats: 4 },
    { vehicleHash: 3314393930, seats: 5 },
    { vehicleHash: 295054921, seats: 6 },
    { vehicleHash: 3145241962, seats: 2 },
    { vehicleHash: 3437611258, seats: 1 },
    { vehicleHash: 1455990255, seats: 4 },
    { vehicleHash: 3249056020, seats: 2 },
    { vehicleHash: 1644055914, seats: 2 },
    { vehicleHash: 2014313426, seats: 10 },
    { vehicleHash: 3929093893, seats: 4 },
    { vehicleHash: 4018222598, seats: 4 },
    { vehicleHash: 2588363614, seats: 4 },
    { vehicleHash: 1429622905, seats: 2 },
    { vehicleHash: 298565713, seats: 2 },
    { vehicleHash: 1861786828, seats: 4 },
    { vehicleHash: 1229411063, seats: 2 },
    { vehicleHash: 1593933419, seats: 2 },
    { vehicleHash: 4084658662, seats: 3 },
    { vehicleHash: 1086534307, seats: 1 },
    { vehicleHash: 1336872304, seats: 1 },
    { vehicleHash: 3186376089, seats: 0 },
    { vehicleHash: 2568944644, seats: 2 },
    { vehicleHash: 426742808, seats: 2 },
    { vehicleHash: 736672010, seats: 2 },
    { vehicleHash: 2038480341, seats: 2 },
    { vehicleHash: 2787736776, seats: 2 },
    { vehicleHash: 3842363289, seats: 2 },
    { vehicleHash: 4003946083, seats: 2 },
    { vehicleHash: 3050505892, seats: 4 },
    { vehicleHash: 1304459735, seats: 2 },
    { vehicleHash: 2754593701, seats: 2 },
    { vehicleHash: 1377217886, seats: 2 },
    { vehicleHash: 3101054893, seats: 2 },
    { vehicleHash: 1755697647, seats: 2 },
    { vehicleHash: 2712905841, seats: 2 },
    { vehicleHash: 2436313176, seats: 2 },
    { vehicleHash: 1416471345, seats: 2 },
    { vehicleHash: 579912970, seats: 2 },
    { vehicleHash: 1353120668, seats: 1 },
    { vehicleHash: 1993851908, seats: 1 },
    { vehicleHash: 3379732821, seats: 2 },
    { vehicleHash: 2767531027, seats: 4 },
    { vehicleHash: 662793086, seats: 4 },
    { vehicleHash: 629969764, seats: 4 },
    { vehicleHash: 359875117, seats: 4 },
    { vehicleHash: 3675036420, seats: 4 },
    { vehicleHash: 1141395928, seats: 2 },
    { vehicleHash: 1532171089, seats: 4 },
    { vehicleHash: 2850852987, seats: 2 },
    { vehicleHash: 461465043, seats: 4 },
    { vehicleHash: 3624880708, seats: 4 },
    { vehicleHash: 655665811, seats: 2 },
    { vehicleHash: 4033620423, seats: 8 },
    { vehicleHash: 1486521356, seats: 4 },
    { vehicleHash: 1343932732, seats: 6 },
    { vehicleHash: 3789743831, seats: 4 },
    { vehicleHash: 2938086457, seats: 2 },
    { vehicleHash: 1706945532, seats: 2 },
    { vehicleHash: 15214558, seats: 2 },
    { vehicleHash: 3540279623, seats: 2 },
    { vehicleHash: 3526730918, seats: 4 },
    { vehicleHash: 4230891418, seats: 2 },
    { vehicleHash: 4000288633, seats: 2 },
    { vehicleHash: 4129572538, seats: 2 },
    { vehicleHash: 2536587772, seats: 2 },
    { vehicleHash: 4284049613, seats: 1 },
    { vehicleHash: 3400983137, seats: 2 },
    { vehicleHash: 274946574, seats: 2 },
    { vehicleHash: 2439462158, seats: 2 },
    { vehicleHash: 3817135397, seats: 4 },
    { vehicleHash: 40817712, seats: 2 },
    { vehicleHash: 775514032, seats: 2 },
    { vehicleHash: 3300595976, seats: 2 },
    { vehicleHash: 3833117047, seats: 2 },
    { vehicleHash: 2361724968, seats: 2 },
    { vehicleHash: 1550581940, seats: 2 },
    { vehicleHash: 268758436, seats: 2 },
    { vehicleHash: 4163619118, seats: 2 },
    { vehicleHash: 669204833, seats: 2 },
    { vehicleHash: 996383885, seats: 2 },
    { vehicleHash: 2100457220, seats: 2 },
    { vehicleHash: 1076201208, seats: 2 },
    { vehicleHash: 1748565021, seats: 2 },
    { vehicleHash: 3045179290, seats: 4 },
    { vehicleHash: 2908631255, seats: 1 },
    { vehicleHash: 2667889793, seats: 6 },
    { vehicleHash: 2718380883, seats: 6 },
    { vehicleHash: 1384502824, seats: 1 },
    { vehicleHash: 3259477733, seats: 4 },
    { vehicleHash: 2336777441, seats: 2 },
    { vehicleHash: 2311345272, seats: 1 },
    { vehicleHash: 3397143273, seats: 1 },
    { vehicleHash: 239897677, seats: 1 },
    { vehicleHash: 802856453, seats: 2 },
    { vehicleHash: 610429990, seats: 2 },
    { vehicleHash: 3758861739, seats: 2 },
    { vehicleHash: 1447690049, seats: 2 },
    { vehicleHash: 3315674721, seats: 2 },
    { vehicleHash: 191916658, seats: 4 },
    { vehicleHash: 3640468689, seats: 4 },
    { vehicleHash: 1336514315, seats: 2 },
    { vehicleHash: 3868033424, seats: 3 },
    { vehicleHash: 4225674290, seats: 3 },
    { vehicleHash: 165968051, seats: 2 },
    { vehicleHash: 4250167832, seats: 4 },
    { vehicleHash: 2635962482, seats: 2 },
    { vehicleHash: 2531292011, seats: 2 },
    { vehicleHash: 2620582743, seats: 4 },
    { vehicleHash: 2922168362, seats: 4 },
    { vehicleHash: 167522317, seats: 4 },
    { vehicleHash: 4116524922, seats: 2 },
    { vehicleHash: 3526923154, seats: 4 },
    { vehicleHash: 728350375, seats: 2 },
    { vehicleHash: 3392937977, seats: 2 },
    { vehicleHash: 3623402354, seats: 2 },
    { vehicleHash: 3816328113, seats: 4 },
    { vehicleHash: 372621319, seats: 2 },
    { vehicleHash: 3265236814, seats: 4 },
    { vehicleHash: 2815031719, seats: 2 },
    { vehicleHash: 2531693357, seats: 2 },
    { vehicleHash: 4113404654, seats: 2 },
    { vehicleHash: 821121576, seats: 2 },
    { vehicleHash: 2613313775, seats: 2 },
    { vehicleHash: 2598648200, seats: 2 },
    { vehicleHash: 1923534526, seats: 2 },
    { vehicleHash: 2670883828, seats: 2 },
    { vehicleHash: 4256087847, seats: 4 },
    { vehicleHash: 3852738056, seats: 2 },
    { vehicleHash: 3853757601, seats: 2 },
    { vehicleHash: 3061199846, seats: 2 },
    { vehicleHash: 4171974011, seats: 2 },
    { vehicleHash: 471034616, seats: 0 },
    { vehicleHash: 3452201761, seats: 6 },
    { vehicleHash: 3829141989, seats: 2 },
    { vehicleHash: 2960513480, seats: 0 },
    { vehicleHash: 4165683409, seats: 2 },
    { vehicleHash: 3553846961, seats: 4 },
    { vehicleHash: 3431608412, seats: 4 },
    { vehicleHash: 1835260592, seats: 0 },
    { vehicleHash: 1539159908, seats: 0 },
    { vehicleHash: 3228633070, seats: 1 },
    { vehicleHash: 723973206, seats: 2 },
    { vehicleHash: 3968823444, seats: 2 },
    { vehicleHash: 237764926, seats: 4 },
    { vehicleHash: 3379262425, seats: 2 },
    { vehicleHash: 3393804037, seats: 4 },
    { vehicleHash: 1233534620, seats: 2 },
    { vehicleHash: 3681241380, seats: 4 },
    { vehicleHash: 349315417, seats: 2 },
    { vehicleHash: 1923400478, seats: 2 },
    { vehicleHash: 3893323758, seats: 2 },
    { vehicleHash: 1039032026, seats: 2 },
    { vehicleHash: 3703315515, seats: 2 }
];
exports.vehicleModelSeats = vehicleModelSeats;
const vehicleClasses = [
    { vehicleHash: 1032823388, vehicleClass: 6 },
    { vehicleHash: 2833484545, vehicleClass: 6 },
    { vehicleHash: 3950024287, vehicleClass: 0 },
    { vehicleHash: 2485144969, vehicleClass: 1 },
    { vehicleHash: 2487343317, vehicleClass: 1 },
    { vehicleHash: 524108981, vehicleClass: 11 },
    { vehicleHash: 3581397346, vehicleClass: 17 },
    { vehicleHash: 3087536137, vehicleClass: 11 },
    { vehicleHash: 2818520053, vehicleClass: 11 },
    { vehicleHash: 2657817814, vehicleClass: 11 },
    { vehicleHash: 3517691494, vehicleClass: 11 },
    { vehicleHash: 2222034228, vehicleClass: 17 },
    { vehicleHash: 1283517198, vehicleClass: 17 },
    { vehicleHash: 2391954683, vehicleClass: 1 },
    { vehicleHash: 1560980623, vehicleClass: 11 },
    { vehicleHash: 1171614426, vehicleClass: 18 },
    { vehicleHash: 3471458123, vehicleClass: 19 },
    { vehicleHash: 1074326203, vehicleClass: 19 },
    { vehicleHash: 3486135912, vehicleClass: 2 },
    { vehicleHash: 142944341, vehicleClass: 2 },
    { vehicleHash: 850565707, vehicleClass: 2 },
    { vehicleHash: 3253274834, vehicleClass: 6 },
    { vehicleHash: 2053223216, vehicleClass: 20 },
    { vehicleHash: 1126868326, vehicleClass: 9 },
    { vehicleHash: 850991848, vehicleClass: 20 },
    { vehicleHash: 2166734073, vehicleClass: 9 },
    { vehicleHash: 4246935337, vehicleClass: 9 },
    { vehicleHash: 3025077634, vehicleClass: 9 },
    { vehicleHash: 4278019151, vehicleClass: 12 },
    { vehicleHash: 2072156101, vehicleClass: 12 },
    { vehicleHash: 1739845664, vehicleClass: 12 },
    { vehicleHash: 2307837162, vehicleClass: 12 },
    { vehicleHash: 4061868990, vehicleClass: 12 },
    { vehicleHash: 121658888, vehicleClass: 12 },
    { vehicleHash: 1069929536, vehicleClass: 12 },
    { vehicleHash: 2859047862, vehicleClass: 9 },
    { vehicleHash: 3612755468, vehicleClass: 4 },
    { vehicleHash: 3990165190, vehicleClass: 6 },
    { vehicleHash: 736902334, vehicleClass: 6 },
    { vehicleHash: 1886712733, vehicleClass: 10 },
    { vehicleHash: 2598821281, vehicleClass: 7 },
    { vehicleHash: 4143991942, vehicleClass: 16 },
    { vehicleHash: 2948279460, vehicleClass: 12 },
    { vehicleHash: 3387490166, vehicleClass: 12 },
    { vehicleHash: 2551651283, vehicleClass: 12 },
    { vehicleHash: 893081117, vehicleClass: 12 },
    { vehicleHash: 1132262048, vehicleClass: 12 },
    { vehicleHash: 2006918058, vehicleClass: 2 },
    { vehicleHash: 3505073125, vehicleClass: 2 },
    { vehicleHash: 456714581, vehicleClass: 18 },
    { vehicleHash: 2549763894, vehicleClass: 12 },
    { vehicleHash: 3334677549, vehicleClass: 21 },
    { vehicleHash: 1147287684, vehicleClass: 11 },
    { vehicleHash: 3757070668, vehicleClass: 11 },
    { vehicleHash: 1876516712, vehicleClass: 12 },
    { vehicleHash: 2072687711, vehicleClass: 6 },
    { vehicleHash: 2983812512, vehicleClass: 7 },
    { vehicleHash: 3249425686, vehicleClass: 6 },
    { vehicleHash: 330661258, vehicleClass: 3 },
    { vehicleHash: 108773431, vehicleClass: 6 },
    { vehicleHash: 3288047904, vehicleClass: 10 },
    { vehicleHash: 2751205197, vehicleClass: 2 },
    { vehicleHash: 3164157193, vehicleClass: 0 },
    { vehicleHash: 1682114128, vehicleClass: 0 },
    { vehicleHash: 2633113103, vehicleClass: 9 },
    { vehicleHash: 534258863, vehicleClass: 9 },
    { vehicleHash: 37348240, vehicleClass: 4 },
    { vehicleHash: 1770332643, vehicleClass: 9 },
    { vehicleHash: 1177543287, vehicleClass: 2 },
    { vehicleHash: 3900892662, vehicleClass: 2 },
    { vehicleHash: 2164484578, vehicleClass: 10 },
    { vehicleHash: 2589662668, vehicleClass: 10 },
    { vehicleHash: 3410276810, vehicleClass: 11 },
    { vehicleHash: 80636076, vehicleClass: 4 },
    { vehicleHash: 3609690755, vehicleClass: 1 },
    { vehicleHash: 2411965148, vehicleClass: 1 },
    { vehicleHash: 3053254478, vehicleClass: 1 },
    { vehicleHash: 3003014393, vehicleClass: 7 },
    { vehicleHash: 4289813342, vehicleClass: 3 },
    { vehicleHash: 3728579874, vehicleClass: 6 },
    { vehicleHash: 3703357000, vehicleClass: 3 },
    { vehicleHash: 1127131465, vehicleClass: 18 },
    { vehicleHash: 2647026068, vehicleClass: 18 },
    { vehicleHash: 3903372712, vehicleClass: 3 },
    { vehicleHash: 4205676014, vehicleClass: 3 },
    { vehicleHash: 2299640309, vehicleClass: 6 },
    { vehicleHash: 1938952078, vehicleClass: 18 },
    { vehicleHash: 1353720154, vehicleClass: 10 },
    { vehicleHash: 1491375716, vehicleClass: 11 },
    { vehicleHash: 3157435195, vehicleClass: 2 },
    { vehicleHash: 499169875, vehicleClass: 6 },
    { vehicleHash: 1909141499, vehicleClass: 1 },
    { vehicleHash: 2016857647, vehicleClass: 6 },
    { vehicleHash: 2519238556, vehicleClass: 2 },
    { vehicleHash: 2494797253, vehicleClass: 4 },
    { vehicleHash: 884422927, vehicleClass: 2 },
    { vehicleHash: 1518533038, vehicleClass: 20 },
    { vehicleHash: 444583674, vehicleClass: 10 },
    { vehicleHash: 418536135, vehicleClass: 7 },
    { vehicleHash: 3005245074, vehicleClass: 1 },
    { vehicleHash: 886934177, vehicleClass: 1 },
    { vehicleHash: 3117103977, vehicleClass: 0 },
    { vehicleHash: 3670438162, vehicleClass: 3 },
    { vehicleHash: 4174679674, vehicleClass: 12 },
    { vehicleHash: 1051415893, vehicleClass: 5 },
    { vehicleHash: 544021352, vehicleClass: 6 },
    { vehicleHash: 1269098716, vehicleClass: 2 },
    { vehicleHash: 469291905, vehicleClass: 18 },
    { vehicleHash: 2170765704, vehicleClass: 5 },
    { vehicleHash: 914654722, vehicleClass: 2 },
    { vehicleHash: 3546958660, vehicleClass: 2 },
    { vehicleHash: 2230595153, vehicleClass: 9 },
    { vehicleHash: 321739290, vehicleClass: 19 },
    { vehicleHash: 3984502180, vehicleClass: 12 },
    { vehicleHash: 3510150843, vehicleClass: 10 },
    { vehicleHash: 475220373, vehicleClass: 10 },
    { vehicleHash: 3861591579, vehicleClass: 5 },
    { vehicleHash: 1783355638, vehicleClass: 11 },
    { vehicleHash: 904750859, vehicleClass: 20 },
    { vehicleHash: 3244501995, vehicleClass: 20 },
    { vehicleHash: 1348744438, vehicleClass: 3 },
    { vehicleHash: 3783366066, vehicleClass: 3 },
    { vehicleHash: 569305213, vehicleClass: 20 },
    { vehicleHash: 3486509883, vehicleClass: 2 },
    { vehicleHash: 2287941233, vehicleClass: 18 },
    { vehicleHash: 3917501776, vehicleClass: 6 },
    { vehicleHash: 1830407356, vehicleClass: 5 },
    { vehicleHash: 2157618379, vehicleClass: 20 },
    { vehicleHash: 2199527893, vehicleClass: 4 },
    { vehicleHash: 1507916787, vehicleClass: 4 },
    { vehicleHash: 2112052861, vehicleClass: 20 },
    { vehicleHash: 2046537925, vehicleClass: 18 },
    { vehicleHash: 2321795001, vehicleClass: 18 },
    { vehicleHash: 2667966721, vehicleClass: 18 },
    { vehicleHash: 1912215274, vehicleClass: 18 },
    { vehicleHash: 2758042359, vehicleClass: 18 },
    { vehicleHash: 2515846680, vehicleClass: 18 },
    { vehicleHash: 4175309224, vehicleClass: 12 },
    { vehicleHash: 943752001, vehicleClass: 12 },
    { vehicleHash: 2844316578, vehicleClass: 0 },
    { vehicleHash: 741586030, vehicleClass: 18 },
    { vehicleHash: 2411098011, vehicleClass: 1 },
    { vehicleHash: 3144368207, vehicleClass: 1 },
    { vehicleHash: 356391690, vehicleClass: 11 },
    { vehicleHash: 1645267888, vehicleClass: 9 },
    { vehicleHash: 1933662059, vehicleClass: 9 },
    { vehicleHash: 2360515092, vehicleClass: 6 },
    { vehicleHash: 1737773231, vehicleClass: 6 },
    { vehicleHash: 2643899483, vehicleClass: 2 },
    { vehicleHash: 3627815886, vehicleClass: 4 },
    { vehicleHash: 3087195462, vehicleClass: 9 },
    { vehicleHash: 4280472072, vehicleClass: 1 },
    { vehicleHash: 2249373259, vehicleClass: 9 },
    { vehicleHash: 3196165219, vehicleClass: 17 },
    { vehicleHash: 4067225593, vehicleClass: 4 },
    { vehicleHash: 1162065741, vehicleClass: 12 },
    { vehicleHash: 2518351607, vehicleClass: 12 },
    { vehicleHash: 782665360, vehicleClass: 19 },
    { vehicleHash: 3089277354, vehicleClass: 18 },
    { vehicleHash: 3448987385, vehicleClass: 11 },
    { vehicleHash: 2136773105, vehicleClass: 2 },
    { vehicleHash: 627094268, vehicleClass: 1 },
    { vehicleHash: 2609945748, vehicleClass: 4 },
    { vehicleHash: 3695398481, vehicleClass: 11 },
    { vehicleHash: 734217681, vehicleClass: 11 },
    { vehicleHash: 3105951696, vehicleClass: 9 },
    { vehicleHash: 989381445, vehicleClass: 9 },
    { vehicleHash: 3039514899, vehicleClass: 1 },
    { vehicleHash: 3548084598, vehicleClass: 6 },
    { vehicleHash: 2594165727, vehicleClass: 11 },
    { vehicleHash: 1221512915, vehicleClass: 2 },
    { vehicleHash: 1349725314, vehicleClass: 3 },
    { vehicleHash: 873639469, vehicleClass: 3 },
    { vehicleHash: 3172678083, vehicleClass: 3 },
    { vehicleHash: 3101863448, vehicleClass: 3 },
    { vehicleHash: 1337041428, vehicleClass: 2 },
    { vehicleHash: 2611638396, vehicleClass: 18 },
    { vehicleHash: 1922257928, vehicleClass: 18 },
    { vehicleHash: 3484649228, vehicleClass: 12 },
    { vehicleHash: 728614474, vehicleClass: 12 },
    { vehicleHash: 2817386317, vehicleClass: 1 },
    { vehicleHash: 1545842587, vehicleClass: 5 },
    { vehicleHash: 2196019706, vehicleClass: 5 },
    { vehicleHash: 1747439474, vehicleClass: 20 },
    { vehicleHash: 4080511798, vehicleClass: 20 },
    { vehicleHash: 1723137093, vehicleClass: 1 },
    { vehicleHash: 970598228, vehicleClass: 6 },
    { vehicleHash: 1123216662, vehicleClass: 1 },
    { vehicleHash: 384071873, vehicleClass: 6 },
    { vehicleHash: 699456151, vehicleClass: 12 },
    { vehicleHash: 2983726598, vehicleClass: 12 },
    { vehicleHash: 2400073108, vehicleClass: 1 },
    { vehicleHash: 1951180813, vehicleClass: 12 },
    { vehicleHash: 3286105550, vehicleClass: 1 },
    { vehicleHash: 3338918751, vehicleClass: 17 },
    { vehicleHash: 1917016601, vehicleClass: 17 },
    { vehicleHash: 1641462412, vehicleClass: 11 },
    { vehicleHash: 2218488798, vehicleClass: 11 },
    { vehicleHash: 1445631933, vehicleClass: 11 },
    { vehicleHash: 1019737494, vehicleClass: 11 },
    { vehicleHash: 3895125590, vehicleClass: 11 },
    { vehicleHash: 48339065, vehicleClass: 10 },
    { vehicleHash: 3347205726, vehicleClass: 10 },
    { vehicleHash: 464687292, vehicleClass: 5 },
    { vehicleHash: 1531094468, vehicleClass: 5 },
    { vehicleHash: 1762279763, vehicleClass: 5 },
    { vehicleHash: 2261744861, vehicleClass: 5 },
    { vehicleHash: 1941029835, vehicleClass: 17 },
    { vehicleHash: 2971866336, vehicleClass: 11 },
    { vehicleHash: 3852654278, vehicleClass: 11 },
    { vehicleHash: 516990260, vehicleClass: 11 },
    { vehicleHash: 887537515, vehicleClass: 11 },
    { vehicleHash: 2132890591, vehicleClass: 11 },
    { vehicleHash: 523724515, vehicleClass: 4 },
    { vehicleHash: 1777363799, vehicleClass: 1 },
    { vehicleHash: 2333339779, vehicleClass: 1 },
    { vehicleHash: 65402552, vehicleClass: 12 },
    { vehicleHash: 758895617, vehicleClass: 5 },
    { vehicleHash: 788045382, vehicleClass: 8 },
    { vehicleHash: 2841686334, vehicleClass: 8 },
    { vehicleHash: 4108429845, vehicleClass: 13 },
    { vehicleHash: 1127861609, vehicleClass: 13 },
    { vehicleHash: 3061159916, vehicleClass: 13 },
    { vehicleHash: 3894672200, vehicleClass: 13 },
    { vehicleHash: 3458454463, vehicleClass: 13 },
    { vehicleHash: 448402357, vehicleClass: 13 },
    { vehicleHash: 1131912276, vehicleClass: 13 },
    { vehicleHash: 4260343491, vehicleClass: 18 },
    { vehicleHash: 1672195559, vehicleClass: 8 },
    { vehicleHash: 11251904, vehicleClass: 8 },
    { vehicleHash: 2154536131, vehicleClass: 8 },
    { vehicleHash: 4180675781, vehicleClass: 8 },
    { vehicleHash: 3403504941, vehicleClass: 8 },
    { vehicleHash: 3401388520, vehicleClass: 8 },
    { vehicleHash: 2006142190, vehicleClass: 8 },
    { vehicleHash: 2623969160, vehicleClass: 8 },
    { vehicleHash: 3385765638, vehicleClass: 8 },
    { vehicleHash: 4154065143, vehicleClass: 8 },
    { vehicleHash: 3469130167, vehicleClass: 4 },
    { vehicleHash: 55628203, vehicleClass: 8 },
    { vehicleHash: 301427732, vehicleClass: 8 },
    { vehicleHash: 837858166, vehicleClass: 15 },
    { vehicleHash: 788747387, vehicleClass: 15 },
    { vehicleHash: 745926877, vehicleClass: 15 },
    { vehicleHash: 4244420235, vehicleClass: 15 },
    { vehicleHash: 1621617168, vehicleClass: 15 },
    { vehicleHash: 1394036463, vehicleClass: 15 },
    { vehicleHash: 1044954915, vehicleClass: 15 },
    { vehicleHash: 353883353, vehicleClass: 15 },
    { vehicleHash: 2634305738, vehicleClass: 15 },
    { vehicleHash: 3660088182, vehicleClass: 8 },
    { vehicleHash: 744705981, vehicleClass: 15 },
    { vehicleHash: 1949211328, vehicleClass: 15 },
    { vehicleHash: 3650256867, vehicleClass: 16 },
    { vehicleHash: 970356638, vehicleClass: 16 },
    { vehicleHash: 2172210288, vehicleClass: 16 },
    { vehicleHash: 2548391185, vehicleClass: 16 },
    { vehicleHash: 1058115860, vehicleClass: 16 },
    { vehicleHash: 3080461301, vehicleClass: 16 },
    { vehicleHash: 621481054, vehicleClass: 16 },
    { vehicleHash: 1981688531, vehicleClass: 16 },
    { vehicleHash: 3013282534, vehicleClass: 16 },
    { vehicleHash: 368211810, vehicleClass: 16 },
    { vehicleHash: 400514754, vehicleClass: 14 },
    { vehicleHash: 3251507587, vehicleClass: 14 },
    { vehicleHash: 1033245328, vehicleClass: 14 },
    { vehicleHash: 276773164, vehicleClass: 14 },
    { vehicleHash: 861409633, vehicleClass: 14 },
    { vehicleHash: 3806844075, vehicleClass: 14 },
    { vehicleHash: 290013743, vehicleClass: 14 },
    { vehicleHash: 3264692260, vehicleClass: 14 },
    { vehicleHash: 3678636260, vehicleClass: 14 },
    { vehicleHash: 771711535, vehicleClass: 14 },
    { vehicleHash: 184361638, vehicleClass: 21 },
    { vehicleHash: 1030400667, vehicleClass: 21 },
    { vehicleHash: 920453016, vehicleClass: 21 },
    { vehicleHash: 240201337, vehicleClass: 21 },
    { vehicleHash: 642617954, vehicleClass: 21 },
    { vehicleHash: 586013744, vehicleClass: 21 },
    { vehicleHash: 868868440, vehicleClass: 21 },
    { vehicleHash: 2154757102, vehicleClass: 11 },
    { vehicleHash: 3417488910, vehicleClass: 11 },
    { vehicleHash: 2715434129, vehicleClass: 11 },
    { vehicleHash: 2236089197, vehicleClass: 11 },
    { vehicleHash: 2524324030, vehicleClass: 11 },
    { vehicleHash: 390902130, vehicleClass: 11 },
    { vehicleHash: 3564062519, vehicleClass: 11 },
    { vehicleHash: 2016027501, vehicleClass: 11 },
    { vehicleHash: 2078290630, vehicleClass: 11 },
    { vehicleHash: 1784254509, vehicleClass: 11 },
    { vehicleHash: 2091594960, vehicleClass: 11 },
    { vehicleHash: 2942498482, vehicleClass: 11 },
    { vehicleHash: 712162987, vehicleClass: 11 },
    { vehicleHash: 2621610858, vehicleClass: 16 },
    { vehicleHash: 3078201489, vehicleClass: 7 },
    { vehicleHash: 2672523198, vehicleClass: 7 },
    { vehicleHash: 338562499, vehicleClass: 7 },
    { vehicleHash: 4012021193, vehicleClass: 14 },
    { vehicleHash: 3945366167, vehicleClass: 9 },
    { vehicleHash: 231083307, vehicleClass: 14 },
    { vehicleHash: 92612664, vehicleClass: 9 },
    { vehicleHash: 1488164764, vehicleClass: 12 },
    { vehicleHash: 117401876, vehicleClass: 5 },
    { vehicleHash: 2997294755, vehicleClass: 6 },
    { vehicleHash: 408192225, vehicleClass: 7 },
    { vehicleHash: 767087018, vehicleClass: 6 },
    { vehicleHash: 1341619767, vehicleClass: 16 },
    { vehicleHash: 2891838741, vehicleClass: 7 },
    { vehicleHash: 4152024626, vehicleClass: 6 },
    { vehicleHash: 486987393, vehicleClass: 2 },
    { vehicleHash: 1836027715, vehicleClass: 8 },
    { vehicleHash: 841808271, vehicleClass: 0 },
    { vehicleHash: 1373123368, vehicleClass: 1 },
    { vehicleHash: 3089165662, vehicleClass: 4 },
    { vehicleHash: 75131841, vehicleClass: 1 },
    { vehicleHash: 3863274624, vehicleClass: 0 },
    { vehicleHash: 3057713523, vehicleClass: 9 },
    { vehicleHash: 1078682497, vehicleClass: 5 },
    { vehicleHash: 3449006043, vehicleClass: 9 },
    { vehicleHash: 743478836, vehicleClass: 8 },
    { vehicleHash: 165154707, vehicleClass: 16 },
    { vehicleHash: 1824333165, vehicleClass: 16 },
    { vehicleHash: 1011753235, vehicleClass: 5 },
    { vehicleHash: 3955379698, vehicleClass: 15 },
    { vehicleHash: 4135840458, vehicleClass: 8 },
    { vehicleHash: 1265391242, vehicleClass: 8 },
    { vehicleHash: 3205927392, vehicleClass: 6 },
    { vehicleHash: 3188613414, vehicleClass: 6 },
    { vehicleHash: 3663206819, vehicleClass: 6 },
    { vehicleHash: 3705788919, vehicleClass: 4 },
    { vehicleHash: 729783779, vehicleClass: 4 },
    { vehicleHash: 2242229361, vehicleClass: 20 },
    { vehicleHash: 1077420264, vehicleClass: 16 },
    { vehicleHash: 1956216962, vehicleClass: 11 },
    { vehicleHash: 941800958, vehicleClass: 5 },
    { vehicleHash: 444171386, vehicleClass: 12 },
    { vehicleHash: 970385471, vehicleClass: 16 },
    { vehicleHash: 2434067162, vehicleClass: 9 },
    { vehicleHash: 2071877360, vehicleClass: 9 },
    { vehicleHash: 296357396, vehicleClass: 12 },
    { vehicleHash: 2198148358, vehicleClass: 9 },
    { vehicleHash: 509498602, vehicleClass: 14 },
    { vehicleHash: 4212341271, vehicleClass: 15 },
    { vehicleHash: 1753414259, vehicleClass: 8 },
    { vehicleHash: 2186977100, vehicleClass: 10 },
    { vehicleHash: 640818791, vehicleClass: 8 },
    { vehicleHash: 2922118804, vehicleClass: 6 },
    { vehicleHash: 410882957, vehicleClass: 6 },
    { vehicleHash: 3039269212, vehicleClass: 17 },
    { vehicleHash: 630371791, vehicleClass: 19 },
    { vehicleHash: 2694714877, vehicleClass: 15 },
    { vehicleHash: 833469436, vehicleClass: 4 },
    { vehicleHash: 1075432268, vehicleClass: 15 },
    { vehicleHash: 3080673438, vehicleClass: 16 },
    { vehicleHash: 2728226064, vehicleClass: 5 },
    { vehicleHash: 1987142870, vehicleClass: 7 },
    { vehicleHash: 3796912450, vehicleClass: 4 },
    { vehicleHash: 1581459400, vehicleClass: 3 },
    { vehicleHash: 784565758, vehicleClass: 4 },
    { vehicleHash: 2941886209, vehicleClass: 8 },
    { vehicleHash: 1663218586, vehicleClass: 7 },
    { vehicleHash: 2815302597, vehicleClass: 9 },
    { vehicleHash: 1070967343, vehicleClass: 14 },
    { vehicleHash: 349605904, vehicleClass: 4 },
    { vehicleHash: 2175389151, vehicleClass: 4 },
    { vehicleHash: 2504420315, vehicleClass: 4 },
    { vehicleHash: 525509695, vehicleClass: 4 },
    { vehicleHash: 1896491931, vehicleClass: 4 },
    { vehicleHash: 2254540506, vehicleClass: 1 },
    { vehicleHash: 2933279331, vehicleClass: 4 },
    { vehicleHash: 3281516360, vehicleClass: 4 },
    { vehicleHash: 2006667053, vehicleClass: 4 },
    { vehicleHash: 2068293287, vehicleClass: 4 },
    { vehicleHash: 3463132580, vehicleClass: 5 },
    { vehicleHash: 1102544804, vehicleClass: 6 },
    { vehicleHash: 2351681756, vehicleClass: 4 },
    { vehicleHash: 2634021974, vehicleClass: 5 },
    { vehicleHash: 4180339789, vehicleClass: 1 },
    { vehicleHash: 2809443750, vehicleClass: 6 },
    { vehicleHash: 1489967196, vehicleClass: 6 },
    { vehicleHash: 3406724313, vehicleClass: 1 },
    { vehicleHash: 1922255844, vehicleClass: 1 },
    { vehicleHash: 906642318, vehicleClass: 1 },
    { vehicleHash: 704435172, vehicleClass: 1 },
    { vehicleHash: 2264796000, vehicleClass: 1 },
    { vehicleHash: 3690124666, vehicleClass: 1 },
    { vehicleHash: 1878062887, vehicleClass: 2 },
    { vehicleHash: 634118882, vehicleClass: 2 },
    { vehicleHash: 470404958, vehicleClass: 2 },
    { vehicleHash: 666166960, vehicleClass: 2 },
    { vehicleHash: 908897389, vehicleClass: 14 },
    { vehicleHash: 3983945033, vehicleClass: 14 },
    { vehicleHash: 867467158, vehicleClass: 14 },
    { vehicleHash: 1448677353, vehicleClass: 14 },
    { vehicleHash: 437538602, vehicleClass: 14 },
    { vehicleHash: 2025593404, vehicleClass: 15 },
    { vehicleHash: 710198397, vehicleClass: 15 },
    { vehicleHash: 2623428164, vehicleClass: 15 },
    { vehicleHash: 1543134283, vehicleClass: 15 },
    { vehicleHash: 972671128, vehicleClass: 4 },
    { vehicleHash: 3999278268, vehicleClass: 7 },
    { vehicleHash: 633712403, vehicleClass: 7 },
    { vehicleHash: 3692679425, vehicleClass: 5 },
    { vehicleHash: 2255212070, vehicleClass: 4 },
    { vehicleHash: 3168702960, vehicleClass: 12 },
    { vehicleHash: 223258115, vehicleClass: 4 },
    { vehicleHash: 1119641113, vehicleClass: 4 },
    { vehicleHash: 2497353967, vehicleClass: 5 },
    { vehicleHash: 3395457658, vehicleClass: 4 },
    { vehicleHash: 16646064, vehicleClass: 4 },
    { vehicleHash: 2999939664, vehicleClass: 16 },
    { vehicleHash: 1203490606, vehicleClass: 2 },
    { vehicleHash: 3862958888, vehicleClass: 2 },
    { vehicleHash: 2537130571, vehicleClass: 6 },
    { vehicleHash: 1426219628, vehicleClass: 7 },
    { vehicleHash: 1274868363, vehicleClass: 6 },
    { vehicleHash: 2465164804, vehicleClass: 7 },
    { vehicleHash: 3989239879, vehicleClass: 17 },
    { vehicleHash: 1475773103, vehicleClass: 12 },
    { vehicleHash: 2449479409, vehicleClass: 15 },
    { vehicleHash: 2123327359, vehicleClass: 7 },
    { vehicleHash: 234062309, vehicleClass: 7 },
    { vehicleHash: 2194326579, vehicleClass: 14 },
    { vehicleHash: 2364918497, vehicleClass: 3 },
    { vehicleHash: 482197771, vehicleClass: 6 },
    { vehicleHash: 741090084, vehicleClass: 8 },
    { vehicleHash: 2067820283, vehicleClass: 7 },
    { vehicleHash: 819197656, vehicleClass: 7 },
    { vehicleHash: 3517794615, vehicleClass: 6 },
    { vehicleHash: 3062131285, vehicleClass: 7 },
    { vehicleHash: 683047626, vehicleClass: 2 },
    { vehicleHash: 101905590, vehicleClass: 9 },
    { vehicleHash: 3631668194, vehicleClass: 9 },
    { vehicleHash: 2191146052, vehicleClass: 17 },
    { vehicleHash: 390201602, vehicleClass: 8 },
    { vehicleHash: 86520421, vehicleClass: 8 },
    { vehicleHash: 1887331236, vehicleClass: 6 },
    { vehicleHash: 1549126457, vehicleClass: 0 },
    { vehicleHash: 3223586949, vehicleClass: 6 },
    { vehicleHash: 2736567667, vehicleClass: 5 },
    { vehicleHash: 3005788552, vehicleClass: 8 },
    { vehicleHash: 2452219115, vehicleClass: 8 },
    { vehicleHash: 3620039993, vehicleClass: 6 },
    { vehicleHash: 3685342204, vehicleClass: 8 },
    { vehicleHash: 2179174271, vehicleClass: 8 },
    { vehicleHash: 1491277511, vehicleClass: 8 },
    { vehicleHash: 1026149675, vehicleClass: 12 },
    { vehicleHash: 4039289119, vehicleClass: 8 },
    { vehicleHash: 2688780135, vehicleClass: 8 },
    { vehicleHash: 6774487, vehicleClass: 8 },
    { vehicleHash: 2035069708, vehicleClass: 8 },
    { vehicleHash: 3676349299, vehicleClass: 8 },
    { vehicleHash: 3285698347, vehicleClass: 8 },
    { vehicleHash: 3724934023, vehicleClass: 8 },
    { vehicleHash: 822018448, vehicleClass: 8 },
    { vehicleHash: 2890830793, vehicleClass: 8 },
    { vehicleHash: 1873600305, vehicleClass: 8 },
    { vehicleHash: 3889340782, vehicleClass: 8 },
    { vehicleHash: 2771538552, vehicleClass: 8 },
    { vehicleHash: 3854198872, vehicleClass: 9 },
    { vehicleHash: 196747873, vehicleClass: 6 },
    { vehicleHash: 272929391, vehicleClass: 7 },
    { vehicleHash: 2246633323, vehicleClass: 7 },
    { vehicleHash: 3812247419, vehicleClass: 7 },
    { vehicleHash: 1034187331, vehicleClass: 7 },
    { vehicleHash: 1093792632, vehicleClass: 7 },
    { vehicleHash: 1886268224, vehicleClass: 6 },
    { vehicleHash: 1074745671, vehicleClass: 6 },
    { vehicleHash: 4055125828, vehicleClass: 8 },
    { vehicleHash: 1790834270, vehicleClass: 8 },
    { vehicleHash: 2704629607, vehicleClass: 9 },
    { vehicleHash: 941494461, vehicleClass: 4 },
    { vehicleHash: 3467805257, vehicleClass: 9 },
    { vehicleHash: 3982671785, vehicleClass: 9 },
    { vehicleHash: 2645431192, vehicleClass: 20 },
    { vehicleHash: 989294410, vehicleClass: 7 },
    { vehicleHash: 2536829930, vehicleClass: 7 },
    { vehicleHash: 682434785, vehicleClass: 12 },
    { vehicleHash: 2382949506, vehicleClass: 17 },
    { vehicleHash: 1180875963, vehicleClass: 9 },
    { vehicleHash: 627535535, vehicleClass: 8 },
    { vehicleHash: 3537231886, vehicleClass: 8 },
    { vehicleHash: 2272483501, vehicleClass: 6 },
    { vehicleHash: 777714999, vehicleClass: 4 },
    { vehicleHash: 3312836369, vehicleClass: 5 },
    { vehicleHash: 2889029532, vehicleClass: 5 },
    { vehicleHash: 1234311532, vehicleClass: 7 },
    { vehicleHash: 719660200, vehicleClass: 6 },
    { vehicleHash: 3194418602, vehicleClass: 11 },
    { vehicleHash: 917809321, vehicleClass: 7 },
    { vehicleHash: 3525819835, vehicleClass: 11 },
    { vehicleHash: 1939284556, vehicleClass: 7 },
    { vehicleHash: 177270108, vehicleClass: 20 },
    { vehicleHash: 433954513, vehicleClass: 9 },
    { vehicleHash: 223240013, vehicleClass: 5 },
    { vehicleHash: 1504306544, vehicleClass: 5 },
    { vehicleHash: 387748548, vehicleClass: 20 },
    { vehicleHash: 1502869817, vehicleClass: 11 },
    { vehicleHash: 1356124575, vehicleClass: 9 },
    { vehicleHash: 2370534026, vehicleClass: 9 },
    { vehicleHash: 562680400, vehicleClass: 19 },
    { vehicleHash: 3084515313, vehicleClass: 4 },
    { vehicleHash: 1897744184, vehicleClass: 9 },
    { vehicleHash: 2413121211, vehicleClass: 19 },
    { vehicleHash: 4262731174, vehicleClass: 19 },
    { vehicleHash: 159274291, vehicleClass: 5 },
    { vehicleHash: 884483972, vehicleClass: 8 },
    { vehicleHash: 3052358707, vehicleClass: 7 },
    { vehicleHash: 4262088844, vehicleClass: 16 },
    { vehicleHash: 2771347558, vehicleClass: 16 },
    { vehicleHash: 3902291871, vehicleClass: 16 },
    { vehicleHash: 1043222410, vehicleClass: 16 },
    { vehicleHash: 2310691317, vehicleClass: 15 },
    { vehicleHash: 4252008158, vehicleClass: 15 },
    { vehicleHash: 2531412055, vehicleClass: 16 },
    { vehicleHash: 3319621991, vehicleClass: 16 },
    { vehicleHash: 2908775872, vehicleClass: 16 },
    { vehicleHash: 3287439187, vehicleClass: 16 },
    { vehicleHash: 3545667823, vehicleClass: 16 },
    { vehicleHash: 2594093022, vehicleClass: 16 },
    { vehicleHash: 1036591958, vehicleClass: 16 },
    { vehicleHash: 1565978651, vehicleClass: 16 },
    { vehicleHash: 2049897956, vehicleClass: 5 },
    { vehicleHash: 1841130506, vehicleClass: 5 },
    { vehicleHash: 1392481335, vehicleClass: 7 },
    { vehicleHash: 3296789504, vehicleClass: 7 },
    { vehicleHash: 838982985, vehicleClass: 5 },
    { vehicleHash: 3903371924, vehicleClass: 5 },
    { vehicleHash: 661493923, vehicleClass: 6 },
    { vehicleHash: 2765724541, vehicleClass: 6 },
    { vehicleHash: 2762269779, vehicleClass: 9 },
    { vehicleHash: 1352136073, vehicleClass: 7 },
    { vehicleHash: 3981782132, vehicleClass: 7 },
    { vehicleHash: 903794909, vehicleClass: 5 },
    { vehicleHash: 2215179066, vehicleClass: 5 },
    { vehicleHash: 1561920505, vehicleClass: 6 },
    { vehicleHash: 2445973230, vehicleClass: 6 },
    { vehicleHash: 1104234922, vehicleClass: 6 },
    { vehicleHash: 2859440138, vehicleClass: 19 },
    { vehicleHash: 4081974053, vehicleClass: 19 },
    { vehicleHash: 447548909, vehicleClass: 16 },
    { vehicleHash: 1181327175, vehicleClass: 15 },
    { vehicleHash: 1483171323, vehicleClass: 5 },
    { vehicleHash: 886810209, vehicleClass: 5 },
    { vehicleHash: 3602674979, vehicleClass: 19 },
    { vehicleHash: 2601952180, vehicleClass: 18 },
    { vehicleHash: 2176659152, vehicleClass: 16 },
    { vehicleHash: 408970549, vehicleClass: 16 },
    { vehicleHash: 1489874736, vehicleClass: 19 },
    { vehicleHash: 1871995513, vehicleClass: 4 },
    { vehicleHash: 15219735, vehicleClass: 4 },
    { vehicleHash: 600450546, vehicleClass: 4 },
    { vehicleHash: 1741861769, vehicleClass: 6 },
    { vehicleHash: 3884762073, vehicleClass: 6 },
    { vehicleHash: 867799010, vehicleClass: 6 },
    { vehicleHash: 4173521127, vehicleClass: 9 },
    { vehicleHash: 2174267100, vehicleClass: 7 },
    { vehicleHash: 3306466016, vehicleClass: 5 },
    { vehicleHash: 4080061290, vehicleClass: 6 },
    { vehicleHash: 1254014755, vehicleClass: 9 },
    { vehicleHash: 1115909093, vehicleClass: 6 },
    { vehicleHash: 3568198617, vehicleClass: 15 },
    { vehicleHash: 3035832600, vehicleClass: 6 },
    { vehicleHash: 3027423925, vehicleClass: 4 },
    { vehicleHash: 1046206681, vehicleClass: 5 },
    { vehicleHash: 1617472902, vehicleClass: 5 },
    { vehicleHash: 3308022675, vehicleClass: 4 },
    { vehicleHash: 3918533058, vehicleClass: 7 },
    { vehicleHash: 1031562256, vehicleClass: 7 },
    { vehicleHash: 1909189272, vehicleClass: 6 },
    { vehicleHash: 931280609, vehicleClass: 0 },
    { vehicleHash: 3160260734, vehicleClass: 7 },
    { vehicleHash: 321186144, vehicleClass: 1 },
    { vehicleHash: 3656405053, vehicleClass: 7 },
    { vehicleHash: 1692272545, vehicleClass: 16 },
    { vehicleHash: 2306538597, vehicleClass: 20 },
    { vehicleHash: 345756458, vehicleClass: 17 },
    { vehicleHash: 2069146067, vehicleClass: 8 },
    { vehicleHash: 1653666139, vehicleClass: 20 },
    { vehicleHash: 219613597, vehicleClass: 12 },
    { vehicleHash: 4240635011, vehicleClass: 9 },
    { vehicleHash: 1945374990, vehicleClass: 20 },
    { vehicleHash: 2044532910, vehicleClass: 9 },
    { vehicleHash: 3987008919, vehicleClass: 16 },
    { vehicleHash: 500482303, vehicleClass: 5 },
    { vehicleHash: 3874056184, vehicleClass: 2 },
    { vehicleHash: 2370166601, vehicleClass: 4 },
    { vehicleHash: 840387324, vehicleClass: 9 },
    { vehicleHash: 3579220348, vehicleClass: 9 },
    { vehicleHash: 1742022738, vehicleClass: 4 },
    { vehicleHash: 1239571361, vehicleClass: 0 },
    { vehicleHash: 679453769, vehicleClass: 20 },
    { vehicleHash: 1909700336, vehicleClass: 20 },
    { vehicleHash: 2482017624, vehicleClass: 8 },
    { vehicleHash: 3001042683, vehicleClass: 4 },
    { vehicleHash: 2920466844, vehicleClass: 8 },
    { vehicleHash: 2550461639, vehicleClass: 4 },
    { vehicleHash: 2233918197, vehicleClass: 4 },
    { vehicleHash: 373261600, vehicleClass: 4 },
    { vehicleHash: 2139203625, vehicleClass: 9 },
    { vehicleHash: 2403970600, vehicleClass: 9 },
    { vehicleHash: 2038858402, vehicleClass: 9 },
    { vehicleHash: 4267640610, vehicleClass: 8 },
    { vehicleHash: 3606777648, vehicleClass: 4 },
    { vehicleHash: 2919906639, vehicleClass: 4 },
    { vehicleHash: 668439077, vehicleClass: 9 },
    { vehicleHash: 2600885406, vehicleClass: 9 },
    { vehicleHash: 2252616474, vehicleClass: 9 },
    { vehicleHash: 4008920556, vehicleClass: 9 },
    { vehicleHash: 3963499524, vehicleClass: 6 },
    { vehicleHash: 3493417227, vehicleClass: 20 },
    { vehicleHash: 1009171724, vehicleClass: 4 },
    { vehicleHash: 1721676810, vehicleClass: 9 },
    { vehicleHash: 1456744817, vehicleClass: 4 },
    { vehicleHash: 3147997943, vehicleClass: 19 },
    { vehicleHash: 1542143200, vehicleClass: 19 },
    { vehicleHash: 3715219435, vehicleClass: 19 },
    { vehicleHash: 628003514, vehicleClass: 0 },
    { vehicleHash: 1537277726, vehicleClass: 0 },
    { vehicleHash: 2728360112, vehicleClass: 4 },
    { vehicleHash: 1591739866, vehicleClass: 7 },
    { vehicleHash: 4245851645, vehicleClass: 4 },
    { vehicleHash: 444994115, vehicleClass: 4 },
    { vehicleHash: 1637620610, vehicleClass: 4 },
    { vehicleHash: 3539435063, vehicleClass: 4 },
    { vehicleHash: 3126015148, vehicleClass: 2 },
    { vehicleHash: 1279262537, vehicleClass: 4 },
    { vehicleHash: 3787471536, vehicleClass: 6 },
    { vehicleHash: 2198276962, vehicleClass: 4 },
    { vehicleHash: 540101442, vehicleClass: 6 },
    { vehicleHash: 3188846534, vehicleClass: 6 },
    { vehicleHash: 2816263004, vehicleClass: 6 },
    { vehicleHash: 3847255899, vehicleClass: 6 },
    { vehicleHash: 1416466158, vehicleClass: 6 },
    { vehicleHash: 4086055493, vehicleClass: 6 },
    { vehicleHash: 916547552, vehicleClass: 8 },
    { vehicleHash: 2674840994, vehicleClass: 6 },
    { vehicleHash: 3630826055, vehicleClass: 7 },
    { vehicleHash: 2490551588, vehicleClass: 4 },
    { vehicleHash: 1934384720, vehicleClass: 4 },
    { vehicleHash: 3970348707, vehicleClass: 7 },
    { vehicleHash: 2945871676, vehicleClass: 9 },
    { vehicleHash: 1044193113, vehicleClass: 7 },
    { vehicleHash: 2465530446, vehicleClass: 2 },
    { vehicleHash: 3612858749, vehicleClass: 7 },
    { vehicleHash: 1854776567, vehicleClass: 6 },
    { vehicleHash: 3353694737, vehicleClass: 6 },
    { vehicleHash: 1323778901, vehicleClass: 7 },
    { vehicleHash: 3932816511, vehicleClass: 9 },
    { vehicleHash: 310284501, vehicleClass: 5 },
    { vehicleHash: 722226637, vehicleClass: 4 },
    { vehicleHash: 3412338231, vehicleClass: 5 },
    { vehicleHash: 1862507111, vehicleClass: 5 },
    { vehicleHash: 686471183, vehicleClass: 6 },
    { vehicleHash: 3040635986, vehicleClass: 19 },
    { vehicleHash: 2031587082, vehicleClass: 5 },
    { vehicleHash: 408825843, vehicleClass: 9 },
    { vehicleHash: 1693751655, vehicleClass: 4 },
    { vehicleHash: 301304410, vehicleClass: 8 },
    { vehicleHash: 394110044, vehicleClass: 5 },
    { vehicleHash: 872704284, vehicleClass: 6 },
    { vehicleHash: 2538945576, vehicleClass: 9 },
    { vehicleHash: 987469656, vehicleClass: 6 },
    { vehicleHash: 1284356689, vehicleClass: 9 },
    { vehicleHash: 340154634, vehicleClass: 22 },
    { vehicleHash: 2334210311, vehicleClass: 22 },
    { vehicleHash: 83136452, vehicleClass: 2 },
    { vehicleHash: 740289177, vehicleClass: 9 },
    { vehicleHash: 960812448, vehicleClass: 7 },
    { vehicleHash: 1456336509, vehicleClass: 6 },
    { vehicleHash: 3460613305, vehicleClass: 6 },
    { vehicleHash: 1118611807, vehicleClass: 0 },
    { vehicleHash: 409049982, vehicleClass: 0 },
    { vehicleHash: 3162245632, vehicleClass: 6 },
    { vehicleHash: 1492612435, vehicleClass: 22 },
    { vehicleHash: 2566281822, vehicleClass: 6 },
    { vehicleHash: 2936769864, vehicleClass: 7 },
    { vehicleHash: 3663644634, vehicleClass: 6 },
    { vehicleHash: 3456868130, vehicleClass: 2 },
    { vehicleHash: 67753863, vehicleClass: 9 },
    { vehicleHash: 2196012677, vehicleClass: 0 },
    { vehicleHash: 2172320429, vehicleClass: 4 },
    { vehicleHash: 2134119907, vehicleClass: 4 },
    { vehicleHash: 1802742206, vehicleClass: 12 },
    { vehicleHash: 3381377750, vehicleClass: 1 },
    { vehicleHash: 2484160806, vehicleClass: 2 },
    { vehicleHash: 1181339704, vehicleClass: 22 },
    { vehicleHash: 1107404867, vehicleClass: 5 },
    { vehicleHash: 1717532765, vehicleClass: 4 },
    { vehicleHash: 2802050217, vehicleClass: 6 },
    { vehicleHash: 4192631813, vehicleClass: 2 },
    { vehicleHash: 3314393930, vehicleClass: 14 },
    { vehicleHash: 295054921, vehicleClass: 15 },
    { vehicleHash: 3145241962, vehicleClass: 6 },
    { vehicleHash: 3437611258, vehicleClass: 6 },
    { vehicleHash: 1455990255, vehicleClass: 5 },
    { vehicleHash: 3249056020, vehicleClass: 11 },
    { vehicleHash: 1644055914, vehicleClass: 0 },
    { vehicleHash: 2014313426, vehicleClass: 19 },
    { vehicleHash: 3929093893, vehicleClass: 16 },
    { vehicleHash: 4018222598, vehicleClass: 14 },
    { vehicleHash: 2588363614, vehicleClass: 14 },
    { vehicleHash: 1429622905, vehicleClass: 0 },
    { vehicleHash: 298565713, vehicleClass: 9 },
    { vehicleHash: 1861786828, vehicleClass: 14 },
    { vehicleHash: 1229411063, vehicleClass: 15 },
    { vehicleHash: 1593933419, vehicleClass: 15 },
    { vehicleHash: 4084658662, vehicleClass: 9 },
    { vehicleHash: 1086534307, vehicleClass: 8 },
    { vehicleHash: 1336872304, vehicleClass: 14 },
    { vehicleHash: 3186376089, vehicleClass: 21 },
    { vehicleHash: 2568944644, vehicleClass: 6 },
    { vehicleHash: 426742808, vehicleClass: 4 },
    { vehicleHash: 736672010, vehicleClass: 4 },
    { vehicleHash: 2038480341, vehicleClass: 6 },
    { vehicleHash: 2787736776, vehicleClass: 6 },
    { vehicleHash: 3842363289, vehicleClass: 6 },
    { vehicleHash: 4003946083, vehicleClass: 6 },
    { vehicleHash: 3050505892, vehicleClass: 1 },
    { vehicleHash: 1304459735, vehicleClass: 6 },
    { vehicleHash: 2754593701, vehicleClass: 6 },
    { vehicleHash: 1377217886, vehicleClass: 6 },
    { vehicleHash: 3101054893, vehicleClass: 6 },
    { vehicleHash: 1755697647, vehicleClass: 6 },
    { vehicleHash: 2712905841, vehicleClass: 6 },
    { vehicleHash: 2436313176, vehicleClass: 6 },
    { vehicleHash: 1416471345, vehicleClass: 3 },
    { vehicleHash: 579912970, vehicleClass: 1 },
    { vehicleHash: 1353120668, vehicleClass: 8 },
    { vehicleHash: 1993851908, vehicleClass: 8 },
    { vehicleHash: 3379732821, vehicleClass: 7 },
    { vehicleHash: 2767531027, vehicleClass: 1 },
    { vehicleHash: 662793086, vehicleClass: 2 },
    { vehicleHash: 629969764, vehicleClass: 2 },
    { vehicleHash: 359875117, vehicleClass: 2 },
    { vehicleHash: 3675036420, vehicleClass: 4 },
    { vehicleHash: 1141395928, vehicleClass: 6 },
    { vehicleHash: 1532171089, vehicleClass: 1 },
    { vehicleHash: 2850852987, vehicleClass: 7 },
    { vehicleHash: 461465043, vehicleClass: 2 },
    { vehicleHash: 3624880708, vehicleClass: 9 },
    { vehicleHash: 655665811, vehicleClass: 7 },
    { vehicleHash: 4033620423, vehicleClass: 2 },
    { vehicleHash: 1486521356, vehicleClass: 12 },
    { vehicleHash: 1343932732, vehicleClass: 20 },
    { vehicleHash: 3789743831, vehicleClass: 6 },
    { vehicleHash: 2938086457, vehicleClass: 6 },
    { vehicleHash: 1706945532, vehicleClass: 4 },
    { vehicleHash: 15214558, vehicleClass: 0 },
    { vehicleHash: 3540279623, vehicleClass: 6 },
    { vehicleHash: 3526730918, vehicleClass: 9 },
    { vehicleHash: 4230891418, vehicleClass: 3 },
    { vehicleHash: 4000288633, vehicleClass: 3 },
    { vehicleHash: 4129572538, vehicleClass: 7 },
    { vehicleHash: 2536587772, vehicleClass: 4 },
    { vehicleHash: 4284049613, vehicleClass: 7 },
    { vehicleHash: 3400983137, vehicleClass: 6 },
    { vehicleHash: 274946574, vehicleClass: 6 },
    { vehicleHash: 2439462158, vehicleClass: 1 },
    { vehicleHash: 3817135397, vehicleClass: 15 },
    { vehicleHash: 40817712, vehicleClass: 4 },
    { vehicleHash: 775514032, vehicleClass: 6 },
    { vehicleHash: 3300595976, vehicleClass: 4 },
    { vehicleHash: 3833117047, vehicleClass: 4 },
    { vehicleHash: 2361724968, vehicleClass: 4 },
    { vehicleHash: 1550581940, vehicleClass: 2 },
    { vehicleHash: 268758436, vehicleClass: 4 },
    { vehicleHash: 4163619118, vehicleClass: 6 },
    { vehicleHash: 669204833, vehicleClass: 7 },
    { vehicleHash: 996383885, vehicleClass: 9 },
    { vehicleHash: 2100457220, vehicleClass: 6 },
    { vehicleHash: 1076201208, vehicleClass: 6 },
    { vehicleHash: 1748565021, vehicleClass: 7 },
    { vehicleHash: 3045179290, vehicleClass: 4 },
    { vehicleHash: 2908631255, vehicleClass: 8 },
    { vehicleHash: 2667889793, vehicleClass: 12 },
    { vehicleHash: 2718380883, vehicleClass: 17 },
    { vehicleHash: 1384502824, vehicleClass: 8 },
    { vehicleHash: 3259477733, vehicleClass: 12 },
    { vehicleHash: 2336777441, vehicleClass: 16 },
    { vehicleHash: 2311345272, vehicleClass: 13 },
    { vehicleHash: 3397143273, vehicleClass: 13 },
    { vehicleHash: 239897677, vehicleClass: 16 },
    { vehicleHash: 802856453, vehicleClass: 9 },
    { vehicleHash: 610429990, vehicleClass: 6 },
    { vehicleHash: 3758861739, vehicleClass: 9 },
    { vehicleHash: 1447690049, vehicleClass: 6 },
    { vehicleHash: 3315674721, vehicleClass: 4 },
    { vehicleHash: 191916658, vehicleClass: 16 },
    { vehicleHash: 3640468689, vehicleClass: 4 },
    { vehicleHash: 1336514315, vehicleClass: 6 },
    { vehicleHash: 3868033424, vehicleClass: 16 },
    { vehicleHash: 4225674290, vehicleClass: 16 },
    { vehicleHash: 165968051, vehicleClass: 4 },
    { vehicleHash: 4250167832, vehicleClass: 12 },
    { vehicleHash: 2635962482, vehicleClass: 15 },
    { vehicleHash: 2531292011, vehicleClass: 9 },
    { vehicleHash: 2620582743, vehicleClass: 18 },
    { vehicleHash: 2922168362, vehicleClass: 2 },
    { vehicleHash: 167522317, vehicleClass: 9 },
    { vehicleHash: 4116524922, vehicleClass: 4 },
    { vehicleHash: 3526923154, vehicleClass: 2 },
    { vehicleHash: 728350375, vehicleClass: 20 },
    { vehicleHash: 3392937977, vehicleClass: 11 },
    { vehicleHash: 3623402354, vehicleClass: 11 },
    { vehicleHash: 3816328113, vehicleClass: 1 },
    { vehicleHash: 372621319, vehicleClass: 4 },
    { vehicleHash: 3265236814, vehicleClass: 2 },
    { vehicleHash: 2815031719, vehicleClass: 3 },
    { vehicleHash: 2531693357, vehicleClass: 6 },
    { vehicleHash: 4113404654, vehicleClass: 6 },
    { vehicleHash: 821121576, vehicleClass: 6 },
    { vehicleHash: 2613313775, vehicleClass: 4 },
    { vehicleHash: 2598648200, vehicleClass: 6 },
    { vehicleHash: 1923534526, vehicleClass: 6 },
    { vehicleHash: 2670883828, vehicleClass: 6 },
    { vehicleHash: 4256087847, vehicleClass: 2 },
    { vehicleHash: 3852738056, vehicleClass: 21 },
    { vehicleHash: 3853757601, vehicleClass: 4 },
    { vehicleHash: 3061199846, vehicleClass: 18 },
    { vehicleHash: 4171974011, vehicleClass: 7 },
    { vehicleHash: 471034616, vehicleClass: 11 },
    { vehicleHash: 3452201761, vehicleClass: 12 },
    { vehicleHash: 3829141989, vehicleClass: 3 },
    { vehicleHash: 2960513480, vehicleClass: 11 },
    { vehicleHash: 4165683409, vehicleClass: 20 },
    { vehicleHash: 3553846961, vehicleClass: 1 },
    { vehicleHash: 3431608412, vehicleClass: 2 },
    { vehicleHash: 1835260592, vehicleClass: 11 },
    { vehicleHash: 1539159908, vehicleClass: 11 },
    { vehicleHash: 3228633070, vehicleClass: 14 },
    { vehicleHash: 723973206, vehicleClass: 4 },
    { vehicleHash: 3968823444, vehicleClass: 4 },
    { vehicleHash: 237764926, vehicleClass: 6 },
    { vehicleHash: 3379262425, vehicleClass: 4 },
    { vehicleHash: 3393804037, vehicleClass: 16 },
    { vehicleHash: 1233534620, vehicleClass: 9 },
    { vehicleHash: 3681241380, vehicleClass: 16 },
    { vehicleHash: 349315417, vehicleClass: 4 },
    { vehicleHash: 1923400478, vehicleClass: 4 },
    { vehicleHash: 3893323758, vehicleClass: 4 },
    { vehicleHash: 1039032026, vehicleClass: 6 },
    { vehicleHash: 3703315515, vehicleClass: 6 }
];
exports.vehicleClasses = vehicleClasses;


/***/ },

/***/ "./source/server/assets/Weapons.assets.ts"
/*!************************************************!*\
  !*** ./source/server/assets/Weapons.assets.ts ***!
  \************************************************/
(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.deathReasons = exports.weaponUnhash = exports.weaponHash = void 0;
const weaponHash = {
    unarmed: 2725352035,
    knife: 2578778090,
    nightstick: 1737195953,
    hammer: 1317494643,
    bat: 2508868239,
    crowbar: 2227010557,
    golfclub: 1141786504,
    bottle: 4192643659,
    dagger: 2460120199,
    hatchet: 4191993645,
    knuckleduster: 3638508604,
    machete: 3713923289,
    flashlight: 2343591895,
    switchblade: 3756226112,
    poolcue: 2484171525,
    wrench: 419712736,
    battleaxe: 3441901897,
    pistol: 453432689,
    pistolmk2: 3219281620,
    combatpistol: 1593441988,
    pistol50: 2578377531,
    snspistol: 3218215474,
    heavypistol: 3523564046,
    vintagepistol: 137902532,
    marksmanpistol: 3696079510,
    revolver: 3249783761,
    appistol: 584646201,
    stungun: 911657153,
    flaregun: 1198879012,
    microsmg: 324215364,
    machinepistol: 3675956304,
    smg: 736523883,
    smg_mk2: 2024373456,
    assaultsmg: 4024951519,
    combatpdw: 171789620,
    mg: 2634544996,
    combatmg: 2144741730,
    combatmgmk2: 3686625920,
    gusenberg: 1627465347,
    minismg: 3173288789,
    assaultrifle: 3220176749,
    assaultrifle_mk2: 961495388,
    carbinerifle: 2210333304,
    carbinerifle_mk2: 4208062921,
    advancedrifle: 2937143193,
    specialcarbine: 3231910285,
    bullpuprifle: 2132975508,
    compactrifle: 1649403952,
    sniperrifle: 100416529,
    heavysniper: 205991906,
    heavysnipermk2: 177293209,
    marksmanrifle: 3342088282,
    pumpshotgun: 487013001,
    sawnoffshotgun: 2017895192,
    bullpupshotgun: 2640438543,
    assaultshotgun: 3800352039,
    mukset: 2828843422,
    heavyshotgun: 984333226,
    doublebarrelshotgun: 4019527611,
    autoshotgun: 317205821,
    grenadelauncher: 2726580491,
    rpg: 2982836145,
    minigun: 1119849093,
    firework: 2138347493,
    railgun: 1834241177,
    hominglauncher: 1672152130,
    grenadelaunchersmoke: 1305664598,
    compactlauncher: 125959754,
    grenade: 2481070269,
    stickybomb: 741814745,
    proximitymine: 2874559379,
    bzgas: 2694266206,
    molotov: 615608432,
    fireextinguisher: 101631238,
    petrolcan: 883325847,
    flare: 1233104067,
    ball: 600439132,
    snowball: 126349499,
    smokegrenade: 4256991824,
    pipebomb: 3125143736,
    parachute: 4222310262
};
exports.weaponHash = weaponHash;
const weaponUnhash = {
    2725352035: "weapon_unarmed",
    2578778090: "weapon_knife",
    1737195953: "weapon_nightstick",
    1317494643: "weapon_hammer",
    2508868239: "weapon_bat",
    2227010557: "weapon_crowbar",
    1141786504: "weapon_golfclub",
    4192643659: "weapon_bottle",
    2460120199: "weapon_dagger",
    4191993645: "weapon_hatchet",
    3638508604: "weapon_knuckleduster",
    3713923289: "weapon_machete",
    2343591895: "weapon_flashlight",
    3756226112: "weapon_switchblade",
    2484171525: "weapon_poolcue",
    419712736: "weapon_wrench",
    3441901897: "weapon_battleaxe",
    453432689: "weapon_pistol",
    3219281620: "weapon_pistol_mk2",
    1593441988: "weapon_combatpistol",
    2578377531: "weapon_pistol50",
    3218215474: "weapon_snspistol",
    3523564046: "weapon_heavypistol",
    137902532: "weapon_vintagepistol",
    3696079510: "weapon_marksmanpistol",
    3249783761: "weapon_revolver",
    584646201: "weapon_appistol",
    911657153: "weapon_stungun",
    1198879012: "weapon_flaregun",
    324215364: "weapon_microsmg",
    3675956304: "weapon_machinepistol",
    736523883: "weapon_smg",
    2024373456: "weapon_smgmk2",
    4024951519: "weapon_assaultsmg",
    171789620: "weapon_combatpdw",
    2634544996: "weapon_mg",
    2144741730: "weapon_combatmg",
    3686625920: "weapon_combatmgmk2",
    1627465347: "weapon_gusenberg",
    3173288789: "weapon_minismg",
    3220176749: "weapon_assaultrifle",
    961495388: "weapon_assaultriflemk2",
    2210333304: "weapon_carbinerifle",
    4208062921: "weapon_carbineriflemk2",
    2937143193: "weapon_advancedrifle",
    3231910285: "weapon_specialcarbine",
    2132975508: "weapon_bullpuprifle",
    1649403952: "weapon_compactrifle",
    100416529: "weapon_sniperrifle",
    205991906: "weapon_heavysniper",
    177293209: "weapon_heavysnipermk2",
    3342088282: "weapon_marksmanrifle",
    487013001: "weapon_pumpshotgun",
    2017895192: "weapon_sawnoffshotgun",
    2640438543: "weapon_bullpupshotgun",
    3800352039: "weapon_assaultshotgun",
    2828843422: "weapon_musket",
    984333226: "weapon_heavyshotgun",
    4019527611: "weapon_doublebarrelshotgun",
    317205821: "weapon_autoshotgun",
    2726580491: "weapon_grenadelauncher",
    2982836145: "weapon_rpg",
    1119849093: "weapon_minigun",
    2138347493: "weapon_firework",
    1834241177: "weapon_railgun",
    1672152130: "weapon_hominglauncher",
    1305664598: "weapon_grenadelaunchersmoke",
    125959754: "weapon_compactlauncher",
    2481070269: "weapon_grenade",
    741814745: "weapon_stickybomb",
    2874559379: "weapon_proximitymine",
    2694266206: "weapon_bzgas",
    615608432: "weapon_molotov",
    101631238: "weapon_fireextinguisher",
    883325847: "weapon_petrolcan",
    1233104067: "weapon_flare",
    600439132: "weapon_ball",
    126349499: "weapon_snowball",
    4256991824: "weapon_smokegrenade",
    3125143736: "weapon_pipebomb",
    4222310262: "weapon_parachute"
};
exports.weaponUnhash = weaponUnhash;
const deathReasons = {
    "2460120199": "Antique Cavalry Dagger",
    "2508868239": "Baseball Bat",
    "4192643659": "Bottle",
    "2227010557": "Crowbar",
    "2725352035": "Fist",
    "2343591895": "Flashlight",
    "1141786504": "Golf Club",
    "1317494643": "Hammer",
    "4191993645": "Hatchet",
    "3638508604": "Knuckle",
    "2578778090": "Knife",
    "3713923289": "Machete",
    "3756226112": "Switchblade",
    "1737195953": "Nightstick",
    "419712736": "Pipe Wrench",
    "3441901897": "Battle Axe",
    "2484171525": "Pool Cue",
    "940833800": "Stone Hatchet",
    "453432689": "Pistol",
    "3219281620": "Pistol MK2",
    "1593441988": "Combat Pistol",
    "584646201": "AP Pistol",
    "911657153": "Stun Gun",
    "2578377531": "Pistol .50",
    "3218215474": "SNS Pistol",
    "2285322324": "SNS Pistol MK2",
    "3523564046": "Heavy Pistol",
    "137902532": "Vintage Pistol",
    "1198879012": "Flare Gun",
    "3696079510": "Marksman Pistol",
    "3249783761": "Heavy Revolver",
    "3415619887": "Heavy Revolver MK2",
    "2548703416": "Double Action",
    "2939590305": "Up-n-Atomizer",
    "324215364": "Micro SMG",
    "736523883": "SMG",
    "2024373456": "SMG MK2",
    "4024951519": "Assault SMG",
    "171789620": "Combat PDW",
    "3675956304": "Machine Pistol",
    "3173288789": "Mini SMG",
    "1198256469": "Unholy Hellbringer",
    "487013001": "Pump Shotgun",
    "1432025498": "Pump Shotgun MK2",
    "2017895192": "Sawed-Off Shotgun",
    "3800352039": "Assault Shotgun",
    "2640438543": "Bullpup Shotgun",
    "2828843422": "Musket",
    "984333226": "Heavy Shotgun",
    "4019527611": "Double Barrel Shotgun",
    "317205821": "Sweeper Shotgun",
    "3220176749": "Assault Rifle",
    "961495388": "Assault Rifle MK2",
    "2210333304": "Carbine Rifle",
    "4208062921": "Carbine Rifle MK2",
    "2937143193": "Advanced Rifle",
    "3231910285": "Special Carbine",
    "2526821735": "Special Carbine MK2",
    "2132975508": "Bullpup Rifle",
    "2228681469": "Bullpup Rifle MK2",
    "1649403952": "Compact Rifle",
    "2634544996": "MG",
    "2144741730": "Combat MG",
    "3686625920": "Combat MG MK2",
    "1627465347": "Gusenberg Sweeper",
    "100416529": "Sniper Rifle",
    "205991906": "Heavy Sniper",
    "177293209": "Heavy Sniper MK2",
    "3342088282": "Marksman Rifle",
    "1785463520": "Marksman Rifle MK2",
    "2982836145": "RPG",
    "2726580491": "Grenade Launcher",
    "1305664598": "Smoke Grenade Launcher",
    "1119849093": "Minigun",
    "2138347493": "Firework Launcher",
    "1834241177": "Railgun",
    "1672152130": "Homing Launcher",
    "125959754": "Compact Grenade Launcher",
    "3056410471": "Ray Minigun",
    "2481070269": "Grenade",
    "2694266206": "BZ Gas",
    "4256991824": "Smoke Grenade",
    "1233104067": "Flare",
    "615608432": "Molotov",
    "741814745": "Sticky Bomb",
    "2874559379": "Proximity Mine",
    "126349499": "Snowball",
    "3125143736": "Pipe Bomb",
    "600439132": "Baseball",
    "883325847": "Jerry Can",
    "101631238": "Fire Extinguisher",
    "4222310262": "Parachute",
    "2461879995": "Electric Fence",
    "3425972830": "Hit by Water Cannon",
    "133987706": "Rammed by Car",
    "2741846334": "Run Over by Car",
    "3452007600": "Fall",
    "4194021054": "Animal",
    "324506233": "Airstrike Rocket",
    "2339582971": "Bleeding",
    "2294779575": "Briefcase",
    "28811031": "Briefcase 02",
    "148160082": "Cougar",
    "1223143800": "Barbed Wire",
    "4284007675": "Drowning",
    "1936677264": "Drowning In Vehicle",
    "539292904": "Explosion",
    "910830060": "Exhaustion",
    "3750660587": "Fire",
    "341774354": "Heli Crash",
    "3204302209": "Vehicle Rocket",
    "2282558706": "Vehicle Akula Barrage",
    "431576697": "Vehicle Akula Minigun",
    "2092838988": "Vehicle Akula Missile",
    "476907586": "Vehicle Akula Turret Dual",
    "3048454573": "Vehicle Akula Turret Single",
    "328167896": "Vehicle APC Cannon",
    "190244068": "Vehicle APC MG",
    "1151689097": "Vehicle APC Missile",
    "3293463361": "Vehicle Ardent MG",
    "2556895291": "Vehicle Avenger Cannon",
    "2756453005": "Vehicle Barrage Rear GL",
    "1200179045": "Vehicle Barrage Rear MG",
    "525623141": "Vehicle Barrage Rear Minigun",
    "4148791700": "Vehicle Barrage Top MG",
    "1000258817": "Vehicle Barrage Top Minigun",
    "3628350041": "Vehicle Bombushka Cannon",
    "741027160": "Vehicle Bombushka Dual MG",
    "3959029566": "Vehicle Cannon Blazer",
    "1817275304": "Vehicle Caracara MG",
    "1338760315": "Vehicle Caracara Minigun",
    "2722615358": "Vehicle Cherno Missile",
    "3936892403": "Vehicle Comet MG",
    "2600428406": "Vehicle Deluxo MG",
    "3036244276": "Vehicle Deluxo Missile",
    "1595421922": "Vehicle Dogfighter MG",
    "3393648765": "Vehicle Dogfighter Missile",
    "2700898573": "Vehicle Dune Grenade Launcher",
    "3507816399": "Vehicle Dune MG",
    "1416047217": "Vehicle Dune Minigun",
    "1566990507": "Vehicle Enemy Laser",
    "1987049393": "Vehicle Hacker Missile",
    "2011877270": "Vehicle Hacker Missile Homing",
    "1331922171": "Vehicle Halftrack Dual MG",
    "1226518132": "Vehicle Halftrack Quad MG",
    "855547631": "Vehicle Havok Minigun",
    "785467445": "Vehicle Hunter Barrage",
    "704686874": "Vehicle Hunter Cannon",
    "1119518887": "Vehicle Hunter MG",
    "153396725": "Vehicle Hunter Missile",
    "2861067768": "Vehicle Insurgent Minigun",
    "507170720": "Vehicle Khanjali Cannon",
    "2206953837": "Vehicle Khanjali Cannon Heavy",
    "394659298": "Vehicle Khanjali GL",
    "711953949": "Vehicle Khanjali MG",
    "3754621092": "Vehicle Menacer MG",
    "3303022956": "Vehicle Microlight MG",
    "3846072740": "Vehicle Mobileops Cannon",
    "3857952303": "Vehicle Mogul Dual Nose",
    "3123149825": "Vehicle Mogul Dual Turret",
    "4128808778": "Vehicle Mogul Nose",
    "3808236382": "Vehicle Mogul Turret",
    "2220197671": "Vehicle Mule4 MG",
    "1198717003": "Vehicle Mule4 Missile",
    "3708963429": "Vehicle Mule4 Turret GL",
    "2786772340": "Vehicle Nightshark MG",
    "1097917585": "Vehicle Nose Turret Valkyrie",
    "3643944669": "Vehicle Oppressor MG",
    "2344076862": "Vehicle Oppressor Missile",
    "3595383913": "Vehicle Oppressor2 Cannon",
    "3796180438": "Vehicle Oppressor2 MG",
    "1966766321": "Vehicle Oppressor2 Missile",
    "3473446624": "Vehicle Plane Rocket",
    "1186503822": "Vehicle Player Buzzard",
    "3800181289": "Vehicle Player Lazer",
    "1638077257": "Vehicle Player Savage",
    "2456521956": "Vehicle Pounder2 Barrage",
    "2467888918": "Vehicle Pounder2 GL",
    "2263283790": "Vehicle Pounder2 Mini",
    "162065050": "Vehicle Pounder2 Missile",
    "3530961278": "Vehicle Radar",
    "3177079402": "Vehicle Revolter MG",
    "3878337474": "Vehicle Rogue Cannon",
    "158495693": "Vehicle Rogue MG",
    "1820910717": "Vehicle Rogue Missile",
    "50118905": "Vehicle Ruiner Bullet",
    "84788907": "Vehicle Ruiner Rocket",
    "3946965070": "Vehicle Savestra MG",
    "231629074": "Vehicle Scramjet MG",
    "3169388763": "Vehicle Scramjet Missile",
    "1371067624": "Vehicle Seabreeze MG",
    "3450622333": "Vehicle Searchlight",
    "4171469727": "Vehicle Space Rocket",
    "3355244860": "Vehicle Speedo4 MG",
    "3595964737": "Vehicle Speedo4 Turret MG",
    "2667462330": "Vehicle Speedo4 Turret Mini",
    "968648323": "Vehicle Strikeforce Barrage",
    "955522731": "Vehicle Strikeforce Cannon",
    "519052682": "Vehicle Strikeforce Missile",
    "1176362416": "Vehicle Subcar MG",
    "3565779982": "Vehicle Subcar Missile",
    "3884172218": "Vehicle Subcar Torpedo",
    "1744687076": "Vehicle Tampa Dual Minigun",
    "3670375085": "Vehicle Tampa Fixed Minigun",
    "2656583842": "Vehicle Tampa Missile",
    "1015268368": "Vehicle Tampa Mortar",
    "1945616459": "Vehicle Tank",
    "3683206664": "Vehicle Technical Minigun",
    "1697521053": "Vehicle Thruster MG",
    "1177935125": "Vehicle Thruster Missile",
    "2156678476": "Vehicle Trailer Dualaa",
    "341154295": "Vehicle Trailer Missile",
    "1192341548": "Vehicle Trailer Quad MG",
    "2966510603": "Vehicle Tula Dual MG",
    "1217122433": "Vehicle Tula MG",
    "376489128": "Vehicle Tula Minigun",
    "1100844565": "Vehicle Tula Nose MG",
    "3041872152": "Vehicle Turret Boxville",
    "1155224728": "Vehicle Turret Insurgent",
    "729375873": "Vehicle Turret Limo",
    "2144528907": "Vehicle Turret Technical",
    "2756787765": "Vehicle Turret Valkyrie",
    "4094131943": "Vehicle Vigilante MG",
    "1347266149": "Vehicle Vigilante Missile",
    "2275421702": "Vehicle Viseris MG",
    "1150790720": "Vehicle Volatol Dual MG",
    "1741783703": "Vehicle Water Cannon"
};
exports.deathReasons = deathReasons;


/***/ },

/***/ "./source/server/classes/CEFEvent.class.ts"
/*!*************************************************!*\
  !*** ./source/server/classes/CEFEvent.class.ts ***!
  \*************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CefEvent = void 0;
const colorette_1 = __webpack_require__(/*! colorette */ "./node_modules/colorette/index.cjs");
class Cef_Event {
    eventsInMemory = [];
    constructor() {
        this.eventsInMemory = [];
        console.log(`${(0, colorette_1.yellow)("[INFO]")} Cef event handler initialised!`);
    }
    get poolSize() {
        return this.eventsInMemory.length;
    }
    register(page, pointer, handler // Allow any type for handler when page and pointer are provided as strings
    ) {
        if (!this.eventsInMemory.some((event) => event.target === page && event.name === pointer)) {
            const _event = new mp.Event(`server::${page}:${pointer}`, handler);
            this.eventsInMemory.push({ target: page, name: pointer, handler, _event });
            return _event;
        }
        else {
            console.log("------------------------------------------------------------");
            throw new Error(`Event: "${page}", "${pointer}" was found duplicated`);
        }
    }
    startPage(player, pageName) {
        player.call("client::cef:start", [pageName]);
    }
    /**
     * Removes page events that were registered using .register
     * @param page page which you'd like to remove events from
     * @returns void
     */
    remove(page) {
        const targetInEvent = this.eventsInMemory.find((x) => x.target === page);
        if (!targetInEvent)
            return;
        if (targetInEvent._event) {
            targetInEvent._event.destroy();
        }
        this.eventsInMemory.splice(this.eventsInMemory.indexOf(targetInEvent), 1);
    }
    /**
     * Updates page:pointer handler.
     * @param page page name which to update handler from
     * @param pointer page pointer which to update handle
     * @param handler new handle that you'd like to attach
     */
    updateHandler(page, pointer, handler) {
        const index = this.eventsInMemory.findIndex((event) => event.target === page && event.name === pointer);
        if (index !== -1) {
            this.eventsInMemory[index].handler = handler;
        }
    }
    /**
     * Emits a CEF(frontend) event, such as when sending data to a specified page given
     * @example
     * ```
     * Cef_Event.emit(mp.players.at(0), "hud", "setData", {level: 1});
     * ```
     * @param player The player to emit data to
     * @param page Which page to update
     * @param pointer Which pointer to call
     * @param data Data to send
     * @returns void
     */
    emit(player, page, pointer, data) {
        if (!mp.players.exists(player))
            return;
        const eventName = `cef::${page}:${String(pointer)}`;
        return player.call("client::eventManager", [eventName, data]);
    }
    /**
     * Emits a CEF(frontend) event, such as when sending data to a specified page given
     * Same as .emit but supports async
     * @example
     * ```
     * await Cef_Event.emitAsync(mp.players.at(0), "hud", "setData", {level: 1});
     * ```
     * @param player The player to emit data to
     * @param target Which page to update
     * @param pointer Which pointer to call
     * @param obj Data to send
     * @returns void
     */
    async emitAsync(player, target, pointer, obj) {
        if (!mp.players.exists(player))
            return;
        const eventName = `cef::${target}:${String(pointer)}`;
        return player.call("client::eventManager", [eventName, obj]);
    }
}
const CefEvent = new Cef_Event();
exports.CefEvent = CefEvent;


/***/ },

/***/ "./source/server/classes/Command.class.ts"
/*!************************************************!*\
  !*** ./source/server/classes/Command.class.ts ***!
  \************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CommandRegistry = void 0;
const CEFEvent_class_1 = __webpack_require__(/*! ./CEFEvent.class */ "./source/server/classes/CEFEvent.class.ts");
class _CommandRegistry {
    notFoundMessageEnabled;
    _notFoundMessage;
    _commands;
    _aliasToCommand;
    constructor() {
        this.notFoundMessageEnabled = true;
        this._notFoundMessage = "404 not found.";
        this._commands = new Map();
        this._aliasToCommand = new Map();
    }
    // Functions
    commandNotFound(_player, _commandName) {
        if (this.notFoundMessageEnabled) {
            return;
        }
    }
    add(command) {
        if (!command) {
            throw new Error("No command information was passed");
        }
        const { name, aliases = [], adminlevel = 0, description, run } = command;
        if (!name || name.length === 0) {
            throw new Error("Cannot register commands without a name");
        }
        else if (!aliases || !Array.isArray(aliases)) {
            throw new Error("Cannot register commands with non-array aliases property");
        }
        else if (typeof run !== "function") {
            throw new Error("Cannot register commands with non-function run property");
        }
        // Make sure every name exists only once
        const nameLowercase = name.toLowerCase();
        if (this._commands.has(nameLowercase) || this._aliasToCommand.has(nameLowercase)) {
            throw new Error(`A command named "${nameLowercase}" already exists`);
        }
        // Make sure aliases are all lowercase strings
        const fixedAliases = aliases.filter((alias) => typeof alias === "string" && alias.length !== 0).map((alias) => alias.toLowerCase());
        // Register command
        this._commands.set(nameLowercase, {
            name: nameLowercase,
            aliases: fixedAliases,
            adminlevel: adminlevel,
            description: description,
            run
        });
        // Register aliases
        const aliasSet = new Set(fixedAliases);
        for (const alias of aliasSet) {
            if (this._commands.has(alias) || this._aliasToCommand.has(alias)) {
                throw new Error(`A command named "${alias}" already exists`);
            }
            this._aliasToCommand.set(alias, nameLowercase);
        }
    }
    getallCommands() {
        return [...this._commands.values()];
    }
    find(commandName) {
        if (!commandName || commandName.length === 0) {
            throw new Error("Command name cannot be empty");
        }
        commandName = commandName.toLowerCase();
        // Try to find by name
        const command = this._commands.get(commandName);
        if (command) {
            return command;
        }
        // Finding by name failed, try to find by alias
        const aliasCommand = this._aliasToCommand.get(commandName);
        if (!aliasCommand)
            return null;
        return this._commands.get(aliasCommand);
    }
    reloadCommands(player) {
        if (!player || !mp.players.exists(player) || !player.account)
            return;
        const scriptCommands = exports.CommandRegistry.getallCommands();
        const commandList = (player.account.adminlevel ?? 0) <= 0 ? scriptCommands.filter((x) => !x.adminlevel).map((x) => `/${x.name}`) : scriptCommands.map((x) => `/${x.name}`);
        CEFEvent_class_1.CefEvent.emit(player, "chat", "setCommands", commandList);
    }
}
exports.CommandRegistry = new _CommandRegistry();


/***/ },

/***/ "./source/server/classes/Interaction.class.ts"
/*!****************************************************!*\
  !*** ./source/server/classes/Interaction.class.ts ***!
  \****************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InteractionMenu = void 0;
const _api_1 = __webpack_require__(/*! @api */ "./source/server/api/index.ts");
class InteractionMenu {
    player = null;
    acceptEvent = null;
    refuseEvent = null;
    constructor() {
        this.player = null;
        this.acceptEvent = null;
        this.refuseEvent = null;
        this.clearPromiseEvents();
    }
    /**
     * Display interaction menu to a player.
     * @param player the player which to show the interaction menu to
     * @param data Interaction menu data
     * @returns 'id' from the item player selected
     */
    new(player, data) {
        this.player = player;
        player.call("client::cef:start", ["interactionMenu"]);
        _api_1.RAGERP.cef.emit(player, "hud", "setInteraction", data);
        return new Promise((resolve) => {
            if (this.player?.id !== player.id)
                return;
            const onAccept = (player, answer) => {
                if (this.player && this.player.id === player.id) {
                    answer = JSON.parse(answer);
                    this.clearPromiseEvents();
                    resolve(parseInt(answer));
                }
            };
            const onReject = (player, _cef) => {
                console.log("rejected");
                if (!this.player || this.player.id !== player.id)
                    return;
                this.closeMenu(player);
                resolve(null);
            };
            this.setPromiseEvents(onAccept, onReject);
        });
    }
    /**
     * Set events which alter on will be triggered depending what player selects in the interaction menu.
     * @param accept
     * @param reject
     */
    setPromiseEvents(accept, reject) {
        this.acceptEvent = new mp.Event("server::hud:interactResult", accept);
        this.refuseEvent = new mp.Event("client::cef:close", reject);
    }
    /**
     *
     */
    clearPromiseEvents() {
        if (this.acceptEvent)
            this.acceptEvent.destroy();
        if (this.refuseEvent)
            this.refuseEvent.destroy();
    }
    /**
     * Close interaction menu for local player.
     * @returns void
     */
    closeMenu(player) {
        if (!mp.players.exists(player))
            return;
        this.clearPromiseEvents();
        player.call("client::cef:close");
    }
}
exports.InteractionMenu = InteractionMenu;


/***/ },

/***/ "./source/server/classes/NativeMenu.class.ts"
/*!***************************************************!*\
  !*** ./source/server/classes/NativeMenu.class.ts ***!
  \***************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NativeMenu = void 0;
const CEFEvent_class_1 = __webpack_require__(/*! @classes/CEFEvent.class */ "./source/server/classes/CEFEvent.class.ts");
/**
 * Represents a native menu for a player.
 */
class NativeMenu {
    /** The unique identifier for the menu. */
    id;
    /** The header title of the menu. */
    header;
    /** The description of the menu. */
    desc;
    /** The player who owns the menu. */
    player;
    /** The items displayed in the menu. */
    items = [];
    /** The event triggered when an item is selected. */
    onSelectEvent = null;
    /** The event triggered when a checkbox item is changed. */
    onCheckboxEvent = null;
    /** The event triggered when a switch item is toggled. */
    onSwitchEvent = null;
    /**
     * Creates a new NativeMenu instance.
     *
     * @param player - The player who owns the menu.
     * @param id - The unique identifier for the menu.
     * @param header - The header title of the menu.
     * @param desc - The description of the menu.
     * @param items - The items displayed in the menu.
     */
    constructor(player, id, header, desc, items) {
        this.id = id;
        this.header = header;
        this.desc = desc;
        this.items = items;
        this.player = player;
        CEFEvent_class_1.CefEvent.emit(this.player, "nativemenu", "setData", { id: this.id, isActive: true, header: { title: this.header, desc: this.desc }, items: this.items });
        CEFEvent_class_1.CefEvent.startPage(this.player, "nativemenu");
    }
    /**
     * Handles the selection of an item in the menu.
     *
     * @param target - The player who selected the item.
     * @returns A promise that resolves with the selected item's data, or null if the player is not valid.
     */
    onItemSelected(target) {
        return new Promise((res) => {
            if (!this.player || !mp.players.exists(this.player) || this.player.id !== target.id) {
                return;
            }
            this.onSelectEvent = new mp.Event("server::nativemenu:onSelectItem", (player, data) => {
                if (!this.player || this.player.id !== player.id)
                    return;
                res(data);
                this.destroy(player);
            });
        });
    }
    /**
     * Destroys the menu and cleans up associated events.
     *
     * @param player - The player for whom the menu is being destroyed.
     */
    destroy(player) {
        this.onSelectEvent?.destroy();
        this.onCheckboxEvent?.destroy();
        this.onSwitchEvent?.destroy();
        CEFEvent_class_1.CefEvent.emit(player, "nativemenu", "setData", { id: -1, isActive: false, header: { title: "", desc: "" }, items: [] });
        player.call("client::cef:close");
        player.nativemenu = null;
    }
}
exports.NativeMenu = NativeMenu;


/***/ },

/***/ "./source/server/classes/Point.class.ts"
/*!**********************************************!*\
  !*** ./source/server/classes/Point.class.ts ***!
  \**********************************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DynamicPoint = exports.dynamicPointPool = void 0;
const uuid_1 = __webpack_require__(/*! uuid */ "./node_modules/uuid/dist/esm-node/index.js");
exports.dynamicPointPool = [];
class DynamicPoint {
    id;
    position;
    dimension;
    onKeyPress;
    pointShape = null;
    textLabel = null;
    blip = null;
    marker = null;
    /**
     * Creates an instance of DynamicPoint.
     * @param {Vector3} position - The position of the dynamic point.
     * @param {number} range - The range of the point shape.
     * @param {number} dimension - The dimension of the point.
     * @param {IPointHandlers} handlers - The handlers for point events.
     * @param {ILabelData} [label] - Optional label data.
     */
    constructor(position, range, dimension, handlers, label) {
        this.id = (0, uuid_1.v4)();
        this.dimension = dimension || 0;
        this.position = position;
        this.pointShape = mp.colshapes.newSphere(position.x, position.y, position.z, range, this.dimension);
        if (label) {
            this.textLabel = mp.labels.new(label.text, label.position ? label.position : position, {
                ...label.options
            });
        }
        this.pointShape.enterHandler = handlers.enterHandler;
        this.pointShape.exitHandler = handlers.exitHandler;
        this.onKeyPress = handlers.onKeyPress;
        exports.dynamicPointPool.push(this);
    }
    /**
     * Creates a text label.
     * @param {string} text - The text for the label.
     * @param {Vector3} [position] - Optional, if no position is set then the point position will be used.
     * @param {object} [options] - Label options, such as font, color, los, etc.
     * @param {number} [options.font] - The font of the label.
     * @param {RGBA} [options.color] - The color of the label.
     * @param {number} [options.dimension] - The dimension of the label.
     * @param {number} [options.drawDistance] - The draw distance of the label.
     * @param {boolean} [options.los] - Line of sight for the label.
     * @returns {void}
     */
    createLabel(text, position, options) {
        if (this.textLabel && mp.labels.exists(this.textLabel)) {
            this.textLabel.text = text;
            if (position)
                this.textLabel.position = position;
            return;
        }
        this.textLabel = mp.labels.new(text, position ? position : this.position, {
            ...options
        });
    }
    /**
     * Updates the text of the label.
     * @param {string} text - The new text to update the label.
     */
    updateLabel(text) {
        if (this.textLabel && mp.labels.exists(this.textLabel))
            this.textLabel.text = text;
    }
    /**
     * Destroys the label.
     */
    destroyLabel() {
        if (!this.textLabel || !mp.labels.exists(this.textLabel))
            return;
        this.textLabel.destroy();
        this.textLabel = null;
    }
    /**
     * Checks if a dynamic point exists.
     * @param {DynamicPoint} point - The dynamic point to check.
     * @returns {DynamicPoint | undefined} - The found dynamic point or undefined.
     */
    exists(point) {
        return exports.dynamicPointPool.find((x) => x.id === point.id);
    }
    /**
     * Destroys the dynamic point.
     */
    destroy() {
        if (this.pointShape && mp.colshapes.exists(this.pointShape)) {
            this.pointShape.destroy();
            this.pointShape = null;
        }
        if (this.textLabel && mp.labels.exists(this.textLabel)) {
            this.textLabel.destroy();
            this.textLabel = null;
        }
        if (this.marker && mp.markers.exists(this.marker)) {
            this.marker.destroy();
            this.marker = null;
        }
        if (this.blip && mp.blips.exists(this.blip)) {
            this.blip.destroy();
            this.blip = null;
        }
        let point = exports.dynamicPointPool.find((x) => x.id === this.id);
        if (!point)
            return;
        exports.dynamicPointPool.splice(exports.dynamicPointPool.indexOf(point), 1);
    }
    /**
     * Creates a new blip based on the provided data.
     * @param {IBlipData} data - The data used to create the blip.
     */
    createBlip(data) {
        this.blip = mp.blips.new(data.sprite, data.position, data.options);
    }
    /**
     * Destroys the current blip if it exists.
     */
    destroyBlip() {
        if (this.blip && mp.blips.exists(this.blip)) {
            this.blip.destroy();
            this.blip = null;
        }
    }
    /**
     * Creates a new marker based on the provided data.
     * @param {IMarkerData} data - The data used to create the marker.
     */
    createMarker(data) {
        this.marker = mp.markers.new(data.type, data.position, data.scale, data.options);
    }
    /**
     * Destroys the current marker if it exists.
     */
    destroyMarker() {
        if (this.marker && mp.markers.exists(this.marker)) {
            this.marker.destroy();
            this.marker = null;
        }
    }
    /**
     * Gets the nearest dynamic point to a player.
     * @param {PlayerMp} player - The player to check proximity.
     * @returns {DynamicPoint | null} - The nearest dynamic point or null if none found.
     */
    static getNearestPoint(player) {
        let found_point = null;
        for (let i = 0; i < exports.dynamicPointPool.length; i++) {
            let point = exports.dynamicPointPool[i];
            if (!point.pointShape || !mp.colshapes.exists(point.pointShape))
                continue;
            if (player.dimension === point.dimension && point.pointShape.isPointWithin(player.position)) {
                found_point = point;
                break;
            }
        }
        return found_point;
    }
    /**
     * Creates a new dynamic point.
     * @param {Vector3} position - The position of the dynamic point.
     * @param {number} range - The range of the point shape.
     * @param {number} dimension - The dimension of the point.
     * @param {IPointHandlers} handlers - The handlers for point events.
     * @param {ILabelData} [label] - Optional label data.
     * @returns {DynamicPoint} - The created dynamic point.
     */
    static new(position, range, dimension, handlers, label) {
        return new DynamicPoint(position, range, dimension, handlers, label);
    }
}
exports.DynamicPoint = DynamicPoint;


/***/ },

/***/ "./source/server/classes/Vehicle.class.ts"
/*!************************************************!*\
  !*** ./source/server/classes/Vehicle.class.ts ***!
  \************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.vehicleManager = exports.Vehicle = exports.vehiclePool = void 0;
const uuid_1 = __webpack_require__(/*! uuid */ "./node_modules/uuid/dist/esm-node/index.js");
const _api_1 = __webpack_require__(/*! @api */ "./source/server/api/index.ts");
const Vehicle_assets_1 = __webpack_require__(/*! @assets/Vehicle.assets */ "./source/server/assets/Vehicle.assets.ts");
const Vehicle_entity_1 = __webpack_require__(/*! @entities/Vehicle.entity */ "./source/server/database/entity/Vehicle.entity.ts");
const defaultVehicleData = {
    locked: false,
    engine: false,
    numberplate: "",
    fuel: 50,
    keyhole: (0, uuid_1.v4)(),
    sqlid: null,
    faction: null,
    primaryColor: [255, 255, 255],
    secondaryColor: [255, 255, 255],
    owner: null,
    ownerName: null,
    trunkState: false,
    hoodState: false,
    price: 0,
    inventory: null,
    impoundState: 0
};
const defaultVehicleMods = {
    tunningMods: {},
    plateColor: 0,
    wheelType: -1,
    wheelMod: 0,
    neonColor: null,
    hasNeon: false,
    primaryColorType: 0,
    secondaryColorType: 0,
    smokecolor: { r: 255, g: 255, b: 255 },
    dashboardcolor: 0,
    interiorcolor: 0,
    dirtlevel: 0,
    windows: { 0: false, 1: false, 2: false, 3: false }
};
/** A list of all vehicles. */
const vehiclePool = [];
exports.vehiclePool = vehiclePool;
class Vehicle {
    /** The type of the vehicle. */
    type;
    /** The vehicle object from the game engine. */
    _vehicle;
    /** Data associated with the vehicle. */
    _data = defaultVehicleData;
    /** Modifications applied to the vehicle. */
    _mods = defaultVehicleMods;
    /** Indicates if the vehicle is wanted by the police. */
    isWanted = false;
    /** The type of tyre used by the vehicle. */
    tyre_type;
    /**
     * Creates an instance of Vehicle.
     * @param {RageShared.Vehicles.Enums.VEHICLETYPES} type - The type of the vehicle.
     * @param {string | number} model - The model of the vehicle.
     * @param {Vector3} position - The position where the vehicle spawns.
     * @param {number} heading - The heading (direction) the vehicle faces.
     * @param {number} dimension - The dimension in which the vehicle exists.
     * @param {RageShared.Vehicles.Interfaces.IVehicleData} [data=defaultVehicleData] - The data associated with the vehicle.
     * @param {RageShared.Vehicles.Interfaces.IVehicleMods | null} [mods=null] - The modifications applied to the vehicle.
     */
    constructor(type, model, position, heading, dimension, data = defaultVehicleData, mods = null) {
        this._vehicle = mp.vehicles.new(typeof model === "string" ? mp.joaat(model) : model, position, {
            dimension,
            numberPlate: data.numberplate ?? "",
            locked: data.locked,
            engine: data.engine,
            heading: heading,
            color: [data.primaryColor, data.secondaryColor]
        });
        this.type = type;
        this._data = data;
        this._mods = mods ? mods : defaultVehicleMods;
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const value = data[key];
                this.setData(key, value);
            }
        }
        for (const key in this._mods) {
            if (this._mods.hasOwnProperty(key)) {
                const value = this._mods[key];
                this.setMod(key, value);
            }
        }
        if (this.isValid()) {
            this.createMods();
        }
        vehiclePool.push(this);
    }
    /**
     * Sets a modification on the vehicle.
     * @param {keyof RageShared.Vehicles.Interfaces.IVehicleMods} key - The key of the modification.
     * @param {RageShared.Vehicles.Interfaces.IVehicleMods[keyof RageShared.Vehicles.Interfaces.IVehicleMods]} value - The value of the modification.
     */
    setMod(key, value) {
        this._mods[key] = value;
        if (this._vehicle && mp.vehicles.exists(this._vehicle)) {
            if (key !== "tunningMods") {
                this._vehicle.setVariable(key, value);
            }
            if (key === "windows") {
                mp.players.callInRange(this._vehicle.position, mp.config["stream-distance"], "client::vehicle:setWindowState", [this._vehicle.id, value]);
            }
            if (key === "dirtlevel") {
                mp.players.callInRange(this._vehicle.position, mp.config["stream-distance"], "client::vehicle:setDirtLevel", [this._vehicle.id, value]);
            }
        }
    }
    /**
     * Gets a modification from the vehicle.
     * @param {keyof RageShared.Vehicles.Interfaces.IVehicleMods} key - The key of the modification.
     * @returns {RageShared.Vehicles.Interfaces.IVehicleMods[keyof RageShared.Vehicles.Interfaces.IVehicleMods]} - The value of the modification.
     */
    getMod(key) {
        return this._mods[key];
    }
    /**
     * Gets data from the vehicle.
     * @param {keyof RageShared.Vehicles.Interfaces.IVehicleData} key - The key of the data.
     * @returns {RageShared.Vehicles.Interfaces.IVehicleData[keyof RageShared.Vehicles.Interfaces.IVehicleData]} - The value of the data.
     */
    getData(key) {
        return this._data[key];
    }
    /**
     * Sets data on the vehicle.
     * @param {keyof RageShared.Vehicles.Interfaces.IVehicleData} key - The key of the data.
     * @param {RageShared.Vehicles.Interfaces.IVehicleData[keyof RageShared.Vehicles.Interfaces.IVehicleData]} value - The value of the data.
     */
    setData(key, value) {
        if (!this._vehicle || !mp.vehicles.exists(this._vehicle))
            return;
        console.log(`[VEHICLEDATA]:: ${this._vehicle.id} setting ${key} to ${value}`);
        this._data[key] = value;
        this._vehicle.setVariable(key, value);
        switch (key) {
            case "engine": {
                this._vehicle.engine = typeof value === "boolean" ? value : false;
                break;
            }
            case "locked": {
                this._vehicle.locked = typeof value === "boolean" ? value : false;
                break;
            }
            case "hoodState": {
                mp.players.callInRange(this._vehicle.position, mp.config["stream-distance"], "client::vehicle:setHoodState", [this._vehicle.id, value]);
                break;
            }
            case "trunkState": {
                mp.players.callInRange(this._vehicle.position, mp.config["stream-distance"], "client::vehicle:setTrunkState", [this._vehicle.id, value]);
                break;
            }
            case "primaryColor": {
                this._vehicle.setColorRGB(...this.getData("primaryColor"), ...this._vehicle.getColorRGB(1));
                break;
            }
            case "secondaryColor": {
                this._vehicle.setColorRGB(...this._vehicle.getColorRGB(0), ...this.getData("secondaryColor"));
                break;
            }
            case "numberplate": {
                this._vehicle.numberPlate = value;
                break;
            }
            default: {
                break;
            }
        }
    }
    /**
     * Gets the model of the vehicle.
     * @returns {number} - The model of the vehicle.
     */
    getId() {
        if (!this._vehicle || !mp.vehicles.exists(this._vehicle))
            return null;
        return this._vehicle.id;
    }
    /**
     * Gets the model of the vehicle.
     * @returns {number} - The model of the vehicle.
     */
    getModel() {
        if (!this._vehicle || !mp.vehicles.exists(this._vehicle))
            return 0;
        return this._vehicle.model;
    }
    /**
     * Gets the type of the vehicle.
     * @returns {RageShared.Vehicles.Enums.VEHICLETYPES} - The type of the vehicle.
     */
    getType() {
        return this.type;
    }
    /**
     * Gets the model name of the vehicle.
     * @param {PlayerMp} player - The player requesting the model name.
     * @returns {Promise<string | null>} - The model name of the vehicle.
     */
    async getModelName(player) {
        if (!this._vehicle || !mp.vehicles.exists(this._vehicle))
            return null;
        let result = await player.callProc("client::proc:getVehicleModelName", [this._vehicle.id]);
        return result;
    }
    /**
     * Gets the passengers of the vehicle.
     * @param {number} vehicleModelHash - The model hash requesting data.
     * @returns {number} - The number of passengers the vehicle can hold.
     */
    getPassengers(vehicleModelHash) {
        const vehicleData = Vehicle_assets_1.vehicleModelSeats.find((x) => x.vehicleHash === vehicleModelHash);
        return vehicleData?.seats ?? 0;
    }
    /**
     * Gets the faction of the vehicle.
     * @returns {string | null} - The faction of the vehicle.
     */
    getFaction() {
        if (!this._vehicle || !mp.vehicles.exists(this._vehicle))
            return null;
        if (this.type !== 2 /* RageShared.Vehicles.Enums.VEHICLETYPES.FACTION */)
            return null;
        return this._data.faction;
    }
    /**
     * Gets the owner name of vehicle.
     * @returns {string | null} - The owner of the vehicle.
     */
    getOwner() {
        if (!this._vehicle || !mp.vehicles.exists(this._vehicle))
            return null;
        if (this.type !== 1 /* RageShared.Vehicles.Enums.VEHICLETYPES.OWNED */)
            return null;
        return this._data.ownerName;
    }
    /**
     * Gets the SQL ID of the vehicle.
     * @returns {number | null} - The SQL ID of the vehicle.
     */
    getSQL() {
        if (!this._vehicle || !mp.vehicles.exists(this._vehicle))
            return null;
        return this._data.sqlid;
    }
    /**
     * Checks if the vehicle is valid.
     * @returns {boolean} - Whether the vehicle is valid.
     */
    isValid() {
        return ![
            5 /* RageShared.Vehicles.Enums.VEHICLETYPES.ADMIN */,
            3 /* RageShared.Vehicles.Enums.VEHICLETYPES.RENTAL */,
            4 /* RageShared.Vehicles.Enums.VEHICLETYPES.JOB */,
            0 /* RageShared.Vehicles.Enums.VEHICLETYPES.NONE */
        ].includes(this.type);
    }
    /**
     * Destroys the vehicle.
     */
    destroy() {
        if (this._vehicle && mp.vehicles.exists(this._vehicle)) {
            this._vehicle.destroy();
        }
        const findIndex = vehiclePool.indexOf(this);
        if (findIndex !== -1) {
            vehiclePool.splice(findIndex, 1);
        }
    }
    /**
     * Sets the modification color of the vehicle.
     */
    setModColor() {
        if (!this._vehicle || !mp.vehicles.exists(this._vehicle))
            return;
        mp.players.forEachInRange(this._vehicle.position, mp.config["stream-distance"], (entity) => {
            if (entity && mp.players.exists(entity) && entity.getVariable("loggedin")) {
                entity.call("client::vehicle:setModColor", [this._vehicle.id]);
            }
        });
    }
    /**
     * Applies vehicle modifications.
     */
    createMods() {
        try {
            if (!mp.vehicles.exists(this._vehicle))
                return;
            this._vehicle.neonEnabled = false;
            this._vehicle.windowTint = 0;
            for (let i = 0; i < 80; i++)
                this._vehicle.setMod(i, -1);
            if (this._mods.plateColor !== null && typeof this._mods.plateColor === "number") {
                this._vehicle.numberPlateType = this._mods.plateColor;
            }
            if (this._mods.wheelType !== null && typeof this._mods.wheelType === "number") {
                this._vehicle.wheelType = this._mods.wheelType;
            }
            if (this._mods.hasNeon && this._mods.neonColor) {
                this._vehicle.setNeonColor(...this._mods.neonColor);
            }
            if (this._data.primaryColor) {
                let [oldr, oldg, oldb] = this._vehicle.getColorRGB(1);
                this._vehicle.setColorRGB(this._data.primaryColor[0], this._data.primaryColor[1], this._data.primaryColor[2], oldr, oldg, oldb);
            }
            if (this._data.secondaryColor) {
                let [oldr, oldg, oldb] = this._vehicle.getColorRGB(0);
                this._vehicle.setColorRGB(oldr, oldg, oldb, this._data.secondaryColor[0], this._data.secondaryColor[1], this._data.secondaryColor[2]);
            }
            this.setModColor();
            if (this._mods.tunningMods) {
                let vehiclemods = this._mods.tunningMods;
                for (let tune in vehiclemods) {
                    const modIndex = parseInt(tune);
                    if (isNaN(modIndex))
                        continue;
                    if (modIndex >= 100)
                        continue;
                    if (modIndex === 18)
                        this._vehicle.setVariable("boost", 1.3);
                    if (modIndex === 55 /* RageShared.Vehicles.Enums.VEHICLEMODS.WINDOW_TINT */) {
                        this._vehicle.windowTint = vehiclemods[modIndex];
                    }
                    else
                        this._vehicle.setMod(parseInt(tune), vehiclemods[modIndex]);
                }
            }
        }
        catch (err) {
            console.log("createMods err: ", err);
        }
    }
    /**
     * Sets a single tuning mod (native mod index 0–48, etc.). Updates tunningMods and applies on server + notifies clients.
     */
    setTuningMod(modIndex, value) {
        if (!this._vehicle || !mp.vehicles.exists(this._vehicle))
            return;
        if (modIndex < 0 || modIndex >= 100)
            return;
        if (!this._mods.tunningMods)
            this._mods.tunningMods = {};
        this._mods.tunningMods[modIndex] = value;
        if (modIndex === 18)
            this._vehicle.setVariable("boost", value === 1 ? 1.3 : 0);
        if (modIndex === 55 /* RageShared.Vehicles.Enums.VEHICLEMODS.WINDOW_TINT */) {
            this._vehicle.windowTint = value;
        }
        else {
            this._vehicle.setMod(modIndex, value);
        }
        mp.players.callInRange(this._vehicle.position, mp.config["stream-distance"], "client::vehicle:applyTuningMod", [
            this._vehicle.id,
            modIndex,
            value
        ]);
    }
    /**
     * Returns current tuning mods (tunningMods object) for UI.
     */
    getTuningMods() {
        return this._mods.tunningMods ? { ...this._mods.tunningMods } : {};
    }
    /**
     * Reloads the modifications on the vehicle.
     */
    reloadMods() {
        this.createMods();
    }
    /**
     * Gets an item slot component by its hash key.
     * @param {string} hashKey - The hash key of the item.
     * @returns {{ slot: number; item: any } | null} - The item slot component.
     */
    getItemSlotComponentByHash(hashKey) {
        const inventory = this.getData("inventory");
        if (!inventory)
            return null;
        let foundItem = null;
        for (const [key, value] of Object.entries(inventory)) {
            if (!value.hash)
                continue;
            if (value.hash === hashKey) {
                foundItem = { slot: parseInt(key), item: value };
                break;
            }
        }
        return foundItem;
    }
    /**
     * Inserts a vehicle into the database.
     * @param {VehicleMp} vehicle - The vehicle to insert.
     * @param {string} modelName - The model name of the vehicle.
     * @param {number} price - The price of the vehicle.
     */
    async insertVehicle(vehicle, modelName, price) {
        const serverVehicle = vehicleManager.at(vehicle.id);
        if (!serverVehicle)
            return;
        let vehicleEntity = new Vehicle_entity_1.VehicleEntity();
        vehicleEntity.modelname = modelName;
        vehicleEntity.class = Vehicle_assets_1.vehicleClasses.find((x) => x.vehicleHash === vehicle.model)?.vehicleClass ?? 0;
        vehicleEntity.fuel = serverVehicle.getData("fuel");
        vehicleEntity.price = price;
        vehicleEntity.primaryColor = vehicle.getColorRGB(0);
        vehicleEntity.secondaryColor = vehicle.getColorRGB(1);
        vehicleEntity.owner_id = serverVehicle.getData("owner");
        vehicleEntity.owner_name = serverVehicle.getData("ownerName");
        vehicleEntity.model = vehicle.model;
        vehicleEntity.plate = vehicle.numberPlate;
        vehicleEntity.is_locked = vehicle.locked ? 1 : 0;
        vehicleEntity.dimension = vehicle.dimension;
        vehicleEntity.isWanted = serverVehicle.isWanted ? 1 : 0;
        vehicleEntity.position = { x: vehicle.position.x, y: vehicle.position.y, z: vehicle.position.z, a: vehicle.heading };
        vehicleEntity.keyhole = serverVehicle.getData("keyhole");
        vehicleEntity.modifications = { 18: -1 };
        await _api_1.RAGERP.database.getRepository(Vehicle_entity_1.VehicleEntity).save(vehicleEntity);
    }
    /**
     * Checks if a vehicle class is a windowed vehicle.
     * @param {number} vehicleClass - The class of the vehicle.
     * @returns {boolean} - Whether the vehicle class is windowed.
     */
    isWindowedVehicle(vehicleClass) {
        return ![
            14 /* RageShared.Vehicles.Enums.VEHICLE_CLASS.BOATS */,
            13 /* RageShared.Vehicles.Enums.VEHICLE_CLASS.CYCLES */,
            11 /* RageShared.Vehicles.Enums.VEHICLE_CLASS.UTILITY */,
            8 /* RageShared.Vehicles.Enums.VEHICLE_CLASS.MOTORCYCLES */,
            22 /* RageShared.Vehicles.Enums.VEHICLE_CLASS.OPEN_WHEEL */
        ].includes(vehicleClass);
    }
}
exports.Vehicle = Vehicle;
const vehicleManager = {
    /**
     * Saves the vehicle to the database.
     * @param {VehicleMp} vehicle - The vehicle to save.
     */
    async saveVehicle(vehicle) {
        const serverVehicle = vehicleManager.at(vehicle.id);
        if (!serverVehicle || !serverVehicle.isValid() || !serverVehicle._vehicle || !mp.vehicles.exists(serverVehicle._vehicle))
            return;
        const vehicleSQL = serverVehicle.getData("sqlid");
        if (vehicleSQL === null)
            return;
        await _api_1.RAGERP.database.getRepository(Vehicle_entity_1.VehicleEntity).update({ id: vehicleSQL }, {
            owner_id: serverVehicle.getData("owner"),
            owner_name: serverVehicle.getData("ownerName"),
            model: serverVehicle._vehicle.model,
            fuel: serverVehicle.getData("fuel"),
            plate: serverVehicle.getData("numberplate"),
            neon: serverVehicle._mods.hasNeon ? 1 : 0,
            neonColor: serverVehicle._mods.neonColor ? serverVehicle._mods.neonColor : [255, 255, 255],
            primaryColor: serverVehicle.getData("primaryColor"),
            secondaryColor: serverVehicle.getData("secondaryColor"),
            plate_color: serverVehicle._mods.plateColor ?? 0,
            is_locked: serverVehicle.getData("locked") ? 1 : 0,
            dimension: vehicle.dimension,
            isWanted: serverVehicle.isWanted ? 1 : 0,
            position: { x: vehicle.position.x, y: vehicle.position.y, z: vehicle.position.z, a: vehicle.heading },
            wheelmods: {
                color: 0,
                mod: serverVehicle._mods.wheelMod,
                type: serverVehicle._mods.wheelType
            },
            modifications: serverVehicle.getMod("tunningMods"),
            primaryColorType: serverVehicle.getMod("primaryColorType"),
            secondaryColorType: serverVehicle.getMod("secondaryColorType"),
            keyhole: serverVehicle.getData("keyhole"),
            impoundState: serverVehicle.getData("impoundState")
        });
    },
    /**
     * Finds a vehicle by ragemp vehicle api ID.
     * @param {number} id - The ID of the vehicle.
     * @returns {Vehicle | null} - The found vehicle or null.
     */
    at(id) {
        let foundvehicle = null;
        for (const vehicle of vehiclePool) {
            if (vehicle._vehicle && mp.vehicles.exists(vehicle._vehicle) && vehicle._vehicle.id === id) {
                foundvehicle = vehicle;
                break;
            }
        }
        return foundvehicle;
    },
    /**
     * Finds a vehicle by its SQL ID.
     * @param {number} id - The SQL ID of the vehicle.
     * @returns {Vehicle | null} - The found vehicle or null.
     */
    atSQL(id) {
        let foundvehicle = null;
        for (const vehicle of vehiclePool) {
            if (vehicle._vehicle && mp.vehicles.exists(vehicle._vehicle) && vehicle.getData("sqlid") === id) {
                foundvehicle = vehicle;
                break;
            }
        }
        return foundvehicle;
    },
    /**
     * Checks if a vehicle is in the world.
     * @param {number} id - The ID of the vehicle.
     * @param {boolean} [isOwned=false] - Whether the vehicle is owned.
     * @returns {VehicleMp | null} - The found vehicle or null.
     */
    isInWorld(id, isOwned = false) {
        const vehicle = vehicleManager.atSQL(id);
        if (vehicle && vehicle._vehicle)
            return vehicle._vehicle;
        return null;
    },
    /**
     * Gets the nearest vehicle to a player within a certain radius.
     * @param {PlayerMp} player - The player to find the nearest vehicle to.
     * @param {number} radius - The radius to search within.
     * @returns {Vehicle | null} - The nearest vehicle or null.
     */
    getNearest(player, radius) {
        for (const vehicle of vehiclePool) {
            if (vehicle && vehicle._vehicle && mp.vehicles.exists(vehicle._vehicle)) {
                if (_api_1.RAGERP.utils.distanceToPos(player.position, vehicle._vehicle.position) > radius)
                    continue;
                return vehicle;
            }
        }
        return null;
    }
};
exports.vehicleManager = vehicleManager;


/***/ },

/***/ "./source/server/commands/Admin.commands.ts"
/*!**************************************************!*\
  !*** ./source/server/commands/Admin.commands.ts ***!
  \**************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const _api_1 = __webpack_require__(/*! @api */ "./source/server/api/index.ts");
const Account_entity_1 = __webpack_require__(/*! @entities/Account.entity */ "./source/server/database/entity/Account.entity.ts");
const Admin_asset_1 = __webpack_require__(/*! @assets/Admin.asset */ "./source/server/assets/Admin.asset.ts");
const AdminLog_manager_1 = __webpack_require__(/*! ../admin/AdminLog.manager */ "./source/server/admin/AdminLog.manager.ts");
const Report_event_1 = __webpack_require__(/*! @events/Report.event */ "./source/server/serverevents/Report.event.ts");
const Player_event_1 = __webpack_require__(/*! @events/Player.event */ "./source/server/serverevents/Player.event.ts");
_api_1.RAGERP.commands.add({
    name: "goto",
    adminlevel: 1 /* RageShared.Enums.ADMIN_LEVELS.LEVEL_ONE */,
    run: (player, fulltext, targetorpos) => {
        const showAvailableLocations = () => {
            _api_1.RAGERP.chat.sendSyntaxError(player, "/goto [player/location]");
            const keys = Object.keys(Admin_asset_1.adminTeleports);
            for (let i = 0; i < keys.length; i += 8) {
                const chunk = keys.slice(i, i + 8);
                player.outputChatBox(`${"!{#ffd200}" /* RageShared.Enums.STRINGCOLORS.YELLOW */}Available locations: ${"!{#afafaf}" /* RageShared.Enums.STRINGCOLORS.GREY */} ${chunk.join(", ")}`);
            }
        };
        if (!fulltext.length || !targetorpos.length) {
            showAvailableLocations();
            return;
        }
        const targetplayer = mp.players.getPlayerByName(targetorpos);
        if (targetplayer && mp.players.exists(targetplayer)) {
            player.position = targetplayer.position;
            player.dimension = targetplayer.dimension;
            player.showNotify("info" /* RageShared.Enums.NotifyType.TYPE_INFO */, `You teleported to ${targetplayer.name}`);
        }
        else {
            const targetpos = Admin_asset_1.adminTeleports[targetorpos];
            if (targetpos) {
                player.position = targetpos;
                player.showNotify("info" /* RageShared.Enums.NotifyType.TYPE_INFO */, `You teleported to ${targetorpos}`);
            }
            else {
                showAvailableLocations();
            }
        }
    }
});
_api_1.RAGERP.commands.add({
    name: "gethere",
    adminlevel: 1 /* RageShared.Enums.ADMIN_LEVELS.LEVEL_ONE */,
    run: (player, fulltext, target) => {
        if (!fulltext.length || !target.length) {
            return _api_1.RAGERP.chat.sendSyntaxError(player, "/gethere [player]");
        }
        const targetplayer = mp.players.getPlayerByName(target);
        if (!targetplayer || !mp.players.exists(targetplayer)) {
            return player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "Player not found");
        }
        targetplayer.position = player.position;
        targetplayer.dimension = player.dimension;
        targetplayer.showNotify("info" /* RageShared.Enums.NotifyType.TYPE_INFO */, `${player.name} teleported you to them`);
        player.showNotify("info" /* RageShared.Enums.NotifyType.TYPE_INFO */, `You teleported ${targetplayer.name} to you`);
    }
});
_api_1.RAGERP.commands.add({
    name: "giveclothes",
    adminlevel: 6 /* RageShared.Enums.ADMIN_LEVELS.LEVEL_SIX */,
    run: (player, fulltext, target, item, comp, drawable, texture) => {
        player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "Inventory system has been removed.");
    }
});
_api_1.RAGERP.commands.add({
    name: "giveitem",
    adminlevel: 6 /* RageShared.Enums.ADMIN_LEVELS.LEVEL_SIX */,
    run: (player, fulltext, target, item, count) => {
        player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "Inventory system has been removed.");
    }
});
_api_1.RAGERP.commands.add({
    name: "spawnitem",
    adminlevel: 6 /* RageShared.Enums.ADMIN_LEVELS.LEVEL_SIX */,
    run: async (player) => {
        player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "Inventory system has been removed.");
    }
});
_api_1.RAGERP.commands.add({
    name: "listplayers",
    aliases: ["players", "online"],
    adminlevel: 1 /* RageShared.Enums.ADMIN_LEVELS.LEVEL_ONE */,
    description: "List all online players",
    run: (player) => {
        player.outputChatBox(`${"!{#32cd32}" /* RageShared.Enums.STRINGCOLORS.GREEN */}____________[ONLINE PLAYERS]____________`);
        mp.players.forEach((p) => {
            if (p && mp.players.exists(p)) {
                const charName = p.character?.name ?? "N/A";
                player.outputChatBox(`ID ${p.id} | ${p.name} | ${charName} | Ping: ${p.ping} | Dim: ${p.dimension}`);
            }
        });
        player.outputChatBox(`${"!{#32cd32}" /* RageShared.Enums.STRINGCOLORS.GREEN */}Total: ${mp.players.length} players`);
    }
});
_api_1.RAGERP.commands.add({
    name: "setadmin",
    description: "Set a player's admin level (0-6). Need level 6 to use arena_mark/arena_save.",
    adminlevel: 6 /* RageShared.Enums.ADMIN_LEVELS.LEVEL_SIX */,
    run: async (player, _fulltext, targetName, levelStr) => {
        if (!targetName || levelStr === undefined)
            return _api_1.RAGERP.chat.sendSyntaxError(player, "/setadmin [username] [0-6]");
        const level = parseInt(levelStr, 10);
        if (isNaN(level) || level < 0 || level > 6)
            return player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "Level must be 0-6.");
        const repo = _api_1.RAGERP.database.getRepository(Account_entity_1.AccountEntity);
        const account = await repo.findOne({ where: { username: targetName.toLowerCase() } });
        if (!account)
            return player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "Account not found.");
        account.adminlevel = level;
        await repo.save(account);
        const target = mp.players.getPlayerByName(targetName);
        if (target && mp.players.exists(target) && target.account)
            target.account.adminlevel = level;
        if (target && mp.players.exists(target))
            target.setVariable("adminLevel", level);
        player.showNotify("success" /* RageShared.Enums.NotifyType.TYPE_SUCCESS */, `${targetName} admin level set to ${level}.`);
    }
});
_api_1.RAGERP.commands.add({
    name: "esp",
    description: "Toggle ESP overlay: /esp [0=off,1=players,2=all]",
    adminlevel: 1 /* RageShared.Enums.ADMIN_LEVELS.LEVEL_ONE */,
    run: (player, _fulltext, modeStr) => {
        const mode = Math.max(0, Math.min(2, parseInt(modeStr ?? "0", 10) || 0));
        player.call("Admin-ToggleESP", [mode]);
        player.showNotify("info" /* RageShared.Enums.NotifyType.TYPE_INFO */, mode > 0 ? `ESP enabled (${mode === 1 ? "players" : "players + vehicles"})` : "ESP disabled");
    }
});
_api_1.RAGERP.commands.add({
    name: "gm",
    description: "Toggle admin godmode for yourself.",
    adminlevel: 1 /* RageShared.Enums.ADMIN_LEVELS.LEVEL_ONE */,
    run: (player) => {
        const current = player.getVariable("AGM");
        const next = !current;
        player.setVariable("AGM", next);
        player.call("Admin-SetGM", [next]);
        player.showNotify("info" /* RageShared.Enums.NotifyType.TYPE_INFO */, `Godmode ${next ? "enabled" : "disabled"}`);
    }
});
_api_1.RAGERP.commands.add({
    name: "inv",
    description: "Toggle admin invisibility for yourself.",
    adminlevel: 1 /* RageShared.Enums.ADMIN_LEVELS.LEVEL_ONE */,
    run: (player) => {
        const alpha = player.alpha ?? 255;
        const nextAlpha = alpha === 0 ? 255 : 0;
        player.alpha = nextAlpha;
        player.setVariable("invisible", nextAlpha === 0);
        player.showNotify("info" /* RageShared.Enums.NotifyType.TYPE_INFO */, `Invisibility ${nextAlpha === 0 ? "enabled" : "disabled"}`);
    }
});
_api_1.RAGERP.commands.add({
    name: "aspec",
    description: "Spectate a player by ID: /aspec [id]",
    adminlevel: 1 /* RageShared.Enums.ADMIN_LEVELS.LEVEL_ONE */,
    run: (player, _fulltext, targetIdStr) => {
        const id = parseInt(targetIdStr ?? "", 10);
        if (isNaN(id)) {
            return _api_1.RAGERP.chat.sendSyntaxError(player, "/aspec [id]");
        }
        const target = mp.players.at(id);
        if (!target || !mp.players.exists(target)) {
            return player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "Player not found.");
        }
        if (target.id === player.id) {
            return player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "You can't spectate yourself.");
        }
        (0, Player_event_1.startSpectate)(player, target);
        player.showNotify("info" /* RageShared.Enums.NotifyType.TYPE_INFO */, `Now spectating ${target.name} (#${target.id})`);
    }
});
_api_1.RAGERP.commands.add({
    name: "aspecoff",
    description: "Stop spectating.",
    adminlevel: 1 /* RageShared.Enums.ADMIN_LEVELS.LEVEL_ONE */,
    run: (player) => {
        if (!player.getVariable("isSpectating")) {
            return player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "You are not spectating.");
        }
        (0, Player_event_1.stopSpectate)(player);
        player.showNotify("info" /* RageShared.Enums.NotifyType.TYPE_INFO */, "Spectate stopped.");
    }
});
_api_1.RAGERP.commands.add({
    name: "admglog",
    description: "Show recent damage logs for a player: /admglog [id]",
    adminlevel: 1 /* RageShared.Enums.ADMIN_LEVELS.LEVEL_ONE */,
    run: (player, _fulltext, targetIdStr) => {
        const id = parseInt(targetIdStr ?? "", 10);
        if (isNaN(id)) {
            return _api_1.RAGERP.chat.sendSyntaxError(player, "/admglog [id]");
        }
        const target = mp.players.at(id);
        if (!target || !mp.players.exists(target)) {
            return player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "Player not found.");
        }
        const logs = (0, AdminLog_manager_1.getRecentDamageLogsFor)(target, 20);
        if (!logs.length) {
            return player.showNotify("info" /* RageShared.Enums.NotifyType.TYPE_INFO */, `No damage logs found for ${target.name}.`);
        }
        player.outputChatBox(`${"!{#ffd200}" /* RageShared.Enums.STRINGCOLORS.YELLOW */}[DMG LOG] Last ${logs.length} hits for ${target.name}:`);
        logs.forEach((e) => {
            const when = new Date(e.timestamp).toLocaleTimeString();
            player.outputChatBox(`${"!{#afafaf}" /* RageShared.Enums.STRINGCOLORS.GREY */}${when} | ${e.attackerName} -> ${e.victimName} | dmg ${e.damage.toFixed(1)} | dist ${e.distance.toFixed(1)} | arena: ${e.inArena ? "Y" : "N"}`);
        });
    }
});
_api_1.RAGERP.commands.add({
    name: "akilllog",
    description: "Show recent kill logs for a player: /akilllog [id]",
    adminlevel: 1 /* RageShared.Enums.ADMIN_LEVELS.LEVEL_ONE */,
    run: (player, _fulltext, targetIdStr) => {
        const id = parseInt(targetIdStr ?? "", 10);
        if (isNaN(id)) {
            return _api_1.RAGERP.chat.sendSyntaxError(player, "/akilllog [id]");
        }
        const target = mp.players.at(id);
        if (!target || !mp.players.exists(target)) {
            return player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "Player not found.");
        }
        const logs = (0, AdminLog_manager_1.getRecentKillLogsFor)(target, 20);
        if (!logs.length) {
            return player.showNotify("info" /* RageShared.Enums.NotifyType.TYPE_INFO */, `No kill logs found for ${target.name}.`);
        }
        player.outputChatBox(`${"!{#ffd200}" /* RageShared.Enums.STRINGCOLORS.YELLOW */}[KILL LOG] Last ${logs.length} deaths/kills for ${target.name}:`);
        logs.forEach((e) => {
            const when = new Date(e.timestamp).toLocaleTimeString();
            const killer = e.killerName ?? "N/A";
            player.outputChatBox(`${"!{#afafaf}" /* RageShared.Enums.STRINGCOLORS.GREY */}${when} | ${killer} -> ${e.victimName} | arena: ${e.inArena ? "Y" : "N"} | reason: ${e.reason ?? -1}`);
        });
    }
});
_api_1.RAGERP.commands.add({
    name: "report",
    description: "Open report panel to submit or view your reports",
    run: (player) => {
        if (!player.getVariable?.("loggedin"))
            return player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "You must be logged in.");
        (0, Report_event_1.openReportPanel)(player);
    }
});
_api_1.RAGERP.commands.add({
    name: "reports",
    adminlevel: 1 /* RageShared.Enums.ADMIN_LEVELS.LEVEL_ONE */,
    description: "Open staff reports panel",
    run: (player) => (0, Report_event_1.openStaffPanel)(player)
});


/***/ },

/***/ "./source/server/commands/ArenaDev.commands.ts"
/*!*****************************************************!*\
  !*** ./source/server/commands/ArenaDev.commands.ts ***!
  \*****************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
const fs = __importStar(__webpack_require__(/*! fs */ "fs"));
const path = __importStar(__webpack_require__(/*! path */ "path"));
const _api_1 = __webpack_require__(/*! @api */ "./source/server/api/index.ts");
const ArenaPresets_asset_1 = __webpack_require__(/*! @arena/ArenaPresets.asset */ "./source/server/arena/ArenaPresets.asset.ts");
const Arena_module_1 = __webpack_require__(/*! @arena/Arena.module */ "./source/server/arena/Arena.module.ts");
let attachEditorEditing = false;
const ATTACHMENTS_FILE = path.join(process.cwd(), "attachments.txt");
const arenaMarkedPresets = new Map();
const ADMIN_DEV = 6 /* RageShared.Enums.ADMIN_LEVELS.LEVEL_SIX */;
_api_1.RAGERP.commands.add({
    name: "pos",
    description: "Print current position (x, y, z, heading, dimension)",
    adminlevel: ADMIN_DEV,
    run: (player) => {
        const { x, y, z } = player.position;
        const heading = player.heading;
        const dim = player.dimension;
        player.outputChatBox(`Position: x=${x.toFixed(2)} y=${y.toFixed(2)} z=${z.toFixed(2)} heading=${heading.toFixed(2)} dimension=${dim}`);
        console.log(`[POS] ${player.name}: x=${x} y=${y} z=${z} heading=${heading} dimension=${dim}`);
    }
});
_api_1.RAGERP.commands.add({
    name: "tp",
    aliases: ["tpc"],
    description: "Teleport to x y z",
    adminlevel: ADMIN_DEV,
    run: (player, _fulltext, x, y, z) => {
        if (!x || !y || !z)
            return _api_1.RAGERP.chat.sendSyntaxError(player, "/tp <x> <y> <z>");
        const px = parseFloat(x);
        const py = parseFloat(y);
        const pz = parseFloat(z);
        if (isNaN(px) || isNaN(py) || isNaN(pz))
            return player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "Invalid coordinates.");
        player.position = new mp.Vector3(px, py, pz);
        player.showNotify("success" /* RageShared.Enums.NotifyType.TYPE_SUCCESS */, `Teleported to ${px.toFixed(1)}, ${py.toFixed(1)}, ${pz.toFixed(1)}`);
    }
});
_api_1.RAGERP.commands.add({
    name: "anim",
    description: "Play animation: /anim [dict] [name]",
    adminlevel: ADMIN_DEV,
    run: (player, _fulltext, dict, name) => {
        if (!dict || !name)
            return _api_1.RAGERP.chat.sendSyntaxError(player, "/anim [dict] [name]");
        player.playAnimation(dict, name, 1, 1);
        player.showNotify("success" /* RageShared.Enums.NotifyType.TYPE_SUCCESS */, `Animation ${dict}/${name} playing.`);
    }
});
_api_1.RAGERP.commands.add({
    name: "anims",
    description: "Stop current animation",
    adminlevel: ADMIN_DEV,
    run: (player) => {
        player.stopAnimation();
        player.showNotify("success" /* RageShared.Enums.NotifyType.TYPE_SUCCESS */, "Animation stopped.");
    }
});
_api_1.RAGERP.commands.add({
    name: "giveweapon",
    aliases: ["givewep"],
    description: "Give weapon: /giveweapon [name] (e.g. weapon_pistol)",
    adminlevel: ADMIN_DEV,
    run: (player, _fulltext, weaponName) => {
        if (!weaponName || !weaponName.trim())
            return _api_1.RAGERP.chat.sendSyntaxError(player, "/giveweapon [name]");
        const hash = mp.joaat(weaponName.trim().toLowerCase());
        if (hash === 0)
            return player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "Invalid weapon name.");
        player.giveWeapon(hash, 999);
        const current = player.getVariable("weaponsOnBody") || [];
        if (!current.includes(hash)) {
            current.push(hash);
            player.setVariable("weaponsOnBody", current);
        }
        player.showNotify("success" /* RageShared.Enums.NotifyType.TYPE_SUCCESS */, `Weapon ${weaponName} given.`);
    }
});
_api_1.RAGERP.commands.add({
    name: "d",
    aliases: ["die", "kill"],
    description: "Kill yourself (for testing)",
    adminlevel: ADMIN_DEV,
    run: (player) => {
        player.health = 0;
        player.showNotify("info" /* RageShared.Enums.NotifyType.TYPE_INFO */, "You died.");
    }
});
_api_1.RAGERP.commands.add({
    name: "mydim",
    description: "Set your own dimension (setdim is admin command for others)",
    adminlevel: ADMIN_DEV,
    run: (player, _fulltext, id) => {
        if (!id)
            return _api_1.RAGERP.chat.sendSyntaxError(player, "/mydim <id>");
        const dim = parseInt(id, 10);
        if (isNaN(dim) || dim < 0)
            return player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "Invalid dimension ID.");
        player.dimension = dim;
        player.showNotify("success" /* RageShared.Enums.NotifyType.TYPE_SUCCESS */, `Dimension set to ${dim}`);
    }
});
const hopoutsMarkCmd = {
    name: "arena_mark",
    aliases: ["hopouts_mark"],
    description: "Mark a point for Hopouts location (e.g. /arena_mark vespucci_canal center)",
    adminlevel: ADMIN_DEV,
    run: (player, _fulltext, presetId, markType) => {
        if (!presetId || !markType)
            return _api_1.RAGERP.chat.sendSyntaxError(player, "/arena_mark <locationId> <center|redspawn|bluespawn|redcar|bluecar|safenode>");
        const type = markType.toLowerCase();
        const valid = ["center", "redspawn", "bluespawn", "redcar", "bluecar", "safenode"];
        if (!valid.includes(type))
            return player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, `Invalid type. Use: ${valid.join(", ")}`);
        let preset = arenaMarkedPresets.get(presetId);
        if (!preset) {
            preset = { safeNodes: [] };
            arenaMarkedPresets.set(presetId, preset);
        }
        const { x, y, z } = player.position;
        const heading = player.heading;
        if (type === "safenode") {
            preset.safeNodes = preset.safeNodes || [];
            preset.safeNodes.push({ x, y, z });
            player.showNotify("success" /* RageShared.Enums.NotifyType.TYPE_SUCCESS */, `[${presetId}] safenode #${preset.safeNodes.length} marked`);
        }
        else {
            const point = { x, y, z, heading };
            if (type === "center")
                preset.center = point;
            else if (type === "redspawn")
                preset.redspawn = point;
            else if (type === "bluespawn")
                preset.bluespawn = point;
            else if (type === "redcar")
                preset.redcar = point;
            else if (type === "bluecar")
                preset.bluecar = point;
            player.showNotify("success" /* RageShared.Enums.NotifyType.TYPE_SUCCESS */, `[${presetId}] ${type} marked`);
        }
    }
};
_api_1.RAGERP.commands.add(hopoutsMarkCmd);
_api_1.RAGERP.commands.add({
    name: "arena_export",
    description: "Export Hopouts location preset as JSON",
    adminlevel: ADMIN_DEV,
    run: (player, _fulltext, presetId) => {
        if (!presetId)
            return _api_1.RAGERP.chat.sendSyntaxError(player, "/arena_export <presetId>");
        const preset = arenaMarkedPresets.get(presetId);
        if (!preset)
            return player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, `No points marked for preset "${presetId}". Use /arena_mark first.`);
        const exportObj = {
            id: presetId,
            center: preset.center,
            redSpawn: preset.redspawn,
            blueSpawn: preset.bluespawn,
            redCar: preset.redcar,
            blueCar: preset.bluecar,
            safeNodes: preset.safeNodes && preset.safeNodes.length > 0 ? preset.safeNodes : undefined
        };
        const json = JSON.stringify(exportObj, null, 2);
        console.log(`\n--- Hopouts location: ${presetId} ---\n${json}\n---`);
        player.outputChatBox(`${"!{#32cd32}" /* RageShared.Enums.STRINGCOLORS.GREEN */}[${presetId}] Exported. Check server console for JSON.`);
    }
});
const hopoutsSaveCmd = {
    name: "arena_save",
    aliases: ["hopouts_save"],
    description: "Save Hopouts location (e.g. /arena_save vespucci_canal \"Vespucci Canal\")",
    adminlevel: ADMIN_DEV,
    run: (player, _fulltext, presetId, presetName) => {
        if (!presetId)
            return _api_1.RAGERP.chat.sendSyntaxError(player, "/arena_save <locationId> [displayName]");
        const preset = arenaMarkedPresets.get(presetId);
        if (!preset)
            return player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, `No points marked for preset "${presetId}". Use /arena_mark first.`);
        if (!preset.center || !preset.redspawn || !preset.bluespawn || !preset.redcar || !preset.bluecar) {
            return player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "Mark center, redspawn, bluespawn, redcar, bluecar first.");
        }
        const name = (presetName && presetName.trim().replace(/"/g, "")) || presetId;
        const toSave = {
            id: presetId,
            name,
            center: preset.center,
            redSpawn: preset.redspawn,
            blueSpawn: preset.bluespawn,
            redCar: preset.redcar,
            blueCar: preset.bluecar,
            safeNodes: preset.safeNodes && preset.safeNodes.length > 0 ? preset.safeNodes : undefined
        };
        if ((0, ArenaPresets_asset_1.saveArenaPreset)(toSave)) {
            player.showNotify("success" /* RageShared.Enums.NotifyType.TYPE_SUCCESS */, `Hopouts location "${name}" saved.`);
        }
        else {
            player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "Failed to save Hopouts location.");
        }
    }
};
_api_1.RAGERP.commands.add(hopoutsSaveCmd);
_api_1.RAGERP.commands.add({
    name: "hopouts_locations",
    aliases: ["arena_locations"],
    description: "List available Hopouts locations",
    run: (player) => {
        const presets = (0, ArenaPresets_asset_1.getArenaPresets)();
        if (presets.length === 0) {
            return player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "No Hopouts locations. Use /arena_mark and /arena_save to create.");
        }
        const list = presets.map((p) => `${p.name} (${p.id})`).join(", ");
        player.outputChatBox(`${"!{#32cd32}" /* RageShared.Enums.STRINGCOLORS.GREEN */}Hopouts locations: ${list}`);
    }
});
_api_1.RAGERP.commands.add({
    name: "hopouts_solo",
    aliases: ["arena_solo"],
    description: "Start a solo Hopouts match for testing (no queue)",
    adminlevel: ADMIN_DEV,
    run: (player, _fulltext, presetId) => {
        if (!player.character)
            return player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "No character loaded.");
        if ((0, Arena_module_1.startSoloMatch)(player, presetId?.trim() || undefined)) {
            player.showNotify("success" /* RageShared.Enums.NotifyType.TYPE_SUCCESS */, "Solo Hopouts match started.");
        }
        else {
            player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "Cannot start. Already in match, or no Hopouts locations. Use /arena_mark and /arena_save first.");
        }
    }
});
// Attachments editor (based on https://github.com/1PepeCortez/Attachments-editor)
_api_1.RAGERP.commands.add({
    name: "attach",
    description: "Start attach editor: /attach [object_name] (e.g. prop_cs_beer_bot_02)",
    adminlevel: ADMIN_DEV,
    run: (player, _fulltext, objectName) => {
        if (attachEditorEditing)
            return player.outputChatBox("!{#ff0000}Already editing an object!");
        if (!objectName || !objectName.trim())
            return player.outputChatBox("!{#ff0000}/attach [object_name]");
        player.call("attachObject", [objectName.trim()]);
        attachEditorEditing = true;
    }
});
mp.events.add("startEditAttachServer", () => {
    attachEditorEditing = true;
});
mp.events.add("finishAttach", (player, objectJson) => {
    attachEditorEditing = false;
    try {
        const data = JSON.parse(objectJson);
        if (data.cancel === true)
            return;
        const line = `[ '${data.bodyName}', ${data.boneIndex}, '${data.object}', ${data.body}, ${data.x.toFixed(4)}, ${data.y.toFixed(4)}, ${data.z.toFixed(4)}, ${data.rx.toFixed(4)}, ${data.ry.toFixed(4)}, ${data.rz.toFixed(4)} ],\r\n`;
        player.outputChatBox(line);
        fs.appendFile(ATTACHMENTS_FILE, line, (err) => {
            if (err)
                console.error("[AttachEditor] Failed to save:", err.message);
        });
    }
    catch {
        // ignore parse errors
    }
});


/***/ },

/***/ "./source/server/commands/Dev.commands.ts"
/*!************************************************!*\
  !*** ./source/server/commands/Dev.commands.ts ***!
  \************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const _api_1 = __webpack_require__(/*! @api */ "./source/server/api/index.ts");
const NativeMenu_class_1 = __webpack_require__(/*! @classes/NativeMenu.class */ "./source/server/classes/NativeMenu.class.ts");
_api_1.RAGERP.commands.add({
    name: "gotopos",
    description: "Teleport to a x y z",
    adminlevel: 6 /* RageShared.Enums.ADMIN_LEVELS.LEVEL_SIX */,
    run: (player, fulltext, x, y, z) => {
        if (!fulltext.length || !x.length || !y.length || !z.length)
            return player.outputChatBox("Usage: /gotopos [x] [y] [z]");
        player.position = new mp.Vector3(parseFloat(x), parseFloat(y), parseFloat(z));
    }
});
_api_1.RAGERP.commands.add({
    name: "savepos",
    aliases: ["getpos", "mypos"],
    adminlevel: 6 /* RageShared.Enums.ADMIN_LEVELS.LEVEL_SIX */,
    run: (player) => {
        const [{ x, y, z }, heading] = [player.position, player.heading];
        console.log(`Position: new mp.Vector3(${x}, ${y}, ${z})`);
        console.log(`Heading: ${heading}`);
    }
});
_api_1.RAGERP.commands.add({
    name: "settime",
    adminlevel: 6 /* RageShared.Enums.ADMIN_LEVELS.LEVEL_SIX */,
    run: (player, fulltext, time) => {
        mp.world.time.set(parseInt(time), 0, 0);
    }
});
_api_1.RAGERP.commands.add({
    name: "sethealth",
    adminlevel: 6 /* RageShared.Enums.ADMIN_LEVELS.LEVEL_SIX */,
    run: (player, fulltext, health) => {
        player.health = parseInt(health);
    }
});
_api_1.RAGERP.commands.add({
    name: "clearinventory",
    adminlevel: 6 /* RageShared.Enums.ADMIN_LEVELS.LEVEL_SIX */,
    run: (player, fulltext, targetid) => {
        player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "Inventory system has been removed.");
    }
});
// RAGERP.commands.add({
//     name: "giveweapon",
//     adminlevel: RageShared.Enums.ADMIN_LEVELS.LEVEL_SIX,
//     run: (player: PlayerMp, fulltext, weapon: RageShared.Inventory.Enums.ITEM_TYPES) => {
//         if (!player.character || !player.character.inventory) return;
//         const itemData = player.character.inventory.addItem(weapon);
//         if (!itemData || itemData.typeCategory !== RageShared.Inventory.Enums.ITEM_TYPE_CATEGORY.TYPE_WEAPON) return;
//         player.showNotify(
//             itemData ? RageShared.Enums.NotifyType.TYPE_SUCCESS : RageShared.Enums.NotifyType.TYPE_ERROR,
//             itemData ? `You received a ${itemData.name}` : `An error occurred giving u the item.`
//         );
//     }
// });
_api_1.RAGERP.commands.add({
    name: "setpage",
    adminlevel: 6 /* RageShared.Enums.ADMIN_LEVELS.LEVEL_SIX */,
    run: (player, fulltext, pagename) => {
        _api_1.RAGERP.cef.emit(player, "system", "setPage", pagename);
    }
});
_api_1.RAGERP.commands.add({
    name: "reloadclientside",
    adminlevel: 6 /* RageShared.Enums.ADMIN_LEVELS.LEVEL_SIX */,
    run: (player) => {
        //@ts-ignore
        mp.players.reloadResources();
    }
});
_api_1.RAGERP.commands.add({
    name: "testbbb",
    adminlevel: 6 /* RageShared.Enums.ADMIN_LEVELS.LEVEL_SIX */,
    run: (player) => {
        //@ts-ignore
        player.call("testcambro");
    }
});
_api_1.RAGERP.commands.add({
    name: "testnativemenu",
    adminlevel: 6 /* RageShared.Enums.ADMIN_LEVELS.LEVEL_SIX */,
    run: async (player) => {
        player.nativemenu = new NativeMenu_class_1.NativeMenu(player, 0, "Hello World", "This is a description", [
            { name: "test", type: 0 /* RageShared.Enums.NATIVEMENU_TYPES.TYPE_DEFAULT */, uid: 123 },
            { name: "test 2", type: 0 /* RageShared.Enums.NATIVEMENU_TYPES.TYPE_DEFAULT */, uid: 1232 },
            { name: "test 3", type: 0 /* RageShared.Enums.NATIVEMENU_TYPES.TYPE_DEFAULT */, uid: 1232 }
        ]);
        player.nativemenu.onItemSelected(player).then((res) => {
            if (!res)
                return player.nativemenu?.destroy(player);
            const data = _api_1.RAGERP.utils.parseObject(res);
            console.log("onItemSelected called, with result: ", data);
            switch (data.listitem) {
                case 0: {
                    console.log("player selected the first item in native menu");
                    return;
                }
                default: {
                    return console.log(`player selected index ${data.listitem} | name: ${data.name} | uid: ${data.uid}`);
                }
            }
        });
    }
});
_api_1.RAGERP.commands.add({
    name: "testitem",
    adminlevel: 6 /* RageShared.Enums.ADMIN_LEVELS.LEVEL_SIX */,
    run: async (player) => {
        player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "Inventory system has been removed.");
    }
});
_api_1.RAGERP.commands.add({
    adminlevel: 6 /* RageShared.Enums.ADMIN_LEVELS.LEVEL_SIX */,
    name: "testattach",
    run: (player, fullText, item, isAttach) => {
        player.attachObject(item, parseInt(isAttach) !== 0);
    }
});
/** Spawn ped bots for testing (target practice, damage, etc.). Peds are not invincible and can be shot. */
const BOT_PED_MODELS = ["a_m_m_skater_01", "a_m_y_skater_01", "s_m_m_armoured_01", "a_m_m_beachvesp_01", "a_m_m_beachvesp_02"];
_api_1.RAGERP.commands.add({
    name: "bot",
    description: "Spawn ped bots near you for testing. Usage: /bot [count 1-5]",
    adminlevel: 1 /* RageShared.Enums.ADMIN_LEVELS.LEVEL_ONE */,
    run: (player, _fulltext, countStr) => {
        const count = Math.min(5, Math.max(1, parseInt(countStr || "1", 10) || 1));
        const rad = (player.heading * Math.PI) / 180;
        const dist = 2.5;
        for (let i = 0; i < count; i++) {
            const model = BOT_PED_MODELS[i % BOT_PED_MODELS.length];
            const modelHash = mp.joaat(model);
            const offset = (i - (count - 1) / 2) * 1.2;
            const px = player.position.x - Math.sin(rad) * dist + Math.cos(rad) * offset;
            const py = player.position.y + Math.cos(rad) * dist + Math.sin(rad) * offset;
            const pos = new mp.Vector3(px, py, player.position.z);
            const ped = mp.peds.new(modelHash, pos, {
                heading: (player.heading + 180) % 360,
                dimension: player.dimension,
                invincible: false,
                frozen: true
            });
            if (ped && mp.peds.exists(ped)) {
                ped.setVariable("isBot", true);
            }
        }
        player.showNotify("success" /* RageShared.Enums.NotifyType.TYPE_SUCCESS */, `Spawned ${count} bot ped(s). You can shoot them for testing.`);
    }
});


/***/ },

/***/ "./source/server/commands/Freeroam.commands.ts"
/*!*****************************************************!*\
  !*** ./source/server/commands/Freeroam.commands.ts ***!
  \*****************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const _api_1 = __webpack_require__(/*! @api */ "./source/server/api/index.ts");
const Weapons_assets_1 = __webpack_require__(/*! @assets/Weapons.assets */ "./source/server/assets/Weapons.assets.ts");
/**
 * Freeroam mode: players can set their own dimension, spawn vehicles, and spawn weapons for FFA.
 */
_api_1.RAGERP.commands.add({
    name: "freeroam",
    aliases: ["ffa", "fr"],
    description: "Show freeroam commands",
    run: (player) => {
        player.outputChatBox(`${"!{#32cd32}" /* RageShared.Enums.STRINGCOLORS.GREEN */}--- Freeroam / FFA ---`);
        player.outputChatBox(`${"!{#ffffff}" /* RageShared.Enums.STRINGCOLORS.WHITE */}/fdim <id> - Set your dimension (private instance)`);
        player.outputChatBox(`${"!{#ffffff}" /* RageShared.Enums.STRINGCOLORS.WHITE */}/fveh <model> - Spawn vehicle (e.g. sultan, infernus)`);
        player.outputChatBox(`${"!{#ffffff}" /* RageShared.Enums.STRINGCOLORS.WHITE */}/fgun <weapon> - Give weapon (e.g. pistol, assaultrifle)`);
        player.outputChatBox(`${"!{#ffffff}" /* RageShared.Enums.STRINGCOLORS.WHITE */}/poligon - Teleport to shooting range`);
    }
});
const SHOOTING_RANGE_POS = new mp.Vector3(821.5705, -2163.812, 29.656);
_api_1.RAGERP.commands.add({
    name: "poligon",
    aliases: ["shootingrange", "range"],
    description: "Teleport to shooting range (45 targets, Assault Rifle + Carbine Rifle)",
    run: (player) => {
        if (!player.getVariable("loggedin"))
            return player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "You must be logged in.");
        const weapons = [Weapons_assets_1.weaponHash.assaultrifle, Weapons_assets_1.weaponHash.carbinerifle];
        weapons.forEach((w) => player.giveWeaponEx(w, 1000, 30));
        player.setVariable("weaponsOnBody", weapons);
        player.position = SHOOTING_RANGE_POS;
        player.call("client::shootingrange:start");
        player.showNotify("success" /* RageShared.Enums.NotifyType.TYPE_SUCCESS */, "Shooting range started! Hit 45 targets.");
    }
});
mp.events.add("FinishedPoligon", (player, points) => {
    player.showNotify("success" /* RageShared.Enums.NotifyType.TYPE_SUCCESS */, `Shooting range complete! Score: ${points} points`);
});
_api_1.RAGERP.commands.add({
    name: "fdim",
    aliases: ["dimension"],
    description: "Set your dimension (private instance for you and your group)",
    run: (player, _fulltext, id) => {
        if (!player.getVariable("loggedin"))
            return player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "You must be logged in.");
        if (!id)
            return _api_1.RAGERP.chat.sendSyntaxError(player, "/fdim <id>");
        const dim = parseInt(id, 10);
        if (isNaN(dim) || dim < 0)
            return player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "Invalid dimension ID (use 0 or positive number).");
        player.dimension = dim;
        player.showNotify("success" /* RageShared.Enums.NotifyType.TYPE_SUCCESS */, `Dimension set to ${dim}`);
    }
});
_api_1.RAGERP.commands.add({
    name: "fveh",
    aliases: ["fcar"],
    description: "Spawn a vehicle (e.g. /fveh sultan, /fveh infernus)",
    run: (player, _fulltext, model) => {
        if (!player.getVariable("loggedin"))
            return player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "You must be logged in.");
        if (!model || !model.trim())
            return _api_1.RAGERP.chat.sendSyntaxError(player, "/fveh <model>");
        const modelName = model.trim().toLowerCase().replace(/^vehicle_/, "");
        const hash = mp.joaat(modelName);
        if (hash === 0 || hash === mp.joaat("null")) {
            return player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, `Unknown vehicle model: ${model}`);
        }
        const vehicle = new _api_1.RAGERP.entities.vehicles.new(6 /* RageShared.Vehicles.Enums.VEHICLETYPES.FREEROAM */, modelName, player.position, player.heading, player.dimension);
        player.showNotify("success" /* RageShared.Enums.NotifyType.TYPE_SUCCESS */, `Spawned ${modelName}`);
    }
});
_api_1.RAGERP.commands.add({
    name: "fgun",
    aliases: ["fweapon", "gun", "wep"],
    description: "Give yourself a weapon (e.g. /fgun pistol, /gun assaultrifle)",
    run: (player, _fulltext, weaponName) => {
        if (!player.getVariable("loggedin"))
            return player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "You must be logged in.");
        if (!weaponName || !weaponName.trim())
            return _api_1.RAGERP.chat.sendSyntaxError(player, "/fgun <weapon>");
        const name = weaponName.trim().toLowerCase().replace(/^weapon_/, "").replace(/\s+/g, "_").replace(/-/g, "_");
        const hash = Weapons_assets_1.weaponHash[name] ?? mp.joaat(`weapon_${name}`);
        if (!hash || hash === mp.joaat("weapon_unarmed")) {
            return player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, `Unknown weapon: ${weaponName}. Try: pistol, smg, assaultrifle, shotgun, sniperrifle`);
        }
        const ammo = 999;
        player.giveWeaponEx(hash, ammo, 30);
        const current = player.getVariable("weaponsOnBody") || [];
        if (!current.includes(hash)) {
            current.push(hash);
            player.setVariable("weaponsOnBody", current);
        }
        player.showNotify("success" /* RageShared.Enums.NotifyType.TYPE_SUCCESS */, `Gave ${weaponName}`);
    }
});


/***/ },

/***/ "./source/server/commands/Player.commands.ts"
/*!***************************************************!*\
  !*** ./source/server/commands/Player.commands.ts ***!
  \***************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const _api_1 = __webpack_require__(/*! @api */ "./source/server/api/index.ts");
const utils_module_1 = __webpack_require__(/*! @shared/utils.module */ "./source/shared/utils.module.ts");
_api_1.RAGERP.commands.add({
    name: "me",
    run: (player, fulltext) => {
        if (!fulltext.length)
            return _api_1.RAGERP.chat.sendSyntaxError(player, "/me [action text]");
        player.setEmoteText([194, 162, 218, 255], `** ${fulltext}`, 7);
        _api_1.RAGERP.chat.sendNearbyMessage(player.position, 15, `!{#C2A2DA}** ${player.getRoleplayName()} ${fulltext}`);
    }
});
_api_1.RAGERP.commands.add({
    name: "w",
    aliases: ["whisper"],
    run: (player, fulltext, targetid, ...text) => {
        if (!fulltext.length || !targetid.length)
            return _api_1.RAGERP.chat.sendSyntaxError(player, "/w(hisper) [playerid] [message]");
        const target = mp.players.getPlayerByName(targetid);
        if (!target || !mp.players.exists(target) || !target.getVariable("loggedin"))
            return player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "Invalid player specified.");
        if (target.id === player.id)
            return player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "You can't whisper yourself.");
        if (utils_module_1.Utils.distanceToPos(player.position, target.position) > 2.5)
            return player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "That player is far away from you.");
        player.setEmoteText([194, 162, 218, 255], `* mutters something to ${target.getRoleplayName()}`, 7);
        _api_1.RAGERP.chat.sendNearbyMessage(player.position, 15, `!{#C2A2DA}** ${player.getRoleplayName()} whispers something to ${target.getRoleplayName()}`);
        player.outputChatBox(`!{#FFFF00}Whisper to: ${target.getRoleplayName()}: ${text.join(" ")}`);
        target.outputChatBox(`!{#FFFF00}${player.getRoleplayName()} whispers: ${text.join(" ")}`);
    }
});
_api_1.RAGERP.commands.add({
    name: "do",
    run: (player, fulltext) => {
        if (!fulltext.length)
            return _api_1.RAGERP.chat.sendSyntaxError(player, "/do [describe action text]");
        player.setEmoteText([194, 162, 218, 255], `** ${fulltext}`, 7);
        _api_1.RAGERP.chat.sendNearbyMessage(player.position, 15, `!{#C2A2DA}** ${fulltext} ((${player.getRoleplayName()}))`);
    }
});
_api_1.RAGERP.commands.add({
    name: "b",
    description: "Local ooc chat",
    run: (player, fulltext) => {
        if (!fulltext.length)
            return _api_1.RAGERP.chat.sendSyntaxError(player, "/b [message]");
        _api_1.RAGERP.chat.sendNearbyMessage(player.position, 15, `!{#afafaf}(( ${player.name} [${player.id}]: ${fulltext} ))`);
    }
});
_api_1.RAGERP.commands.add({
    name: "shout",
    aliases: ["s"],
    description: "Shoutout a message",
    run: (player, fulltext) => {
        if (!fulltext.length)
            return _api_1.RAGERP.chat.sendSyntaxError(player, "/s(hout) [text]");
        player.setEmoteText([255, 255, 255, 255], `(Shouts) ${fulltext}!`, 5);
        _api_1.RAGERP.chat.sendNearbyMessage(player.position, 20.0, `${player.getRoleplayName()} shouts: ${fulltext}!`);
    }
});


/***/ },

/***/ "./source/server/commands/index.ts"
/*!*****************************************!*\
  !*** ./source/server/commands/index.ts ***!
  \*****************************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
__webpack_require__(/*! ./Admin.commands */ "./source/server/commands/Admin.commands.ts");
__webpack_require__(/*! ./Dev.commands */ "./source/server/commands/Dev.commands.ts");
__webpack_require__(/*! ./Player.commands */ "./source/server/commands/Player.commands.ts");
__webpack_require__(/*! ./ArenaDev.commands */ "./source/server/commands/ArenaDev.commands.ts");
__webpack_require__(/*! ./Freeroam.commands */ "./source/server/commands/Freeroam.commands.ts");


/***/ },

/***/ "./source/server/database/Database.module.ts"
/*!***************************************************!*\
  !*** ./source/server/database/Database.module.ts ***!
  \***************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MainDataSource = void 0;
__webpack_require__(/*! reflect-metadata */ "reflect-metadata");
const fs = __importStar(__webpack_require__(/*! fs */ "fs"));
const path = __importStar(__webpack_require__(/*! path */ "path"));
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const Account_entity_1 = __webpack_require__(/*! ./entity/Account.entity */ "./source/server/database/entity/Account.entity.ts");
const Character_entity_1 = __webpack_require__(/*! ./entity/Character.entity */ "./source/server/database/entity/Character.entity.ts");
const Logger_module_1 = __webpack_require__(/*! ./Logger.module */ "./source/server/database/Logger.module.ts");
const Ban_entity_1 = __webpack_require__(/*! ./entity/Ban.entity */ "./source/server/database/entity/Ban.entity.ts");
const dotenv = __importStar(__webpack_require__(/*! dotenv */ "dotenv"));
const Vehicle_entity_1 = __webpack_require__(/*! ./entity/Vehicle.entity */ "./source/server/database/entity/Vehicle.entity.ts");
const Bank_entity_1 = __webpack_require__(/*! @entities/Bank.entity */ "./source/server/database/entity/Bank.entity.ts");
const WeaponPreset_entity_1 = __webpack_require__(/*! ./entity/WeaponPreset.entity */ "./source/server/database/entity/WeaponPreset.entity.ts");
dotenv.config();
// Ensure log directory exists so the database logger can write (server runs from ragemp-server folder)
const dblogsDir = path.resolve(process.cwd(), "dblogs");
if (!fs.existsSync(dblogsDir)) {
    fs.mkdirSync(dblogsDir, { recursive: true });
}
let beta = true;
const config = {
    connectionLimit: 100,
    connectTimeout: 60 * 60 * 1000,
    acquireTimeout: 60 * 60 * 1000,
    timeout: 60 * 60 * 1000,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: !beta ? process.env.DB_BETA_PASSWORD : process.env.DB_PASS,
    database: process.env.DB_DATABASE,
    port: 5432
};
const loggerConfig = {
    queryLogFilePath: "./dblogs/query-log.log",
    errorLogFilePath: "./dblogs/error.log",
    defaultLogFilePath: "./dblogs/default-log.log"
};
exports.MainDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: config.host,
    port: config.port,
    username: config.user,
    password: config.password,
    database: config.database,
    synchronize: true,
    connectTimeoutMS: config.connectTimeout,
    logging: ["error"],
    entities: [Account_entity_1.AccountEntity, Character_entity_1.CharacterEntity, Bank_entity_1.BankAccountEntity, Ban_entity_1.BanEntity, Vehicle_entity_1.VehicleEntity, WeaponPreset_entity_1.WeaponPresetEntity],
    migrations: [],
    subscribers: [],
    logger: Logger_module_1.DatabaseLogger.getInstance(loggerConfig)
});


/***/ },

/***/ "./source/server/database/Logger.module.ts"
/*!*************************************************!*\
  !*** ./source/server/database/Logger.module.ts ***!
  \*************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DatabaseLogger = void 0;
const fs = __importStar(__webpack_require__(/*! fs */ "fs"));
const createFile = (filename) => {
    fs.open(filename, "r", (err, fd) => {
        if (err) {
            fs.writeFile(filename, "", (err) => {
                if (err)
                    console.log(err);
                else
                    console.log("The file was saved!");
            });
        }
        else {
            console.log("The file exists!");
        }
    });
};
const saveFile = (name, log) => {
    fs.appendFile("" + name + ".log", `${log}\n`, (err) => {
        if (err) {
            createFile(name);
            return console.log(err);
        }
    });
};
class DatabaseLogger {
    static instance;
    config;
    constructor(config) {
        this.config = config;
    }
    static getInstance(config) {
        if (!DatabaseLogger.instance) {
            DatabaseLogger.instance = new DatabaseLogger(config);
        }
        return DatabaseLogger.instance;
    }
    logQuery(query, parameters, queryRunner) {
        const logMessage = `-------------------------------------------------------------------------\n\Query: ${query}\nParameters: ${parameters}\n-------------------------------------------------------------------------\n`;
        try {
            fs.appendFileSync(this.config.queryLogFilePath, logMessage);
        }
        catch (err) {
            createFile(this.config.queryLogFilePath);
        }
    }
    logQueryError(error, query, parameters, queryRunner) {
        const logMessage = `-------------------------------------------------------------------------\nDate: [${new Date()}]\nQuery: ${query}\nParameters: ${parameters}\n${error}\n-------------------------------------------------------------------------\n`;
        try {
            fs.appendFileSync(this.config.errorLogFilePath, logMessage);
        }
        catch (err) {
            createFile(this.config.errorLogFilePath);
        }
    }
    logQuerySlow(time, query, parameters, queryRunner) {
        // throw new Error('Method not implemented.');
    }
    logSchemaBuild(message, queryRunner) {
        // throw new Error('Method not implemented.');
    }
    logMigration(message, queryRunner) {
        // throw new Error('Method not implemented.');
    }
    log(level, message, queryRunner) {
        const logMessage = `${level} | ${message} | ${queryRunner}\n`;
        try {
            fs.appendFileSync(this.config.defaultLogFilePath, logMessage);
        }
        catch (err) {
            createFile(this.config.defaultLogFilePath);
        }
    }
}
exports.DatabaseLogger = DatabaseLogger;


/***/ },

/***/ "./source/server/database/entity/Account.entity.ts"
/*!*********************************************************!*\
  !*** ./source/server/database/entity/Account.entity.ts ***!
  \*********************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AccountEntity = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const Character_entity_1 = __webpack_require__(/*! ./Character.entity */ "./source/server/database/entity/Character.entity.ts");
let AccountEntity = class AccountEntity {
    id;
    adminlevel = 0;
    username;
    password;
    email;
    socialClubId;
    characters;
};
exports.AccountEntity = AccountEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], AccountEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", width: 11, default: 0 }),
    __metadata("design:type", Number)
], AccountEntity.prototype, "adminlevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 32 }),
    __metadata("design:type", String)
], AccountEntity.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 129 }),
    __metadata("design:type", String)
], AccountEntity.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 52 }),
    __metadata("design:type", String)
], AccountEntity.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 52 }),
    __metadata("design:type", String)
], AccountEntity.prototype, "socialClubId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Character_entity_1.CharacterEntity, (char) => char.account),
    __metadata("design:type", Array)
], AccountEntity.prototype, "characters", void 0);
exports.AccountEntity = AccountEntity = __decorate([
    (0, typeorm_1.Entity)({ name: "accounts" })
], AccountEntity);


/***/ },

/***/ "./source/server/database/entity/Ban.entity.ts"
/*!*****************************************************!*\
  !*** ./source/server/database/entity/Ban.entity.ts ***!
  \*****************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BanEntity = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
let BanEntity = class BanEntity {
    id;
    ip;
    rsgId;
    username;
    serial;
    reason;
    bannedBy;
    bannedByLevel;
    lifttime;
};
exports.BanEntity = BanEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], BanEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255, nullable: true, default: null }),
    __metadata("design:type", String)
], BanEntity.prototype, "ip", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255, nullable: true, default: null }),
    __metadata("design:type", String)
], BanEntity.prototype, "rsgId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255, nullable: true, default: null }),
    __metadata("design:type", String)
], BanEntity.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255, nullable: true, default: null }),
    __metadata("design:type", String)
], BanEntity.prototype, "serial", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255, nullable: true, default: null }),
    __metadata("design:type", String)
], BanEntity.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255, nullable: true, default: null }),
    __metadata("design:type", String)
], BanEntity.prototype, "bannedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", width: 11, default: 0 }),
    __metadata("design:type", Number)
], BanEntity.prototype, "bannedByLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255, nullable: true, default: null }),
    __metadata("design:type", String)
], BanEntity.prototype, "lifttime", void 0);
exports.BanEntity = BanEntity = __decorate([
    (0, typeorm_1.Entity)({ name: "bans" })
], BanEntity);


/***/ },

/***/ "./source/server/database/entity/Bank.entity.ts"
/*!******************************************************!*\
  !*** ./source/server/database/entity/Bank.entity.ts ***!
  \******************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BankAccountEntity = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const Character_entity_1 = __webpack_require__(/*! @entities/Character.entity */ "./source/server/database/entity/Character.entity.ts");
let BankAccountEntity = class BankAccountEntity {
    id;
    isPrimary;
    accountnumber;
    pincode;
    balance;
    accountholder;
    character;
};
exports.BankAccountEntity = BankAccountEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], BankAccountEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], BankAccountEntity.prototype, "isPrimary", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", width: 11, default: 0 }),
    __metadata("design:type", Number)
], BankAccountEntity.prototype, "accountnumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", width: 11, default: 0 }),
    __metadata("design:type", Number)
], BankAccountEntity.prototype, "pincode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", width: 11, default: 0 }),
    __metadata("design:type", Number)
], BankAccountEntity.prototype, "balance", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 32, default: "" }),
    __metadata("design:type", String)
], BankAccountEntity.prototype, "accountholder", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Character_entity_1.CharacterEntity, (char) => char.bank),
    __metadata("design:type", Character_entity_1.CharacterEntity)
], BankAccountEntity.prototype, "character", void 0);
exports.BankAccountEntity = BankAccountEntity = __decorate([
    (0, typeorm_1.Entity)({ name: "bank_accounts" })
], BankAccountEntity);


/***/ },

/***/ "./source/server/database/entity/Character.entity.ts"
/*!***********************************************************!*\
  !*** ./source/server/database/entity/Character.entity.ts ***!
  \***********************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CharacterEntity = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const Command_class_1 = __webpack_require__(/*! @classes/Command.class */ "./source/server/classes/Command.class.ts");
const Account_entity_1 = __webpack_require__(/*! ./Account.entity */ "./source/server/database/entity/Account.entity.ts");
const Death_utils_1 = __webpack_require__(/*! @events/Death.utils */ "./source/server/serverevents/Death.utils.ts");
const index_1 = __webpack_require__(/*! @shared/index */ "./source/shared/index.ts");
const Bank_entity_1 = __webpack_require__(/*! @entities/Bank.entity */ "./source/server/database/entity/Bank.entity.ts");
let CharacterEntity = class CharacterEntity {
    id;
    account;
    appearance = {
        face: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0, 17: 0, 18: 0, 19: 0 },
        parents: { father: 0, mother: 0, leatherMix: 0, similarity: 0 },
        hair: { head: 0, eyebrows: 0, chest: 0, beard: 0 },
        color: { head: 0, head_secondary: 0, eyebrows: 0, eyes: 0, chest: 0, beard: 0, lipstick: 0 }
    };
    lastlogin = null;
    name;
    gender = 0;
    level = 1;
    position;
    wantedLevel = 0;
    deathState = 0 /* RageShared.Players.Enums.DEATH_STATES.STATE_NONE */;
    cash = 1500;
    bank;
    constructor() { }
    async save(player) { }
    applyAppearance(player) {
        if (!player || !mp.players.exists(player) || !player.character)
            return;
        const data = player.character.appearance;
        const gender = player.model === mp.joaat("mp_m_freemode_01");
        player.setHeadBlend(data.parents.mother, data.parents.father, 4, data.parents.mother, data.parents.father, 0, (data.parents.similarity / 100) * -1, (data.parents.leatherMix / 100) * -1, 0);
        player.setHairColor(data.color.head, typeof data.color.head_secondary === "undefined" ? 0 : data.color.head_secondary);
        if (gender) {
            player.setHeadOverlay(1, [data.hair.beard, 1, data.color.beard, data.color.beard]);
        }
        else {
            player.setHeadOverlay(1, [data.hair.beard, 0, 1, 1]);
            player.setHeadOverlay(10, [data.hair.chest, 0, 1, 1]);
        }
        player.eyeColor = data.color.eyes;
        player.setClothes(2, data.hair.head, 0, 0);
        for (let i = 0; i < 20; i++) {
            player.setFaceFeature(i, data.face[i] / 100);
        }
    }
    loadInventory = function (player) {
        // Inventory system removed
    };
    setStoreData(player, key, value) {
        return player.call("client::eventManager", ["cef::player:setPlayerData", key, value]);
    }
    async spawn(player) {
        if (!player || !mp.players.exists(player) || !player.character)
            return;
        const { x, y, z, heading } = player.character.position;
        player.character.applyAppearance(player);
        const clothes = player.character.appearance.clothes;
        if (clothes) {
            const clothesJson = JSON.stringify(clothes);
            player.setVariable("clothes", clothesJson);
            player.call("client::wardrobe:applyClothes", [clothesJson]);
        }
        player.character.loadInventory(player);
        player.character.setStoreData(player, "ping", player.ping);
        player.character.setStoreData(player, "wantedLevel", player.character.wantedLevel);
        player.setVariable("adminLevel", player.account?.adminlevel ?? 0);
        await player.requestCollisionAt(x, y, z).then(() => {
            player.spawn(new mp.Vector3(x, y, z));
        });
        player.heading = heading;
        if (player.character.deathState === 1 /* RageShared.Players.Enums.DEATH_STATES.STATE_INJURED */) {
            (0, Death_utils_1.setPlayerToInjuredState)(player);
        }
        if (player.account?.adminlevel) {
            player.outputChatBox(`>>> You are logged in as !{green}LEVEL ${player.account.adminlevel}!{white} admin!`);
        }
        player.character.setStoreData(player, "cash", player.character.cash);
        if (player.character.lastlogin) {
            const lastLoginDate = new Date(player.character.lastlogin);
            const formattedDate = lastLoginDate.toLocaleString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });
            player.outputChatBox(`Your last login was on !{green}${formattedDate}`);
        }
        player.character.lastlogin = new Date();
        Command_class_1.CommandRegistry.reloadCommands(player);
    }
    async getData(data) {
        return this[data];
    }
};
exports.CharacterEntity = CharacterEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CharacterEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Account_entity_1.AccountEntity, (account) => account.id),
    __metadata("design:type", Account_entity_1.AccountEntity)
], CharacterEntity.prototype, "account", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "jsonb", default: null }),
    __metadata("design:type", Object)
], CharacterEntity.prototype, "appearance", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true }),
    __metadata("design:type", Object)
], CharacterEntity.prototype, "lastlogin", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 32 }),
    __metadata("design:type", String)
], CharacterEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", width: 11, default: 0 }),
    __metadata("design:type", Number)
], CharacterEntity.prototype, "gender", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", width: 11, default: 1 }),
    __metadata("design:type", Number)
], CharacterEntity.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "jsonb", default: null }),
    __metadata("design:type", Object)
], CharacterEntity.prototype, "position", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", width: 11, default: 0 }),
    __metadata("design:type", Number)
], CharacterEntity.prototype, "wantedLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", width: 11, default: 0 }),
    __metadata("design:type", Number)
], CharacterEntity.prototype, "deathState", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", width: 11, default: 1500 }),
    __metadata("design:type", Number)
], CharacterEntity.prototype, "cash", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Bank_entity_1.BankAccountEntity, (bank) => bank.character),
    __metadata("design:type", Array)
], CharacterEntity.prototype, "bank", void 0);
exports.CharacterEntity = CharacterEntity = __decorate([
    (0, typeorm_1.Entity)({ name: "characters" }),
    __metadata("design:paramtypes", [])
], CharacterEntity);


/***/ },

/***/ "./source/server/database/entity/Vehicle.entity.ts"
/*!*********************************************************!*\
  !*** ./source/server/database/entity/Vehicle.entity.ts ***!
  \*********************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VehicleEntity = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
let VehicleEntity = class VehicleEntity {
    id;
    owner_id;
    owner_name;
    model;
    modelname;
    price;
    class;
    fuel;
    primaryColor = [255, 255, 255];
    secondaryColor = [255, 255, 255];
    dashboardColor;
    interiorColor;
    neon;
    neonColor = [255, 255, 255];
    livery;
    extra;
    wheelmods = { type: -1, mod: 0, color: 0 };
    plate;
    plate_color;
    is_locked;
    position;
    modifications;
    primaryColorType;
    secondaryColorType;
    dimension;
    isWanted;
    // @Column({ type: "json" })
    // inventory: any;
    faction = null;
    keyhole = null;
    impoundState = 0;
};
exports.VehicleEntity = VehicleEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], VehicleEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", width: 10, nullable: true, default: null }),
    __metadata("design:type", Object)
], VehicleEntity.prototype, "owner_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 50, nullable: true, default: null }),
    __metadata("design:type", Object)
], VehicleEntity.prototype, "owner_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "bigint", nullable: true }),
    __metadata("design:type", Number)
], VehicleEntity.prototype, "model", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", default: "" }),
    __metadata("design:type", String)
], VehicleEntity.prototype, "modelname", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", width: 10, default: 0 }),
    __metadata("design:type", Number)
], VehicleEntity.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", width: 10, default: -1 }),
    __metadata("design:type", Number)
], VehicleEntity.prototype, "class", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", width: 10, default: 100 }),
    __metadata("design:type", Number)
], VehicleEntity.prototype, "fuel", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "json" }),
    __metadata("design:type", Array)
], VehicleEntity.prototype, "primaryColor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "json" }),
    __metadata("design:type", Array)
], VehicleEntity.prototype, "secondaryColor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", width: 10, default: 100 }),
    __metadata("design:type", Number)
], VehicleEntity.prototype, "dashboardColor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", width: 10, default: 100 }),
    __metadata("design:type", Number)
], VehicleEntity.prototype, "interiorColor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", width: 10, default: 0 }),
    __metadata("design:type", Number)
], VehicleEntity.prototype, "neon", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "jsonb" }),
    __metadata("design:type", Array)
], VehicleEntity.prototype, "neonColor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", width: 10, default: 100 }),
    __metadata("design:type", Number)
], VehicleEntity.prototype, "livery", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", width: 10, default: 100 }),
    __metadata("design:type", Number)
], VehicleEntity.prototype, "extra", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "json" }),
    __metadata("design:type", Object)
], VehicleEntity.prototype, "wheelmods", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 8, default: "" }),
    __metadata("design:type", String)
], VehicleEntity.prototype, "plate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", width: 10, nullable: true, default: null }),
    __metadata("design:type", Number)
], VehicleEntity.prototype, "plate_color", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", default: 0 }),
    __metadata("design:type", Number)
], VehicleEntity.prototype, "is_locked", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "jsonb" }),
    __metadata("design:type", Object)
], VehicleEntity.prototype, "position", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "json" }),
    __metadata("design:type", Object)
], VehicleEntity.prototype, "modifications", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", width: 10, default: 0 }),
    __metadata("design:type", Object)
], VehicleEntity.prototype, "primaryColorType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", width: 10, default: 0 }),
    __metadata("design:type", Object)
], VehicleEntity.prototype, "secondaryColorType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", width: 10, default: 0 }),
    __metadata("design:type", Number)
], VehicleEntity.prototype, "dimension", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", default: 0 }),
    __metadata("design:type", Number)
], VehicleEntity.prototype, "isWanted", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 50, nullable: true, default: null }),
    __metadata("design:type", Object)
], VehicleEntity.prototype, "faction", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 129, nullable: true, default: null }),
    __metadata("design:type", Object)
], VehicleEntity.prototype, "keyhole", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", width: 11, default: 0 }),
    __metadata("design:type", Number)
], VehicleEntity.prototype, "impoundState", void 0);
exports.VehicleEntity = VehicleEntity = __decorate([
    (0, typeorm_1.Entity)({ name: "vehicles" })
], VehicleEntity);


/***/ },

/***/ "./source/server/database/entity/WeaponPreset.entity.ts"
/*!**************************************************************!*\
  !*** ./source/server/database/entity/WeaponPreset.entity.ts ***!
  \**************************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WeaponPresetEntity = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const Character_entity_1 = __webpack_require__(/*! ./Character.entity */ "./source/server/database/entity/Character.entity.ts");
let WeaponPresetEntity = class WeaponPresetEntity {
    id;
    character;
    characterId;
    weaponName;
    components = [];
};
exports.WeaponPresetEntity = WeaponPresetEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], WeaponPresetEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Character_entity_1.CharacterEntity, { onDelete: "CASCADE" }),
    __metadata("design:type", Character_entity_1.CharacterEntity)
], WeaponPresetEntity.prototype, "character", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int" }),
    __metadata("design:type", Number)
], WeaponPresetEntity.prototype, "characterId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 64 }),
    __metadata("design:type", String)
], WeaponPresetEntity.prototype, "weaponName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "jsonb", default: "[]" }),
    __metadata("design:type", Array)
], WeaponPresetEntity.prototype, "components", void 0);
exports.WeaponPresetEntity = WeaponPresetEntity = __decorate([
    (0, typeorm_1.Entity)({ name: "weapon_presets" })
], WeaponPresetEntity);


/***/ },

/***/ "./source/server/modules/Attachments.module.ts"
/*!*****************************************************!*\
  !*** ./source/server/modules/Attachments.module.ts ***!
  \*****************************************************/
(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.entityAttachments = void 0;
const entityAttachments = {
    _addAttachment(entity, attachmentHash, remove) {
        let idx = entity._attachments.indexOf(attachmentHash);
        if (idx === -1) {
            if (!remove) {
                entity._attachments.push(attachmentHash);
            }
        }
        else if (remove) {
            entity._attachments.splice(idx, 1);
        }
        entity.setVariable("attachmentsData", serializeAttachments(entity._attachments));
    },
    initFunctions: (entity) => {
        entity._attachments = [];
        entity.addAttachment = function _addAttachmentWrap(attachmentName, remove) {
            let to = typeof attachmentName;
            if (to === "number") {
                entityAttachments._addAttachment(entity, attachmentName, remove);
            }
            else if (to === "string") {
                entityAttachments._addAttachment(entity, mp.joaat(attachmentName), remove);
            }
        };
        entity.hasAttachment = function _hasAttachment(attachmentName) {
            return entity._attachments.indexOf(typeof attachmentName === "string" ? mp.joaat(attachmentName) : attachmentName) !== -1;
        };
    }
};
exports.entityAttachments = entityAttachments;
function serializeAttachments(attachments) {
    return attachments.map((hash) => hash.toString(36)).join("|");
}
mp.events.add("staticAttachments.Add", (player, hash) => {
    player.addAttachment(parseInt(hash, 36), false);
});
mp.events.add("staticAttachments.Remove", (player, hash) => {
    player.addAttachment(parseInt(hash, 36), true);
});
mp.events.add("vstaticAttachments.Add", (player, remoteVehicle, hash) => {
    let vehicle = mp.vehicles.at(remoteVehicle);
    if (vehicle && mp.vehicles.exists(vehicle)) {
        vehicle.addAttachment(parseInt(hash, 36), false);
    }
});
mp.events.add("vstaticAttachments.Remove", (player, remoteVehicle, hash) => {
    let vehicle = mp.vehicles.at(remoteVehicle);
    if (vehicle && mp.vehicles.exists(vehicle)) {
        vehicle.addAttachment(parseInt(hash, 36), true);
    }
});


/***/ },

/***/ "./source/server/modules/Chat.module.ts"
/*!**********************************************!*\
  !*** ./source/server/modules/Chat.module.ts ***!
  \**********************************************/
(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Chat = void 0;
exports.Chat = {
    /**
     * Sends a syntax error message to a specific player.
     *
     * @param {PlayerMp} player - The player to whom the message will be sent.
     * @param {string} message - The message that describes the correct usage.
     * @returns {void}
     */
    sendSyntaxError(player, message) {
        return player.outputChatBox(`!{#FF6347}Usage:!{#ffffff} ${message}`);
    },
    /**
     * Sends a message to all players within a certain range of a specific position.
     *
     * @param {Vector3} position - The position from which the range is calculated.
     * @param {number} range - The range within which players will receive the message.
     * @param {string} message - The message to send to players.
     * @returns {void}
     */
    sendNearbyMessage(position, range, message) {
        mp.players.forEachInRange(position, range, (player) => {
            if (player.getVariable("loggedin"))
                player.outputChatBox(message);
        });
    },
    /**
     * Sends a warning message to all admins with a certain level or higher.
     *
     * @param {number} color - The color code (32bit in hexadecimal) for the message.
     * @param {string} message - The warning message to send to admins.
     * @param {RageShared.Enums.ADMIN_LEVELS} [level=RageShared.Enums.ADMIN_LEVELS.LEVEL_ONE] - The minimum admin level required to receive the message.
     * @returns {void}
     */
    sendAdminWarning(color, message, level = 1 /* RageShared.Enums.ADMIN_LEVELS.LEVEL_ONE */) {
        const players = mp.players.toArray().filter((x) => x.account && x.account.adminlevel >= level);
        const padColor = color.toString(16).toUpperCase().padStart(8, "0").slice(0, -2);
        players.forEach((player) => {
            player.outputChatBox(`!{#${padColor}}${message}`);
        });
    }
};


/***/ },

/***/ "./source/server/prototype/Player.prototype.ts"
/*!*****************************************************!*\
  !*** ./source/server/prototype/Player.prototype.ts ***!
  \*****************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const _api_1 = __webpack_require__(/*! @api */ "./source/server/api/index.ts");
/**
 * Gets a player by their name or ID.
 * @param {string} stringornumber - The name or ID of the player.
 * @returns {PlayerMp | undefined} The player if found, otherwise undefined.
 */
mp.players.getPlayerByName = function (stringornumber) {
    if (!isNaN(parseInt(stringornumber))) {
        return mp.players.at(parseInt(stringornumber));
    }
    else {
        if (stringornumber.length < 3)
            return undefined;
        const players = mp.players.toArray();
        for (const player of players) {
            const [firstname] = player.name.split(" ");
            if (!firstname.toLowerCase().includes(stringornumber.toLowerCase()))
                continue;
            return player;
        }
    }
};
/**
 * Displays a notification to the player.
 * @param {RageShared.Enums.NotifyType} type - The type of notification.
 * @param {string} message - The message to display.
 * @param {"light" | "dark" | "colored"} [skin="dark"] - The skin style of the notification.
 */
mp.Player.prototype.showNotify = function (type, message, skin = "dark") {
    return _api_1.RAGERP.cef.emit(this, "notify", "show", { type, message, skin });
};
/**
 * Gets the admin level of the player.
 * @returns {number} The admin level of the player.
 */
mp.Player.prototype.getAdminLevel = function () {
    if (!this || !mp.players.exists(this) || !this.account)
        return 0;
    return this.account.adminlevel;
};
/**
 * Gives a weapon to the player.
 * @param {number} weapon - The weapon hash.
 * @param {number} totalAmmo - The total ammo for the weapon.
 * @param {number} [ammoInClip] - The ammo in the clip (optional).
 */
mp.Player.prototype.giveWeaponEx = function (weapon, totalAmmo, _ammoInClip) {
    this.giveWeapon(weapon, totalAmmo);
};
/**
 * Gets the player's roleplay name, optionally checking if they are wearing a mask.
 * @param {boolean} [checkmask=true] - Whether to check if the player is wearing a mask.
 * @returns {string} The roleplay name of the player.
 */
mp.Player.prototype.getRoleplayName = function (checkmask = true) {
    const player = this;
    if (!player || !mp.players.exists(player) || !player.character)
        return "Unknown";
    return player.name;
};
/**
 * Requests collision at a specific location.
 * @param {number} x - The X coordinate.
 * @param {number} y - The Y coordinate.
 * @param {number} z - The Z coordinate.
 * @returns {Promise<void>} A promise that resolves when the collision is requested.
 */
mp.Player.prototype.requestCollisionAt = async function (x, y, z) {
    return await this.callProc("client::proc:requestCollisionAt", [x, y, z]);
};
/**
 * Starts a screen effect for the player.
 * @param {string} effectName - The name of the effect.
 * @param {number} [duration=3000] - The duration of the effect in milliseconds.
 * @param {boolean} [looped=true] - Whether the effect should be looped.
 */
mp.Player.prototype.startScreenEffect = function (effectName, duration = 3000, looped = true) {
    this.call("client::effects:startScreenEffect", [effectName, duration, looped]);
};
/**
 * Stops a screen effect for the player.
 * @param {string} effectName - The name of the effect.
 */
mp.Player.prototype.stopScreenEffect = function (effectName) {
    this.call("client::effects:stopScreenEffect", [effectName]);
};
/**
 * Sets the emote text for the player.
 * @param {Array4d} color - The color of the text.
 * @param {string} text - The emote text.
 * @param {number} [time=7] - The duration in seconds the text will be displayed.
 */
mp.Player.prototype.setEmoteText = function (color, text, time = 7) {
    this.setVariable("emoteTextData", JSON.stringify({ color, text }));
    if (this.emoteTimeout) {
        clearTimeout(this.emoteTimeout);
        this.emoteTimeout = null;
    }
    this.emoteTimeout = setTimeout(() => {
        this.setVariable("emoteTextData", null);
        clearTimeout(this.emoteTimeout);
        this.emoteTimeout = null;
    }, time * 1_000);
};
/**
 * Gives money to the player.
 * @param {number} amount - The amount of money to give.
 * @param {string} [logMessage] - An optional log message.
 */
mp.Player.prototype.giveMoney = function (amount, logMessage) {
    if (!mp.players.exists(this) || !this.getVariable("loggedin") || !this.character)
        return;
    this.character.cash = this.character.cash + amount;
    this.character.setStoreData(this, "cash", this.character.cash);
};
mp.Player.prototype.attachObject = function (name, attached) {
    this.call("client::attachments:attach", [name, attached]);
};


/***/ },

/***/ "./source/server/report/Report.manager.ts"
/*!************************************************!*\
  !*** ./source/server/report/Report.manager.ts ***!
  \************************************************/
(__unused_webpack_module, exports) {


/**
 * RxReports-style report system: players submit reports; staff view, claim, close, delete.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MAX_REPORTS_PER_PLAYER = exports.REPORT_CATEGORIES = void 0;
exports.getOpenCountForPlayer = getOpenCountForPlayer;
exports.createReport = createReport;
exports.getMyReports = getMyReports;
exports.getAllReports = getAllReports;
exports.claimReport = claimReport;
exports.unclaimReport = unclaimReport;
exports.closeReport = closeReport;
exports.reopenReport = reopenReport;
exports.deleteReport = deleteReport;
exports.addChatMessage = addChatMessage;
exports.getReport = getReport;
exports.REPORT_CATEGORIES = ["Report Player", "Report Bug", "Report Other"];
exports.MAX_REPORTS_PER_PLAYER = 3;
const reports = [];
let nextId = 1;
function findReport(id) {
    return reports.find((r) => r.id === id);
}
function getOpenCountForPlayer(playerId) {
    return reports.filter((r) => r.reporterId === playerId && r.status !== "closed").length;
}
function createReport(reporterId, reporterName, category, subject, message, reportedPlayerId, reportedPlayerName) {
    if (getOpenCountForPlayer(reporterId) >= exports.MAX_REPORTS_PER_PLAYER)
        return null;
    const entry = {
        id: nextId++,
        reporterId,
        reporterName,
        category,
        subject,
        message,
        reportedPlayerId,
        reportedPlayerName,
        status: "open",
        claimedById: null,
        claimedByName: null,
        createdAt: Date.now(),
        chat: []
    };
    reports.push(entry);
    return entry;
}
function getMyReports(playerId) {
    return reports.filter((r) => r.reporterId === playerId).sort((a, b) => b.createdAt - a.createdAt);
}
function getAllReports() {
    return [...reports].sort((a, b) => b.createdAt - a.createdAt);
}
function claimReport(reportId, staffId, staffName) {
    const r = findReport(reportId);
    if (!r || r.status === "closed")
        return false;
    if (r.claimedById != null)
        return false;
    r.status = "claimed";
    r.claimedById = staffId;
    r.claimedByName = staffName;
    return true;
}
function unclaimReport(reportId) {
    const r = findReport(reportId);
    if (!r || r.status === "closed")
        return false;
    r.status = "open";
    r.claimedById = null;
    r.claimedByName = null;
    return true;
}
function closeReport(reportId) {
    const r = findReport(reportId);
    if (!r)
        return false;
    r.status = "closed";
    return true;
}
function reopenReport(reportId) {
    const r = findReport(reportId);
    if (!r)
        return false;
    r.status = "open";
    r.claimedById = null;
    r.claimedByName = null;
    return true;
}
function deleteReport(reportId) {
    const idx = reports.findIndex((r) => r.id === reportId);
    if (idx === -1)
        return false;
    reports.splice(idx, 1);
    return true;
}
function addChatMessage(reportId, senderId, senderName, message) {
    const r = findReport(reportId);
    if (!r || r.status === "closed")
        return false;
    r.chat.push({ senderId, senderName, message, at: Date.now() });
    return true;
}
function getReport(reportId) {
    return findReport(reportId);
}


/***/ },

/***/ "./source/server/serverevents/Admin.event.ts"
/*!***************************************************!*\
  !*** ./source/server/serverevents/Admin.event.ts ***!
  \***************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const _api_1 = __webpack_require__(/*! @api */ "./source/server/api/index.ts");
const Command_class_1 = __webpack_require__(/*! @classes/Command.class */ "./source/server/classes/Command.class.ts");
function runCommand(player, commandText) {
    const trimmed = commandText.trim();
    if (!trimmed.length)
        return;
    const msg = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    const args = msg.substring(1).trim().split(/ +/);
    const name = args.shift();
    if (!name)
        return;
    const fullText = msg.substring(name.length + 1).trim();
    const command = Command_class_1.CommandRegistry.find(name);
    if (!command) {
        player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, `Unknown command: /${name}`);
        return;
    }
    if (command.adminlevel && command.adminlevel > player.getAdminLevel()) {
        player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "You are not authorized to use this command.");
        return;
    }
    try {
        if (command.run.constructor.name === "AsyncFunction") {
            command.run(player, fullText, ...args);
        }
        else {
            command.run(player, fullText, ...args);
        }
    }
    catch (e) {
        console.error("[Admin Panel] Command error:", e);
        player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "Command failed.");
    }
}
_api_1.RAGERP.cef.register("admin", "executeCommand", (player, data) => {
    if (!player?.account || player.account.adminlevel <= 0)
        return;
    let cmd;
    try {
        const parsed = typeof data === "string" ? JSON.parse(data) : data;
        cmd = typeof parsed === "string" ? parsed : parsed?.command ?? String(parsed);
    }
    catch {
        cmd = String(data);
    }
    runCommand(player, cmd);
});
_api_1.RAGERP.cef.register("admin", "close", (player) => {
    _api_1.RAGERP.cef.emit(player, "system", "setPage", "hud");
});


/***/ },

/***/ "./source/server/serverevents/Arena.event.ts"
/*!***************************************************!*\
  !*** ./source/server/serverevents/Arena.event.ts ***!
  \***************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const _api_1 = __webpack_require__(/*! @api */ "./source/server/api/index.ts");
const Arena_module_1 = __webpack_require__(/*! @arena/Arena.module */ "./source/server/arena/Arena.module.ts");
const ArenaMatch_manager_1 = __webpack_require__(/*! @arena/ArenaMatch.manager */ "./source/server/arena/ArenaMatch.manager.ts");
const ArenaConfig_1 = __webpack_require__(/*! @arena/ArenaConfig */ "./source/server/arena/ArenaConfig.ts");
_api_1.RAGERP.cef.register("arena", "joinQueue", async (player, data) => {
    let size = 1;
    try {
        const parsed = typeof data === "string" ? JSON.parse(data) : data;
        if (parsed && typeof parsed === "object" && parsed.size !== undefined) {
            const s = Number(parsed.size);
            if (ArenaConfig_1.QUEUE_SIZES.includes(s))
                size = s;
        }
        else if (typeof parsed === "number") {
            if (ArenaConfig_1.QUEUE_SIZES.includes(parsed))
                size = parsed;
        }
    }
    catch {
        /* use default */
    }
    if ((0, Arena_module_1.joinQueue)(player, size)) {
        _api_1.RAGERP.cef.emit(player, "system", "setPage", "arena_lobby");
    }
});
_api_1.RAGERP.cef.register("arena", "leaveQueue", async (player) => {
    (0, Arena_module_1.leaveQueue)(player);
    _api_1.RAGERP.cef.startPage(player, "mainmenu");
    _api_1.RAGERP.cef.emit(player, "system", "setPage", "mainmenu");
});
_api_1.RAGERP.cef.register("arena", "leaveMatch", async (player) => {
    if ((0, ArenaMatch_manager_1.leaveMatch)(player)) {
        player.showNotify("success" /* RageShared.Enums.NotifyType.TYPE_SUCCESS */, "Left arena match.");
    }
});
_api_1.RAGERP.cef.register("arena", "vote", async (player, data) => {
    try {
        const parsed = typeof data === "string" ? JSON.parse(data) : data;
        const mapId = typeof parsed === "object" && parsed?.mapId ? String(parsed.mapId) : null;
        if (mapId)
            (0, Arena_module_1.vote)(player, mapId);
    }
    catch {
        console.warn("[arena:vote] Invalid vote data:", data);
    }
});
mp.events.add("server::arena:useItem", (player, dataStr) => {
    const match = (0, ArenaMatch_manager_1.getMatchByPlayer)(player);
    if (!match || match.state !== "active" || !(0, ArenaMatch_manager_1.isAliveInMatch)(match, player.id))
        return;
    if (player.getVariable("arenaCastActive"))
        return;
    let item = null;
    try {
        const data = typeof dataStr === "string" ? JSON.parse(dataStr) : dataStr;
        if (data?.item === "plate")
            item = "plate";
        else if (data?.item === "medkit")
            item = "medkit";
    }
    catch {
        return;
    }
    if (!item)
        return;
    const cfg = item === "medkit" ? ArenaConfig_1.ITEM_CONFIG.medkit : ArenaConfig_1.ITEM_CONFIG.plate;
    const countVar = item === "medkit" ? "arenaMedkits" : "arenaPlates";
    const count = player.getVariable(countVar) ?? 0;
    if (count <= 0)
        return;
    player.setVariable("arenaCastActive", true);
    _api_1.RAGERP.cef.emit(player, "arena", "itemCastStart", { item, castTime: cfg.castTime });
    setTimeout(() => {
        if (!mp.players.exists(player))
            return;
        player.setVariable("arenaCastActive", false);
        const matchAfter = (0, ArenaMatch_manager_1.getMatchByPlayer)(player);
        if (!matchAfter || matchAfter.state !== "active" || !(0, ArenaMatch_manager_1.isAliveInMatch)(matchAfter, player.id)) {
            _api_1.RAGERP.cef.emit(player, "arena", "itemCastCancel", {});
            return;
        }
        const newCount = player.getVariable(countVar) ?? 0;
        if (newCount <= 0) {
            _api_1.RAGERP.cef.emit(player, "arena", "itemCastCancel", {});
            return;
        }
        player.setVariable(countVar, newCount - 1);
        const medkits = player.getVariable("arenaMedkits") ?? 0;
        const plates = player.getVariable("arenaPlates") ?? 0;
        _api_1.RAGERP.cef.emit(player, "arena", "itemCounts", { medkits, plates });
        if (item === "medkit") {
            const c = ArenaConfig_1.ITEM_CONFIG.medkit;
            const newHealth = Math.min(c.maxHp, player.health + c.heal);
            player.health = newHealth;
        }
        else {
            const c = ArenaConfig_1.ITEM_CONFIG.plate;
            const newArmor = Math.min(c.maxArmor, player.armour + c.armor);
            player.armour = newArmor;
        }
        _api_1.RAGERP.cef.emit(player, "arena", "setVitals", {
            health: Math.max(0, Math.min(100, player.health)),
            armor: Math.max(0, Math.min(100, player.armour))
        });
        _api_1.RAGERP.cef.emit(player, "arena", "itemCastComplete", { item });
    }, cfg.castTime);
});


/***/ },

/***/ "./source/server/serverevents/Auth.event.ts"
/*!**************************************************!*\
  !*** ./source/server/serverevents/Auth.event.ts ***!
  \**************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const crypto_1 = __importDefault(__webpack_require__(/*! crypto */ "crypto"));
const _api_1 = __webpack_require__(/*! @api */ "./source/server/api/index.ts");
const Account_entity_1 = __webpack_require__(/*! @entities/Account.entity */ "./source/server/database/entity/Account.entity.ts");
const Character_entity_1 = __webpack_require__(/*! @entities/Character.entity */ "./source/server/database/entity/Character.entity.ts");
const Character_event_1 = __webpack_require__(/*! ./Character.event */ "./source/server/serverevents/Character.event.ts");
function hashPassword(text) {
    return crypto_1.default.createHash("sha256").update(text).digest("hex");
}
_api_1.RAGERP.cef.register("auth", "register", async (player, data) => {
    const { username, email, password, confirmPassword } = _api_1.RAGERP.utils.parseObject(data);
    if (username.length < 4 || username.length > 32)
        return player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "Your username must be between 4 and 32 characters.");
    if (password.length < 5)
        return player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "Your password must contain at least 5 characters.");
    if (password !== confirmPassword)
        return player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "Password mismatch.");
    const accountExists = await _api_1.RAGERP.database.getRepository(Account_entity_1.AccountEntity).findOne({ where: { username, email } });
    if (accountExists)
        return player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "Account username or email exists.");
    const accountData = new Account_entity_1.AccountEntity();
    accountData.username = username.toLowerCase();
    accountData.password = hashPassword(password);
    accountData.socialClubId = player.rgscId;
    accountData.email = email;
    accountData.characters = [];
    const result = await _api_1.RAGERP.database.getRepository(Account_entity_1.AccountEntity).save(accountData);
    if (!result) {
        player.showNotify("info" /* RageShared.Enums.NotifyType.TYPE_INFO */, "An error occurred creating your account, please contact an admin.");
        return;
    }
    player.account = result;
    player.name = player.account.username;
    player.call("client::auth:destroyCamera");
    player.call("client::creator:start");
    _api_1.RAGERP.cef.emit(player, "system", "setPage", "creator");
});
_api_1.RAGERP.cef.register("auth", "loginPlayer", async (player, data) => {
    const { username, password } = _api_1.RAGERP.utils.parseObject(data);
    const accountData = await _api_1.RAGERP.database.getRepository(Account_entity_1.AccountEntity).findOne({ where: { username: username.toLowerCase() } });
    if (!accountData)
        return player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "We could not find that account!");
    if (hashPassword(password) !== accountData.password)
        return player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "Wrong password.");
    player.account = accountData;
    player.name = player.account.username;
    const characters = await _api_1.RAGERP.database.getRepository(Character_entity_1.CharacterEntity).find({
        where: { account: { id: accountData.id } },
        relations: ["bank"],
        take: 1
    });
    if (characters.length > 0) {
        await (0, Character_event_1.spawnWithCharacter)(player, characters[0]);
        _api_1.RAGERP.cef.startPage(player, "mainmenu");
        _api_1.RAGERP.cef.emit(player, "system", "setPage", "mainmenu");
        _api_1.RAGERP.cef.emit(player, "mainmenu", "setPlayerData", { name: characters[0].name });
    }
    else {
        player.call("client::auth:destroyCamera");
        player.call("client::creator:start");
        _api_1.RAGERP.cef.emit(player, "system", "setPage", "creator");
    }
});


/***/ },

/***/ "./source/server/serverevents/Character.event.ts"
/*!*******************************************************!*\
  !*** ./source/server/serverevents/Character.event.ts ***!
  \*******************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.spawnWithCharacter = spawnWithCharacter;
const _api_1 = __webpack_require__(/*! @api */ "./source/server/api/index.ts");
const Character_entity_1 = __webpack_require__(/*! @entities/Character.entity */ "./source/server/database/entity/Character.entity.ts");
async function spawnWithCharacter(player, character) {
    player.character = character;
    player.setVariable("loggedin", true);
    player.call("client::auth:destroyCamera");
    player.call("client::cef:close");
    player.model = character.gender === 0 ? mp.joaat("mp_m_freemode_01") : mp.joaat("mp_f_freemode_01");
    player.name = character.name;
    await character.spawn(player);
    player.showNotify("success" /* RageShared.Enums.NotifyType.TYPE_SUCCESS */, `Welcome, ${character.name}!`);
}
/**
 * When a player changes navigation in character creator, example going from general data to appearance
 */
_api_1.RAGERP.cef.register("creator", "navigation", async (player, name) => {
    name = JSON.parse(name);
    const cameraName = "creator_" + name;
    player.call("client::creator:changeCamera", [cameraName]);
    player.call("client::creator:changeCategory", [cameraName]);
});
/**
 * Executed when a player selects a character to spawn with (kept for compatibility)
 */
_api_1.RAGERP.cef.register("character", "select", async (player, data) => {
    const id = JSON.parse(data);
    const character = await _api_1.RAGERP.database.getRepository(Character_entity_1.CharacterEntity).findOne({ where: { id }, relations: ["bank"] });
    if (!character)
        return player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "An error occurred selecting your character.");
    await spawnWithCharacter(player, character);
});
/**
 * Executes when a player choose to create a new character
 */
_api_1.RAGERP.cef.register("character", "create", async (player) => {
    player.call("client::auth:destroyCamera");
    player.call("client::creator:start");
    _api_1.RAGERP.cef.emit(player, "system", "setPage", "creator");
});
/**
 * Executes when a player finishes creating a character.
 */
_api_1.RAGERP.cef.register("creator", "create", async (player, data) => {
    if (!player.account)
        return player.kick("An error has occurred!");
    const parseData = _api_1.RAGERP.utils.parseObject(data);
    const fullname = `${parseData.name.firstname} ${parseData.name.lastname}`;
    const nameisTaken = await _api_1.RAGERP.database.getRepository(Character_entity_1.CharacterEntity).findOne({ where: { name: fullname } });
    if (nameisTaken)
        return player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "We're sorry but that name is already taken, choose another one.");
    const { sex, parents, hair, face, color, clothes: creatorClothes } = parseData;
    const characterLimit = await _api_1.RAGERP.database.getRepository(Character_entity_1.CharacterEntity).find({ where: { account: { id: player.account.id } }, take: 1 });
    if (characterLimit.length >= 1)
        return player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "You already have a character. One character per account.");
    const defaultClothes = sex === 1
        ? { hats: { drawable: 0, texture: 0 }, masks: { drawable: 0, texture: 0 }, tops: { drawable: 15, texture: 0 }, pants: { drawable: 15, texture: 0 }, shoes: { drawable: 35, texture: 0 } }
        : { hats: { drawable: 0, texture: 0 }, masks: { drawable: 0, texture: 0 }, tops: { drawable: 15, texture: 0 }, pants: { drawable: 21, texture: 0 }, shoes: { drawable: 34, texture: 0 } };
    const clothes = { ...defaultClothes, ...(creatorClothes && typeof creatorClothes === "object" ? creatorClothes : {}) };
    const characterData = new Character_entity_1.CharacterEntity();
    characterData.account = player.account;
    characterData.appearance = { color, face, hair, parents, clothes };
    characterData.name = fullname;
    characterData.gender = sex;
    characterData.position = {
        x: 213.0,
        y: -810.0,
        z: 30.73,
        heading: 160.0
    };
    // Inventory system removed - no inventory initialization needed
    const result = await _api_1.RAGERP.database.getRepository(Character_entity_1.CharacterEntity).save(characterData);
    if (!result)
        return;
    player.name = fullname;
    player.character = result;
    player.setVariable("loggedin", true);
    player.call("client::creator:destroycam");
    player.call("client::cef:close");
    await player.character.spawn(player);
});


/***/ },

/***/ "./source/server/serverevents/Chat.event.ts"
/*!**************************************************!*\
  !*** ./source/server/serverevents/Chat.event.ts ***!
  \**************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const Command_class_1 = __webpack_require__(/*! @classes/Command.class */ "./source/server/classes/Command.class.ts");
const invokeCommand = async (player, message) => {
    message = message.substring(1);
    message = message.trim();
    const args = message.split(/ +/);
    const name = args.shift();
    if (!name)
        return;
    const fullText = message.substring(name.length + 1); // +1 for the space after command name
    // Check if command exists
    const command = Command_class_1.CommandRegistry.find(name);
    if (!command) {
        if (Command_class_1.CommandRegistry.notFoundMessageEnabled) {
            Command_class_1.CommandRegistry.commandNotFound(player, name);
        }
        return;
    }
    const cancel = { cancel: false };
    // CommandEvents.emit('receive', player, command, fullText, args, cancel);
    // Handle cancellation
    if (cancel && cancel.cancel) {
        return;
    }
    try {
        // Handle run
        if (command.adminlevel && command.adminlevel > player.getAdminLevel()) {
            return player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "You are not authorized to use this command.");
        }
        if (command.run.constructor.name === "AsyncFunction") {
            await command.run(player, fullText, ...args);
        }
        else {
            command.run(player, fullText, ...args);
        }
    }
    catch (e) {
        console.error(e);
    }
};
const LOCAL_CHAT_RANGE = 50;
const CHAT_PREFIXES = ["/global", "/team", "/local", "/admin"];
function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function parseChatScope(message) {
    const trimmed = message.trim();
    const lower = trimmed.toLowerCase();
    for (const prefix of CHAT_PREFIXES) {
        if (lower === prefix || lower.startsWith(prefix + " ")) {
            const msg = trimmed.slice(prefix.length).trim();
            return { scope: prefix.slice(1), msg };
        }
    }
    return null;
}
const sendChatMessage = (player, msg, scope = "local") => {
    try {
        msg = msg.trim();
    }
    catch {
        msg = msg;
    }
    if (msg.length <= 0)
        return;
    const safeMsg = escapeHtml(msg);
    const safeName = escapeHtml(player.getRoleplayName());
    const scopeTag = scope === "all" ? "[GLOBAL]" : scope === "team" ? "[TEAM]" : scope === "admin" ? "[ADMIN]" : "[LOCAL]";
    const formatted = `<span class="chat-scope">${scopeTag}</span> ${safeName}: ${safeMsg}`;
    switch (scope) {
        case "all":
            mp.players.forEach((target) => {
                if (target.getVariable("loggedin"))
                    target.call("client::chat:newMessage", [formatted]);
            });
            break;
        case "team": {
            const playerTeam = player.getVariable("currentTeam");
            mp.players.forEach((target) => {
                if (target.getVariable("loggedin") && target.getVariable("currentTeam") === playerTeam) {
                    target.call("client::chat:newMessage", [formatted]);
                }
            });
            break;
        }
        case "admin": {
            const adminLevel = player.getAdminLevel();
            mp.players.forEach((target) => {
                if (target.getVariable("loggedin") && target.getAdminLevel() >= 1) {
                    target.call("client::chat:newMessage", [formatted]);
                }
            });
            break;
        }
        case "local":
        default:
            mp.players.forEachInRange(player.position, LOCAL_CHAT_RANGE, (target) => {
                if (target.getVariable("loggedin"))
                    target.call("client::chat:newMessage", [formatted]);
            });
            break;
    }
};
const invokeMessage = async (player, data) => {
    let message;
    try {
        const parsed = JSON.parse(data);
        message = Array.isArray(parsed) ? parsed[0] : parsed;
    }
    catch {
        message = data;
    }
    player.call("client::chat:close");
    if (message.length <= 0)
        return;
    const chatScope = parseChatScope(message);
    if (chatScope) {
        return sendChatMessage(player, chatScope.msg, chatScope.scope);
    }
    if (message[0] === "/" && message.length > 1) {
        return invokeCommand(player, message);
    }
    return sendChatMessage(player, message, "local");
};
mp.events.add("server::chat:sendMessage", invokeMessage);


/***/ },

/***/ "./source/server/serverevents/DamageSync.event.ts"
/*!********************************************************!*\
  !*** ./source/server/serverevents/DamageSync.event.ts ***!
  \********************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const utils_module_1 = __webpack_require__(/*! @shared/utils.module */ "./source/shared/utils.module.ts");
const ArenaMatch_manager_1 = __webpack_require__(/*! @arena/ArenaMatch.manager */ "./source/server/arena/ArenaMatch.manager.ts");
const AdminLog_manager_1 = __webpack_require__(/*! ../admin/AdminLog.manager */ "./source/server/admin/AdminLog.manager.ts");
const DEFAULT_BONE_MULT = 1;
const DEFAULT_WEAPON_BASE = 28;
const DEFAULT_WEAPON_MIN = 10;
/** Default effective range (m): damage = base inside this, then falls off with distance. */
const DEFAULT_EFFECTIVE_RANGE = 35;
/** Arena: scale so TTK varies by weapon (stronger guns kill in fewer shots). */
const ARENA_DAMAGE_MULT = 0.75;
/** Arena: base for per-weapon cap; cap = min(25, ARENA_CAP_BASE + weaponBase * 0.5) so .50 hits harder than carbine. */
const ARENA_CAP_BASE = 8;
const ARENA_CAP_MAX = 25;
const boneMultipliers = {
    Head: 1.5,
    Neck: 1.5,
    Left_Clavicle: 1,
    Right_Clavicle: 1,
    "Upper_Arm Right": 1,
    "Upper_Arm Left": 1,
    "Lower_Arm Right": 1,
    "Lower_Arm Left": 1,
    Spine_1: 1,
    Spine_3: 1,
    Right_Tigh: 1,
    Left_Tigh: 1,
    Right_Calf: 1,
    Left_Calf: 1,
    Right_Food: 1,
    Left_Food: 1
};
// Per-weapon damage: base/min for body, effectiveRange (m) for falloff. Head = 1.5x, no one-shot head.
// Inside effectiveRange = full base damage; beyond it, damage = base * effectiveRange / distance (clamped to min).
const weaponDamage = {
    [String(mp.joaat("weapon_pistol"))]: { base: 18, min: 9, effectiveRange: 18 },
    [String(mp.joaat("weapon_pistol_mk2"))]: { base: 20, min: 10, effectiveRange: 20 },
    [String(mp.joaat("weapon_combatpistol"))]: { base: 20, min: 10, effectiveRange: 20 },
    [String(mp.joaat("weapon_heavypistol"))]: { base: 22, min: 10, effectiveRange: 22 },
    [String(mp.joaat("weapon_appistol"))]: { base: 16, min: 8, effectiveRange: 15 },
    [String(mp.joaat("weapon_pistol50"))]: { base: 24, min: 12, effectiveRange: 25 },
    [String(mp.joaat("weapon_microsmg"))]: { base: 14, min: 8, effectiveRange: 18 },
    [String(mp.joaat("weapon_smg"))]: { base: 16, min: 10, effectiveRange: 22 },
    [String(mp.joaat("weapon_assaultrifle"))]: { base: 22, min: 10, effectiveRange: 45 },
    [String(mp.joaat("weapon_assaultrifle_mk2"))]: { base: 24, min: 10, effectiveRange: 50 },
    [String(mp.joaat("weapon_carbinerifle"))]: { base: 22, min: 8, effectiveRange: 45 },
    [String(mp.joaat("weapon_carbinerifle_mk2"))]: { base: 24, min: 10, effectiveRange: 50 },
    [String(mp.joaat("weapon_specialcarbine"))]: { base: 22, min: 10, effectiveRange: 42 },
    [String(mp.joaat("weapon_bullpuprifle"))]: { base: 22, min: 10, effectiveRange: 40 },
    [String(mp.joaat("weapon_advancedrifle"))]: { base: 22, min: 10, effectiveRange: 45 },
    [String(mp.joaat("weapon_sniperrifle"))]: { base: 55, min: 35, effectiveRange: 100 },
    [String(mp.joaat("weapon_heavysniper"))]: { base: 55, min: 45, effectiveRange: 120 },
    [String(mp.joaat("weapon_heavysniper_mk2"))]: { base: 65, min: 50, effectiveRange: 130 },
    [String(mp.joaat("weapon_pumpshotgun"))]: { base: 45, min: 35, effectiveRange: 20 },
    [String(mp.joaat("weapon_sawnoffshotgun"))]: { base: 40, min: 30, effectiveRange: 12 },
    [String(mp.joaat("weapon_assaultshotgun"))]: { base: 35, min: 25, effectiveRange: 22 },
    [String(mp.joaat("weapon_combatshotgun"))]: { base: 40, min: 30, effectiveRange: 25 },
    [String(mp.joaat("weapon_mg"))]: { base: 18, min: 12, effectiveRange: 55 },
    [String(mp.joaat("weapon_combatmg"))]: { base: 18, min: 14, effectiveRange: 60 },
    [String(mp.joaat("weapon_combatpdw"))]: { base: 16, min: 10, effectiveRange: 28 },
    [String(mp.joaat("weapon_compactrifle"))]: { base: 20, min: 10, effectiveRange: 35 }
};
function getBoneMultiplier(bone) {
    return boneMultipliers[bone] ?? DEFAULT_BONE_MULT;
}
function getWeaponDamage(weaponHash, distance) {
    const w = weaponDamage[weaponHash] ?? { base: DEFAULT_WEAPON_BASE, min: DEFAULT_WEAPON_MIN, effectiveRange: DEFAULT_EFFECTIVE_RANGE };
    const range = w.effectiveRange ?? DEFAULT_EFFECTIVE_RANGE;
    let dmg;
    if (distance <= range) {
        dmg = w.base;
    }
    else {
        dmg = (w.base * range) / distance;
        if (dmg < w.min)
            dmg = w.min;
    }
    return Math.round(dmg * 10) / 10;
}
mp.events.add("server:PlayerHit", (shooter, victimId, targetBone, weaponHash) => {
    if (!shooter || !mp.players.exists(shooter))
        return;
    const victim = mp.players.at(victimId);
    if (!victim || !mp.players.exists(victim))
        return;
    if (shooter.id === victim.id)
        return;
    // Arena: no team damage
    const match = (0, ArenaMatch_manager_1.getMatchByPlayer)(victim);
    if (match) {
        const victimTeam = (0, ArenaMatch_manager_1.getTeam)(match, victim.id);
        const shooterTeam = (0, ArenaMatch_manager_1.getTeam)(match, shooter.id);
        if (victimTeam && shooterTeam && victimTeam === shooterTeam)
            return;
        // Must be in same dimension
        if (shooter.dimension !== victim.dimension)
            return;
    }
    const distance = utils_module_1.Utils.distanceToPos(shooter.position, victim.position);
    const isHead = targetBone === "Head";
    const weaponDmg = getWeaponDamage(weaponHash, Math.max(1, distance));
    const boneMult = getBoneMultiplier(targetBone); // Head = 1.5x, no one-shot head
    const finalDamage = Math.round(weaponDmg * boneMult * 10) / 10;
    // Arena (Hopouts): apply damage on server; per-weapon cap so .50 etc. kill in fewer shots than weaker guns
    if (match && match.state === "active") {
        const w = weaponDamage[weaponHash] ?? { base: DEFAULT_WEAPON_BASE, min: DEFAULT_WEAPON_MIN };
        const cap = Math.min(ARENA_CAP_MAX, ARENA_CAP_BASE + w.base * 0.5);
        let dmgLeft = Math.round(finalDamage * ARENA_DAMAGE_MULT * 10) / 10;
        if (dmgLeft <= 0)
            dmgLeft = 1;
        dmgLeft = Math.min(dmgLeft, cap);
        const effectiveHp = Math.max(0, (victim.getVariable("arenaEffectiveHp") ?? 100) - dmgLeft);
        victim.setVariable("arenaEffectiveHp", effectiveHp);
        if (victim.armour > 0) {
            const toArmour = Math.min(victim.armour, dmgLeft);
            victim.armour = Math.max(0, victim.armour - toArmour);
            dmgLeft -= toArmour;
        }
        if (dmgLeft > 0) {
            victim.health = Math.max(0, victim.health - dmgLeft);
        }
        if (effectiveHp <= 0) {
            (0, ArenaMatch_manager_1.handleArenaDeath)(victim, shooter);
        }
    }
    else {
        // Freeroam: apply damage on server so it actually registers (server-authoritative)
        let dmgLeft = finalDamage;
        if (victim.armour > 0) {
            const toArmour = Math.min(victim.armour, dmgLeft);
            victim.armour = Math.max(0, victim.armour - toArmour);
            dmgLeft -= toArmour;
        }
        if (dmgLeft > 0) {
            victim.health = Math.max(0, victim.health - dmgLeft);
        }
        // Push server-authoritative vitals to victim's client so HP/AP UI updates (engine may not sync immediately)
        victim.call("client::player:setVitals", [victim.health, victim.armour]);
    }
    (0, AdminLog_manager_1.logDamageHit)({
        attacker: shooter,
        victim,
        weaponHash,
        damage: finalDamage,
        distance,
        inArena: !!match
    });
    const hitStatus = isHead ? 3 : victim.armour > 0 ? 2 : 1; // 1=health, 2=armour, 3=head
    shooter.call("client:ShowHitmarker", [finalDamage, victim.position.x, victim.position.y, victim.position.z, hitStatus]);
});


/***/ },

/***/ "./source/server/serverevents/Death.event.ts"
/*!***************************************************!*\
  !*** ./source/server/serverevents/Death.event.ts ***!
  \***************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const ArenaMatch_manager_1 = __webpack_require__(/*! @arena/ArenaMatch.manager */ "./source/server/arena/ArenaMatch.manager.ts");
const AdminLog_manager_1 = __webpack_require__(/*! ../admin/AdminLog.manager */ "./source/server/admin/AdminLog.manager.ts");
const LEGION_SQUARE = { x: 213.0, y: -810.0, z: 30.73, heading: 160.0 };
/** Freeroam: instant respawn at Legion Square with full health/armor (no death screen). */
function respawnFreeroamAtLegionSquare(player) {
    if (!player || !mp.players.exists(player) || !player.character)
        return;
    player.character.setStoreData(player, "isDead", false);
    player.character.setStoreData(player, "deathTime", 30);
    player.setVariable("isDead", false);
    player.setOwnVariable("deathAnim", null);
    player.character.deathState = 0 /* RageShared.Players.Enums.DEATH_STATES.STATE_NONE */;
    player.stopScreenEffect("DeathFailMPIn");
    player.spawn(new mp.Vector3(LEGION_SQUARE.x, LEGION_SQUARE.y, LEGION_SQUARE.z));
    player.heading = LEGION_SQUARE.heading;
    player.health = 100;
    player.armour = 100;
    player.call("client::player:setVitals", [100, 100]);
}
function playerDeath(player, _reason, killer) {
    if (!player || !mp.players.exists(player) || !player.character)
        return;
    const inArena = (0, ArenaMatch_manager_1.isPlayerInArenaMatch)(player);
    if (inArena && (0, ArenaMatch_manager_1.handleArenaDeath)(player, killer)) {
        (0, AdminLog_manager_1.logKill)({ killer, victim: player, reason: _reason ?? null, inArena: true });
        return;
    }
    (0, AdminLog_manager_1.logKill)({ killer, victim: player, reason: _reason ?? null, inArena: false });
    // Freeroam: no death screen — respawn immediately at Legion Square with full health/armor
    respawnFreeroamAtLegionSquare(player);
    player.character.save(player);
}
mp.events.add("playerDeath", playerDeath);
mp.events.add("server::player:acceptDeath", (player) => respawnFreeroamAtLegionSquare(player));


/***/ },

/***/ "./source/server/serverevents/Death.utils.ts"
/*!***************************************************!*\
  !*** ./source/server/serverevents/Death.utils.ts ***!
  \***************************************************/
(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.setPlayerToInjuredState = setPlayerToInjuredState;
const randomDeathAnimations = [
    { dict: "missfinale_c1@", anim: "lying_dead_player0" },
    { dict: "missprologueig_6", anim: "lying_dead_brad" },
    { dict: "misslamar1dead_body", anim: "dead_idle" }
];
function setPlayerToInjuredState(player) {
    if (!player || !mp.players.exists(player) || !player.character)
        return;
    player.character.deathState = 1 /* RageShared.Players.Enums.DEATH_STATES.STATE_INJURED */;
    player.character.setStoreData(player, "isDead", true);
    player.setVariable("isDead", true);
    const randomDeath = randomDeathAnimations[Math.floor(Math.random() * randomDeathAnimations.length)];
    player.playAnimation(randomDeath.dict, randomDeath.anim, 2, 9);
    player.setOwnVariable("deathAnim", { anim: randomDeath.anim, dict: randomDeath.dict });
    player.startScreenEffect("DeathFailMPIn", 0, true);
}


/***/ },

/***/ "./source/server/serverevents/MainMenu.event.ts"
/*!******************************************************!*\
  !*** ./source/server/serverevents/MainMenu.event.ts ***!
  \******************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const _api_1 = __webpack_require__(/*! @api */ "./source/server/api/index.ts");
const Arena_module_1 = __webpack_require__(/*! @arena/Arena.module */ "./source/server/arena/Arena.module.ts");
const ArenaPresets_asset_1 = __webpack_require__(/*! @arena/ArenaPresets.asset */ "./source/server/arena/ArenaPresets.asset.ts");
const ArenaMatch_manager_1 = __webpack_require__(/*! @arena/ArenaMatch.manager */ "./source/server/arena/ArenaMatch.manager.ts");
const Character_entity_1 = __webpack_require__(/*! @entities/Character.entity */ "./source/server/database/entity/Character.entity.ts");
const ArenaConfig_1 = __webpack_require__(/*! @arena/ArenaConfig */ "./source/server/arena/ArenaConfig.ts");
_api_1.RAGERP.cef.register("mainmenu", "playFreeroam", async (player) => {
    if (!player.character) {
        _api_1.RAGERP.cef.emit(player, "mainmenu", "playError", { message: "No character loaded." });
        return;
    }
    if ((0, ArenaMatch_manager_1.isPlayerInArenaMatch)(player)) {
        (0, ArenaMatch_manager_1.leaveMatch)(player, false);
        _api_1.RAGERP.cef.emit(player, "arena", "leftMatch", null);
    }
    const LEGION_SQUARE = { x: 213.0, y: -810.0, z: 30.73, heading: 160.0 };
    player.dimension = 0;
    player.setVariable("isSpectating", false);
    player.call("client::player:freeze", [false]);
    player.call("client::arena:zoneClear");
    player.call("client::arena:clearTeam");
    player.spawn(new mp.Vector3(LEGION_SQUARE.x, LEGION_SQUARE.y, LEGION_SQUARE.z));
    player.heading = LEGION_SQUARE.heading;
    player.health = 100;
    player.armour = 100;
    player.call("client::player:setVitals", [100, 100]);
    await _api_1.RAGERP.database.getRepository(Character_entity_1.CharacterEntity).update(player.character.id, {
        position: LEGION_SQUARE,
        lastlogin: player.character.lastlogin,
        deathState: player.character.deathState,
        cash: player.character.cash
    });
    player.call("client::cef:close");
    _api_1.RAGERP.cef.emit(player, "system", "setPage", "hud");
});
_api_1.RAGERP.cef.register("mainmenu", "openSettings", (player) => {
    _api_1.RAGERP.cef.startPage(player, "settings");
    _api_1.RAGERP.cef.emit(player, "system", "setPage", "settings");
});
_api_1.RAGERP.cef.register("mainmenu", "getArenaMaps", (player) => {
    const presets = (0, ArenaPresets_asset_1.getArenaPresets)();
    _api_1.RAGERP.cef.emit(player, "mainmenu", "setArenaMaps", {
        maps: presets.map((p) => ({ id: p.id, name: p.name }))
    });
});
_api_1.RAGERP.cef.register("mainmenu", "playArena", async (player, data) => {
    if (!player.character) {
        _api_1.RAGERP.cef.emit(player, "mainmenu", "playError", { message: "No character loaded." });
        return;
    }
    let size = 1;
    let mapId;
    try {
        const parsed = data ? (typeof data === "string" ? JSON.parse(data) : data) : null;
        if (parsed && typeof parsed === "object" && parsed.size !== undefined) {
            const s = Number(parsed.size);
            if (ArenaConfig_1.QUEUE_SIZES.includes(s))
                size = s;
        }
        if (parsed && typeof parsed === "object" && parsed.map) {
            mapId = String(parsed.map);
        }
    }
    catch {
        /* default */
    }
    if ((0, Arena_module_1.joinQueue)(player, size, mapId)) {
        _api_1.RAGERP.cef.startPage(player, "arena_lobby");
        _api_1.RAGERP.cef.emit(player, "system", "setPage", "arena_lobby");
    }
    else {
        _api_1.RAGERP.cef.emit(player, "mainmenu", "playError", { message: "Could not join queue. You may already be in it." });
    }
});


/***/ },

/***/ "./source/server/serverevents/Player.event.ts"
/*!****************************************************!*\
  !*** ./source/server/serverevents/Player.event.ts ***!
  \****************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.startSpectate = startSpectate;
exports.stopSpectate = stopSpectate;
const _api_1 = __webpack_require__(/*! @api */ "./source/server/api/index.ts");
const Ban_entity_1 = __webpack_require__(/*! @entities/Ban.entity */ "./source/server/database/entity/Ban.entity.ts");
const Character_entity_1 = __webpack_require__(/*! @entities/Character.entity */ "./source/server/database/entity/Character.entity.ts");
const Attachments_module_1 = __webpack_require__(/*! @modules/Attachments.module */ "./source/server/modules/Attachments.module.ts");
const ArenaMatch_manager_1 = __webpack_require__(/*! @arena/ArenaMatch.manager */ "./source/server/arena/ArenaMatch.manager.ts");
const LEGION_SQUARE = { x: 213.0, y: -810.0, z: 30.73, heading: 160.0 };
async function onPlayerJoin(player) {
    try {
        const banData = await _api_1.RAGERP.database.getRepository(Ban_entity_1.BanEntity).findOne({
            where: [{ serial: player.serial }, { ip: player.ip }, { username: player.name }, { rsgId: player.rgscId }]
        });
        if (banData) {
            if (_api_1.RAGERP.utils.hasDatePassedTimestamp(parseInt(banData.lifttime))) {
                await _api_1.RAGERP.database.getRepository(Ban_entity_1.BanEntity).delete({ id: banData.id });
            }
            else {
                player.kick(`Banned: ${banData.reason}`);
                return;
            }
        }
        player.account = null;
        player.character = null;
        player.lastPosition = null;
        player.emoteTimeout = null;
        player.setVariable("loggedin", false);
        player.setVariable("isSpectating", false);
        player.setVariable("adminLevel", 0);
        player.setVariable("emoteText", null);
        player.cdata = {};
    }
    catch (err) {
        console.error(err);
    }
}
async function onPlayerQuit(player) {
    if ((0, ArenaMatch_manager_1.isPlayerInArenaMatch)(player)) {
        (0, ArenaMatch_manager_1.leaveMatch)(player);
    }
    const character = player.character;
    if (!character)
        return;
    if (player.dimension !== 0) {
        await _api_1.RAGERP.database.getRepository(Character_entity_1.CharacterEntity).update(character.id, {
            position: LEGION_SQUARE,
            lastlogin: character.lastlogin,
            deathState: character.deathState,
            cash: character.cash
        });
    }
    else {
        const lastPosition = { ...player.position };
        await _api_1.RAGERP.database.getRepository(Character_entity_1.CharacterEntity).update(character.id, {
            position: { x: lastPosition.x, y: lastPosition.y, z: lastPosition.z, heading: player.heading },
            lastlogin: character.lastlogin,
            deathState: character.deathState,
            cash: character.cash
        });
    }
}
mp.events.add({
    "playerQuit": onPlayerQuit,
    "playerJoin": onPlayerJoin
});
/** Centralized spectate start: saves position, teleports to target, notifies client. Pass target.id (client uses as remoteId). */
function startSpectate(spectator, target) {
    if (!spectator || !mp.players.exists(spectator) || !target || !mp.players.exists(target))
        return;
    if (spectator.id === target.id)
        return;
    if (spectator.getVariable("isSpectating")) {
        stopSpectate(spectator);
        return;
    }
    spectator.lastPosition = new mp.Vector3(spectator.position.x, spectator.position.y, spectator.position.z);
    spectator.position = new mp.Vector3(target.position.x, target.position.y, target.position.z - 15);
    spectator.setVariable("isSpectating", true);
    spectator.call("client::spectate:start", [target.id]);
}
/** Restores position and stops spectate. Set restorePosition false when leaving arena so we don't teleport back to death spot. */
function stopSpectate(player, restorePosition = true) {
    if (!player || !mp.players.exists(player))
        return;
    player.setVariable("isSpectating", false);
    if (restorePosition && player.lastPosition) {
        player.position = player.lastPosition;
    }
    player.lastPosition = null;
    player.call("client::spectate:stop");
}
mp.events.add("server::spectate:stop", (player) => {
    stopSpectate(player);
});
mp.events.add("server::player:noclip", (player, status) => {
    player.setVariable("noclip", status);
    mp.players.forEachInRange(player.position, mp.config["stream-distance"], (nearbyPlayer) => {
        nearbyPlayer.call("client::player:noclip", [player.id, status]);
    });
});
mp.events.add("entityCreated", (entity) => {
    if (["vehicle", "player"].includes(entity.type)) {
        Attachments_module_1.entityAttachments.initFunctions(entity);
    }
});
_api_1.RAGERP.cef.register("settings", "changePassword", (player) => { });


/***/ },

/***/ "./source/server/serverevents/PlayerMenu.event.ts"
/*!********************************************************!*\
  !*** ./source/server/serverevents/PlayerMenu.event.ts ***!
  \********************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const _api_1 = __webpack_require__(/*! @api */ "./source/server/api/index.ts");
mp.events.add("server::playerMenu:close", (player) => {
    if (!player || !mp.players.exists(player))
        return;
    player.call("client::cef:close");
});
mp.events.add("server::player:setCefPage", (player, pageName) => {
    if (!player || !mp.players.exists(player))
        return;
    if (pageName !== "playerMenu")
        return;
    const players = mp.players.toArray().map((p) => ({
        id: p.id,
        name: p.name,
        ping: p.ping
    }));
    _api_1.RAGERP.cef.emit(player, "playerList", "setPlayers", players);
});


/***/ },

/***/ "./source/server/serverevents/Point.event.ts"
/*!***************************************************!*\
  !*** ./source/server/serverevents/Point.event.ts ***!
  \***************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const Point_class_1 = __webpack_require__(/*! @classes/Point.class */ "./source/server/classes/Point.class.ts");
mp.events.add("server::player:pressE", async (player) => {
    try {
        if (!mp.players.exists(player))
            return;
        const point = Point_class_1.DynamicPoint.getNearestPoint(player);
        if (!point)
            return;
        point.onKeyPress.constructor.name === "AsyncFunction" ? await point.onKeyPress(player) : point.onKeyPress(player);
    }
    catch (err) {
        console.error("dynamic point event err: ", err);
    }
});
mp.events.add("playerEnterColshape", (player, shape) => {
    if (typeof shape.enterHandler !== "undefined")
        shape.enterHandler(player);
});
mp.events.add("playerExitColshape", (player, shape) => {
    if (typeof shape.exitHandler !== "undefined")
        shape.exitHandler(player);
});


/***/ },

/***/ "./source/server/serverevents/Report.event.ts"
/*!****************************************************!*\
  !*** ./source/server/serverevents/Report.event.ts ***!
  \****************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.openReportPanel = openReportPanel;
exports.openStaffPanel = openStaffPanel;
const _api_1 = __webpack_require__(/*! @api */ "./source/server/api/index.ts");
const Report_manager_1 = __webpack_require__(/*! @report/Report.manager */ "./source/server/report/Report.manager.ts");
function isStaff(player) {
    return (player.getAdminLevel?.() ?? 0) >= 1 /* RageShared.Enums.ADMIN_LEVELS.LEVEL_ONE */;
}
function sendReportData(player, mode) {
    const playersList = mp.players.toArray().filter((p) => p.getVariable?.("loggedin")).map((p) => ({ id: p.id, name: p.name }));
    if (mode === "player") {
        _api_1.RAGERP.cef.emit(player, "report", "setData", {
            mode: "player",
            categories: Report_manager_1.REPORT_CATEGORIES,
            myReports: (0, Report_manager_1.getMyReports)(player.id),
            players: playersList.filter((p) => p.id !== player.id)
        });
    }
    else {
        _api_1.RAGERP.cef.emit(player, "report", "setData", {
            mode: "staff",
            categories: Report_manager_1.REPORT_CATEGORIES,
            reports: (0, Report_manager_1.getAllReports)(),
            players: playersList
        });
    }
}
function openReportPanel(player) {
    player.setVariable("reportPanelMode", "player");
    sendReportData(player, "player");
    _api_1.RAGERP.cef.startPage(player, "report");
    _api_1.RAGERP.cef.emit(player, "system", "setPage", "report");
}
function openStaffPanel(player) {
    if (!isStaff(player))
        return player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "No permission.");
    player.setVariable("reportPanelMode", "staff");
    sendReportData(player, "staff");
    _api_1.RAGERP.cef.startPage(player, "report");
    _api_1.RAGERP.cef.emit(player, "system", "setPage", "report");
}
function notifyStaffNewReport() {
    mp.players.forEach((p) => {
        if (isStaff(p) && p.getVariable?.("loggedin")) {
            _api_1.RAGERP.cef.emit(p, "report", "newReport", null);
        }
    });
}
_api_1.RAGERP.cef.register("report", "open", async (player) => openReportPanel(player));
_api_1.RAGERP.cef.register("report", "openStaff", async (player) => openStaffPanel(player));
_api_1.RAGERP.cef.register("report", "requestData", async (player) => {
    const mode = player.getVariable("reportPanelMode") ?? "player";
    if (mode === "staff" && !isStaff(player))
        return;
    sendReportData(player, mode);
});
_api_1.RAGERP.cef.register("report", "submit", async (player, data) => {
    try {
        const d = typeof data === "string" ? JSON.parse(data) : data;
        const { category, subject, message, reportedPlayerId = null, reportedPlayerName = null } = d;
        if (!category || !subject?.trim() || !message?.trim()) {
            return player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "Subject and message required.");
        }
        if ((0, Report_manager_1.getOpenCountForPlayer)(player.id) >= 3) {
            return player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "You have too many open reports.");
        }
        const report = (0, Report_manager_1.createReport)(player.id, player.name ?? "Unknown", category, subject.trim(), message.trim(), reportedPlayerId ?? null, reportedPlayerName ?? null);
        if (!report) {
            return player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "Max open reports reached.");
        }
        openReportPanel(player);
        notifyStaffNewReport();
        player.showNotify("success" /* RageShared.Enums.NotifyType.TYPE_SUCCESS */, "Report sent.");
    }
    catch (e) {
        player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "Failed to submit report.");
    }
});
_api_1.RAGERP.cef.register("report", "getMyReports", async (player) => {
    _api_1.RAGERP.cef.emit(player, "report", "setMyReports", (0, Report_manager_1.getMyReports)(player.id));
});
_api_1.RAGERP.cef.register("report", "getAllReports", async (player) => {
    if (!isStaff(player))
        return;
    _api_1.RAGERP.cef.emit(player, "report", "setReports", (0, Report_manager_1.getAllReports)());
});
_api_1.RAGERP.cef.register("report", "claim", async (player, reportId) => {
    if (!isStaff(player))
        return;
    const ok = (0, Report_manager_1.claimReport)(Number(reportId), player.id, player.name ?? "Staff");
    if (ok) {
        player.showNotify("success" /* RageShared.Enums.NotifyType.TYPE_SUCCESS */, "Report claimed.");
        _api_1.RAGERP.cef.emit(player, "report", "setReports", (0, Report_manager_1.getAllReports)());
    }
    else {
        player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "Could not claim report.");
    }
});
_api_1.RAGERP.cef.register("report", "unclaim", async (player, reportId) => {
    if (!isStaff(player))
        return;
    (0, Report_manager_1.unclaimReport)(Number(reportId));
    _api_1.RAGERP.cef.emit(player, "report", "setReports", (0, Report_manager_1.getAllReports)());
});
_api_1.RAGERP.cef.register("report", "close", async (player, reportId) => {
    if (!isStaff(player))
        return;
    (0, Report_manager_1.closeReport)(Number(reportId));
    player.showNotify("success" /* RageShared.Enums.NotifyType.TYPE_SUCCESS */, "Report closed.");
    _api_1.RAGERP.cef.emit(player, "report", "setReports", (0, Report_manager_1.getAllReports)());
});
_api_1.RAGERP.cef.register("report", "reopen", async (player, reportId) => {
    if (!isStaff(player))
        return;
    (0, Report_manager_1.reopenReport)(Number(reportId));
    _api_1.RAGERP.cef.emit(player, "report", "setReports", (0, Report_manager_1.getAllReports)());
});
_api_1.RAGERP.cef.register("report", "delete", async (player, reportId) => {
    if (!isStaff(player))
        return;
    (0, Report_manager_1.deleteReport)(Number(reportId));
    player.showNotify("success" /* RageShared.Enums.NotifyType.TYPE_SUCCESS */, "Report deleted.");
    _api_1.RAGERP.cef.emit(player, "report", "setReports", (0, Report_manager_1.getAllReports)());
});
_api_1.RAGERP.cef.register("report", "sendMessage", async (player, data) => {
    try {
        const d = typeof data === "string" ? JSON.parse(data) : data;
        const { reportId, message } = d;
        if (!reportId || !message?.trim())
            return;
        const r = (0, Report_manager_1.getReport)(Number(reportId));
        if (!r)
            return;
        const isStaffMember = isStaff(player);
        const canChat = isStaffMember || r.reporterId === player.id;
        if (!canChat)
            return;
        (0, Report_manager_1.addChatMessage)(Number(reportId), player.id, player.name ?? "?", message.trim());
        _api_1.RAGERP.cef.emit(player, "report", "setReportDetail", { report: (0, Report_manager_1.getReport)(Number(reportId)) });
        if (r.reporterId !== player.id) {
            const reporter = mp.players.at(r.reporterId);
            if (reporter && mp.players.exists(reporter)) {
                _api_1.RAGERP.cef.emit(reporter, "report", "newChatMessage", { reportId: r.id });
            }
        }
    }
    catch {
        /* ignore */
    }
});
_api_1.RAGERP.cef.register("report", "getReportDetail", async (player, reportId) => {
    const r = (0, Report_manager_1.getReport)(Number(reportId));
    if (!r)
        return;
    if (!isStaff(player) && r.reporterId !== player.id)
        return;
    _api_1.RAGERP.cef.emit(player, "report", "setReportDetail", { report: r });
});
_api_1.RAGERP.cef.register("report", "closePage", async (player) => {
    _api_1.RAGERP.cef.emit(player, "system", "setPage", "hud");
});


/***/ },

/***/ "./source/server/serverevents/Vehicle.event.ts"
/*!*****************************************************!*\
  !*** ./source/server/serverevents/Vehicle.event.ts ***!
  \*****************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const _api_1 = __webpack_require__(/*! @api */ "./source/server/api/index.ts");
const Interaction_class_1 = __webpack_require__(/*! @classes/Interaction.class */ "./source/server/classes/Interaction.class.ts");
/**
 * This events are triggered from client-side
 */
mp.events.add("server::vehicle:setTuningMod", (player, vehicleId, modIndex, modValue) => {
    const vehicle = _api_1.RAGERP.entities.vehicles.at(vehicleId);
    if (!vehicle || !mp.vehicles.exists(vehicle._vehicle))
        return;
    if (!player.vehicle || player.vehicle.id !== vehicle._vehicle.id || player.seat !== 0)
        return;
    vehicle.setTuningMod(modIndex, modValue);
});
mp.events.add("server::vehicle:setTrunkState", (player, vehicleid, state) => {
    const vehicle = _api_1.RAGERP.entities.vehicles.at(vehicleid);
    if (!vehicle || !mp.vehicles.exists(vehicle._vehicle))
        return;
    vehicle.setData("trunkState", state);
});
mp.events.add("server::vehicle:setHoodState", (player, vehicleid, state) => {
    const vehicle = _api_1.RAGERP.entities.vehicles.at(vehicleid);
    if (!vehicle || mp.vehicles.exists(vehicle._vehicle))
        return;
    vehicle.setData("hoodState", state);
});
mp.events.add("server::interaction:vehicle", async (player, vehicleId) => {
    const vehicle = _api_1.RAGERP.entities.vehicles.at(vehicleId);
    if (!vehicle || !vehicle._vehicle)
        return;
    player.interactionMenu = new Interaction_class_1.InteractionMenu();
    let interactionData;
    player.vehicle && player.vehicle.id === vehicleId
        ? (interactionData = [
            { id: 0, text: "Toggle Hood", type: 0 },
            { id: 1, text: "Toggle Trunk", type: 1 },
            { id: 2, text: "Lock Vehicle", type: 2 },
            { id: 3, text: `${player.vehicle.engine ? "Turn off Engine" : "Turn on Engine"}`, type: 3 },
            { id: 4, text: "Tune Vehicle", type: 4 }
        ])
        : (interactionData = [
            { id: 0, text: "Toggle Hood", type: 0 },
            { id: 1, text: "Toggle Trunk", type: 1 },
            { id: 2, text: "Lock Vehicle", type: 2 }
        ]);
    const result = await player.interactionMenu.new(player, { isActive: true, items: interactionData });
    if (result === null)
        return player.interactionMenu?.closeMenu(player);
    switch (result) {
        case 0: {
            vehicle.setData("hoodState", !vehicle.getData("hoodState"));
            break;
        }
        case 1: {
            vehicle.setData("trunkState", !vehicle.getData("trunkState"));
            break;
        }
        case 2: {
            vehicle.setData("locked", !vehicle.getData("locked"));
            break;
        }
        case 3: {
            vehicle.setData("engine", !vehicle.getData("engine"));
            break;
        }
        case 4: {
            _api_1.RAGERP.cef.startPage(player, "tuner");
            _api_1.RAGERP.cef.emit(player, "system", "setPage", "tuner");
            _api_1.RAGERP.cef.emit(player, "tuner", "setData", {
                vehicleId: vehicle._vehicle.id,
                mods: vehicle.getTuningMods()
            });
            break;
        }
    }
    player.interactionMenu?.closeMenu(player);
});
_api_1.RAGERP.cef.register("tuner", "applyMod", (player, data) => {
    const vehicle = _api_1.RAGERP.entities.vehicles.at(data.vehicleId);
    if (!vehicle || !player.vehicle || player.vehicle.id !== vehicle._vehicle.id || player.seat !== 0)
        return;
    vehicle.setTuningMod(data.modIndex, data.value);
});
_api_1.RAGERP.cef.register("tuner", "close", (player) => {
    player.call("client::cef:close");
});
/** Opens the vehicle tuning UI. Must be in driver seat. */
_api_1.RAGERP.commands.add({
    name: "tune",
    description: "Open the vehicle tuning UI (driver seat only). Or press G on your vehicle and choose 'Tune Vehicle'.",
    run: (player) => {
        if (!player.vehicle || player.seat !== 0)
            return player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "You must be in the driver seat to tune.");
        const vehicle = _api_1.RAGERP.entities.vehicles.at(player.vehicle.id);
        if (!vehicle || !mp.vehicles.exists(vehicle._vehicle))
            return player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "This vehicle cannot be tuned.");
        _api_1.RAGERP.cef.startPage(player, "tuner");
        _api_1.RAGERP.cef.emit(player, "system", "setPage", "tuner");
        _api_1.RAGERP.cef.emit(player, "tuner", "setData", {
            vehicleId: vehicle._vehicle.id,
            mods: vehicle.getTuningMods()
        });
    }
});
_api_1.RAGERP.commands.add({
    name: "tunemod",
    description: "Set a single mod by index (advanced). Prefer /tune for the tuning UI.",
    run: (player, _fulltext, modIndexStr, valueStr) => {
        if (!player.vehicle || player.seat !== 0)
            return player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "You must be in the driver seat.");
        const vehicle = _api_1.RAGERP.entities.vehicles.at(player.vehicle.id);
        if (!vehicle || !mp.vehicles.exists(vehicle._vehicle))
            return player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "This vehicle cannot be tuned.");
        const modIndex = parseInt(modIndexStr ?? "", 10);
        const value = parseInt(valueStr ?? "-1", 10);
        if (Number.isNaN(modIndex) || Number.isNaN(value)) {
            player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "Use /tune to open the tuning UI, or /tunemod <modIndex> <value> (e.g. 0 1 = Spoiler, 55 1 = Window Tint, -1 = stock).");
            return _api_1.RAGERP.chat.sendSyntaxError(player, "/tunemod <modIndex> <value>");
        }
        vehicle.setTuningMod(modIndex, value);
        player.showNotify("success" /* RageShared.Enums.NotifyType.TYPE_SUCCESS */, `Mod ${modIndex} set to ${value}.`);
    }
});


/***/ },

/***/ "./source/server/serverevents/Voice.event.ts"
/*!***************************************************!*\
  !*** ./source/server/serverevents/Voice.event.ts ***!
  \***************************************************/
() {


/**
 * Local and team voice: client requests add/remove listeners; server enables/disables voice stream.
 * Arena teammates are set in ArenaMatch.manager via arenaTeammateIds variable.
 */
mp.events.add("server::voice:addListener", (player, targetId) => {
    if (player == null || !mp.players.exists(player))
        return;
    const target = typeof targetId === "number" ? mp.players.at(targetId) : null;
    if (target && mp.players.exists(target))
        player.enableVoiceTo(target);
});
mp.events.add("server::voice:removeListener", (player, targetId) => {
    if (player == null || !mp.players.exists(player))
        return;
    const target = typeof targetId === "number" ? mp.players.at(targetId) : null;
    if (target && mp.players.exists(target))
        player.disableVoiceTo(target);
});


/***/ },

/***/ "./source/server/serverevents/Wardrobe.event.ts"
/*!******************************************************!*\
  !*** ./source/server/serverevents/Wardrobe.event.ts ***!
  \******************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const _api_1 = __webpack_require__(/*! @api */ "./source/server/api/index.ts");
const Character_entity_1 = __webpack_require__(/*! @entities/Character.entity */ "./source/server/database/entity/Character.entity.ts");
const CEFEvent_class_1 = __webpack_require__(/*! @classes/CEFEvent.class */ "./source/server/classes/CEFEvent.class.ts");
const defaultClothesMale = { hats: { drawable: 0, texture: 0 }, masks: { drawable: 0, texture: 0 }, tops: { drawable: 15, texture: 0 }, pants: { drawable: 21, texture: 0 }, shoes: { drawable: 34, texture: 0 } };
const defaultClothesFemale = { ...defaultClothesMale, pants: { drawable: 15, texture: 0 }, shoes: { drawable: 35, texture: 0 } };
function getClothesForPlayer(player) {
    const base = player.character?.gender === 1 ? defaultClothesFemale : defaultClothesMale;
    const stored = player.character?.appearance?.clothes;
    const clothes = { ...base };
    if (stored && typeof stored === "object") {
        if (stored.hats)
            clothes.hats = { ...base.hats, ...stored.hats };
        if (stored.masks)
            clothes.masks = { ...base.masks, ...stored.masks };
        if (stored.tops)
            clothes.tops = { ...base.tops, ...stored.tops };
        if (stored.pants)
            clothes.pants = { ...base.pants, ...stored.pants };
        if (stored.shoes)
            clothes.shoes = { ...base.shoes, ...stored.shoes };
    }
    return clothes;
}
const WARDROBE_DIMENSION_BASE = 5000;
function openWardrobe(player) {
    if (!player.character)
        return player.showNotify("error" /* RageShared.Enums.NotifyType.TYPE_ERROR */, "You must be logged in.");
    player.setVariable("wardrobePreviousDimension", player.dimension);
    player.dimension = WARDROBE_DIMENSION_BASE + player.id;
    const clothes = getClothesForPlayer(player);
    CEFEvent_class_1.CefEvent.emit(player, "wardrobe", "setClothes", clothes);
    _api_1.RAGERP.cef.startPage(player, "wardrobe");
    _api_1.RAGERP.cef.emit(player, "system", "setPage", "wardrobe");
}
_api_1.RAGERP.commands.add({
    name: "clothing",
    aliases: ["clothes"],
    description: "Open clothing menu to change clothes",
    run: (player) => openWardrobe(player)
});
_api_1.RAGERP.cef.register("wardrobe", "open", async (player) => openWardrobe(player));
_api_1.RAGERP.cef.register("wardrobe", "getClothes", async (player) => {
    if (!player.character)
        return;
    const clothes = getClothesForPlayer(player);
    CEFEvent_class_1.CefEvent.emit(player, "wardrobe", "setClothes", clothes);
});
function saveClothesAndSync(player, clothes) {
    player.character.appearance.clothes = clothes;
    const clothesJson = JSON.stringify(clothes);
    player.setVariable("clothes", clothesJson);
    player.call("client::wardrobe:applyClothes", [clothesJson]);
}
_api_1.RAGERP.cef.register("wardrobe", "save", async (player, data) => {
    if (!player.character)
        return;
    const clothes = _api_1.RAGERP.utils.parseObject(data);
    player.character.appearance.clothes = clothes;
    await _api_1.RAGERP.database.getRepository(Character_entity_1.CharacterEntity).update(player.character.id, {
        appearance: player.character.appearance
    });
    saveClothesAndSync(player, clothes);
    player.call("client::cef:close");
    player.showNotify("success" /* RageShared.Enums.NotifyType.TYPE_SUCCESS */, "Outfit saved!");
});
_api_1.RAGERP.cef.register("wardrobe", "saveInline", async (player, data) => {
    if (!player.character)
        return;
    const clothes = _api_1.RAGERP.utils.parseObject(data);
    player.character.appearance.clothes = clothes;
    await _api_1.RAGERP.database.getRepository(Character_entity_1.CharacterEntity).update(player.character.id, {
        appearance: player.character.appearance
    });
    saveClothesAndSync(player, clothes);
    player.showNotify("success" /* RageShared.Enums.NotifyType.TYPE_SUCCESS */, "Outfit saved!");
});
_api_1.RAGERP.cef.register("wardrobe", "close", async (player) => {
    player.call("client::cef:close");
});
mp.events.add("server::player:closeCEF", (player, page) => {
    if (page === "wardrobe") {
        const prev = player.getVariable("wardrobePreviousDimension");
        player.dimension = typeof prev === "number" ? prev : 0;
        player.setVariable("wardrobePreviousDimension", undefined);
    }
});


/***/ },

/***/ "./source/shared/index.ts"
/*!********************************!*\
  !*** ./source/shared/index.ts ***!
  \********************************/
(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RageShared = void 0;
var RageShared;
(function (RageShared) {
    let Inventory;
    (function (Inventory) {
        let Enums;
        (function (Enums) {
            Enums.INVENTORY_EQUIPMENTS = {
                hat: "0",
                mask: "1",
                glasses: "2",
                earRings: "3",
                chain: "4",
                tShirt: "5",
                top: "6",
                backpack: "7",
                wallet: "8",
                armour: "9",
                watch: "10",
                gloves: "11",
                pants: "12",
                shoes: "13"
            };
            let INVENTORY_CATEGORIES;
            (function (INVENTORY_CATEGORIES) {
                INVENTORY_CATEGORIES["CLOTHES"] = "clothes";
                INVENTORY_CATEGORIES["POCKETS"] = "pockets";
            })(INVENTORY_CATEGORIES = Enums.INVENTORY_CATEGORIES || (Enums.INVENTORY_CATEGORIES = {}));
        })(Enums = Inventory.Enums || (Inventory.Enums = {}));
    })(Inventory = RageShared.Inventory || (RageShared.Inventory = {}));
})(RageShared || (exports.RageShared = RageShared = {}));


/***/ },

/***/ "./source/shared/utils.module.ts"
/*!***************************************!*\
  !*** ./source/shared/utils.module.ts ***!
  \***************************************/
(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Utils = void 0;
/**
 * Utility functions used throughout the client and server side
 */
exports.Utils = {
    /**
     * Delays execution for a specified number of milliseconds.
     * @param {number} ms - The number of milliseconds to sleep.
     * @returns {Promise<void>} A promise that resolves after the specified delay.
     */
    sleep: function (ms) {
        return new Promise((res) => setTimeout(res, ms));
    },
    /**
     * Checks if the current date has passed a given timestamp.
     * @param {number} timestamp - The timestamp to compare against the current date.
     * @returns {boolean} True if the current date has passed the timestamp, otherwise false.
     */
    hasDatePassedTimestamp: function (timestamp) {
        const currentTimestamp = Date.now();
        return currentTimestamp > timestamp;
    },
    /**
     * Attempts to parse a JSON string.
     * @param {any} obj - The object to parse.
     * @returns {any} The parsed object if successful, otherwise the original object.
     */
    tryParse: function (obj) {
        try {
            return JSON.parse(obj);
        }
        catch (_err) {
            return obj;
        }
    },
    /**
     * Calculates the distance between two 3D points.
     * @param {Vector3} first - The first point.
     * @param {Vector3} second - The second point.
     * @returns {number} The distance between the two points.
     */
    distanceToPos: function (first, second) {
        return Math.abs(Math.sqrt(Math.pow(second.x - first.x, 2) + Math.pow(second.y - first.y, 2) + Math.pow(second.z - first.z, 2)));
    },
    /**
     * Converts an object to a JSON string.
     * @template T
     * @param {T} obj - The object to stringify.
     * @returns {StringifiedObject<T>} The JSON string representation of the object.
     */
    stringifyObject: function (obj) {
        return JSON.stringify(obj);
    },
    /**
     * Parses a JSON string back into an object.
     * @template T
     * @param {StringifiedObject<T>} str - The JSON string to parse.
     * @returns {T} The parsed object.
     */
    parseObject: function (str) {
        return JSON.parse(str);
    },
    /**
     * Sends a debug message to the server.
     * @param {string} message - The debug message.
     * @param {...any} args - Additional arguments to include with the message.
     */
    clientDebug: function (message, ...args) {
        //@ts-ignore
        mp.events.callRemote("server::client:debug", message, ...args);
    },
    /**
     * Returns a random element from an array.
     * @template T
     * @param {Array<T>} array - The array to sample from.
     * @returns {T} A random element from the array.
     */
    getRandomFromArray: function (array) {
        return array[Math.floor(Math.random() * array.length)];
    },
    /**
     * Converts a hexadecimal string representation of a floating-point number to a JavaScript float.
     *
     * @param {string} str - The hexadecimal string (without the "0x" prefix) representing the floating-point number.
     * @returns {number} - The corresponding floating-point number, or 0 if the input is invalid.
     */
    parseHexAsFloat: function (str) {
        let int = parseInt("0x" + str, 16);
        if (isNaN(int)) {
            return 0;
        }
        const sign = int >>> 31 ? -1 : 1;
        const exp = ((int >>> 23) & 0xff) - 127;
        const mantiss = (int & 0x7fffff) + 0x800000;
        return sign * mantiss * Math.pow(2, exp - 23);
    }
};


/***/ },

/***/ "./node_modules/uuid/dist/esm-node/index.js"
/*!**************************************************!*\
  !*** ./node_modules/uuid/dist/esm-node/index.js ***!
  \**************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   NIL: () => (/* reexport safe */ _nil_js__WEBPACK_IMPORTED_MODULE_4__["default"]),
/* harmony export */   parse: () => (/* reexport safe */ _parse_js__WEBPACK_IMPORTED_MODULE_8__["default"]),
/* harmony export */   stringify: () => (/* reexport safe */ _stringify_js__WEBPACK_IMPORTED_MODULE_7__["default"]),
/* harmony export */   v1: () => (/* reexport safe */ _v1_js__WEBPACK_IMPORTED_MODULE_0__["default"]),
/* harmony export */   v3: () => (/* reexport safe */ _v3_js__WEBPACK_IMPORTED_MODULE_1__["default"]),
/* harmony export */   v4: () => (/* reexport safe */ _v4_js__WEBPACK_IMPORTED_MODULE_2__["default"]),
/* harmony export */   v5: () => (/* reexport safe */ _v5_js__WEBPACK_IMPORTED_MODULE_3__["default"]),
/* harmony export */   validate: () => (/* reexport safe */ _validate_js__WEBPACK_IMPORTED_MODULE_6__["default"]),
/* harmony export */   version: () => (/* reexport safe */ _version_js__WEBPACK_IMPORTED_MODULE_5__["default"])
/* harmony export */ });
/* harmony import */ var _v1_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./v1.js */ "./node_modules/uuid/dist/esm-node/v1.js");
/* harmony import */ var _v3_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./v3.js */ "./node_modules/uuid/dist/esm-node/v3.js");
/* harmony import */ var _v4_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./v4.js */ "./node_modules/uuid/dist/esm-node/v4.js");
/* harmony import */ var _v5_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./v5.js */ "./node_modules/uuid/dist/esm-node/v5.js");
/* harmony import */ var _nil_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./nil.js */ "./node_modules/uuid/dist/esm-node/nil.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./version.js */ "./node_modules/uuid/dist/esm-node/version.js");
/* harmony import */ var _validate_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./validate.js */ "./node_modules/uuid/dist/esm-node/validate.js");
/* harmony import */ var _stringify_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./stringify.js */ "./node_modules/uuid/dist/esm-node/stringify.js");
/* harmony import */ var _parse_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./parse.js */ "./node_modules/uuid/dist/esm-node/parse.js");










/***/ },

/***/ "./node_modules/uuid/dist/esm-node/md5.js"
/*!************************************************!*\
  !*** ./node_modules/uuid/dist/esm-node/md5.js ***!
  \************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var crypto__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! crypto */ "crypto");
/* harmony import */ var crypto__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(crypto__WEBPACK_IMPORTED_MODULE_0__);


function md5(bytes) {
  if (Array.isArray(bytes)) {
    bytes = Buffer.from(bytes);
  } else if (typeof bytes === 'string') {
    bytes = Buffer.from(bytes, 'utf8');
  }

  return crypto__WEBPACK_IMPORTED_MODULE_0___default().createHash('md5').update(bytes).digest();
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (md5);

/***/ },

/***/ "./node_modules/uuid/dist/esm-node/native.js"
/*!***************************************************!*\
  !*** ./node_modules/uuid/dist/esm-node/native.js ***!
  \***************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var crypto__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! crypto */ "crypto");
/* harmony import */ var crypto__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(crypto__WEBPACK_IMPORTED_MODULE_0__);

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  randomUUID: (crypto__WEBPACK_IMPORTED_MODULE_0___default().randomUUID)
});

/***/ },

/***/ "./node_modules/uuid/dist/esm-node/nil.js"
/*!************************************************!*\
  !*** ./node_modules/uuid/dist/esm-node/nil.js ***!
  \************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ('00000000-0000-0000-0000-000000000000');

/***/ },

/***/ "./node_modules/uuid/dist/esm-node/parse.js"
/*!**************************************************!*\
  !*** ./node_modules/uuid/dist/esm-node/parse.js ***!
  \**************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _validate_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./validate.js */ "./node_modules/uuid/dist/esm-node/validate.js");


function parse(uuid) {
  if (!(0,_validate_js__WEBPACK_IMPORTED_MODULE_0__["default"])(uuid)) {
    throw TypeError('Invalid UUID');
  }

  let v;
  const arr = new Uint8Array(16); // Parse ########-....-....-....-............

  arr[0] = (v = parseInt(uuid.slice(0, 8), 16)) >>> 24;
  arr[1] = v >>> 16 & 0xff;
  arr[2] = v >>> 8 & 0xff;
  arr[3] = v & 0xff; // Parse ........-####-....-....-............

  arr[4] = (v = parseInt(uuid.slice(9, 13), 16)) >>> 8;
  arr[5] = v & 0xff; // Parse ........-....-####-....-............

  arr[6] = (v = parseInt(uuid.slice(14, 18), 16)) >>> 8;
  arr[7] = v & 0xff; // Parse ........-....-....-####-............

  arr[8] = (v = parseInt(uuid.slice(19, 23), 16)) >>> 8;
  arr[9] = v & 0xff; // Parse ........-....-....-....-############
  // (Use "/" to avoid 32-bit truncation when bit-shifting high-order bytes)

  arr[10] = (v = parseInt(uuid.slice(24, 36), 16)) / 0x10000000000 & 0xff;
  arr[11] = v / 0x100000000 & 0xff;
  arr[12] = v >>> 24 & 0xff;
  arr[13] = v >>> 16 & 0xff;
  arr[14] = v >>> 8 & 0xff;
  arr[15] = v & 0xff;
  return arr;
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (parse);

/***/ },

/***/ "./node_modules/uuid/dist/esm-node/regex.js"
/*!**************************************************!*\
  !*** ./node_modules/uuid/dist/esm-node/regex.js ***!
  \**************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (/^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i);

/***/ },

/***/ "./node_modules/uuid/dist/esm-node/rng.js"
/*!************************************************!*\
  !*** ./node_modules/uuid/dist/esm-node/rng.js ***!
  \************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ rng)
/* harmony export */ });
/* harmony import */ var crypto__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! crypto */ "crypto");
/* harmony import */ var crypto__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(crypto__WEBPACK_IMPORTED_MODULE_0__);

const rnds8Pool = new Uint8Array(256); // # of random values to pre-allocate

let poolPtr = rnds8Pool.length;
function rng() {
  if (poolPtr > rnds8Pool.length - 16) {
    crypto__WEBPACK_IMPORTED_MODULE_0___default().randomFillSync(rnds8Pool);
    poolPtr = 0;
  }

  return rnds8Pool.slice(poolPtr, poolPtr += 16);
}

/***/ },

/***/ "./node_modules/uuid/dist/esm-node/sha1.js"
/*!*************************************************!*\
  !*** ./node_modules/uuid/dist/esm-node/sha1.js ***!
  \*************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var crypto__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! crypto */ "crypto");
/* harmony import */ var crypto__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(crypto__WEBPACK_IMPORTED_MODULE_0__);


function sha1(bytes) {
  if (Array.isArray(bytes)) {
    bytes = Buffer.from(bytes);
  } else if (typeof bytes === 'string') {
    bytes = Buffer.from(bytes, 'utf8');
  }

  return crypto__WEBPACK_IMPORTED_MODULE_0___default().createHash('sha1').update(bytes).digest();
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (sha1);

/***/ },

/***/ "./node_modules/uuid/dist/esm-node/stringify.js"
/*!******************************************************!*\
  !*** ./node_modules/uuid/dist/esm-node/stringify.js ***!
  \******************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   unsafeStringify: () => (/* binding */ unsafeStringify)
/* harmony export */ });
/* harmony import */ var _validate_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./validate.js */ "./node_modules/uuid/dist/esm-node/validate.js");

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */

const byteToHex = [];

for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 0x100).toString(16).slice(1));
}

function unsafeStringify(arr, offset = 0) {
  // Note: Be careful editing this code!  It's been tuned for performance
  // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
  return byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]];
}

function stringify(arr, offset = 0) {
  const uuid = unsafeStringify(arr, offset); // Consistency check for valid UUID.  If this throws, it's likely due to one
  // of the following:
  // - One or more input array values don't map to a hex octet (leading to
  // "undefined" in the uuid)
  // - Invalid input values for the RFC `version` or `variant` fields

  if (!(0,_validate_js__WEBPACK_IMPORTED_MODULE_0__["default"])(uuid)) {
    throw TypeError('Stringified UUID is invalid');
  }

  return uuid;
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (stringify);

/***/ },

/***/ "./node_modules/uuid/dist/esm-node/v1.js"
/*!***********************************************!*\
  !*** ./node_modules/uuid/dist/esm-node/v1.js ***!
  \***********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _rng_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./rng.js */ "./node_modules/uuid/dist/esm-node/rng.js");
/* harmony import */ var _stringify_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./stringify.js */ "./node_modules/uuid/dist/esm-node/stringify.js");

 // **`v1()` - Generate time-based UUID**
//
// Inspired by https://github.com/LiosK/UUID.js
// and http://docs.python.org/library/uuid.html

let _nodeId;

let _clockseq; // Previous uuid creation time


let _lastMSecs = 0;
let _lastNSecs = 0; // See https://github.com/uuidjs/uuid for API details

function v1(options, buf, offset) {
  let i = buf && offset || 0;
  const b = buf || new Array(16);
  options = options || {};
  let node = options.node || _nodeId;
  let clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq; // node and clockseq need to be initialized to random values if they're not
  // specified.  We do this lazily to minimize issues related to insufficient
  // system entropy.  See #189

  if (node == null || clockseq == null) {
    const seedBytes = options.random || (options.rng || _rng_js__WEBPACK_IMPORTED_MODULE_0__["default"])();

    if (node == null) {
      // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
      node = _nodeId = [seedBytes[0] | 0x01, seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]];
    }

    if (clockseq == null) {
      // Per 4.2.2, randomize (14 bit) clockseq
      clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 0x3fff;
    }
  } // UUID timestamps are 100 nano-second units since the Gregorian epoch,
  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.


  let msecs = options.msecs !== undefined ? options.msecs : Date.now(); // Per 4.2.1.2, use count of uuid's generated during the current clock
  // cycle to simulate higher resolution clock

  let nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1; // Time since last uuid creation (in msecs)

  const dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 10000; // Per 4.2.1.2, Bump clockseq on clock regression

  if (dt < 0 && options.clockseq === undefined) {
    clockseq = clockseq + 1 & 0x3fff;
  } // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
  // time interval


  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
    nsecs = 0;
  } // Per 4.2.1.2 Throw error if too many uuids are requested


  if (nsecs >= 10000) {
    throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
  }

  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq; // Per 4.1.4 - Convert from unix epoch to Gregorian epoch

  msecs += 12219292800000; // `time_low`

  const tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
  b[i++] = tl >>> 24 & 0xff;
  b[i++] = tl >>> 16 & 0xff;
  b[i++] = tl >>> 8 & 0xff;
  b[i++] = tl & 0xff; // `time_mid`

  const tmh = msecs / 0x100000000 * 10000 & 0xfffffff;
  b[i++] = tmh >>> 8 & 0xff;
  b[i++] = tmh & 0xff; // `time_high_and_version`

  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version

  b[i++] = tmh >>> 16 & 0xff; // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)

  b[i++] = clockseq >>> 8 | 0x80; // `clock_seq_low`

  b[i++] = clockseq & 0xff; // `node`

  for (let n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }

  return buf || (0,_stringify_js__WEBPACK_IMPORTED_MODULE_1__.unsafeStringify)(b);
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (v1);

/***/ },

/***/ "./node_modules/uuid/dist/esm-node/v3.js"
/*!***********************************************!*\
  !*** ./node_modules/uuid/dist/esm-node/v3.js ***!
  \***********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _v35_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./v35.js */ "./node_modules/uuid/dist/esm-node/v35.js");
/* harmony import */ var _md5_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./md5.js */ "./node_modules/uuid/dist/esm-node/md5.js");


const v3 = (0,_v35_js__WEBPACK_IMPORTED_MODULE_0__["default"])('v3', 0x30, _md5_js__WEBPACK_IMPORTED_MODULE_1__["default"]);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (v3);

/***/ },

/***/ "./node_modules/uuid/dist/esm-node/v35.js"
/*!************************************************!*\
  !*** ./node_modules/uuid/dist/esm-node/v35.js ***!
  \************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DNS: () => (/* binding */ DNS),
/* harmony export */   URL: () => (/* binding */ URL),
/* harmony export */   "default": () => (/* binding */ v35)
/* harmony export */ });
/* harmony import */ var _stringify_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./stringify.js */ "./node_modules/uuid/dist/esm-node/stringify.js");
/* harmony import */ var _parse_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./parse.js */ "./node_modules/uuid/dist/esm-node/parse.js");



function stringToBytes(str) {
  str = unescape(encodeURIComponent(str)); // UTF8 escape

  const bytes = [];

  for (let i = 0; i < str.length; ++i) {
    bytes.push(str.charCodeAt(i));
  }

  return bytes;
}

const DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
const URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
function v35(name, version, hashfunc) {
  function generateUUID(value, namespace, buf, offset) {
    var _namespace;

    if (typeof value === 'string') {
      value = stringToBytes(value);
    }

    if (typeof namespace === 'string') {
      namespace = (0,_parse_js__WEBPACK_IMPORTED_MODULE_1__["default"])(namespace);
    }

    if (((_namespace = namespace) === null || _namespace === void 0 ? void 0 : _namespace.length) !== 16) {
      throw TypeError('Namespace must be array-like (16 iterable integer values, 0-255)');
    } // Compute hash of namespace and value, Per 4.3
    // Future: Use spread syntax when supported on all platforms, e.g. `bytes =
    // hashfunc([...namespace, ... value])`


    let bytes = new Uint8Array(16 + value.length);
    bytes.set(namespace);
    bytes.set(value, namespace.length);
    bytes = hashfunc(bytes);
    bytes[6] = bytes[6] & 0x0f | version;
    bytes[8] = bytes[8] & 0x3f | 0x80;

    if (buf) {
      offset = offset || 0;

      for (let i = 0; i < 16; ++i) {
        buf[offset + i] = bytes[i];
      }

      return buf;
    }

    return (0,_stringify_js__WEBPACK_IMPORTED_MODULE_0__.unsafeStringify)(bytes);
  } // Function#name is not settable on some platforms (#270)


  try {
    generateUUID.name = name; // eslint-disable-next-line no-empty
  } catch (err) {} // For CommonJS default export support


  generateUUID.DNS = DNS;
  generateUUID.URL = URL;
  return generateUUID;
}

/***/ },

/***/ "./node_modules/uuid/dist/esm-node/v4.js"
/*!***********************************************!*\
  !*** ./node_modules/uuid/dist/esm-node/v4.js ***!
  \***********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _native_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./native.js */ "./node_modules/uuid/dist/esm-node/native.js");
/* harmony import */ var _rng_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./rng.js */ "./node_modules/uuid/dist/esm-node/rng.js");
/* harmony import */ var _stringify_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./stringify.js */ "./node_modules/uuid/dist/esm-node/stringify.js");




function v4(options, buf, offset) {
  if (_native_js__WEBPACK_IMPORTED_MODULE_0__["default"].randomUUID && !buf && !options) {
    return _native_js__WEBPACK_IMPORTED_MODULE_0__["default"].randomUUID();
  }

  options = options || {};
  const rnds = options.random || (options.rng || _rng_js__WEBPACK_IMPORTED_MODULE_1__["default"])(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

  rnds[6] = rnds[6] & 0x0f | 0x40;
  rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

  if (buf) {
    offset = offset || 0;

    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }

    return buf;
  }

  return (0,_stringify_js__WEBPACK_IMPORTED_MODULE_2__.unsafeStringify)(rnds);
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (v4);

/***/ },

/***/ "./node_modules/uuid/dist/esm-node/v5.js"
/*!***********************************************!*\
  !*** ./node_modules/uuid/dist/esm-node/v5.js ***!
  \***********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _v35_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./v35.js */ "./node_modules/uuid/dist/esm-node/v35.js");
/* harmony import */ var _sha1_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./sha1.js */ "./node_modules/uuid/dist/esm-node/sha1.js");


const v5 = (0,_v35_js__WEBPACK_IMPORTED_MODULE_0__["default"])('v5', 0x50, _sha1_js__WEBPACK_IMPORTED_MODULE_1__["default"]);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (v5);

/***/ },

/***/ "./node_modules/uuid/dist/esm-node/validate.js"
/*!*****************************************************!*\
  !*** ./node_modules/uuid/dist/esm-node/validate.js ***!
  \*****************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _regex_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./regex.js */ "./node_modules/uuid/dist/esm-node/regex.js");


function validate(uuid) {
  return typeof uuid === 'string' && _regex_js__WEBPACK_IMPORTED_MODULE_0__["default"].test(uuid);
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (validate);

/***/ },

/***/ "./node_modules/uuid/dist/esm-node/version.js"
/*!****************************************************!*\
  !*** ./node_modules/uuid/dist/esm-node/version.js ***!
  \****************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _validate_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./validate.js */ "./node_modules/uuid/dist/esm-node/validate.js");


function version(uuid) {
  if (!(0,_validate_js__WEBPACK_IMPORTED_MODULE_0__["default"])(uuid)) {
    throw TypeError('Invalid UUID');
  }

  return parseInt(uuid.slice(14, 15), 16);
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (version);

/***/ },

/***/ "dotenv"
/*!*************************!*\
  !*** external "dotenv" ***!
  \*************************/
(module) {

module.exports = require("dotenv");

/***/ },

/***/ "reflect-metadata"
/*!***********************************!*\
  !*** external "reflect-metadata" ***!
  \***********************************/
(module) {

module.exports = require("reflect-metadata");

/***/ },

/***/ "typeorm"
/*!**************************!*\
  !*** external "typeorm" ***!
  \**************************/
(module) {

module.exports = require("typeorm");

/***/ },

/***/ "crypto"
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
(module) {

module.exports = require("crypto");

/***/ },

/***/ "fs"
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
(module) {

module.exports = require("fs");

/***/ },

/***/ "path"
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
(module) {

module.exports = require("path");

/***/ },

/***/ "tty"
/*!**********************!*\
  !*** external "tty" ***!
  \**********************/
(module) {

module.exports = require("tty");

/***/ },

/***/ "./node_modules/colorette/index.cjs"
/*!******************************************!*\
  !*** ./node_modules/colorette/index.cjs ***!
  \******************************************/
(__unused_webpack_module, exports, __webpack_require__) {



Object.defineProperty(exports, "__esModule", ({ value: true }));

var tty = __webpack_require__(/*! tty */ "tty");

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n["default"] = e;
  return Object.freeze(n);
}

var tty__namespace = /*#__PURE__*/_interopNamespace(tty);

const {
  env = {},
  argv = [],
  platform = "",
} = typeof process === "undefined" ? {} : process;

const isDisabled = "NO_COLOR" in env || argv.includes("--no-color");
const isForced = "FORCE_COLOR" in env || argv.includes("--color");
const isWindows = platform === "win32";
const isDumbTerminal = env.TERM === "dumb";

const isCompatibleTerminal =
  tty__namespace && tty__namespace.isatty && tty__namespace.isatty(1) && env.TERM && !isDumbTerminal;

const isCI =
  "CI" in env &&
  ("GITHUB_ACTIONS" in env || "GITLAB_CI" in env || "CIRCLECI" in env);

const isColorSupported =
  !isDisabled &&
  (isForced || (isWindows && !isDumbTerminal) || isCompatibleTerminal || isCI);

const replaceClose = (
  index,
  string,
  close,
  replace,
  head = string.substring(0, index) + replace,
  tail = string.substring(index + close.length),
  next = tail.indexOf(close)
) => head + (next < 0 ? tail : replaceClose(next, tail, close, replace));

const clearBleed = (index, string, open, close, replace) =>
  index < 0
    ? open + string + close
    : open + replaceClose(index, string, close, replace) + close;

const filterEmpty =
  (open, close, replace = open, at = open.length + 1) =>
  (string) =>
    string || !(string === "" || string === undefined)
      ? clearBleed(
          ("" + string).indexOf(close, at),
          string,
          open,
          close,
          replace
        )
      : "";

const init = (open, close, replace) =>
  filterEmpty(`\x1b[${open}m`, `\x1b[${close}m`, replace);

const colors = {
  reset: init(0, 0),
  bold: init(1, 22, "\x1b[22m\x1b[1m"),
  dim: init(2, 22, "\x1b[22m\x1b[2m"),
  italic: init(3, 23),
  underline: init(4, 24),
  inverse: init(7, 27),
  hidden: init(8, 28),
  strikethrough: init(9, 29),
  black: init(30, 39),
  red: init(31, 39),
  green: init(32, 39),
  yellow: init(33, 39),
  blue: init(34, 39),
  magenta: init(35, 39),
  cyan: init(36, 39),
  white: init(37, 39),
  gray: init(90, 39),
  bgBlack: init(40, 49),
  bgRed: init(41, 49),
  bgGreen: init(42, 49),
  bgYellow: init(43, 49),
  bgBlue: init(44, 49),
  bgMagenta: init(45, 49),
  bgCyan: init(46, 49),
  bgWhite: init(47, 49),
  blackBright: init(90, 39),
  redBright: init(91, 39),
  greenBright: init(92, 39),
  yellowBright: init(93, 39),
  blueBright: init(94, 39),
  magentaBright: init(95, 39),
  cyanBright: init(96, 39),
  whiteBright: init(97, 39),
  bgBlackBright: init(100, 49),
  bgRedBright: init(101, 49),
  bgGreenBright: init(102, 49),
  bgYellowBright: init(103, 49),
  bgBlueBright: init(104, 49),
  bgMagentaBright: init(105, 49),
  bgCyanBright: init(106, 49),
  bgWhiteBright: init(107, 49),
};

const createColors = ({ useColor = isColorSupported } = {}) =>
  useColor
    ? colors
    : Object.keys(colors).reduce(
        (colors, key) => ({ ...colors, [key]: String }),
        {}
      );

const {
  reset,
  bold,
  dim,
  italic,
  underline,
  inverse,
  hidden,
  strikethrough,
  black,
  red,
  green,
  yellow,
  blue,
  magenta,
  cyan,
  white,
  gray,
  bgBlack,
  bgRed,
  bgGreen,
  bgYellow,
  bgBlue,
  bgMagenta,
  bgCyan,
  bgWhite,
  blackBright,
  redBright,
  greenBright,
  yellowBright,
  blueBright,
  magentaBright,
  cyanBright,
  whiteBright,
  bgBlackBright,
  bgRedBright,
  bgGreenBright,
  bgYellowBright,
  bgBlueBright,
  bgMagentaBright,
  bgCyanBright,
  bgWhiteBright,
} = createColors();

exports.bgBlack = bgBlack;
exports.bgBlackBright = bgBlackBright;
exports.bgBlue = bgBlue;
exports.bgBlueBright = bgBlueBright;
exports.bgCyan = bgCyan;
exports.bgCyanBright = bgCyanBright;
exports.bgGreen = bgGreen;
exports.bgGreenBright = bgGreenBright;
exports.bgMagenta = bgMagenta;
exports.bgMagentaBright = bgMagentaBright;
exports.bgRed = bgRed;
exports.bgRedBright = bgRedBright;
exports.bgWhite = bgWhite;
exports.bgWhiteBright = bgWhiteBright;
exports.bgYellow = bgYellow;
exports.bgYellowBright = bgYellowBright;
exports.black = black;
exports.blackBright = blackBright;
exports.blue = blue;
exports.blueBright = blueBright;
exports.bold = bold;
exports.createColors = createColors;
exports.cyan = cyan;
exports.cyanBright = cyanBright;
exports.dim = dim;
exports.gray = gray;
exports.green = green;
exports.greenBright = greenBright;
exports.hidden = hidden;
exports.inverse = inverse;
exports.isColorSupported = isColorSupported;
exports.italic = italic;
exports.magenta = magenta;
exports.magentaBright = magentaBright;
exports.red = red;
exports.redBright = redBright;
exports.reset = reset;
exports.strikethrough = strikethrough;
exports.underline = underline;
exports.white = white;
exports.whiteBright = whiteBright;
exports.yellow = yellow;
exports.yellowBright = yellowBright;


/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!********************************!*\
  !*** ./source/server/index.ts ***!
  \********************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const colorette_1 = __webpack_require__(/*! colorette */ "./node_modules/colorette/index.cjs");
const _api_1 = __webpack_require__(/*! @api */ "./source/server/api/index.ts");
__webpack_require__(/*! @commands/index */ "./source/server/commands/index.ts");
__webpack_require__(/*! @prototype/Player.prototype */ "./source/server/prototype/Player.prototype.ts");
__webpack_require__(/*! @events/Auth.event */ "./source/server/serverevents/Auth.event.ts");
__webpack_require__(/*! @events/Chat.event */ "./source/server/serverevents/Chat.event.ts");
__webpack_require__(/*! @events/Character.event */ "./source/server/serverevents/Character.event.ts");
__webpack_require__(/*! @events/Player.event */ "./source/server/serverevents/Player.event.ts");
__webpack_require__(/*! @events/Death.event */ "./source/server/serverevents/Death.event.ts");
__webpack_require__(/*! @events/DamageSync.event */ "./source/server/serverevents/DamageSync.event.ts");
__webpack_require__(/*! @events/Voice.event */ "./source/server/serverevents/Voice.event.ts");
__webpack_require__(/*! @events/Vehicle.event */ "./source/server/serverevents/Vehicle.event.ts");
__webpack_require__(/*! @events/Point.event */ "./source/server/serverevents/Point.event.ts");
__webpack_require__(/*! @events/Wardrobe.event */ "./source/server/serverevents/Wardrobe.event.ts");
__webpack_require__(/*! @events/MainMenu.event */ "./source/server/serverevents/MainMenu.event.ts");
__webpack_require__(/*! @events/PlayerMenu.event */ "./source/server/serverevents/PlayerMenu.event.ts");
__webpack_require__(/*! @events/Admin.event */ "./source/server/serverevents/Admin.event.ts");
__webpack_require__(/*! @arena/ArenaMatch.manager */ "./source/server/arena/ArenaMatch.manager.ts");
__webpack_require__(/*! @events/Arena.event */ "./source/server/serverevents/Arena.event.ts");
__webpack_require__(/*! @events/Report.event */ "./source/server/serverevents/Report.event.ts");
mp.events.add("server::client:debug", (_, message, ...args) => {
    if (!process.env.DEBUG_MODE)
        return;
    console.log(message, ...args);
});
(async () => {
    mp.events.delayInitialization = true;
    await _api_1.RAGERP.database
        .initialize()
        .then(() => console.log(`${(0, colorette_1.green)("[DONE]")} Database connected!`))
        .catch((err) => console.error(`${(0, colorette_1.red)("[ERROR]")} Database connection error:`, err));
    console.log(`${(0, colorette_1.green)("[DONE]")} Server Events: ${Object.values(mp.events.binded).length}`);
    console.log(`${(0, colorette_1.green)("[DONE]")} Cef Events: ${_api_1.RAGERP.cef.poolSize}`);
    console.log(`${(0, colorette_1.green)("[DONE]")} Total Commands: ${_api_1.RAGERP.commands._commands.size}`);
    mp.events.delayInitialization = false;
})();

})();

/******/ })()
;
//# sourceMappingURL=index.js.map