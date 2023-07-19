export async function FileLoader(filePath: string) {
  const resp = await fetch(filePath);

  if (!resp.ok) {
    throw new Error(`ObjLoader could not fine file at ${filePath}. Please check your path.`);
  }

  const file = await resp.text();
  if (file.length === 0) {
    throw new Error(`${filePath} File is empty.`);
  }

  return file;
}
