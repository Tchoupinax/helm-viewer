import { parseArgs } from "node:util";

import { nanoid } from "nanoid";

export function getArguments() {
  return parseArgs({
    options: {
      watch: {
        type: "boolean",
        short: "w",
        default: false,
      },
      push: {
        type: "boolean",
        short: "p",
        default: false,
      },
      encryptionKey: {
        type: "string",
        short: "k",
        default: nanoid().slice(0, 10),
      },
      browser: {
        type: "string",
        short: "b",
        default: "default",
      },
      values: {
        type: "string",
        short: "v",
        multiple: true,
        default: [],
      },
      help: {
        type: "boolean",
        short: "h",
        default: false,
      },
      name: {
        type: "string",
        short: "n",
        default: "release-name",
      },
    },
    allowPositionals: true,
  });
}
