# portfolio-macbook

Image assets for Harbor's macOS-style portfolio site.

- `wallpaper/field.jpg` — desktop wallpaper, field (2576×1932)
- `wallpaper/rooftops.jpg` — desktop wallpaper, rooftops at sunset (3206×1796)
- `video/about.mp4` — Photo Booth video for the About window (H.264/AAC MP4)
- `video/about-poster.jpg` — poster frame for that video
- `about/portrait.jpg` — portrait for the desktop About icon

## Site code (`app/`)

The macOS-desktop portfolio built in Magic Patterns, mirrored here.

```bash
cd app
npm install
npm run dev     # local preview
npm run build   # production build in app/dist
```

`index.html`, `vite.config.ts`, `postcss.config.js`, `tsconfig.json` and the Tailwind `content` paths
are added so the project runs outside Magic Patterns. Images and video load from this repo via jsDelivr.
