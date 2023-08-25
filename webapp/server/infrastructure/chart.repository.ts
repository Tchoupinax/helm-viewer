import { randomUUID } from "crypto"
import upload from "../api/shared/upload.post"

export class ChartRepository {
  private static charts = new Map()

  static upload(chartId: string, chartPayload: string): string {
    const encryptionKey = randomUUID();
    this.charts.set(chartId, chartPayload);
    return encryptionKey;
  }

  static read(chartId: string, encryptionKey: string): string {
    return this.charts.get(chartId)
  }
}
