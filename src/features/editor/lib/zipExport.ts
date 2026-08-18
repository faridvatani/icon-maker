import { zipSync } from "fflate";

export const createZipArchive = (files: Record<string, Uint8Array>) =>
  zipSync(files);
