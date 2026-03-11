/**
 * Type representing either a synchronous or asynchronous key action.
 */
type KeybindType = () => void | Promise<void>;

/**
 * Interface representing a keybind configuration.
 */
interface Keybind {
    keyCode: number;
    up: boolean;
    action: KeybindType;
    description: string;
}

/**
 * Class responsible for managing player keybinds.
 */
/** Composite key for Map to support multiple bindings per key+up. */
function key(keyCode: number, up: boolean): string {
    return `${keyCode}:${up}`;
}

/**
 * Class responsible for managing player keybinds.
 * Supports multiple handlers per key (e.g. E for NPC and E for accept death).
 */
class _PlayerKeybind {
    private keybinds: Map<string, Keybind[]>;

    constructor() {
        this.keybinds = new Map<string, Keybind[]>();
    }

    /**
     * Adds a new keybind. Multiple bindings for the same key+up are supported.
     */
    public addKeybind(data: { keyCode: number; up: boolean }, action: KeybindType, description: string): void {
        const k = key(data.keyCode, data.up);
        const list = this.keybinds.get(k) ?? [];
        list.push({ keyCode: data.keyCode, up: data.up, action, description });
        this.keybinds.set(k, list);
        mp.keys.bind(data.keyCode, data.up, action);
    }

    /**
     * Removes an existing keybind.
     * @param action - Optional. If provided, removes only this action; otherwise removes all for this key.
     */
    public removeKeybind(keyCode: number, up: boolean, action?: KeybindType): void {
        const k = key(keyCode, up);
        const list = this.keybinds.get(k);
        if (!list) return;

        if (action) {
            const idx = list.findIndex((kb) => kb.action === action);
            if (idx >= 0) {
                mp.keys.unbind(keyCode, up, list[idx].action);
                list.splice(idx, 1);
            }
        } else {
            list.forEach((kb) => mp.keys.unbind(keyCode, up, kb.action));
            list.length = 0;
        }
        if (list.length === 0) this.keybinds.delete(k);
    }

    /**
     * Updates an existing keybind. Pass oldAction to update a specific binding when multiple exist.
     */
    public updateKeybind(keyCode: number, up: boolean, newAction: KeybindType, newDescription: string, oldAction?: KeybindType): void {
        this.removeKeybind(keyCode, up, oldAction);
        this.addKeybind({ keyCode, up }, newAction, newDescription);
    }

    public getKeybindDescription(keyCode: number, up: boolean): string | undefined {
        const list = this.keybinds.get(key(keyCode, up));
        return list?.[0]?.description;
    }

    public getAllKeybinds(): Map<string, Keybind[]> {
        return new Map(this.keybinds);
    }
}

/**
 * Singleton instance of the _PlayerKeybind class.
 */
export const PlayerKeybind = new _PlayerKeybind();
