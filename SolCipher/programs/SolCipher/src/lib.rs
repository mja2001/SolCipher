use anchor_lang::prelude::*;

// Program ID – update this to match the deployed program ID.  It must also
// correspond to the `PROGRAM_ID` value in your `.env` file.
declare_id!("SoLD0cs11111111111111111111111111111111111111");

#[program]
pub mod solcipher {
    use super::*;

    /// Register a new document.  Stores the IPFS hash and expiry time and
    /// initialises the Document account.
    pub fn register_document(
        ctx: Context<RegisterDocument>,
        ipfs_hash: String,
        expires_at: i64,
    ) -> Result<()> {
        let document = &mut ctx.accounts.document;
        document.owner = *ctx.accounts.owner.key;
        document.ipfs_hash = ipfs_hash;
        document.expires_at = expires_at;
        document.created_at = Clock::get()?.unix_timestamp;
        Ok(())
    }

    /// Grant access to an existing document.  Creates a new `Access` account
    /// storing the document, owner, grantee and timestamp.
    pub fn grant_access(ctx: Context<GrantAccess>, grantee: Pubkey) -> Result<()> {
        let access = &mut ctx.accounts.access;
        access.doc = ctx.accounts.document.key();
        access.owner = *ctx.accounts.owner.key;
        access.grantee = grantee;
        access.granted_at = Clock::get()?.unix_timestamp;
        access.revoked = false;
        Ok(())
    }

    /// Revoke access to a document.  Only the owner may revoke access.
    pub fn revoke_access(ctx: Context<RevokeAccess>) -> Result<()> {
        let access = &mut ctx.accounts.access;
        require!(access.owner == *ctx.accounts.owner.key, SolcipherError::Unauthorized);
        access.revoked = true;
        Ok(())
    }

    /// Log an access event.  Used to audit when users view a document.  A new
    /// `AccessLog` account is initialised with the document key and user.
    pub fn log_access(ctx: Context<LogAccess>) -> Result<()> {
        let log = &mut ctx.accounts.access_log;
        log.doc = ctx.accounts.document.key();
        log.user = *ctx.accounts.user.key;
        log.timestamp = Clock::get()?.unix_timestamp;
        Ok(())
    }

    /// Create a batch share.  Stores a CID pointing to a manifest describing
    /// multiple encrypted files along with the recipient, file count and
    /// optional expiry.  The manifest must be uploaded separately via IPFS.
    pub fn create_batch_share(
        ctx: Context<CreateBatchShare>,
        manifest_cid: String,
        recipient: Pubkey,
        file_count: u32,
        expiry: Option<i64>,
    ) -> Result<()> {
        let share = &mut ctx.accounts.batch_share;
        share.owner = *ctx.accounts.owner.key;
        share.recipient = recipient;
        share.manifest_cid = manifest_cid;
        share.file_count = file_count;
        share.expiry = expiry;
        Ok(())
    }
}

/// Context for registering a document.  Allocates space for the Document
/// account and charges the owner for rent.
#[derive(Accounts)]
pub struct RegisterDocument<'info> {
    #[account(init, payer = owner, space = 8 + 32 + 4 + 128 + 8 + 8)]
    pub document: Account<'info, Document>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

/// Context for granting access.  Allocates space for the Access account and
/// requires that the provided document is owned by the caller.
#[derive(Accounts)]
pub struct GrantAccess<'info> {
    #[account(init, payer = owner, space = 8 + 32 + 32 + 32 + 8 + 1)]
    pub access: Account<'info, Access>,
    #[account(mut, has_one = owner)]
    pub document: Account<'info, Document>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

/// Context for revoking access.  Mutates an existing Access account and
/// requires that the caller owns the document.
#[derive(Accounts)]
pub struct RevokeAccess<'info> {
    #[account(mut, has_one = owner)]
    pub access: Account<'info, Access>,
    #[account(mut)]
    pub owner: Signer<'info>,
}

/// Context for logging access to a document.
#[derive(Accounts)]
pub struct LogAccess<'info> {
    #[account(init, payer = user, space = 8 + 32 + 32 + 8)]
    pub access_log: Account<'info, AccessLog>,
    #[account(mut)]
    pub document: Account<'info, Document>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

/// Context for creating a batch share.
#[derive(Accounts)]
pub struct CreateBatchShare<'info> {
    #[account(init, payer = owner, space = 8 + 32 + 32 + 4 + 128 + 4 + 8)]
    pub batch_share: Account<'info, BatchShare>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

/// Document account – stores metadata for a single encrypted file.
#[account]
pub struct Document {
    pub owner: Pubkey,
    pub ipfs_hash: String,
    pub expires_at: i64,
    pub created_at: i64,
}

/// Access account – grants a specific grantee access to a document.
#[account]
pub struct Access {
    pub doc: Pubkey,
    pub owner: Pubkey,
    pub grantee: Pubkey,
    pub granted_at: i64,
    pub revoked: bool,
}

/// AccessLog account – records a single access event for audit purposes.
#[account]
pub struct AccessLog {
    pub doc: Pubkey,
    pub user: Pubkey,
    pub timestamp: i64,
}

/// BatchShare account – represents a collection of encrypted files shared
/// together via a manifest CID.  `expiry` is optional.
#[account]
pub struct BatchShare {
    pub owner: Pubkey,
    pub recipient: Pubkey,
    pub manifest_cid: String,
    pub file_count: u32,
    pub expiry: Option<i64>,
}

/// Custom errors for the Solcipher program.
#[error_code]
pub enum SolcipherError {
    #[msg("You are not authorised to perform this action.")]
    Unauthorized,
}