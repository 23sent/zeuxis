export async function FileLoader(filePath: string) {
  const resp = await fetch(filePath);

  if (!resp.ok) {
    throw new Error(`ObjLoader could not fine file at ${filePath}. Please check your path.`);
  }

  return resp;
}
