import { client } from "../config/apiClient"
import { ENDPOINTS } from "../config/endpoints";

export const coreApi = {
  stats() {
    return client.get(ENDPOINTS.core.stats);
  },

  seedForce() {
    return client.post(ENDPOINTS.core.seedForce);
  },

  flushOnly() {
    return client.post(ENDPOINTS.core.flush);
  },

  resetAndSeed() {
    return client.post(ENDPOINTS.core.resetAndSeed);
  },

  backupDumpdata() {
    return client.get(ENDPOINTS.core.backupDumpdata, { responseType: "blob" });
  },

  backupSqlite() {
    return client.get(ENDPOINTS.core.backupSqlite, { responseType: "blob" });
  },
};
