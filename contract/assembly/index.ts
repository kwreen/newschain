/*
 * This is an example of an AssemblyScript smart contract with two simple,
 * symmetric functions:
 *
 * 1. setGreeting: accepts a greeting, such as "howdy", and records it for the
 *    user (account_id) who sent the request
 * 2. getGreeting: accepts an account_id and returns the greeting saved for it,
 *    defaulting to "Hello"
 *
 * Learn more about writing NEAR smart contracts with AssemblyScript:
 * https://docs.near.org/docs/develop/contracts/as/intro
 *
 */

import { Context, logging, storage } from 'near-sdk-as'

const DEFAULT_MESSAGE = 'Hello'

@nearBindgen
export class Contract {

  /* TODO: REQUIRES IMPLEMENTATION FOR "what's up?"
   *
   * 1. Get top news items (i.e. news items ordered by votes)
   * 2. Get all news items ⭐ (maybe goes with the first one?)
   * 3. Post news item (params e.g. summary string, link, account id)
   *    defaults to be set: id=genereated value, votes=0 ⭐
   * 4. Get news items by account id
   * 5. Vote for a news item (params e.g. news item id, vouch amount)
   *    defaults to be set: 0.22
   * 6. Get top news by date (i.e. news items ordered by votes)
   * 7. todo: all the logic with distributing rewards
   */

  // "Hello World" with singleton method

  getGreeting(accountId: string): string | null {
    return storage.get<string>(accountId, DEFAULT_MESSAGE);
  }

  setGreeting(message: string): void {
    const account_id = Context.sender

    logging.log('Saving greeting "' + message + '" for account "' + account_id + '"')

    storage.set(account_id, message)
  }
}

// "Hello World" example with simple export method

// // Exported functions will be part of the public interface for your smart contract.
// // Feel free to extract behavior to non-exported functions!
// export function getGreeting(accountId: string): string | null {
//   // This uses raw `storage.get`, a low-level way to interact with on-chain
//   // storage for simple contracts.
//   // If you have something more complex, check out persistent collections:
//   // https://docs.near.org/docs/concepts/data-storage#assemblyscript-collection-types
//   return storage.get<string>(accountId, DEFAULT_MESSAGE)
// }

// export function setGreeting(message: string): void {
//   const account_id = Context.sender

//   // Use logging.log to record logs permanently to the blockchain!
//   logging.log(
//     // String interpolation (`like ${this}`) is a work in progress:
//     // https://github.com/AssemblyScript/assemblyscript/pull/1115
//     'Saving greeting "' + message + '" for account "' + account_id + '"'
//   )

//   storage.set(account_id, message)
// }
