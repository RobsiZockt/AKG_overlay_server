import { createSSEStore } from "./createSSEStore";
export const UVmatchupData = createSSEStore({
  type: 'UVmatchupUpdate',
  snapshotUrl: '/api/uv/matchup',
  initial: {data:"0"}
});
