/**
 * Local and team voice: client requests add/remove listeners; server enables/disables voice stream.
 * Arena teammates are set in ArenaMatch.manager via arenaTeammateIds variable.
 * Outside Hopouts: radio uses radioChannel (set via /setradio).
 */
const DEFAULT_RADIO_CHANNEL = 1000;

mp.events.add("server::voice:addListener", (player: PlayerMp, targetId: number) => {
    if (player == null || !mp.players.exists(player)) return;
    const target = typeof targetId === "number" ? mp.players.at(targetId) : null;
    if (target && mp.players.exists(target)) player.enableVoiceTo(target);
});

mp.events.add("server::voice:removeListener", (player: PlayerMp, targetId: number) => {
    if (player == null || !mp.players.exists(player)) return;
    const target = typeof targetId === "number" ? mp.players.at(targetId) : null;
    if (target && mp.players.exists(target)) player.disableVoiceTo(target);
});

mp.events.add("server::voice:requestRadioListeners", (player: PlayerMp) => {
    if (!player || !mp.players.exists(player)) return;
    const channel = (player.getVariable("radioChannel") as number) ?? DEFAULT_RADIO_CHANNEL;
    const ids: number[] = [];
    mp.players.forEach((p: PlayerMp) => {
        if (!p || !mp.players.exists(p) || p.id === player.id) return;
        if (p.dimension !== player.dimension) return;
        const pChannel = (p.getVariable("radioChannel") as number) ?? DEFAULT_RADIO_CHANNEL;
        if (pChannel === channel) ids.push(p.id);
    });
    player.call("client::voice:radioListeners", [ids]);
});
