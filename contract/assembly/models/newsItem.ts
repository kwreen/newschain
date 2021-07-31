import { context, u128 } from "near-sdk-as";

// generate a new id according to title + link + sharerId?
// could also be handled on the frontend if so.. where should this live?
// Currently.. using the collection count of news items...

@nearBindgen
export class NewsItem {
  createdAt: u64 = context.blockTimestamp;

  constructor(
    public id: string,
    public sharerId: string,
    public title: string,
    public valueVouchTotal: u128,
    public link?: string
  ) {}
}
