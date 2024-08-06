export function computeUrls(): { remoteURL: string; remoteReadURL: string } {
  let remoteURL = "https://helm-viewer.vercel.app";
  let remoteReadURL = "https://helm-viewer.vercel.app";

  if (process.env.NODE_ENV === "development") {
    remoteURL = "http://localhost:3000";
    remoteReadURL = "http://localhost:3000";
  }

  if (process.env.BACKEND_ENDPOINT) {
    remoteURL = process.env.BACKEND_ENDPOINT.replace(/\/$/, "");
    remoteReadURL = process.env.BACKEND_ENDPOINT.replace(/\/$/, "");
  }

  if (process.env.BACKEND_READ_ENDPOINT) {
    remoteReadURL = process.env.BACKEND_READ_ENDPOINT.replace(/\/$/, "");
  }

  return {
    remoteURL,
    remoteReadURL,
  };
}
