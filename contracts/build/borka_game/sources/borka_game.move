module borka_game::borka_game {

    use one::event;
    use one::object::{Self, UID};
    use one::transfer;
    use one::tx_context::{Self, TxContext};

    public struct ScoreSubmitted has copy, drop {
        player: address,
        coins: u64,
        deaths: u64,
        time_ms: u64,
    }

    public struct TokensClaimed has copy, drop {
        player: address,
        amount: u64,
    }

    public struct NftMinted has copy, drop {
        player: address,
        skin_id: u64,
    }

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

    public struct BorisSkinNFT has key, store {
        id: UID,
        skin_id: u64,
        owner: address,
    }

    public struct MintRegistry has key {
        id: UID,
        minted: vector<address>,
    }

    fun init(ctx: &mut TxContext) {
        let board = Leaderboard {
            id: object::new(ctx),
            entries: vector::empty(),
            max_entries: 100,
        };
        transfer::share_object(board);

        let registry = MintRegistry {
            id: object::new(ctx),
            minted: vector::empty(),
        };
        transfer::share_object(registry);
    }

    public entry fun submit_score(
        board: &mut Leaderboard,
        coins: u64,
        deaths: u64,
        time_ms: u64,
        ctx: &mut TxContext,
    ) {
        let player = tx_context::sender(ctx);

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

        let new_entry = ScoreEntry {
            player,
            coins,
            deaths,
            time_ms,
        };
        vector::push_back(&mut board.entries, new_entry);

        event::emit(ScoreSubmitted {
            player,
            coins,
            deaths,
            time_ms,
        });
    }

    public entry fun claim_tokens(board: &mut Leaderboard, ctx: &mut TxContext) {
        let player = tx_context::sender(ctx);
        let _ = board;

        event::emit(TokensClaimed {
            player,
            amount: 1,
        });
    }

    public entry fun mint_devil_boris(registry: &mut MintRegistry, ctx: &mut TxContext) {
        let player = tx_context::sender(ctx);

        let mut i = 0;
        let len = vector::length(&registry.minted);
        while (i < len) {
            let addr = vector::borrow(&registry.minted, i);
            assert!(*addr != player, 0);
            i = i + 1;
        };

        vector::push_back(&mut registry.minted, player);

        let nft = BorisSkinNFT {
            id: object::new(ctx),
            skin_id: 4,
            owner: player,
        };
        transfer::transfer(nft, player);

        event::emit(NftMinted {
            player,
            skin_id: 4,
        });
    }
}
