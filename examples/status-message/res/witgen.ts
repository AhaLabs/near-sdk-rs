export type Base64VecU8 = Uint8Array;
export type U128 = string;
export type AccountId = string;

import { Gas, NEAR } from "near-units";
/**
* Options used to initiate a function call (especially a change function call)
* @see {@link viewFunction} to initiate a view function call
*/
export interface CallOptions<T> {
  /**
  * named arguments to pass the method `{ messageText: 'my message' }`
  */
  args: T;
  /** max amount of gas that method call can use */
  gas?: Gas;
  /** amount of NEAR (in yoctoNEAR) to send together with the call */
  attachedDeposit?: NEAR;
  /**
  * Metadata to send the NEAR Wallet if using it to sign transactions.
  * @see {@link RequestSignTransactionsOptions}
  */
  walletMeta?: string;
  /**
  * Callback url to send the NEAR Wallet if using it to sign transactions.
  * @see {@link RequestSignTransactionsOptions}
  */
  walletCallbackUrl?: string;
  /**
  * Convert input arguments into bytes array.
  */
  // stringify?: (input: any) => Buffer;
}
import { Contract as _Contract, Account } from 'near-api-js';
export interface Contract extends _Contract {
  set_status(props: CallOptions<{message: string}>): Promise<void>;
  get_status(args: {accountId: AccountId}): Promise<string | null>;
}
export function init(account: Account, contractId: string): Contract {
  return <Contract> new _Contract(account, contractId, {viewMethods: ["get_status"], changeMethods: ["set_status"]})
}
