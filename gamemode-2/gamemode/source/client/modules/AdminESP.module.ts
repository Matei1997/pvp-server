const localPlayer = mp.players.local;

class AdminESP {
    private mode = 0; // 0 = off, 1 = players, 2 = players + vehicles

    constructor() {
        mp.events.add("Admin-ToggleESP", this.setMode.bind(this));
        mp.events.add("render", this.onRender.bind(this));
    }

    private setMode(mode: number) {
        if (!localPlayer.getVariable("adminLevel")) return;
        const next = Math.max(0, Math.min(2, Number(mode) || 0));
        this.mode = next;
    }

    private drawPlayers() {
        mp.players.forEachInStreamRange((player) => {
            if (player.handle === 0 || player === localPlayer) return;
            const pos = player.position;
            mp.game.graphics.drawText(
                `${player.name} (${player.remoteId})`,
                [pos.x, pos.y, pos.z + 1.5],
                {
                    scale: [0.3, 0.3],
                    outline: true,
                    color: [255, 255, 255, 255],
                    font: 4,
                    centre: true
                }
            );
        });
    }

    private drawVehicles() {
        mp.vehicles.forEachInStreamRange((vehicle) => {
            if (vehicle.handle === 0) return;
            const pos = vehicle.position;
            const modelName = mp.game.vehicle.getDisplayNameFromVehicleModel(vehicle.model);
            mp.game.graphics.drawText(
                `${modelName} (${vehicle.getNumberPlateText()})`,
                [pos.x, pos.y, pos.z - 0.5],
                {
                    scale: [0.3, 0.3],
                    outline: true,
                    color: [255, 255, 255, 255],
                    font: 4,
                    centre: true
                }
            );
        });
    }

    private onRender() {
        if (this.mode <= 0) return;
        this.drawPlayers();
        if (this.mode > 1) this.drawVehicles();
    }
}

new AdminESP();

