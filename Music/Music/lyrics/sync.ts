import { TagConstants } from "node-id3";

function parseLrcToSyncEntries(lrcText: string) {
  const lines = lrcText.split(/\r?\n/);
  const entries = [];

  const timeRegex = /^\s*\[(\d+:\d+(?:\.\d+)?)\]\s*(.*)$/; // captures timestamp and text
  for (const line of lines) {
    const m = line.match(timeRegex);
    if (!m) continue;
    const ts = m[1]!;
    const text = m[2]!.trim();
    if (!text) continue; // skip empty-lyric entries

    const ms = timeStringToMs(ts);
    if (ms === null) continue;
    entries.push({ text, timeStamp: ms });
  }

  // Ensure entries are sorted by time (SYLT expects chronological order).
  entries.sort((a, b) => a.timeStamp - b.timeStamp);
  return entries;
}

// Accepts "mm:ss", "mm:ss.xx" or "m:ss.xxx" etc -> milliseconds
function timeStringToMs(s: string) {
  const m = s.match(/^(\d+):(\d+)(?:\.(\d+))?$/);
  if (!m) return null;
  const minutes = parseInt(m[1]!, 10);
  const seconds = parseInt(m[2]!, 10);
  // fractional part -> convert to exactly 3 digits (milliseconds)
  const frac = (m[3] || '').padEnd(3, '0').slice(0, 3);
  const millis = parseInt(frac, 10);
  return minutes * 60 * 1000 + seconds * 1000 + millis;
}

// Build tag object for node-id3
function buildSyltTag(synchronisedTextArray: { text: string; timeStamp: number }[]) {
  return {
    synchronisedLyrics: [{
      language: 'eng', // 3-letter ISO-639-2 code
      timeStampFormat: TagConstants.TimeStampFormat.MILLISECONDS,
      contentType: TagConstants.SynchronisedLyrics.ContentType.LYRICS,
      shortText: 'RAWFEAR (synced)', // optional descriptor
      synchronisedText: synchronisedTextArray.map(e => ({ text: e.text, timeStamp: e.timeStamp }))
    }]
  };
}

export function getTags(syncedLyrics: string) {
    const syncEntries = parseLrcToSyncEntries(syncedLyrics);
    return buildSyltTag(syncEntries);
}
