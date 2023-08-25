export type HistoryItem = {
  chartName: string;
  chartVersion: string;
  date: Date;
  id: string;
}

export class History {
  private static key = 'helm-viewer-history';

  static list(): Array<HistoryItem> {
    return JSON.parse(localStorage.getItem(this.key) ?? '[]')
  }

  static append(element: HistoryItem) {
    const histories = this.list();
    histories.push(element);
    localStorage.setItem(this.key, JSON.stringify(histories));
  }
}