use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
    sysvar::{clock::Clock, Sysvar},
};

entrypoint!(process_instruction);

const MAX_NAME_LEN: usize = 16;
const MATCH_ID_LEN: usize = 32;

#[derive(BorshSerialize, BorshDeserialize, Clone)]
pub struct PredictionMarketState {
    pub is_initialized: bool,
    pub admin: Pubkey,
    pub match_id: [u8; MATCH_ID_LEN],
    pub team_a_name: [u8; MAX_NAME_LEN],
    pub team_a_len: u8,
    pub team_b_name: [u8; MAX_NAME_LEN],
    pub team_b_len: u8,
    pub close_ts: i64,
    pub resolved: bool,
    pub winning_side: u8,
    pub total_pool: u64,
    pub total_a: u64,
    pub total_b: u64,
}

#[derive(BorshSerialize, BorshDeserialize, Clone)]
pub struct PositionState {
    pub is_initialized: bool,
    pub market: Pubkey,
    pub user: Pubkey,
    pub side: u8,
    pub stake: u64,
    pub claimed: bool,
}

#[derive(BorshSerialize, BorshDeserialize)]
pub enum PredictionInstruction {
    InitializeMarket {
        match_id: [u8; MATCH_ID_LEN],
        team_a: String,
        team_b: String,
        close_ts: i64,
    },
    PlaceBet {
        side: u8,
        amount: u64,
    },
    ResolveMarket {
        winning_side: u8,
    },
    ClaimReward,
}

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = PredictionInstruction::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    match instruction {
        PredictionInstruction::InitializeMarket {
            match_id,
            team_a,
            team_b,
            close_ts,
        } => initialize_market(program_id, accounts, match_id, &team_a, &team_b, close_ts),
        PredictionInstruction::PlaceBet { side, amount } => place_bet(program_id, accounts, side, amount),
        PredictionInstruction::ResolveMarket { winning_side } => resolve_market(program_id, accounts, winning_side),
        PredictionInstruction::ClaimReward => claim_reward(program_id, accounts),
    }
}

fn initialize_market(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    match_id: [u8; MATCH_ID_LEN],
    team_a: &str,
    team_b: &str,
    close_ts: i64,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let admin = next_account_info(account_info_iter)?;
    let market_account = next_account_info(account_info_iter)?;

    if !admin.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    if market_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }

    let team_a_bytes = team_a.as_bytes();
    let team_b_bytes = team_b.as_bytes();

    if team_a_bytes.len() > MAX_NAME_LEN || team_b_bytes.len() > MAX_NAME_LEN {
        return Err(ProgramError::InvalidInstructionData);
    }

    let mut state = deserialize_market(market_account)?;
    if state.is_initialized {
        return Err(ProgramError::AccountAlreadyInitialized);
    }

    let mut team_a_buf = [0u8; MAX_NAME_LEN];
    team_a_buf[..team_a_bytes.len()].copy_from_slice(team_a_bytes);

    let mut team_b_buf = [0u8; MAX_NAME_LEN];
    team_b_buf[..team_b_bytes.len()].copy_from_slice(team_b_bytes);

    state = PredictionMarketState {
        is_initialized: true,
        admin: *admin.key,
        match_id,
        team_a_name: team_a_buf,
        team_a_len: team_a_bytes.len() as u8,
        team_b_name: team_b_buf,
        team_b_len: team_b_bytes.len() as u8,
        close_ts,
        resolved: false,
        winning_side: 0,
        total_pool: 0,
        total_a: 0,
        total_b: 0,
    };

    save_market(market_account, &state)?;
    msg!("prediction market initialized");
    Ok(())
}

fn place_bet(program_id: &Pubkey, accounts: &[AccountInfo], side: u8, amount: u64) -> ProgramResult {
    if side != 1 && side != 2 {
        return Err(ProgramError::InvalidInstructionData);
    }

    if amount == 0 {
        return Err(ProgramError::InvalidInstructionData);
    }

    let account_info_iter = &mut accounts.iter();
    let bettor = next_account_info(account_info_iter)?;
    let market_account = next_account_info(account_info_iter)?;
    let position_account = next_account_info(account_info_iter)?;

    if !bettor.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    if market_account.owner != program_id || position_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }

    let now = Clock::get()?.unix_timestamp;

    let mut market = deserialize_market(market_account)?;
    if !market.is_initialized {
        return Err(ProgramError::UninitializedAccount);
    }

    if market.resolved || now > market.close_ts {
        return Err(ProgramError::InvalidAccountData);
    }

    market.total_pool = market
        .total_pool
        .checked_add(amount)
        .ok_or(ProgramError::ArithmeticOverflow)?;

    if side == 1 {
        market.total_a = market.total_a.checked_add(amount).ok_or(ProgramError::ArithmeticOverflow)?;
    } else {
        market.total_b = market.total_b.checked_add(amount).ok_or(ProgramError::ArithmeticOverflow)?;
    }

    let mut position = deserialize_position(position_account)?;

    if !position.is_initialized {
        position = PositionState {
            is_initialized: true,
            market: *market_account.key,
            user: *bettor.key,
            side,
            stake: amount,
            claimed: false,
        };
    } else {
        if position.user != *bettor.key || position.market != *market_account.key || position.side != side {
            return Err(ProgramError::InvalidAccountData);
        }

        if position.claimed {
            return Err(ProgramError::InvalidAccountData);
        }

        position.stake = position
            .stake
            .checked_add(amount)
            .ok_or(ProgramError::ArithmeticOverflow)?;
    }

    save_market(market_account, &market)?;
    save_position(position_account, &position)?;

    msg!("bet placed side: {} amount: {}", side, amount);
    Ok(())
}

fn resolve_market(program_id: &Pubkey, accounts: &[AccountInfo], winning_side: u8) -> ProgramResult {
    if winning_side != 1 && winning_side != 2 {
        return Err(ProgramError::InvalidInstructionData);
    }

    let account_info_iter = &mut accounts.iter();
    let admin = next_account_info(account_info_iter)?;
    let market_account = next_account_info(account_info_iter)?;

    if !admin.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    if market_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }

    let mut market = deserialize_market(market_account)?;
    if !market.is_initialized {
        return Err(ProgramError::UninitializedAccount);
    }

    if market.admin != *admin.key {
        return Err(ProgramError::IllegalOwner);
    }

    if market.resolved {
        return Err(ProgramError::InvalidAccountData);
    }

    market.resolved = true;
    market.winning_side = winning_side;

    save_market(market_account, &market)?;
    msg!("market resolved winning side: {}", winning_side);
    Ok(())
}

fn claim_reward(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let bettor = next_account_info(account_info_iter)?;
    let market_account = next_account_info(account_info_iter)?;
    let position_account = next_account_info(account_info_iter)?;

    if !bettor.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    if market_account.owner != program_id || position_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }

    let market = deserialize_market(market_account)?;
    if !market.is_initialized || !market.resolved {
        return Err(ProgramError::InvalidAccountData);
    }

    let mut position = deserialize_position(position_account)?;
    if !position.is_initialized {
        return Err(ProgramError::UninitializedAccount);
    }

    if position.user != *bettor.key || position.market != *market_account.key {
        return Err(ProgramError::InvalidAccountData);
    }

    if position.claimed {
        return Err(ProgramError::InvalidAccountData);
    }

    if position.side != market.winning_side {
        position.claimed = true;
        save_position(position_account, &position)?;
        msg!("claim result: no payout");
        return Ok(());
    }

    let winning_pool = if market.winning_side == 1 {
        market.total_a
    } else {
        market.total_b
    };

    if winning_pool == 0 {
        return Err(ProgramError::InvalidAccountData);
    }

    let payout = (position.stake as u128)
        .checked_mul(market.total_pool as u128)
        .ok_or(ProgramError::ArithmeticOverflow)?
        .checked_div(winning_pool as u128)
        .ok_or(ProgramError::ArithmeticOverflow)?;

    let payout = u64::try_from(payout).map_err(|_| ProgramError::ArithmeticOverflow)?;

    position.claimed = true;
    save_position(position_account, &position)?;

    msg!("claim payout: {}", payout);
    Ok(())
}

fn deserialize_market(market_account: &AccountInfo) -> Result<PredictionMarketState, ProgramError> {
    let data = market_account.try_borrow_data()?;
    PredictionMarketState::try_from_slice(&data).map_err(|_| ProgramError::InvalidAccountData)
}

fn save_market(market_account: &AccountInfo, state: &PredictionMarketState) -> ProgramResult {
    let mut data = market_account.try_borrow_mut_data()?;
    state
        .serialize(&mut &mut data[..])
        .map_err(|_| ProgramError::AccountDataTooSmall)
}

fn deserialize_position(position_account: &AccountInfo) -> Result<PositionState, ProgramError> {
    let data = position_account.try_borrow_data()?;
    PositionState::try_from_slice(&data).map_err(|_| ProgramError::InvalidAccountData)
}

fn save_position(position_account: &AccountInfo, state: &PositionState) -> ProgramResult {
    let mut data = position_account.try_borrow_mut_data()?;
    state
        .serialize(&mut &mut data[..])
        .map_err(|_| ProgramError::AccountDataTooSmall)
}
