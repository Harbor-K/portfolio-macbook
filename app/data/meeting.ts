// Settings for the Reminders window, where visitors pick a time to meet Harbor.
// Slots are defined in Harbor's time zone and shown to each visitor in their own local time.
// Sending a request opens the visitor's email app with a pre-filled message to Harbor —
// nothing is stored or sent by the site itself.
export const meeting = {
  listName: "Meet Harbor",
  intro: "Pick a time for a 30-minute chat. Times are shown in your time zone.",
  title: "30-min chat with Harbor",
  kind: "Video call",
  email: "harborkim0328@gmail.com",
  hostTimeZoneOffsetHours: 9, // Harbor is in Korea (UTC+9, no daylight saving)
  slotHours: [10, 15, 21], // start times in Harbor's local time
  daysAhead: 10, // how far ahead to offer slots (weekdays only)
};
