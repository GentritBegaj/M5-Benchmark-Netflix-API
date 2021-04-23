import { dirname } from "path";
import { fileURLToPath } from "url";

export const getCurrentFolderPath = (filename) => {
  return dirname(fileURLToPath(filename));
};
