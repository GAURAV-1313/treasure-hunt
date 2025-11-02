#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, String, Vec, Symbol};

#[contracttype]
#[derive(Clone)]
pub struct TreasureHunt {
    pub id: u32,
    pub name: String,
    pub answer_hash: String,
    pub reward_amount: i128,
    pub active: bool,
}

#[contracttype]
#[derive(Clone)]
pub struct PlayerProgress {
    pub player: Address,
    pub completed_hunts: Vec<u32>,
    pub total_rewards: i128,
}

// Storage keys using Symbol type
const HUNTS: Symbol = symbol_short!("HUNTS");
const PROGRESS: Symbol = symbol_short!("PROGRESS");
const ADMIN: Symbol = symbol_short!("ADMIN");

#[contract]
pub struct TreasureHuntContract;

#[contractimpl]
impl TreasureHuntContract {
    /// Initialize the contract with admin
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&ADMIN) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&ADMIN, &admin);
    }

    /// Create a new treasure hunt (admin only)
    pub fn create_hunt(
        env: Env,
        admin: Address,
        id: u32,
        name: String,
        answer_hash: String,
        reward_amount: i128,
    ) {
        admin.require_auth();
        
        let stored_admin: Address = env.storage().instance().get(&ADMIN).unwrap();
        if admin != stored_admin {
            panic!("Not authorized");
        }

        let hunt = TreasureHunt {
            id,
            name,
            answer_hash,
            reward_amount,
            active: true,
        };

        env.storage().persistent().set(&id, &hunt);
        
        // Add to hunts list
        let mut hunts: Vec<u32> = env.storage().instance().get(&HUNTS).unwrap_or(Vec::new(&env));
        hunts.push_back(id);
        env.storage().instance().set(&HUNTS, &hunts);
    }

    /// Submit an answer to a treasure hunt
    pub fn submit_answer(env: Env, player: Address, hunt_id: u32, answer: String) -> bool {
        player.require_auth();

        let hunt: TreasureHunt = env.storage().persistent().get(&hunt_id).unwrap();
        
        if !hunt.active {
            panic!("Hunt is not active");
        }

        // Check if player already completed this hunt
        let progress_key = (PROGRESS, player.clone());
        let mut progress: PlayerProgress = env
            .storage()
            .persistent()
            .get(&progress_key)
            .unwrap_or(PlayerProgress {
                player: player.clone(),
                completed_hunts: Vec::new(&env),
                total_rewards: 0,
            });

        // Check if already completed
        for completed in progress.completed_hunts.iter() {
            if completed == hunt_id {
                panic!("Hunt already completed");
            }
        }

        // Verify answer (simple hash comparison)
        let answer_hash = Self::hash_answer(&env, &answer);
        
        if answer_hash == hunt.answer_hash {
            // Mark as completed
            progress.completed_hunts.push_back(hunt_id);
            progress.total_rewards += hunt.reward_amount;
            env.storage().persistent().set(&progress_key, &progress);
            
            return true;
        }

        false
    }

    /// Get player progress
    pub fn get_progress(env: Env, player: Address) -> PlayerProgress {
        let progress_key = (PROGRESS, player.clone());
        env.storage()
            .persistent()
            .get(&progress_key)
            .unwrap_or(PlayerProgress {
                player: player.clone(),
                completed_hunts: Vec::new(&env),
                total_rewards: 0,
            })
    }

    /// Get hunt details
    pub fn get_hunt(env: Env, hunt_id: u32) -> TreasureHunt {
        env.storage().persistent().get(&hunt_id).unwrap()
    }

    /// Get all hunt IDs
    pub fn get_all_hunts(env: Env) -> Vec<u32> {
        env.storage().instance().get(&HUNTS).unwrap_or(Vec::new(&env))
    }

    /// Helper function to hash answers (simplified for demo)
    fn hash_answer(env: &Env, answer: &String) -> String {
        // In production, use proper hashing
        // For demo, we'll use a simple transformation
        answer.clone()
    }

    /// Get leaderboard (top players by total rewards)
    pub fn get_leaderboard(env: Env) -> Vec<PlayerProgress> {
        // Note: In production, you'd want to maintain a sorted list
        // This is a simplified version
        let mut leaderboard = Vec::new(&env);
        // Implementation would iterate through all players
        leaderboard
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;

    #[test]
    fn test_treasure_hunt() {
        let env = Env::default();
        let contract_id = env.register_contract(None, TreasureHuntContract);
        let client = TreasureHuntContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let player = Address::generate(&env);

        // Initialize
        client.initialize(&admin);

        // Create hunt
        client.create_hunt(
            &admin,
            &1,
            &String::from_str(&env, "First Hunt"),
            &String::from_str(&env, "stellar"),
            &100,
        );

        // Submit answer
        let result = client.submit_answer(
            &player,
            &1,
            &String::from_str(&env, "stellar"),
        );

        assert_eq!(result, true);

        // Check progress
        let progress = client.get_progress(&player);
        assert_eq!(progress.total_rewards, 100);
    }
}