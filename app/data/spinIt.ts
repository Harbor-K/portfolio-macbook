// "Spin it" turntable (opens from the Dock and sits under Photo Booth).
// `src` is the audio file for a track. While it is empty, the record still spins but no sound plays.
// Only add audio Harbor has the right to publish (her own recordings, licensed or royalty-free music,
// or an official preview link).
export type Track = { title: string; artist: string; src: string };

// Photo printed on the record's centre label: Harbor's own "Pink Sky" photo.
export const labelImage =
  "https://cdn.jsdelivr.net/gh/Harbor-K/portfolio-macbook@ad47edc72dc9f58af99e149aa7fc38799f0c8e6f/wallpaper/pink-sky.jpg";

export const tracks: Track[] = [{ title: "The Remedy (I Won't Worry)", artist: "Jason Mraz", src: "" }];
