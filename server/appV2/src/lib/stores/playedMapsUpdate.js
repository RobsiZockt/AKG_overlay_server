import { createSSEStore } from "./createSSEStore";
export const playedMaps = createSSEStore({
  type: 'playedMapsUpdate',
  snapshotUrl: '/api/api/played_maps',
  initial: {data:"1"}
});
