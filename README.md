# portfolio-macbook

Image assets for Harbor's macOS-style portfolio site.

- `wallpaper/field.jpg` — desktop wallpaper, field (2576×1932)
- `wallpaper/rooftops.jpg` — desktop wallpaper, rooftops at sunset (3206×1796)
- `wallpaper/pink-sky.jpg`, `wallpaper/seaside.jpg`, `wallpaper/park-sunset.jpg` — more wallpapers (System Settings > Wallpaper)
- `video/intro.mp4` — Photo Booth intro video for the About window (H.264/AAC MP4)
- `video/intro-poster.jpg` — poster frame for that video
- `about/portrait.jpg` — portrait for the desktop About icon
- `cv/cv.pdf` — downloadable CV (replace with the real CV under the same name)
- `icons/projects-folder.png` — desktop Projects folder icon (from harbor_project.svg, 256px wide)
- `icons/archive-book.png` — desktop Archive icon (from harbor_book.svg, 256px)
- `icons/trust-bank.png` — Trust Bank project thumbnail
- `icons/cv-pdf.png` — desktop CV.pdf icon (Preview-style PDF document)
- `icons/notes.png` — desktop Notes icon
- `icons/gamecove.png`, `icons/utrada.png`, `icons/eto-markets.png` — project thumbnails
- `notes/bovril-jar.jpg`, `notes/bovril-toast.jpg` — photos for the "Fun fact" note
- `dock/*.png` — Dock app icons (Finder, Settings, Reminders, Music, Figma, Cursor, Claude), 160px

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
