import { wikitext } from "@/actions/wikitext";
import { Panels } from "./Panels";

export default async function Text() {
  const chunks = wikitext
    .replace(/\n/g, "<br>")
    .split(" ")
    .reduce((acc, curr, i) => {
      const chunkIndex = Math.floor(i / 100);
      if (!acc[chunkIndex]) {
        acc[chunkIndex] = [];
      }
      acc[chunkIndex].push(curr);
      return acc;
    }, [] as string[][])
    .map((chunk) => chunk.join(" "));

  return (
    <div className="flex flex-col h-full">
      <div className="grow max-h-3/5 overflow-hidden">
        <Panels />
      </div>
      <div className="text-lg text-start h-2/5 flex-none overflow-y-auto border-t-2 border-white">
        <div className="!py-2 font-pixel">Wikipedia Text</div>
        {chunks.map((chunk, i) => {
          const colors = [
            "#FF0000",
            "#0000FF",
            "#00FF00",
            "#FFFF00",
            "#800080",
            "#FFC0CB",
            "#FFA500",
          ].map((color) => color + "4D"); // 4D = 30% opacity in hex
          const randomColor = colors[Math.floor(Math.random() * colors.length)];
          return (
            <span key={i}>
              <span
                style={{ backgroundColor: randomColor }}
                dangerouslySetInnerHTML={{ __html: chunk }}
              />
              <span>&nbsp;</span>
            </span>
          );
        })}
      </div>
    </div>

    // <div
    //   className="text-lg text-start"
    //   dangerouslySetInnerHTML={{ __html: chunks.join("<span>&nbsp;</span>") }}
    // />
  );
}
