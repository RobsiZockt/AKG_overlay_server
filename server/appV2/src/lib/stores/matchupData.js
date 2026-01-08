import { createSSEStore } from "./createSSEStore";
export const matchupData = createSSEStore({
  type: 'matchupUpdate',
  snapshotUrl: '/api/api/matchup',
  initial: {data:"0"}
});
