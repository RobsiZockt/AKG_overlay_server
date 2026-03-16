import { createFetchStore } from "./createFetchStore";

export const teamdata = createFetchStore("/api/teams", true);