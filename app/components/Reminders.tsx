import React from "react";
import type { DragHandleProps } from "./MacWindow";
import { MeetingBooking } from "./MeetingBooking";

// The phone layout's "Meet" page. On the desktop the visitor's checklist ("Scheduled") is a menu bar
// drop-down instead (ChecklistMenu), so this only shows the booking.
export function Reminders({ dragHandleProps, lights }: { dragHandleProps: DragHandleProps; lights: React.ReactNode }) {
  return <MeetingBooking dragHandleProps={dragHandleProps} lights={lights} />;
}
