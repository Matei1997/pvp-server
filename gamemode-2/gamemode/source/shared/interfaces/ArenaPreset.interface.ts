export interface IArenaPresetPoint {
    x: number;
    y: number;
    z: number;
    heading?: number;
}

export interface IArenaPreset {
    id: string;
    name: string;
    center: IArenaPresetPoint;
    redSpawn: IArenaPresetPoint;
    blueSpawn: IArenaPresetPoint;
    redCar: IArenaPresetPoint;
    blueCar: IArenaPresetPoint;
    safeNodes?: { x: number; y: number; z: number }[];
}
