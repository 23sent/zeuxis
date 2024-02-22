const canvas = document.createElement('canvas');

export async function TextureLoader(filepath: string) {
  // const file = await FileLoader(filepath);
  const resp = await fetch(filepath);

  if (!resp.ok) {
    throw new Error(`Texture Loader could not fine file at ${filepath}. Please check your path.`);
  }

  const blob = await resp.blob();

  // const blob = await file.blob();
  const image = await createImageBitmap(blob);

  canvas.width = image.width;
  canvas.height = image.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cant find rendering context.');

  ctx.drawImage(image, 0, 0);
  return ctx.getImageData(0, 0, image.width, image.height);
}
