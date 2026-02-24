import crypto from "crypto-js";

export function encrypt(data: string, key: string): string {
  return crypto.AES.encrypt(data, key).toString();
}

export function decrypt(encryptedData: string, key: string): string {
  const bytes = crypto.AES.decrypt(encryptedData, key);
  return bytes.toString(crypto.enc.Utf8);
}
