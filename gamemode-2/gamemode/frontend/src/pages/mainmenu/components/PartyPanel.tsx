import * as React from "react";
import { observer } from "mobx-react-lite";
import EventManager from "utils/EventManager.util";
import { partyStore } from "store/Party.store";
import { playerStore } from "store/Player.store";
import { playerListStore } from "store/PlayerList.store";
import style from "../mainmenu.module.scss";

function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(" ");
}

interface PartyPanelProps {
    displayName: string;
    invitePanelOpen: boolean;
    setInvitePanelOpen: (v: boolean) => void;
    inviteSearch: string;
    setInviteSearch: (v: string) => void;
}

export const PartyPanel: React.FC<PartyPanelProps> = observer(
    ({ displayName, invitePanelOpen, setInvitePanelOpen, inviteSearch, setInviteSearch }) => {
        const isLeader = partyStore.party && partyStore.isLeader(playerStore.data.id);
        const inviteablePlayers = React.useMemo(() => {
            const exclude = new Set([playerStore.data.id, ...partyStore.memberIds]);
            const q = inviteSearch.trim().toLowerCase();
            return playerListStore.players.filter((p) => {
                if (exclude.has(p.id)) return false;
                if (!q) return true;
                return p.name.toLowerCase().includes(q);
            });
        }, [playerListStore.players, inviteSearch, partyStore.memberIds]);

        return (
            <aside className={style.socialPanel}>
                <div className={style.socialSection}>
                    <div className={style.socialTitle}>YOUR PROFILE</div>
                    <div className={style.socialName}>{displayName}</div>
                    <div className={style.socialRank}>BRONZE I</div>
                    <div className={style.socialBadges}>RANK</div>
                    <div className={style.socialLevel}>LEVEL 1</div>
                    <div className={style.socialXp}>0 / 500 XP</div>
                </div>
                <div className={style.socialSection}>
                    <div className={style.socialTitle}>YOUR LOBBY</div>
                    <div className={style.socialSearch}>
                        <span className={style.searchIcon}>⌕</span>
                        <input
                            type="text"
                            placeholder="Search players..."
                            className={style.searchInput}
                            readOnly={!invitePanelOpen}
                            value={inviteSearch}
                            onChange={(e) => setInviteSearch(e.target.value)}
                            onFocus={() => isLeader && !invitePanelOpen && setInvitePanelOpen(true)}
                        />
                    </div>
                    {!partyStore.party && (
                        <button type="button" className={style.inviteSlot} onClick={() => EventManager.emitServer("party", "createParty")}>
                            <span className={style.invitePlus}>+</span>
                            <span className={style.inviteLabel}>CREATE PARTY</span>
                        </button>
                    )}
                    <div className={style.inviteSlots}>
                        {Array.from({ length: partyStore.party ? partyStore.maxSize : 5 }, (_, i) => {
                            const member = partyStore.members[i];
                            const isEmpty = !member;
                            const isLeaderSlot = partyStore.leaderId === playerStore.data.id;
                            const canKick = isLeaderSlot && member && member.id !== playerStore.data.id;
                            return (
                                <div
                                    key={i}
                                    className={style.inviteSlot}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => {
                                        if (isEmpty) {
                                            if (isLeaderSlot) setInvitePanelOpen(true);
                                        } else if (canKick) {
                                            EventManager.emitServer("party", "kickMember", { targetId: member.id });
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault();
                                            if (isEmpty && isLeaderSlot) setInvitePanelOpen(true);
                                            else if (canKick) EventManager.emitServer("party", "kickMember", { targetId: member.id });
                                        }
                                    }}
                                >
                                    {member ? (
                                        <>
                                            <span className={style.inviteLabel}>{member.name}</span>
                                            {member.id === partyStore.leaderId && <span className={style.inviteLabel}>(Leader)</span>}
                                        </>
                                    ) : (
                                        <>
                                            <span className={style.invitePlus}>+</span>
                                            <span className={style.inviteLabel}>INVITE FRIEND</span>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    {partyStore.party && (
                        <button type="button" className={style.freeroamBtn} onClick={() => EventManager.emitServer("party", "leaveParty")}>
                            LEAVE PARTY
                        </button>
                    )}
                    <div className={style.friendsList}>
                        {invitePanelOpen ? (
                            <>
                                <div className={style.friendsListHeader}>
                                    <span>INVITE PLAYER</span>
                                    <button
                                        type="button"
                                        className={style.invitePanelClose}
                                        onClick={() => {
                                            setInvitePanelOpen(false);
                                            setInviteSearch("");
                                        }}
                                        aria-label="Close"
                                    >
                                        ×
                                    </button>
                                </div>
                                <div className={style.friendsListEntries}>
                                    {inviteablePlayers.length === 0 ? (
                                        <div className={style.friendsListEmpty}>No players to invite</div>
                                    ) : (
                                        inviteablePlayers.map((p) => {
                                            const isInvited = partyStore.party?.pendingInvites?.includes(p.id) ?? false;
                                            return (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    className={cn(style.friendsListEntry, isInvited && style.friendsListEntryInvited)}
                                                    onClick={() => {
                                                        if (!isInvited) EventManager.emitServer("party", "invitePlayer", { targetId: p.id });
                                                    }}
                                                    disabled={isInvited}
                                                >
                                                    <span>{p.name}</span>
                                                    {isInvited ? <span className={style.inviteState}>Invited</span> : <span className={style.inviteState}>+ Invite</span>}
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </>
                        ) : (
                            <span className={style.friendsListPlaceholder}>FRIENDS LIST</span>
                        )}
                    </div>
                    {partyStore.pendingInvite && (
                        <div className={style.inviteToast}>
                            <span>{partyStore.pendingInvite.leaderName} invited you</span>
                            <div className={style.inviteToastActions}>
                                <button type="button" onClick={() => EventManager.emitServer("party", "acceptInvite", { partyId: partyStore.pendingInvite!.partyId })}>
                                    ACCEPT
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        EventManager.emitServer("party", "declineInvite", { partyId: partyStore.pendingInvite!.partyId });
                                        partyStore.setInvite(null);
                                    }}
                                >
                                    DECLINE
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </aside>
        );
    }
);
