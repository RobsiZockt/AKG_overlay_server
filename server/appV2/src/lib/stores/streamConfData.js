import { createSSEStore } from "./createSSEStore";
export const streamConfData = createSSEStore({
  type: 'streamConfUpdate',
  snapshotUrl: '/api/stconf',
  initial: {data:"0"}
});
