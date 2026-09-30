import { createSSEStore } from "./createSSEStore";
export const EventLogger = createSSEStore({
  type: 'newLoggedEvent',
  snapshotUrl: '/api/events',
  initial: []
});
