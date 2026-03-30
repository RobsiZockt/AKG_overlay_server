import { createFetchStore } from "./createFetchStore";

export const stream_config_static = createFetchStore("/api/stconf",true);