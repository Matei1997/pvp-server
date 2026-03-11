/**
 * Local and team voice: client requests add/remove listeners; server enables/disables voice stream.
 * Arena teammates are set in ArenaMatch.manager via arenaTeammateIds variable.
 */
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
