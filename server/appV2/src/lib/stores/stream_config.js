import { createFetchStore } from "./createFetchStore";

export const stream_config = createFetchStore("/api/stconf",true);