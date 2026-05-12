import { readFile, writeFile } from "node:fs/promises";

const indexPath = new URL("../dist/index.html", import.meta.url);

let html = await readFile(indexPath, "utf8");

html = html
  .replace(/\s+type="module"/g, "")
  .replace(/\s+crossorigin(?:="[^"]*")?/g, "")
  .replace(/<script(?![^>]*\bdefer\b)([^>]*\bsrc="[^"]+"[^>]*)><\/script>/g, "<script defer$1></script>");

await writeFile(indexPath, html);
