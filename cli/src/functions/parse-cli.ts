import { randomUUID } from "node:crypto";
import { parseArgs } from "node:util";

export function getArguments() {
  return parseArgs(
    {
      options: {
        watch: {
          type: "boolean",
          short: "w",
          default: false
        },
        push: {
          type: "boolean",
          short: "p",
          default: false
        },
        encryptionKey: {
          type: "string",
          short: "k",
          default: randomUUID()
        },
        browser: {
          type: "string",
          short: "b",
          default: "default"
        },
        values: {
          type: "string",
          short: "v",
          multiple: true,
          default: []
        },
        help: {
          type: "boolean",
          short: "h",
          default: false
        }
      },
      allowPositionals: true
    }
  );
}