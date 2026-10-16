export const manifest = {
  screens: {
    scr_1wdu22: { name: "Photo Booth", route: "/", state: {"openWindows":{"about":true,"projects":false},"activeWindow":"about","photoBoothInfo":false}, position: {"x":160,"y":220} },
    scr_9e13dp: { name: "Photo Booth — About", route: "/", state: {"openWindows":{"about":true,"projects":false},"activeWindow":"about","photoBoothInfo":true}, position: {"x":1560,"y":220} },
    scr_rirhv0: { name: "Projects", route: "/", state: {"openWindows":{"about":false,"projects":true},"activeWindow":"projects"}, position: {"x":160,"y":2200} },
    scr_zj8kvf: { name: "Desktop Workspace", route: "/", state: {"openWindows":{"about":true,"projects":true},"activeWindow":"about","photoBoothInfo":false}, position: {"x":160,"y":4180} },
  },
  sections: {
    sec_11zh9s: { name: "Photo Booth", x: 0, y: 0, width: 2920, height: 1180 },
    sec_8gmw71: { name: "Projects", x: 0, y: 1980, width: 1520, height: 1180 },
    sec_lafwoe: { name: "Workspace", x: 0, y: 3960, width: 1520, height: 1180 },
  },
  layers: [
    { kind: "section", id: "sec_11zh9s", children: [
      { kind: "screen", id: "scr_1wdu22" },
      { kind: "screen", id: "scr_9e13dp" },
    ] },
    { kind: "section", id: "sec_8gmw71", children: [
      { kind: "screen", id: "scr_rirhv0" },
    ] },
    { kind: "section", id: "sec_lafwoe", children: [
      { kind: "screen", id: "scr_zj8kvf" },
    ] },
  ],
}
