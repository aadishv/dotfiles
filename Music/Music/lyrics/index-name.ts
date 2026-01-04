import { globSync } from "fs";
import NodeID3 from "node-id3";
import { err, ok, okAsync } from "neverthrow";

for (const file of globSync("../Media.localized/Music/**/*.mp3")) {
  const result = await okAsync(NodeID3.read(file))
    .andThen((data) => {
      console.log(data)
      process.exit(1)
      if (data.album && data.artist) {
        let title = file.split("/").pop();
        if (title?.startsWith("0") || title?.startsWith("1")) {
          title = title.slice(3);
        }
        title = title ? title.slice(0, title.length - 4) : "N/A";
        if (data.title) return err(`Title already exists for song ${title}`);
        else console.log(title);
        return ok({
          album: data.album,
          artist: data.artist,
          title,
        });
      } else return err(`Missing album or artist for ${file}`);
    })
    .andThen(({ album, artist, title }) => {
      const updateResult = NodeID3.update(
        {
          title,
        },
        file,
      );
      return updateResult ? ok(title) : err("Failed to update title");
    });
  if (result.isErr()) {
    console.error(result.error);
  } else if (result.isOk()) {
    console.log(
      "Title updated successfully for ",
      file,
      ":",
      result.value,
    );
  }
}
