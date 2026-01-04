import { globSync } from "fs";
import NodeID3 from "node-id3";
import { err, ok, okAsync } from "neverthrow";

for (const file of globSync("../Media.localized/Music/**/*.mp3")) {
  const result = await okAsync(NodeID3.read(file))
    .map((data) => {
      if (data.album && data.artist) {
        let title = file.split("/").pop();
        if (title?.startsWith("0") || title?.startsWith("1")) {
          title = title.slice(3);
        }
        title = title ? title.slice(0, title.length - 4) : "N/A"
        if (data.unsynchronisedLyrics) return err(`Unsynchronised lyrics already exist for song ${title}`);
        else console.log(title);
        return ok({
          album: data.album,
          artist: data.artist,
          title,
        });
      } else return err("Missing album, artist, or title");
    })
    .andThen((v) => v)
    .map(async ({ album, artist, title }) => {
      const params = {
        artist_name: artist,
        track_name: title,
        // "Other" is just a playlist basically
        ...(album === "Other" ? {} : { album_name: album }),
      };
      const query = new URLSearchParams(params);
      const lyricPromise = fetch(
        `https://lrclib.net/api/search?${query.toString()}`,
      )
        .then(
          (res) =>
            res.json() as Promise<
              ({ plainLyrics?: string } | { message: string })[]
            >,
        )
        .then((data) => {
          if (data[0]) {
            return data[0];
          } else {
            throw new Error(`No lyrics found for song ${title}`);
          }
        })
        .then((data) =>
          "plainLyrics" in data && data.plainLyrics
            ? ok(data.plainLyrics)
            : err(`No lyrics found for song ${title}`),
        )
        .catch((e) => err(e.message));
      return await lyricPromise;
    })
    .andThen((v) => v)
    .map(
      (lyrics) =>
        NodeID3.update(
          {
            unsynchronisedLyrics: {
              language: "eng",
              text: lyrics,
            },
          },
          file,
        ) && lyrics,
    );
  if (result.isErr()) {
    console.error(result.error);
  } else if (result.isOk()) {
    console.log(
      "Lyrics updated successfully for ",
      file,
      ":",
      // result.value.slice(0, 20),
    );
  }
}
