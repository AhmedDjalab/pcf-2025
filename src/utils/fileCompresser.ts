import { gunzipSync, gzipSync, strToU8 } from "fflate";

/**
 * Compress a file using gzip and return a Blob (.gz file).
 * @param file File to compress
 * @returns Promise<Blob> compressed file
 */
export const compressFile = async (file: File): Promise<Blob> => {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  // compress with gzip
  const compressed = gzipSync(uint8Array);

  // return as Blob, can upload with fetch/FormData
  return new Blob([compressed], { type: "application/gzip" });
};

/**
 * Decompress a gzip file and return the original data as Uint8Array
 * @param file Compressed file (Blob or File)
 * @returns Promise<Uint8Array> decompressed data
 */
export const decompressFile = async (
  file: Blob | File
): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  const compressedData = new Uint8Array(arrayBuffer);

  // decompress with gunzip
  const decompressed = gunzipSync(compressedData);

  return decompressed;
};
