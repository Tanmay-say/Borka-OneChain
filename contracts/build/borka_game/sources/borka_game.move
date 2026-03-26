module borka_game::borka_game {
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

    fun init(ctx: &mut TxContext) {
        let board = Leaderboard {
            id: object::new(ctx),
            entries: vector::empty(),
            max_entries: 100,
        };
        transfer::share_object(board);
    }

    public fun submit_score(
        board: &mut Leaderboard,
        coins: u64,
        deaths: u64,
        time_ms: u64,
        ctx: &mut TxContext,
    ) {
        let player = tx_context::sender(ctx);
        let new_entry = ScoreEntry { player, coins, deaths, time_ms };

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

        if (vector::length(&board.entries) >= board.max_entries) {
            vector::remove(&mut board.entries, 0);
        };

        vector::push_back(&mut board.entries, new_entry);
    }

    public fun claim_tokens(
        board: &mut Leaderboard,
        coins: u64,
        ctx: &mut TxContext,
    ) {
        let player = tx_context::sender(ctx);
        let _ = player;
        let _ = coins;
        let _ = board;
    }
}
