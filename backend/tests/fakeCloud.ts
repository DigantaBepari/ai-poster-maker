import { Writable } from "node:stream";
export const fakeAssets = new Map<string, Buffer>();
interface Options {
  public_id?: string;
  folder?: string;
  resource_type: string;
  type?: string;
  format?: string;
}
const url = (
  id: string,
  o: { resource_type: string; type: string; format?: string },
) =>
  "https://res.cloudinary.com/demo/" +
  o.resource_type +
  "/" +
  o.type +
  "/" +
  id +
  (o.format ? "." + o.format : "");
export const fakeCloudinary = {
  url,
  uploader: {
    upload_stream: (
      options: Options,
      callback: (
        error: null,
        result: { public_id: string; secure_url: string },
      ) => void,
    ) => {
      const chunks: Buffer[] = [];
      const id = options.public_id ?? options.folder + "/photo";
      const assetUrl = url(id, { ...options, type: options.type ?? "upload" });
      return new Writable({
        write(chunk, _encoding, next) {
          chunks.push(Buffer.from(chunk));
          next();
        },
        final(next) {
          fakeAssets.set(assetUrl, Buffer.concat(chunks));
          callback(null, { public_id: id, secure_url: assetUrl });
          next();
        },
      });
    },
    destroy: async () => ({ result: "ok" }),
  },
};
