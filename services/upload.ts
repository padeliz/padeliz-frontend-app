/**
 * Multipart body construction from a local file URI.
 *
 * On web, FormData does not accept a `{uri,name,type}` object (it serializes to
 * "[object Object]"), so the URI is fetched into a real Blob. On native, React
 * Native's FormData expects that file shape. `name`/`type` from the image picker
 * are preferred when provided.
 */
import { Platform } from "react-native";

const MIME_BY_EXT: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  pdf: "application/pdf",
};

export type FileMeta = { name?: string; type?: string };

/** Build a `FormData` holding the file at `uri` under the given field name. */
export async function formDataFromUri(
  field: string,
  uri: string,
  opts?: FileMeta
): Promise<FormData> {
  const inferredName = uri.split("/").pop()?.split("?")[0] || "upload.jpg";
  const name = opts?.name || inferredName;
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const type = opts?.type || MIME_BY_EXT[ext] || "image/jpeg";

  const form = new FormData();
  if (Platform.OS === "web") {
    const blob = await (await fetch(uri)).blob();
    form.append(field, blob, name);
  } else {
    form.append(field, { uri, name, type } as unknown as Blob);
  }
  return form;
}
