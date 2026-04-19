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

const MAX_URI_LEN: usize = 128;
const MAX_SYMBOL_LEN: usize = 16;

#[derive(BorshSerialize, BorshDeserialize, Clone)]
pub struct AssetRecord {
    pub is_initialized: bool,
    pub admin: Pubkey,
    pub mint: Pubkey,
    pub asset_kind: u8,
    pub base_price: u64,
    pub symbol_len: u8,
    pub symbol: [u8; MAX_SYMBOL_LEN],
    pub uri_len: u16,
    pub uri: [u8; MAX_URI_LEN],
}

#[derive(BorshSerialize, BorshDeserialize)]
pub enum AssetMintInstruction {
    CreateAsset {
        asset_kind: u8,
        base_price: u64,
        symbol: String,
        uri: String,
    },
    UpdatePrice {
        base_price: u64,
    },
    UpdateUri {
        uri: String,
    },
}

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = AssetMintInstruction::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    match instruction {
        AssetMintInstruction::CreateAsset {
            asset_kind,
            base_price,
            symbol,
            uri,
        } => create_asset(program_id, accounts, asset_kind, base_price, &symbol, &uri),
        AssetMintInstruction::UpdatePrice { base_price } => update_price(program_id, accounts, base_price),
        AssetMintInstruction::UpdateUri { uri } => update_uri(program_id, accounts, &uri),
    }
}

fn create_asset(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    asset_kind: u8,
    base_price: u64,
    symbol: &str,
    uri: &str,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let admin = next_account_info(account_info_iter)?;
    let asset_account = next_account_info(account_info_iter)?;
    let mint_account = next_account_info(account_info_iter)?;

    if !admin.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    if asset_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }

    let symbol_bytes = symbol.as_bytes();
    let uri_bytes = uri.as_bytes();

    if symbol_bytes.len() > MAX_SYMBOL_LEN || uri_bytes.len() > MAX_URI_LEN {
        return Err(ProgramError::InvalidInstructionData);
    }

    let mut state = deserialize_asset(asset_account)?;
    if state.is_initialized {
        return Err(ProgramError::AccountAlreadyInitialized);
    }

    let mut symbol_buf = [0u8; MAX_SYMBOL_LEN];
    symbol_buf[..symbol_bytes.len()].copy_from_slice(symbol_bytes);

    let mut uri_buf = [0u8; MAX_URI_LEN];
    uri_buf[..uri_bytes.len()].copy_from_slice(uri_bytes);

    state = AssetRecord {
        is_initialized: true,
        admin: *admin.key,
        mint: *mint_account.key,
        asset_kind,
        base_price,
        symbol_len: symbol_bytes.len() as u8,
        symbol: symbol_buf,
        uri_len: uri_bytes.len() as u16,
        uri: uri_buf,
    };

    save_asset(asset_account, &state)?;
    msg!("asset created");
    Ok(())
}

fn update_price(program_id: &Pubkey, accounts: &[AccountInfo], base_price: u64) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let admin = next_account_info(account_info_iter)?;
    let asset_account = next_account_info(account_info_iter)?;

    if !admin.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    if asset_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }

    let mut state = deserialize_asset(asset_account)?;
    if !state.is_initialized {
        return Err(ProgramError::UninitializedAccount);
    }

    if state.admin != *admin.key {
        return Err(ProgramError::IllegalOwner);
    }

    state.base_price = base_price;
    save_asset(asset_account, &state)?;
    msg!("asset price updated");
    Ok(())
}

fn update_uri(program_id: &Pubkey, accounts: &[AccountInfo], uri: &str) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let admin = next_account_info(account_info_iter)?;
    let asset_account = next_account_info(account_info_iter)?;

    if !admin.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    if asset_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }

    let uri_bytes = uri.as_bytes();
    if uri_bytes.len() > MAX_URI_LEN {
        return Err(ProgramError::InvalidInstructionData);
    }

    let mut state = deserialize_asset(asset_account)?;
    if !state.is_initialized {
        return Err(ProgramError::UninitializedAccount);
    }

    if state.admin != *admin.key {
        return Err(ProgramError::IllegalOwner);
    }

    state.uri = [0u8; MAX_URI_LEN];
    state.uri[..uri_bytes.len()].copy_from_slice(uri_bytes);
    state.uri_len = uri_bytes.len() as u16;

    save_asset(asset_account, &state)?;
    msg!("asset uri updated");
    Ok(())
}

fn deserialize_asset(asset_account: &AccountInfo) -> Result<AssetRecord, ProgramError> {
    let data = asset_account.try_borrow_data()?;
    AssetRecord::try_from_slice(&data).map_err(|_| ProgramError::InvalidAccountData)
}

fn save_asset(asset_account: &AccountInfo, state: &AssetRecord) -> ProgramResult {
    let mut data = asset_account.try_borrow_mut_data()?;
    state
        .serialize(&mut &mut data[..])
        .map_err(|_| ProgramError::AccountDataTooSmall)
}
