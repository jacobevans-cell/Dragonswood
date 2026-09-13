// Fit the entire visible silhouette. Transparency is padding, never evidence of a face crop.
export function alphaBounds(pixels, width, height) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || pixels.length !== width * height * 4) throw new Error('Invalid portrait pixels.');
  let left = width, top = height, right = -1, bottom = -1;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    if (!pixels[(y * width + x) * 4 + 3]) continue;
    left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
  }
  return right < 0 ? null : { x:left, y:top, width:right-left+1, height:bottom-top+1 };
}
export function containSilhouette(bounds, width, height, inset = .06) {
  if (!bounds || !(bounds.width > 0) || !(bounds.height > 0) || !(width > 0) || !(height > 0)) return null;
  const scale = Math.min(width * (1 - 2 * inset) / bounds.width, height * (1 - 2 * inset) / bounds.height);
  return { x:(width-bounds.width*scale)/2, y:(height-bounds.height*scale)/2, width:bounds.width*scale, height:bounds.height*scale };
}
