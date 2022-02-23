import {
  Account,
  transactions,
  providers,
  DEFAULT_FUNCTION_CALL_GAS,
} from "near-api-js";

import BN from "bn.js";
export interface ChangeMethodOptions {
  gas?: BN;
  attachedDeposit?: BN;
  walletMeta?: string;
  walletCallbackUrl?: string;
}
export interface ViewFunctionOptions {
  parse?: (response: Uint8Array) => any;
  stringify?: (input: any) => any;
}

/** 64 bit unsigned integer less than 2^53 -1 */
type u64 = number;
/** 64 bit signed integer less than 2^53 -1 */
type i64 = number;
export interface StorageBalanceBounds {
  min: U128;
  max?: U128;
}
export interface FungibleTokenMetadata {
  spec: string;
  name: string;
  symbol: string;
  icon?: string;
  reference?: string;
  reference_hash?: Base64VecU8;
  decimals: number;
}
/**
 * In this implementation, the Token struct takes two extensions standards (metadata and approval) as optional fields, as they are frequently used in modern NFTs.
 */
export interface Token {
  token_id: TokenId;
  owner_id: AccountId;
  metadata?: TokenMetadata;
  approved_account_ids?: Record<AccountId, u64>;
}
/**
 * Note that token IDs for NFTs are strings on NEAR. It's still fine to use autoincrementing numbers as unique IDs if desired, but they should be stringified. This is to make IDs more future-proof as chain-agnostic conventions and standards arise, and allows for more flexibility with considerations like bridging NFTs across chains, etc.
 */
export type TokenId = string;
export interface StorageBalance {
  total: U128;
  available: U128;
}
export type WrappedDuration = string;
/**
 * Metadata on the individual token level.
 */
export interface TokenMetadata {
  title?: string;
  description?: string;
  media?: string;
  media_hash?: Base64VecU8;
  copies?: u64;
  issued_at?: string;
  expires_at?: string;
  starts_at?: string;
  updated_at?: string;
  extra?: string;
  reference?: string;
  reference_hash?: Base64VecU8;
}
/**
 * Metadata for the NFT contract itself.
 */
export interface NftContractMetadata {
  spec: string;
  name: string;
  symbol: string;
  icon?: string;
  base_uri?: string;
  reference?: string;
  reference_hash?: Base64VecU8;
}
/**
 * StorageUsage is used to count the amount of storage used by a contract.
 */
export type StorageUsage = u64;
/**
 * Balance is a type for storing amounts of tokens, specified in yoctoNEAR.
 */
export type Balance = U128;
/**
 * Represents the amount of NEAR tokens in "gas units" which are used to fund transactions.
 */
export type Gas = u64;
/**
 * base64 string.
 */
export type Base64VecU8 = string;
/**
 * Raw type for duration in nanoseconds
 */
export type Duration = u64;
export type U128 = string;
/**
 * Public key in a binary format with base58 string serialization with human-readable curve.
 * The key types currently supported are `secp256k1` and `ed25519`.
 *
 * Ed25519 public keys accepted are 32 bytes and secp256k1 keys are the uncompressed 64 format.
 */
export type PublicKey = string;
export type AccountId = string;
/**
 * Raw type for timestamp in nanoseconds
 */
export type Timestamp = u64;

export class Contract {
  constructor(public account: Account, public readonly contractId: string) {}

  nft_total_supply(
    args: {} = {},
    options?: ViewFunctionOptions
  ): Promise<U128> {
    return this.account.viewFunction(
      this.contractId,
      "nft_total_supply",
      args,
      options
    );
  }
  nft_tokens(
    args: { from_index?: U128; limit?: u64 },
    options?: ViewFunctionOptions
  ): Promise<Token[]> {
    return this.account.viewFunction(
      this.contractId,
      "nft_tokens",
      args,
      options
    );
  }
  async nft_approve(
    args: { token_id: TokenId; account_id: AccountId; msg?: string },
    options?: ChangeMethodOptions
  ): Promise<void> {
    return providers.getTransactionLastResult(
      await this.nft_approveRaw(args, options)
    );
  }
  nft_approveRaw(
    args: { token_id: TokenId; account_id: AccountId; msg?: string },
    options?: ChangeMethodOptions
  ): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({
      contractId: this.contractId,
      methodName: "nft_approve",
      args,
      ...options,
    });
  }
  nft_approveTx(
    args: { token_id: TokenId; account_id: AccountId; msg?: string },
    options?: ChangeMethodOptions
  ): transactions.Action {
    return transactions.functionCall(
      "nft_approve",
      args,
      options?.gas ?? DEFAULT_FUNCTION_CALL_GAS,
      options?.attachedDeposit ?? new BN(0)
    );
  }
  /**
   * Simple transfer. Transfer a given `token_id` from current owner to
   * `receiver_id`.
   *
   * Requirements
   * * Caller of the method must attach a deposit of 1 yoctoⓃ for security purposes
   * * Contract MUST panic if called by someone other than token owner or,
   * if using Approval Management, one of the approved accounts
   * * `approval_id` is for use with Approval Management,
   * see <https://nomicon.io/Standards/NonFungibleToken/ApprovalManagement.html>
   * * If using Approval Management, contract MUST nullify approved accounts on
   * successful transfer.
   * * TODO: needed? Both accounts must be registered with the contract for transfer to
   * succeed. See see <https://nomicon.io/Standards/StorageManagement.html>
   *
   * Arguments:
   * * `receiver_id`: the valid NEAR account receiving the token
   * * `token_id`: the token to transfer
   * * `approval_id`: expected approval ID. A number smaller than
   * 2^53, and therefore representable as JSON. See Approval Management
   * standard for full explanation.
   * * `memo` (optional): for use cases that may benefit from indexing or
   * providing information for a transfer
   */
  async nft_transfer(
    args: {
      receiver_id: AccountId;
      token_id: TokenId;
      approval_id?: u64;
      memo?: string;
    },
    options?: ChangeMethodOptions
  ): Promise<void> {
    return providers.getTransactionLastResult(
      await this.nft_transferRaw(args, options)
    );
  }
  /**
   * Simple transfer. Transfer a given `token_id` from current owner to
   * `receiver_id`.
   *
   * Requirements
   * * Caller of the method must attach a deposit of 1 yoctoⓃ for security purposes
   * * Contract MUST panic if called by someone other than token owner or,
   * if using Approval Management, one of the approved accounts
   * * `approval_id` is for use with Approval Management,
   * see <https://nomicon.io/Standards/NonFungibleToken/ApprovalManagement.html>
   * * If using Approval Management, contract MUST nullify approved accounts on
   * successful transfer.
   * * TODO: needed? Both accounts must be registered with the contract for transfer to
   * succeed. See see <https://nomicon.io/Standards/StorageManagement.html>
   *
   * Arguments:
   * * `receiver_id`: the valid NEAR account receiving the token
   * * `token_id`: the token to transfer
   * * `approval_id`: expected approval ID. A number smaller than
   * 2^53, and therefore representable as JSON. See Approval Management
   * standard for full explanation.
   * * `memo` (optional): for use cases that may benefit from indexing or
   * providing information for a transfer
   */
  nft_transferRaw(
    args: {
      receiver_id: AccountId;
      token_id: TokenId;
      approval_id?: u64;
      memo?: string;
    },
    options?: ChangeMethodOptions
  ): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({
      contractId: this.contractId,
      methodName: "nft_transfer",
      args,
      ...options,
    });
  }
  /**
   * Simple transfer. Transfer a given `token_id` from current owner to
   * `receiver_id`.
   *
   * Requirements
   * * Caller of the method must attach a deposit of 1 yoctoⓃ for security purposes
   * * Contract MUST panic if called by someone other than token owner or,
   * if using Approval Management, one of the approved accounts
   * * `approval_id` is for use with Approval Management,
   * see <https://nomicon.io/Standards/NonFungibleToken/ApprovalManagement.html>
   * * If using Approval Management, contract MUST nullify approved accounts on
   * successful transfer.
   * * TODO: needed? Both accounts must be registered with the contract for transfer to
   * succeed. See see <https://nomicon.io/Standards/StorageManagement.html>
   *
   * Arguments:
   * * `receiver_id`: the valid NEAR account receiving the token
   * * `token_id`: the token to transfer
   * * `approval_id`: expected approval ID. A number smaller than
   * 2^53, and therefore representable as JSON. See Approval Management
   * standard for full explanation.
   * * `memo` (optional): for use cases that may benefit from indexing or
   * providing information for a transfer
   */
  nft_transferTx(
    args: {
      receiver_id: AccountId;
      token_id: TokenId;
      approval_id?: u64;
      memo?: string;
    },
    options?: ChangeMethodOptions
  ): transactions.Action {
    return transactions.functionCall(
      "nft_transfer",
      args,
      options?.gas ?? DEFAULT_FUNCTION_CALL_GAS,
      options?.attachedDeposit ?? new BN(0)
    );
  }
  /**
   * Transfer token and call a method on a receiver contract. A successful
   * workflow will end in a success execution outcome to the callback on the NFT
   * contract at the method `nft_resolve_transfer`.
   *
   * You can think of this as being similar to attaching native NEAR tokens to a
   * function call. It allows you to attach any Non-Fungible Token in a call to a
   * receiver contract.
   *
   * Requirements:
   * * Caller of the method must attach a deposit of 1 yoctoⓃ for security
   * purposes
   * * Contract MUST panic if called by someone other than token owner or,
   * if using Approval Management, one of the approved accounts
   * * The receiving contract must implement `ft_on_transfer` according to the
   * standard. If it does not, FT contract's `ft_resolve_transfer` MUST deal
   * with the resulting failed cross-contract call and roll back the transfer.
   * * Contract MUST implement the behavior described in `ft_resolve_transfer`
   * * `approval_id` is for use with Approval Management extension, see
   * that document for full explanation.
   * * If using Approval Management, contract MUST nullify approved accounts on
   * successful transfer.
   *
   * Arguments:
   * * `receiver_id`: the valid NEAR account receiving the token.
   * * `token_id`: the token to send.
   * * `approval_id`: expected approval ID. A number smaller than
   * 2^53, and therefore representable as JSON. See Approval Management
   * standard for full explanation.
   * * `memo` (optional): for use cases that may benefit from indexing or
   * providing information for a transfer.
   * * `msg`: specifies information needed by the receiving contract in
   * order to properly handle the transfer. Can indicate both a function to
   * call and the parameters to pass to that function.
   */
  async nft_transfer_call(
    args: {
      receiver_id: AccountId;
      token_id: TokenId;
      approval_id?: u64;
      memo?: string;
      msg: string;
    },
    options?: ChangeMethodOptions
  ): Promise<void> {
    return providers.getTransactionLastResult(
      await this.nft_transfer_callRaw(args, options)
    );
  }
  /**
   * Transfer token and call a method on a receiver contract. A successful
   * workflow will end in a success execution outcome to the callback on the NFT
   * contract at the method `nft_resolve_transfer`.
   *
   * You can think of this as being similar to attaching native NEAR tokens to a
   * function call. It allows you to attach any Non-Fungible Token in a call to a
   * receiver contract.
   *
   * Requirements:
   * * Caller of the method must attach a deposit of 1 yoctoⓃ for security
   * purposes
   * * Contract MUST panic if called by someone other than token owner or,
   * if using Approval Management, one of the approved accounts
   * * The receiving contract must implement `ft_on_transfer` according to the
   * standard. If it does not, FT contract's `ft_resolve_transfer` MUST deal
   * with the resulting failed cross-contract call and roll back the transfer.
   * * Contract MUST implement the behavior described in `ft_resolve_transfer`
   * * `approval_id` is for use with Approval Management extension, see
   * that document for full explanation.
   * * If using Approval Management, contract MUST nullify approved accounts on
   * successful transfer.
   *
   * Arguments:
   * * `receiver_id`: the valid NEAR account receiving the token.
   * * `token_id`: the token to send.
   * * `approval_id`: expected approval ID. A number smaller than
   * 2^53, and therefore representable as JSON. See Approval Management
   * standard for full explanation.
   * * `memo` (optional): for use cases that may benefit from indexing or
   * providing information for a transfer.
   * * `msg`: specifies information needed by the receiving contract in
   * order to properly handle the transfer. Can indicate both a function to
   * call and the parameters to pass to that function.
   */
  nft_transfer_callRaw(
    args: {
      receiver_id: AccountId;
      token_id: TokenId;
      approval_id?: u64;
      memo?: string;
      msg: string;
    },
    options?: ChangeMethodOptions
  ): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({
      contractId: this.contractId,
      methodName: "nft_transfer_call",
      args,
      ...options,
    });
  }
  /**
   * Transfer token and call a method on a receiver contract. A successful
   * workflow will end in a success execution outcome to the callback on the NFT
   * contract at the method `nft_resolve_transfer`.
   *
   * You can think of this as being similar to attaching native NEAR tokens to a
   * function call. It allows you to attach any Non-Fungible Token in a call to a
   * receiver contract.
   *
   * Requirements:
   * * Caller of the method must attach a deposit of 1 yoctoⓃ for security
   * purposes
   * * Contract MUST panic if called by someone other than token owner or,
   * if using Approval Management, one of the approved accounts
   * * The receiving contract must implement `ft_on_transfer` according to the
   * standard. If it does not, FT contract's `ft_resolve_transfer` MUST deal
   * with the resulting failed cross-contract call and roll back the transfer.
   * * Contract MUST implement the behavior described in `ft_resolve_transfer`
   * * `approval_id` is for use with Approval Management extension, see
   * that document for full explanation.
   * * If using Approval Management, contract MUST nullify approved accounts on
   * successful transfer.
   *
   * Arguments:
   * * `receiver_id`: the valid NEAR account receiving the token.
   * * `token_id`: the token to send.
   * * `approval_id`: expected approval ID. A number smaller than
   * 2^53, and therefore representable as JSON. See Approval Management
   * standard for full explanation.
   * * `memo` (optional): for use cases that may benefit from indexing or
   * providing information for a transfer.
   * * `msg`: specifies information needed by the receiving contract in
   * order to properly handle the transfer. Can indicate both a function to
   * call and the parameters to pass to that function.
   */
  nft_transfer_callTx(
    args: {
      receiver_id: AccountId;
      token_id: TokenId;
      approval_id?: u64;
      memo?: string;
      msg: string;
    },
    options?: ChangeMethodOptions
  ): transactions.Action {
    return transactions.functionCall(
      "nft_transfer_call",
      args,
      options?.gas ?? DEFAULT_FUNCTION_CALL_GAS,
      options?.attachedDeposit ?? new BN(0)
    );
  }
  /**
   * Initializes the contract owned by `owner_id` with
   * default metadata (for example purposes only).
   */
  async new_default_meta(
    args: { owner_id: AccountId },
    options?: ChangeMethodOptions
  ): Promise<void> {
    return providers.getTransactionLastResult(
      await this.new_default_metaRaw(args, options)
    );
  }
  /**
   * Initializes the contract owned by `owner_id` with
   * default metadata (for example purposes only).
   */
  new_default_metaRaw(
    args: { owner_id: AccountId },
    options?: ChangeMethodOptions
  ): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({
      contractId: this.contractId,
      methodName: "new_default_meta",
      args,
      ...options,
    });
  }
  /**
   * Initializes the contract owned by `owner_id` with
   * default metadata (for example purposes only).
   */
  new_default_metaTx(
    args: { owner_id: AccountId },
    options?: ChangeMethodOptions
  ): transactions.Action {
    return transactions.functionCall(
      "new_default_meta",
      args,
      options?.gas ?? DEFAULT_FUNCTION_CALL_GAS,
      options?.attachedDeposit ?? new BN(0)
    );
  }
  /**
   * Returns the token with the given `token_id` or `null` if no such token.
   */
  nft_token(
    args: { token_id: TokenId },
    options?: ViewFunctionOptions
  ): Promise<Token | null> {
    return this.account.viewFunction(
      this.contractId,
      "nft_token",
      args,
      options
    );
  }
  /**
   * Mint a new token with ID=`token_id` belonging to `token_owner_id`.
   *
   * Since this example implements metadata, it also requires per-token metadata to be provided
   * in this call. `self.tokens.mint` will also require it to be Some, since
   * `StorageKey::TokenMetadata` was provided at initialization.
   *
   * `self.tokens.mint` will enforce `predecessor_account_id` to equal the `owner_id` given in
   * initialization call to `new`.
   */
  async nft_mint(
    args: {
      token_id: TokenId;
      token_owner_id: AccountId;
      token_metadata: TokenMetadata;
    },
    options?: ChangeMethodOptions
  ): Promise<Token> {
    return providers.getTransactionLastResult(
      await this.nft_mintRaw(args, options)
    );
  }
  /**
   * Mint a new token with ID=`token_id` belonging to `token_owner_id`.
   *
   * Since this example implements metadata, it also requires per-token metadata to be provided
   * in this call. `self.tokens.mint` will also require it to be Some, since
   * `StorageKey::TokenMetadata` was provided at initialization.
   *
   * `self.tokens.mint` will enforce `predecessor_account_id` to equal the `owner_id` given in
   * initialization call to `new`.
   */
  nft_mintRaw(
    args: {
      token_id: TokenId;
      token_owner_id: AccountId;
      token_metadata: TokenMetadata;
    },
    options?: ChangeMethodOptions
  ): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({
      contractId: this.contractId,
      methodName: "nft_mint",
      args,
      ...options,
    });
  }
  /**
   * Mint a new token with ID=`token_id` belonging to `token_owner_id`.
   *
   * Since this example implements metadata, it also requires per-token metadata to be provided
   * in this call. `self.tokens.mint` will also require it to be Some, since
   * `StorageKey::TokenMetadata` was provided at initialization.
   *
   * `self.tokens.mint` will enforce `predecessor_account_id` to equal the `owner_id` given in
   * initialization call to `new`.
   */
  nft_mintTx(
    args: {
      token_id: TokenId;
      token_owner_id: AccountId;
      token_metadata: TokenMetadata;
    },
    options?: ChangeMethodOptions
  ): transactions.Action {
    return transactions.functionCall(
      "nft_mint",
      args,
      options?.gas ?? DEFAULT_FUNCTION_CALL_GAS,
      options?.attachedDeposit ?? new BN(0)
    );
  }
  async nft_revoke_all(
    args: { token_id: TokenId },
    options?: ChangeMethodOptions
  ): Promise<void> {
    return providers.getTransactionLastResult(
      await this.nft_revoke_allRaw(args, options)
    );
  }
  nft_revoke_allRaw(
    args: { token_id: TokenId },
    options?: ChangeMethodOptions
  ): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({
      contractId: this.contractId,
      methodName: "nft_revoke_all",
      args,
      ...options,
    });
  }
  nft_revoke_allTx(
    args: { token_id: TokenId },
    options?: ChangeMethodOptions
  ): transactions.Action {
    return transactions.functionCall(
      "nft_revoke_all",
      args,
      options?.gas ?? DEFAULT_FUNCTION_CALL_GAS,
      options?.attachedDeposit ?? new BN(0)
    );
  }
  async nft_revoke(
    args: { token_id: TokenId; account_id: AccountId },
    options?: ChangeMethodOptions
  ): Promise<void> {
    return providers.getTransactionLastResult(
      await this.nft_revokeRaw(args, options)
    );
  }
  nft_revokeRaw(
    args: { token_id: TokenId; account_id: AccountId },
    options?: ChangeMethodOptions
  ): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({
      contractId: this.contractId,
      methodName: "nft_revoke",
      args,
      ...options,
    });
  }
  nft_revokeTx(
    args: { token_id: TokenId; account_id: AccountId },
    options?: ChangeMethodOptions
  ): transactions.Action {
    return transactions.functionCall(
      "nft_revoke",
      args,
      options?.gas ?? DEFAULT_FUNCTION_CALL_GAS,
      options?.attachedDeposit ?? new BN(0)
    );
  }
  nft_metadata(
    args: {} = {},
    options?: ViewFunctionOptions
  ): Promise<NftContractMetadata> {
    return this.account.viewFunction(
      this.contractId,
      "nft_metadata",
      args,
      options
    );
  }
  nft_is_approved(
    args: {
      token_id: TokenId;
      approved_account_id: AccountId;
      approval_id?: u64;
    },
    options?: ViewFunctionOptions
  ): Promise<boolean> {
    return this.account.viewFunction(
      this.contractId,
      "nft_is_approved",
      args,
      options
    );
  }
  nft_tokens_for_owner(
    args: { account_id: AccountId; from_index?: U128; limit?: u64 },
    options?: ViewFunctionOptions
  ): Promise<Token[]> {
    return this.account.viewFunction(
      this.contractId,
      "nft_tokens_for_owner",
      args,
      options
    );
  }
  nft_supply_for_owner(
    args: { account_id: AccountId },
    options?: ViewFunctionOptions
  ): Promise<U128> {
    return this.account.viewFunction(
      this.contractId,
      "nft_supply_for_owner",
      args,
      options
    );
  }
  async new(
    args: { owner_id: AccountId; metadata: NftContractMetadata },
    options?: ChangeMethodOptions
  ): Promise<void> {
    return providers.getTransactionLastResult(await this.newRaw(args, options));
  }
  newRaw(
    args: { owner_id: AccountId; metadata: NftContractMetadata },
    options?: ChangeMethodOptions
  ): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({
      contractId: this.contractId,
      methodName: "new",
      args,
      ...options,
    });
  }
  newTx(
    args: { owner_id: AccountId; metadata: NftContractMetadata },
    options?: ChangeMethodOptions
  ): transactions.Action {
    return transactions.functionCall(
      "new",
      args,
      options?.gas ?? DEFAULT_FUNCTION_CALL_GAS,
      options?.attachedDeposit ?? new BN(0)
    );
  }
}
