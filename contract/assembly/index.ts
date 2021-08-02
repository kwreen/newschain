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
import { XCC_GAS } from "./constants";

import {
  NEWS_ITEM_ID_PREFIX,
  VOUCH_TRANSACTION_ID_PREFIX,
  LAST_VOUCHED_TOKENS_RELEASE_TIMESTAMP,
} from "./ids";
import { NewsItem } from "./models/NewsItem";
import { VouchTransaction } from "./models/VouchTransaction";

const DEFAULT_MESSAGE = "Hello";

@nearBindgen
export class Contract {
  // { news_item_id => NewsItem }
  idToNewsItem: PersistentUnorderedMap<string, NewsItem> =
    new PersistentUnorderedMap<string, NewsItem>("a0");

  // { vouch_transaction_id => VouchTransaction }
  idToVouchTransaction: PersistentUnorderedMap<string, VouchTransaction> =
    new PersistentUnorderedMap<string, VouchTransaction>("b0");

  // { news_item_id => [VouchTransactions] }
  newsItemIdToVouchTransctions: PersistentUnorderedMap<
    string,
    PersistentVector<VouchTransaction>
  > = new PersistentUnorderedMap<string, PersistentVector<VouchTransaction>>(
    "c0"
  );

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

  /**
   * Get today's most highly vouched for news items.
   *
   * todo:
   *   - should make this more efficient, maybe store items by date?
   *
   * @returns today's top 3 vouched news items
   */
  getTop3VouchedNewsItem(): NewsItem[] {
    const sortedNewsItems =
      this.getDescendingSortedNewsItemsByTotalVouchedTokens();

    return sortedNewsItems.slice(0, 3);
  }

  // ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
  // VOUCH TRANSACTIONS

  /**
   * Vouch for the value of a news item by staking NEAR tokens.
   *
   * @param newsItemId of the news item to vouch for
   * @param amount to stake for the the value vouching
   */
  vouch(newsItemId: string, amount: u128): void {
    assert(
      this.idToNewsItem.contains(newsItemId),
      "No news item exists for id " + newsItemId
    );
    const accountId = Context.sender;
    // todo: actually send to a lockup account to keep staked tokens until end of day
    const tmpLockupAccount = accountId;

    const newsItem = this.idToNewsItem.getSome(newsItemId);

    const transactionId = this.generateVouchTransactionId();
    const newTransaction = new VouchTransaction(
      accountId,
      accountId,
      newsItemId,
      amount
    );

    ContractPromiseBatch.create(tmpLockupAccount).transfer(amount);

    logging.log(
      "Staking " + amount.toString() + "NEAR tokens for NewsItem #" + newsItemId
    );
    this.idToVouchTransaction.set(transactionId, newTransaction);

    let currentTransactions = this.getTransactionsByNewsItemId(newsItemId);
    currentTransactions.push(newTransaction);
    this.newsItemIdToVouchTransctions.set(newsItemId, currentTransactions);

    // todo: this doesn't seem to update the total
    newsItem.totalVouchedTokens = u128.add(newsItem.totalVouchedTokens, amount);
  }

  /**
   * Get all the transactions for a given news item id.
   *
   * @param newsItemId
   * @returns a list of transactions
   */
  getVouchTransactions(newsItemId: string): VouchTransaction[] {
    const transactionsVector = this.getTransactionsByNewsItemId(newsItemId);
    let transactionArray: VouchTransaction[] = new Array<VouchTransaction>();

    for (let i = 0; i < transactionsVector.length; i++) {
      const item = transactionsVector[i];
      transactionArray.push(item);
    }

    return transactionArray;
  }

  /**
   * Release NEAR tokens that have been stake for the vouching of a news item.
   * This method will only run if the day has ended. If called before the day's end,
   * no tokens will be released.
   */
  releaseVouchedTokens(): void {
    // todo
    // assert(this.isContractInitialized, "Contract must be initialized first");

    const currentDateTime = this.getCurrentDateTime();
    const currentTimestamp = currentDateTime.getTime();

    // Yesterday is 864e5 milliseconds back
    // 864e5 = 24*60*60*1000
    const dayInMilliseconds = 864e5;

    // trying to make the compiler happy, there's gotta be a better way to do this...
    const lastTimestampString = storage.get<string>(
      LAST_VOUCHED_TOKENS_RELEASE_TIMESTAMP
    );
    assert(lastTimestampString, "Contract has not been initialized");

    if (lastTimestampString) {
      const lastTimestamp = <i64>parseInt(lastTimestampString);

      // logic
      if (currentTimestamp == lastTimestamp) {
        logging.log("day not over, not releasing tokens yet");
        return;
      } else if (currentTimestamp == lastTimestamp + dayInMilliseconds) {
        logging.log("day over, releasing tokens..");
        // code to release tokens...
        // todo: actually send to a lockup account to keep staked tokens until end of day
        const tmpLockupAccount = Context.sender;

        // get the top vouched news
        const top3NewsItems =
          this.getDescendingSortedNewsItemsByTotalVouchedTokens().slice(0, 3);

        for (let i = 0; i < top3NewsItems.length; i++) {
          const newsItem = top3NewsItems[i];
          ContractPromiseBatch.create(tmpLockupAccount)
            .transfer(newsItem.totalVouchedTokens)
            .then(Context.contractName)
            .function_call(
              "onVouchedTokensRelease",
              "{ currentTimestamp:" + currentTimestamp.toString() + "}",
              // why does this not work: `{ currentTimestamp: currentTimestamp.toString }`?
              u128.Zero,
              XCC_GAS
            );

          logging.log(
            "Releasing " +
              newsItem.totalVouchedTokens.toString() +
              " tokens for NewsItem #" +
              newsItem.id
          );

          // todo: tmp code
          newsItem.totalVouchedTokens = u128.Zero;
          logging.log(newsItem);
        }
      }

      logging.log(currentDateTime);
    }
  }

  onVouchedTokensRelease(currentTimestamp: string): void {
    // assert predecessor is contract
    logging.log(
      "Updating LAST_VOUCHED_TOKENS_RELEASE_TIMESTAMP following vouched tokens release..."
    );
    storage.set(LAST_VOUCHED_TOKENS_RELEASE_TIMESTAMP, currentTimestamp);
  }

  // ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
  // CONTRACT ENV

  /**
   * Get the timestamp of when the latest vouched tokens have been released.
   * This timestamp will only ever represent today or yesterday's date.
   *
   * The number represents non-leap-milliseconds since January 1, 1970 0:00:00 UTC.
   * @returns last vouched tokens release timestamp
   */
  getLastVouchedTokensReleaseTimestamp(): string | null {
    const lastTimestamp = storage.get<string>(
      LAST_VOUCHED_TOKENS_RELEASE_TIMESTAMP
    );
    assert(lastTimestamp, "Contract has not been initialized");

    return lastTimestamp;
  }

  // todo: tmp method, should not be a callable
  initializeContract(): void {
    // Storing todayTimestamp as a string because i64 cannot be nullable
    // Should we store with -1 instead?
    const currentDateTime = this.getCurrentDateTime();

    // todo: tmp code, setting to yesterday instead of today
    const today = (currentDateTime.getTime() - 864e5).toString();
    storage.set(LAST_VOUCHED_TOKENS_RELEASE_TIMESTAMP, today);

    logging.log(
      "Initializing contract with LAST_VOUCHED_TOKENS_RELEASE_TIMESTAMP=" +
        today
    );
  }

  // ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
  // PRIVATE

  private getCurrentDateTime(): Date {
    // Date is from Context is retrieved as nanoseconds (10^-9)
    // JavaScript dates are handled in milliseconds (10^-3)
    const blockTimestampMultiplier = 1000000;
    const blockTimestamp = Context.blockTimestamp;

    // We don't need the time, only the date
    const currentDateTime = new Date(blockTimestamp / blockTimestampMultiplier);
    currentDateTime.setUTCHours(0);
    currentDateTime.setUTCMinutes(0);
    currentDateTime.setUTCSeconds(0);
    currentDateTime.setUTCMilliseconds(0);

    return currentDateTime;
  }

  private generateVouchTransactionId(): string {
    return (
      VOUCH_TRANSACTION_ID_PREFIX + this.idToVouchTransaction.length.toString()
    );
  }

  // todo: is there a better convention to generate ids on the chain, e.g. use UUIDs?
  private generateNewsItemId(): string {
    return NEWS_ITEM_ID_PREFIX + this.idToNewsItem.length.toString();
  }

  private getTransactionsByNewsItemId(
    id: string
  ): PersistentVector<VouchTransaction> {
    let currentTransactions: PersistentVector<VouchTransaction>;
    if (this.newsItemIdToVouchTransctions.contains(id)) {
      currentTransactions = this.newsItemIdToVouchTransctions.getSome(id);
    } else {
      currentTransactions = new PersistentVector<VouchTransaction>("d0");
    }

    return currentTransactions;
  }

  private getDescendingSortedNewsItemsByTotalVouchedTokens(): NewsItem[] {
    const newsItems = this.idToNewsItem.values();
    newsItems.sort((a, b) => {
      // todo: would it be possible to avoid this conversion u128 -> string -> int as number?
      // i.e. simply doing `u128.sub(b.totalVouchedTokens, a.totalVouchedTokens)` won't work
      if (b.totalVouchedTokens < a.totalVouchedTokens) {
        return -1;
      }
      if (b.totalVouchedTokens > a.totalVouchedTokens) {
        return 1;
      }
      return 0;
    });

    return newsItems;
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
}
