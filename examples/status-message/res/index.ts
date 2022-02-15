import { Account, transactions, providers, DEFAULT_FUNCTION_CALL_GAS } from 'near-api-js';


import BN from 'bn.js';
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
  
  constructor(public account: Account, public readonly contractId: string){}
  
  async set_status(args: {message: string}, options?: ChangeMethodOptions): Promise<void> {
    return providers.getTransactionLastResult(await this.set_statusRaw(args, options));
  }
  set_statusRaw(args: {message: string}, options?: ChangeMethodOptions):  Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "set_status", args, ...options});
  }
  set_statusTx(args: {message: string}, options?: ChangeMethodOptions):  transactions.Action {
    return transactions.functionCall("set_status", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  get_status(args: {account_id: AccountId}, options?: ViewFunctionOptions): Promise<string | null> {
    return this.account.viewFunction(this.contractId, "get_status", args, options);
  }
}
