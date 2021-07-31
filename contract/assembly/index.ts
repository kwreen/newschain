import {
  Context,
  ContractPromiseBatch,
  logging,
  MapEntry,
  PersistentUnorderedMap,
  PersistentVector,
  storage,
  u128,
} from "near-sdk-as";

import { NEWS_ITEM_ID_PREFIX, VALUE_VOUCH_TRANSACTION_ID_PREFIX } from "./ids";
import { NewsItem } from "./models/NewsItem";
import { ValueVouchTransaction } from "./models/ValueVouchTransaction";

const DEFAULT_MESSAGE = "Hello";

@nearBindgen
export class Contract {
  // { news_item_id => NewsItem }
  idToNewsItem: PersistentUnorderedMap<string, NewsItem> =
    new PersistentUnorderedMap<string, NewsItem>("a");

  // { value_vouch_transaction_id => ValueVouchTransaction }
  idToValueVouchTransaction: PersistentUnorderedMap<
    string,
    ValueVouchTransaction
  > = new PersistentUnorderedMap<string, ValueVouchTransaction>("b");

  // { news_item_id => [ValueVouchTransactions] }
  newsItemIdToValueVouchTransactions: PersistentUnorderedMap<
    string,
    PersistentVector<ValueVouchTransaction>
  > = new PersistentUnorderedMap<
    string,
    PersistentVector<ValueVouchTransaction>
  >("c");

  // ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
  // NEWS ITEM

  /**
   * Get all the existing news items shared on the chain.
   *
   * todo: probably needs some form of pagination?
   *
   * @returns a map of id to its respective NewsItem
   */
  getNewsItems(): MapEntry<string, NewsItem>[] {
    return this.idToNewsItem.entries();
  }

  /**
   * Share a news item on the chain. This creates a new item.
   *
   * todo:
   *   - AccountId should have an AccountId type?
   *   - Link should be a validateable URL?
   *   - Title should have a character limit?
   *   - Add a 'vouch' amount parameter by sharer
   *
   * @param title of the news
   * @param link to a reliable news source
   */
  createNewsItem(title: string, link?: string): void {
    const accountId = Context.sender;
    const newsItemId = this.generateNewsItemId();
    const newsItem = new NewsItem(
      newsItemId,
      accountId,
      title,
      u128.Zero,
      link
    );

    logging.log(newsItem);
    this.idToNewsItem.set(newsItemId, newsItem);
  }

  // ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
  // VALUE VOUCH TRANSACTIONS

  /**
   * Vouch for the value of a news item by staking NEAR tokens.
   *
   * @param newsItemId of the news item to vouch for
   * @param amount to stake for the the value vouching
   */
  valueVouchNewsItem(newsItemId: string, amount: u128): void {
    assert(
      this.idToNewsItem.contains(newsItemId),
      "No news item exists for id " + newsItemId
    );
    const accountId = Context.sender;
    // todo: actually send to a lockup account to keep staked tokens until end of day
    const tmpLockupAccount = accountId;

    const newsItem = this.idToNewsItem.getSome(newsItemId);

    const transactionId = this.generateValueVouchTransactionId();
    const newTransaction = new ValueVouchTransaction(
      accountId,
      accountId,
      newsItemId,
      amount
    );

    ContractPromiseBatch.create(tmpLockupAccount).transfer(amount);

    logging.log(
      "Staking " + amount.toString() + "NEAR tokens for NewsItem #" + newsItemId
    );
    this.idToValueVouchTransaction.set(transactionId, newTransaction);

    let currentTransactions: PersistentVector<ValueVouchTransaction>;
    if (this.newsItemIdToValueVouchTransactions.contains(newsItemId)) {
      currentTransactions =
        this.newsItemIdToValueVouchTransactions.getSome(newsItemId);
    } else {
      currentTransactions = new PersistentVector<ValueVouchTransaction>("d");
    }

    currentTransactions.push(newTransaction);
    this.newsItemIdToValueVouchTransactions.set(
      newsItemId,
      currentTransactions
    );

    newsItem.valueVouchTotal = u128.add(newsItem.valueVouchTotal, amount);
  }

  // ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
  // tmp

  /**
   * tmp code from create-near-app
   *
   * @param accountId
   * @returns
   */
  getGreeting(accountId: string): string | null {
    return storage.get<string>(accountId, DEFAULT_MESSAGE);
  }

  /**
   * tmp code from create-near-app
   *
   * @param accountId
   * @returns
   */
  setGreeting(message: string): void {
    const accountId = Context.sender;

    logging.log(
      'Saving greeting "' + message + '" for account "' + accountId + '"'
    );

    storage.set(accountId, message);
  }

  // ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
  // PRIVATE

  private generateValueVouchTransactionId(): string {
    return (
      VALUE_VOUCH_TRANSACTION_ID_PREFIX +
      this.idToValueVouchTransaction.length.toString()
    );
  }

  private generateNewsItemId(): string {
    return NEWS_ITEM_ID_PREFIX + this.idToNewsItem.length.toString();
  }
}
