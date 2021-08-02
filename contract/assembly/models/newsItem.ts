import { Context, u128 } from "near-sdk-as";

// generate a new id according to title + link + sharerId?
// could also be handled on the frontend if so.. where should this live?
// Currently.. using the collection count of news items...

@nearBindgen
export class NewsItem {
  createdAt: u64 = Context.blockTimestamp;

  constructor(
    public id: string,
    public sharerId: string,
    public title: string,
    public totalVouchedTokens: u128, // todo: should this be f64?
    public link?: string
  ) {}
}
