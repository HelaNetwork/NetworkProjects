use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};

entrypoint!(process_instruction);

#[derive(BorshSerialize, BorshDeserialize, Clone)]
pub struct MarketState {
    pub is_initialized: bool,
    pub admin: Pubkey,
    pub asset_mint: Pubkey,
    pub treasury: Pubkey,
    pub base_price: u64,
    pub slope: u64,
    pub fee_bps: u16,
    pub supply: u64,
}

#[derive(BorshSerialize, BorshDeserialize)]
pub enum BondingCurveInstruction {
    Initialize {
        base_price: u64,
        slope: u64,
        fee_bps: u16,
    },
    QuoteBuy {
        quantity: u64,
    },
    QuoteSell {
        quantity: u64,
    },
    ExecuteBuy {
        quantity: u64,
    },
    ExecuteSell {
        quantity: u64,
    },
}

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = BondingCurveInstruction::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    match instruction {
        BondingCurveInstruction::Initialize {
            base_price,
            slope,
            fee_bps,
        } => initialize_market(program_id, accounts, base_price, slope, fee_bps),
        BondingCurveInstruction::QuoteBuy { quantity } => quote_buy(program_id, accounts, quantity),
        BondingCurveInstruction::QuoteSell { quantity } => quote_sell(program_id, accounts, quantity),
        BondingCurveInstruction::ExecuteBuy { quantity } => execute_buy(program_id, accounts, quantity),
        BondingCurveInstruction::ExecuteSell { quantity } => execute_sell(program_id, accounts, quantity),
    }
}

fn initialize_market(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    base_price: u64,
    slope: u64,
    fee_bps: u16,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let admin = next_account_info(account_info_iter)?;
    let market_account = next_account_info(account_info_iter)?;
    let asset_mint = next_account_info(account_info_iter)?;
    let treasury = next_account_info(account_info_iter)?;

    if !admin.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    if market_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }

    if fee_bps > 1_000 {
        return Err(ProgramError::InvalidInstructionData);
    }

    let mut state = deserialize_market(market_account)?;
    if state.is_initialized {
        return Err(ProgramError::AccountAlreadyInitialized);
    }

    state = MarketState {
        is_initialized: true,
        admin: *admin.key,
        asset_mint: *asset_mint.key,
        treasury: *treasury.key,
        base_price,
        slope,
        fee_bps,
        supply: 0,
    };

    save_market(market_account, &state)?;
    msg!("bonding curve market initialized");
    Ok(())
}

fn quote_buy(program_id: &Pubkey, accounts: &[AccountInfo], quantity: u64) -> ProgramResult {
    let market = read_market(program_id, accounts)?;
    if quantity == 0 {
        return Err(ProgramError::InvalidInstructionData);
    }

    let gross = sum_buy_cost(market.base_price, market.slope, market.supply, quantity)?;
    let fee = compute_fee(gross, market.fee_bps)?;
    let total = gross.checked_add(fee).ok_or(ProgramError::ArithmeticOverflow)?;

    msg!("quote_buy_gross: {}", gross);
    msg!("quote_buy_fee: {}", fee);
    msg!("quote_buy_total: {}", total);
    Ok(())
}

fn quote_sell(program_id: &Pubkey, accounts: &[AccountInfo], quantity: u64) -> ProgramResult {
    let market = read_market(program_id, accounts)?;
    if quantity == 0 || quantity > market.supply {
        return Err(ProgramError::InvalidInstructionData);
    }

    let gross = sum_sell_value(market.base_price, market.slope, market.supply, quantity)?;
    let fee = compute_fee(gross, market.fee_bps)?;
    let net = gross.checked_sub(fee).ok_or(ProgramError::ArithmeticOverflow)?;

    msg!("quote_sell_gross: {}", gross);
    msg!("quote_sell_fee: {}", fee);
    msg!("quote_sell_net: {}", net);
    Ok(())
}

fn execute_buy(program_id: &Pubkey, accounts: &[AccountInfo], quantity: u64) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let trader = next_account_info(account_info_iter)?;
    let market_account = next_account_info(account_info_iter)?;

    if !trader.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    if market_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }

    if quantity == 0 {
        return Err(ProgramError::InvalidInstructionData);
    }

    let mut state = deserialize_market(market_account)?;
    if !state.is_initialized {
        return Err(ProgramError::UninitializedAccount);
    }

    let gross = sum_buy_cost(state.base_price, state.slope, state.supply, quantity)?;
    let fee = compute_fee(gross, state.fee_bps)?;
    let total = gross.checked_add(fee).ok_or(ProgramError::ArithmeticOverflow)?;

    state.supply = state.supply.checked_add(quantity).ok_or(ProgramError::ArithmeticOverflow)?;
    save_market(market_account, &state)?;

    msg!("execute_buy_quantity: {}", quantity);
    msg!("execute_buy_total: {}", total);
    Ok(())
}

fn execute_sell(program_id: &Pubkey, accounts: &[AccountInfo], quantity: u64) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let trader = next_account_info(account_info_iter)?;
    let market_account = next_account_info(account_info_iter)?;

    if !trader.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    if market_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }

    let mut state = deserialize_market(market_account)?;
    if !state.is_initialized {
        return Err(ProgramError::UninitializedAccount);
    }

    if quantity == 0 || quantity > state.supply {
        return Err(ProgramError::InvalidInstructionData);
    }

    let gross = sum_sell_value(state.base_price, state.slope, state.supply, quantity)?;
    let fee = compute_fee(gross, state.fee_bps)?;
    let net = gross.checked_sub(fee).ok_or(ProgramError::ArithmeticOverflow)?;

    state.supply = state.supply.checked_sub(quantity).ok_or(ProgramError::ArithmeticOverflow)?;
    save_market(market_account, &state)?;

    msg!("execute_sell_quantity: {}", quantity);
    msg!("execute_sell_net: {}", net);
    Ok(())
}

fn read_market(program_id: &Pubkey, accounts: &[AccountInfo]) -> Result<MarketState, ProgramError> {
    let market_account = accounts.get(0).ok_or(ProgramError::NotEnoughAccountKeys)?;
    if market_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }
    let state = deserialize_market(market_account)?;
    if !state.is_initialized {
        return Err(ProgramError::UninitializedAccount);
    }
    Ok(state)
}

fn deserialize_market(market_account: &AccountInfo) -> Result<MarketState, ProgramError> {
    let data = market_account.try_borrow_data()?;
    MarketState::try_from_slice(&data).map_err(|_| ProgramError::InvalidAccountData)
}

fn save_market(market_account: &AccountInfo, state: &MarketState) -> ProgramResult {
    let mut data = market_account.try_borrow_mut_data()?;
    state
        .serialize(&mut &mut data[..])
        .map_err(|_| ProgramError::AccountDataTooSmall)
}

fn compute_fee(amount: u64, fee_bps: u16) -> Result<u64, ProgramError> {
    let fee = (amount as u128)
        .checked_mul(fee_bps as u128)
        .ok_or(ProgramError::ArithmeticOverflow)?
        .checked_div(10_000)
        .ok_or(ProgramError::ArithmeticOverflow)?;
    u64::try_from(fee).map_err(|_| ProgramError::ArithmeticOverflow)
}

fn sum_buy_cost(base: u64, slope: u64, current_supply: u64, quantity: u64) -> Result<u64, ProgramError> {
    let q = quantity as u128;
    let s = current_supply as u128;
    let base_component = q
        .checked_mul(base as u128)
        .ok_or(ProgramError::ArithmeticOverflow)?;
    let progressive = (q
        .checked_mul(s)
        .ok_or(ProgramError::ArithmeticOverflow)?)
    .checked_add(
        q.checked_mul(q.checked_sub(1).ok_or(ProgramError::ArithmeticOverflow)?)
            .ok_or(ProgramError::ArithmeticOverflow)?
            .checked_div(2)
            .ok_or(ProgramError::ArithmeticOverflow)?,
    )
    .ok_or(ProgramError::ArithmeticOverflow)?;
    let slope_component = progressive
        .checked_mul(slope as u128)
        .ok_or(ProgramError::ArithmeticOverflow)?;

    let total = base_component
        .checked_add(slope_component)
        .ok_or(ProgramError::ArithmeticOverflow)?;
    u64::try_from(total).map_err(|_| ProgramError::ArithmeticOverflow)
}

fn sum_sell_value(base: u64, slope: u64, current_supply: u64, quantity: u64) -> Result<u64, ProgramError> {
    let q = quantity as u128;
    let s = current_supply as u128;
    let base_component = q
        .checked_mul(base as u128)
        .ok_or(ProgramError::ArithmeticOverflow)?;
    let first = q
        .checked_mul(s.checked_sub(1).ok_or(ProgramError::ArithmeticOverflow)?)
        .ok_or(ProgramError::ArithmeticOverflow)?;
    let second = q
        .checked_mul(q.checked_sub(1).ok_or(ProgramError::ArithmeticOverflow)?)
        .ok_or(ProgramError::ArithmeticOverflow)?
        .checked_div(2)
        .ok_or(ProgramError::ArithmeticOverflow)?;

    let progressive = first.checked_sub(second).ok_or(ProgramError::ArithmeticOverflow)?;
    let slope_component = progressive
        .checked_mul(slope as u128)
        .ok_or(ProgramError::ArithmeticOverflow)?;

    let total = base_component
        .checked_add(slope_component)
        .ok_or(ProgramError::ArithmeticOverflow)?;
    u64::try_from(total).map_err(|_| ProgramError::ArithmeticOverflow)
}
