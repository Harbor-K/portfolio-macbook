// "Spin it" turntable (opens from the Dock and sits under Photo Booth).
// Placeholder playlists — no songs yet. Add tracks to a playlist's `tracks` later.
export type Playlist = { id: string; name: string; tracks: { title: string; artist: string; src: string }[] };

export const playlists: Playlist[] = [
  { id: "lofi", name: "Lo-fi hip hop", tracks: [] },
  { id: "jazz", name: "Jazz for focus", tracks: [] },
  { id: "citypop", name: "City pop", tracks: [] },
  { id: "indie", name: "Indie mornings", tracks: [] },
];
