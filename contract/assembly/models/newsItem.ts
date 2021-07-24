
// generate a new id according to title + link + sharerId?
// could also be handled on the frontend if so.. where should this live?
// Currently.. using the collection count of news items...

@nearBindgen
export class NewsItem {
  constructor(
    public id: string,
    public sharerId: string,
    public title: string,
    public link?: string,
  ) { }
}
