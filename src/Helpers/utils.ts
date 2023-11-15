export function base64ToFile(
  base64String: string,
  fileName: string,
  mimeType: string
): File {
  const byteCharacters = atob(base64String.split(",")[1]);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });

  // Create a File object from the Blob
  const file = new File([blob], fileName, { type: mimeType });

  return file;
}
