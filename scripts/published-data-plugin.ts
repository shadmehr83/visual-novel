import type { Plugin } from "vite";
import { readFileSync } from "node:fs";
export function publishedDataPlugin(): Plugin {
  const data = new Map<string, string>();
  return {
    name: "split-published-media",
    enforce: "pre" as const,
    resolveId(source: string) {
      if (source.endsWith("projects/published.stillframe.json"))
        return "\0published-project";
      if (source.startsWith("virtual:published-media-")) return "\0" + source;
    },
    load(id: string) {
      if (id.startsWith("\0virtual:published-media-"))
        return "export default " + JSON.stringify(data.get(id));
      if (id !== "\0published-project") return;
      this.addWatchFile("projects/published.stillframe.json");
      const p = JSON.parse(
        readFileSync("projects/published.stillframe.json", "utf8"),
      );
      const imports: string[] = [];
      let index = 0;
      for (const a of [...p.assets, ...(p.audioAssets || [])]) {
        const key = "\0virtual:published-media-" + index;
        data.set(key, a.data);
        imports.push(
          "import media" +
            index +
            " from " +
            JSON.stringify(key.slice(1)) +
            ";",
        );
        a.data = "__PUBLISHED_MEDIA_" + index + "__";
        index++;
      }
      let body = JSON.stringify(p);
      for (let i = 0; i < index; i++)
        body = body.replace(
          JSON.stringify("__PUBLISHED_MEDIA_" + i + "__"),
          "media" + i,
        );
      return imports.join("\n") + "\nexport default " + body + ";";
    },
  };
}
