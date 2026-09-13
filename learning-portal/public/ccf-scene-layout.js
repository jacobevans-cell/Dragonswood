// Pins describe locations in the source illustration, never in the canvas.
// Keep this geometry separate from Phaser so letterboxing and responsive views
// cannot silently move a record onto a different object.
export function containImage(width, height, imageWidth, imageHeight) {
  if (
    ![width, height, imageWidth, imageHeight].every(
      (value) => Number.isFinite(value) && value > 0,
    )
  )
    return null;
  const scale = Math.min(width / imageWidth, height / imageHeight);
  const displayWidth = imageWidth * scale;
  const displayHeight = imageHeight * scale;
  return {
    x: (width - displayWidth) / 2,
    y: (height - displayHeight) / 2,
    width: displayWidth,
    height: displayHeight,
    scale,
  };
}

export function validScenePosition(position) {
  return [position?.x, position?.y].every(
    (value) => Number.isFinite(value) && value >= 0 && value <= 1,
  );
}

export function layoutCaseScene({
  width,
  height,
  imageWidth,
  imageHeight,
  evidence = [],
}) {
  const bounds = containImage(width, height, imageWidth, imageHeight);
  const showLabels = width >= 600;
  const pinRadius = showLabels ? 14 : 12;
  if (!bounds) return { bounds, showLabels, pinRadius, markers: [] };
  const markers = evidence.flatMap((item, index) => {
    const position = item?.scenePosition;
    if (!validScenePosition(position)) return [];
    return [
      {
        id: item.id,
        index,
        x: bounds.x + bounds.width * position.x,
        y: bounds.y + bounds.height * position.y,
        labelSide: position.labelSide === "above" ? "above" : "below",
      },
    ];
  });
  return { bounds, showLabels, pinRadius, markers };
}
