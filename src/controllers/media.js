import { join, dirname } from "path";
import fs from "fs-extra";
import { getCurrentFolderPath } from "../lib/fs-tools.js";

const pathToMedias = join(
  getCurrentFolderPath(import.meta.url),
  "../data/medias.json"
);

export const getMedias = async () => await fs.readJSON(pathToMedias);

export const writeMedias = async (content) =>
  await fs.writeJSON(pathToMedias, content);
