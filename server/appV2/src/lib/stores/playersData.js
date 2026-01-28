import { createSSEStore } from "./createSSEStore";
export const playerData = createSSEStore({
  type: 'playersUpdate',
  snapshotUrl: '/api/api/players',
  initial: {data:"0"}
});
