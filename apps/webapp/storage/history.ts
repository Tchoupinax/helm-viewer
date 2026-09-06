export type HistoryItem = {
  chartName: string;
  chartVersion: string;
  date: Date;
  id: string;
};

const HISTORY_KEY = "helm-viewer-history";

export const History = {
  list(): Array<HistoryItem> {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]") as Array<HistoryItem>;
  },
  append(element: HistoryItem) {
    const histories = History.list();
    histories.push(element);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(histories));
  },
};
