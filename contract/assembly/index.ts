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

import { Context, logging, MapEntry, PersistentUnorderedMap, storage } from 'near-sdk-as'
import { NEWS_ITEM_ID_PREFIX } from './ids';
import { NewsItem } from './models/NewsItem';

const DEFAULT_MESSAGE = 'Hello'

@nearBindgen
export class Contract {

  idToNewsItem: PersistentUnorderedMap<string, NewsItem> = new PersistentUnorderedMap<string, NewsItem>("a");

  // Probably needs some form of pagination
  getNewsItems(): MapEntry<string, NewsItem>[] {
    return this.idToNewsItem.entries();
  }

  // AccountId should have an AccountId type?
  // Link should be a validateable URL?
  // Title should have a character limit?
  //
  // for later:
  // VouchAmount by sharer
  createNewsItem(title: string, link?: string): void {
    // run validations

    const newsItemId = this.generateNewsItemId();
    const account_id = Context.sender

    const newsItem = new NewsItem(newsItemId, account_id, title, link);

    logging.log(newsItem);
    this.idToNewsItem.set(newsItemId, newsItem);
  }

  // tmp, from base code
  getGreeting(accountId: string): string | null {
    return storage.get<string>(accountId, DEFAULT_MESSAGE);
  }

  private generateNewsItemId(): string {
    return NEWS_ITEM_ID_PREFIX + this.idToNewsItem.length.toString();
  }
}
