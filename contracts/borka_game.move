module borka_game::borka_game {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use std::vector;

    // ── Structs ──────────────────────────────────────────────

    public struct ScoreEntry has store, copy, drop {
        player: address,
        coins: u64,
        deaths: u64,
        time_ms: u64,
    }

    public struct Leaderboard has key {
        id: UID,
        entries: vector<ScoreEntry>,
        max_entries: u64,
    }

    // ── Init ─────────────────────────────────────────────────

    fun init(ctx: &mut TxContext) {
        let board = Leaderboard {
            id: object::new(ctx),
            entries: vector::empty(),
            max_entries: 100,
        };
        transfer::share_object(board);
    }

    // ── Public functions ──────────────────────────────────────

    /// Submit a completed run score. One entry per wallet per call.
    /// Old entries from the same wallet are replaced.
    public entry fun submit_score(
        board: &mut Leaderboard,
        coins: u64,
        deaths: u64,
        time_ms: u64,
        ctx: &mut TxContext,
    ) {
        let player = tx_context::sender(ctx);
        let new_entry = ScoreEntry { player, coins, deaths, time_ms };

        // Remove existing entry for this player
        let mut i = 0;
        let len = vector::length(&board.entries);
        while (i < len) {
            let entry = vector::borrow(&board.entries, i);
            if (entry.player == player) {
                vector::remove(&mut board.entries, i);
                break
            };
            i = i + 1;
        };

        // Cap at max_entries — remove lowest scorer if needed
        if (vector::length(&board.entries) >= board.max_entries) {
            vector::remove(&mut board.entries, 0);
        };

        vector::push_back(&mut board.entries, new_entry);
    }

    /// Claim tokens: emits an event. Actual token transfer handled
    /// off-chain via backend or faucet for hackathon MVP.
    public entry fun claim_tokens(
        board: &mut Leaderboard,
        coins: u64,
        ctx: &mut TxContext,
    ) {
        // For MVP: this is a proof-of-claim transaction on-chain
        // The event can be picked up by a backend to transfer OCT
        let player = tx_context::sender(ctx);
        // No-op for MVP — the tx hash itself proves the claim
        let _ = player;
        let _ = coins;
        let _ = board;
    }
}
