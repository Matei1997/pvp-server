import { Browser } from "./Browser.class";

/**
 * Manages the chat functionality. T = open chat.
 * Use /global, /team, /local, /admin to send to those channels.
 */
class _ChatAPI {
    sendModeCount: number = 0;
    arrayMessage: number = -1;
    chatOpen: boolean = false;

    constructor() {
        mp.console.logWarning("[CHAT] ChatAPI initialized!");
        mp.events.add("client::chat:newMessage", this.sendMessage.bind(this));
        mp.events.add("client::chat:close", this.close.bind(this));
        mp.events.add("client::chat:open", this.open.bind(this));

        mp.keys.bind(84, false, () => this.open()); // T = open chat
        mp.keys.bind(13, false, this.close.bind(this)); // Enter = send/close
        mp.keys.bind(27, false, this.close.bind(this)); // ESC = cancel
    }

    /**
     * Opens the chat interface.
     */
    public open() {
        try {
            if (Browser.currentPage && Browser.currentPage !== "death" && Browser.currentPage !== "arena_hud") return;
            Browser.processEvent("cef::chat:toggle", true);
            Browser.startPage("chat");
            this.chatOpen = true;
        } catch (err: unknown) {
            if (err instanceof TypeError) {
                mp.console.logWarning("Chat.Open Error: " + err.message, true, false);
            }
        }
    }

    /**
     * Closes the chat interface.
     */
    public close() {
        if (!this.chatOpen || Browser.currentPage !== "chat") return;
        this.chatOpen = false;
        Browser.processEvent("cef::chat:toggle", false);
        Browser.processEvent("cef::chat:close");
        Browser.closePage();
    }

    /**
     * Sends a new message to the chat interface.
     * @param {string} data - The message data to send.
     */
    public sendMessage(data: string) {
        this.arrayMessage++;
        Browser.processEvent("cef::chat:newMessage", data);
    }
}

export const ChatAPI = new _ChatAPI();
