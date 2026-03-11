import { RAGERP } from "@api";
import { ZONE_PHASES } from "./ArenaConfig";
import { ArenaMatchData, getMatchByDimension, handleZoneDeath } from "./ArenaMatch.manager";

interface ZoneState {
    dimension: number;
    centerX: number;
    centerY: number;
    currentRadius: number;
    targetRadius: number;
    currentPhase: number;
    phaseStartedAt: number;
    phaseDuration: number;
    dps: number;
    active: boolean;
}

const activeZones = new Map<number, ZoneState>();
const outOfBoundsStart = new Map<number, number>();
const OUT_OF_BOUNDS_RADIUS = 320;
const OUT_OF_BOUNDS_GRACE = 8;

export function startZone(dimension: number, centerX: number, centerY: number, elapsedOffsetMs: number = 0): void {
    if (ZONE_PHASES.length === 0) return;

    const firstPhase = ZONE_PHASES[0];
    const zone: ZoneState = {
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

export function stopZone(dimension: number): void {
    activeZones.delete(dimension);
    outOfBoundsStart.clear();
}

export function getZoneState(dimension: number): ZoneState | undefined {
    return activeZones.get(dimension);
}

function advancePhase(zone: ZoneState): boolean {
    zone.currentPhase++;
    if (zone.currentPhase >= ZONE_PHASES.length) {
        return false;
    }
    const phase = ZONE_PHASES[zone.currentPhase];
    zone.currentRadius = zone.targetRadius;
    zone.targetRadius = phase.endRadius;
    zone.phaseDuration = phase.duration * 1000;
    zone.phaseStartedAt = Date.now();
    zone.dps = phase.dps;
    return true;
}

function getCurrentRadius(zone: ZoneState): number {
    const elapsed = Date.now() - zone.phaseStartedAt;
    const progress = Math.min(1, elapsed / zone.phaseDuration);
    return zone.currentRadius + (zone.targetRadius - zone.currentRadius) * progress;
}

function isInZone(zone: ZoneState, x: number, y: number): boolean {
    const radius = getCurrentRadius(zone);
    const dx = x - zone.centerX;
    const dy = y - zone.centerY;
    return (dx * dx + dy * dy) <= (radius * radius);
}

export function tickZones(): void {
    const now = Date.now();

    activeZones.forEach((zone, dim) => {
        if (!zone.active) return;

        const match = getMatchByDimension(dim);
        if (!match || match.state !== "active") return;

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
        const playersToKill: PlayerMp[] = [];

        allPlayers.forEach((mp_) => {
            const p = mp.players.at(mp_.id);
            if (!p || !mp.players.exists(p)) return;

            if (mp_.alive && !isInZone(zone, p.position.x, p.position.y)) {
                const currentHp = p.health;
                const newHp = currentHp - zone.dps;
                if (newHp <= 0) {
                    playersToKill.push(p);
                } else {
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
                (RAGERP.cef.emit as Function)(p, "arena", "outOfBounds", { active: true, timeLeft });
                if (timeLeft <= 0) {
                    playersToKill.push(p);
                }
            } else if (outOfBoundsStart.has(p.id)) {
                outOfBoundsStart.delete(p.id);
                (RAGERP.cef.emit as Function)(p, "arena", "outOfBounds", { active: false, timeLeft: 0 });
            }

            p.call("client::arena:zoneUpdate", [
                zone.centerX,
                zone.centerY,
                Math.round(radius),
                zone.currentPhase + 1,
                ZONE_PHASES.length,
                phaseTimeLeft,
                zone.dps
            ]);

            (RAGERP.cef.emit as Function)(p, "arena", "zoneUpdate", {
                centerX: zone.centerX,
                centerY: zone.centerY,
                radius: safeRadius,
                phase: zone.currentPhase + 1,
                totalPhases: ZONE_PHASES.length,
                phaseTimeLeft,
                dps: zone.dps
            });
        });

        playersToKill.forEach((p) => {
            if (mp.players.exists(p)) {
                handleZoneDeath(p);
            }
        });
    });
}

setInterval(tickZones, 1000);
