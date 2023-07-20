export function resizeImageBuffer(
  buffer: Uint8ClampedArray,
  w: number,
  h: number,
  ratio: number,
): Uint8ClampedArray {
  ratio = Math.max(1, Number(ratio.toFixed()));
  const newBuffer = new Uint8ClampedArray(buffer.length * ratio * ratio);

  for (let newBufferIndex = 0; newBufferIndex < newBuffer.length; newBufferIndex += 4) {
    const pixelIndex = Math.floor(newBufferIndex / 4);
    const x = Math.floor(Math.floor(pixelIndex / ratio) % w);
    const y = Math.floor(Math.floor(pixelIndex / (ratio * ratio)) / h);
    const bufferIndex = (y * w + x) * 4;

    newBuffer[newBufferIndex + 0] = buffer[bufferIndex + 0];
    newBuffer[newBufferIndex + 1] = buffer[bufferIndex + 1];
    newBuffer[newBufferIndex + 2] = buffer[bufferIndex + 2];
    newBuffer[newBufferIndex + 3] = buffer[bufferIndex + 3];
  }

  return newBuffer;
}
