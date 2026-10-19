// "Spin it" turntable (opens from the Dock and sits under Photo Booth).
// `src` is the audio file for a track. While it is empty, the record still spins but no sound plays.
// Only add audio Harbor has the right to publish (her own recordings, licensed or royalty-free music,
// or an official preview link).
/** `seconds` is the song's length, shown before the audio file has loaded. */
export type Track = { title: string; artist: string; src: string; seconds?: number };

// Artwork printed on the record's centre label (spin-it/suno-label.png in the repo).
export const labelImage =
  "https://cdn.jsdelivr.net/gh/Harbor-K/portfolio-macbook@abb17368e4713a283fa9200f88ada12616217003/spin-it/suno-label.png";

// "Sunshine", made by Harbor with Suno, hosted in the repo (audio/) via jsDelivr, pinned to a commit.
const audio = "https://cdn.jsdelivr.net/gh/Harbor-K/portfolio-macbook@abb17368e4713a283fa9200f88ada12616217003/audio";

export const tracks: Track[] = [{ title: "Sunshine", artist: "Me × Suno", src: `${audio}/sunshine.m4a`, seconds: 167 }];
