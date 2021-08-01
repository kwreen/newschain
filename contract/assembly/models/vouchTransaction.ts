import { Context, u128 } from "near-sdk-as";

@nearBindgen
export class VouchTransaction {
  createdAt: u64 = Context.blockTimestamp;

  constructor(
    public sender: string,
    public receiver: string,
    public newsItemId: string,
    public amount: u128
  ) {}
}
