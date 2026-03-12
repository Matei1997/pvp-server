/**
 * Bridges server party events to CEF. Server uses player.call("client::party:*");
 * we forward to the eventManager so the frontend receives them.
 */
mp.events.add("client::party:emit", (event: string, payload: string) => {
    try {
        const data = typeof payload === "string" ? JSON.parse(payload) : payload;
        mp.events.call("client::eventManager", "cef::party:" + event, data);
    } catch {
        mp.console.logWarning("[PartyBridge] Failed to parse party:emit payload");
    }
});

mp.events.add("client::party:inviteReceived", (partyData: unknown, leaderName: string) => {
    try {
        const party = typeof partyData === "string" ? JSON.parse(partyData) : partyData;
        mp.events.call("client::eventManager", "cef::party:inviteReceived", { party, leaderName: leaderName ?? "Unknown" });
    } catch {
        mp.console.logWarning("[PartyBridge] Failed to parse party:inviteReceived");
    }
});

mp.events.add("client::party:kicked", () => {
    mp.events.call("client::eventManager", "cef::party:kicked", {});
});

mp.events.add("client::party:disbanded", () => {
    mp.events.call("client::eventManager", "cef::party:disbanded", {});
});
