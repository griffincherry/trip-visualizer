export const createBezierCurve = (from, to, segments = 50) => {
  const points = [];
  const midLat = (from[0] + to[0]) / 2;
  const midLng = (from[1] + to[1]) / 2;

  const controlPoint = [
    midLat + (to[0] - from[0]) * 0.2,
    midLng
  ];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const lat = Math.pow(1 - t, 2) * from[0] + 2 * (1 - t) * t * controlPoint[0] + Math.pow(t, 2) * to[0];
    const lng = Math.pow(1 - t, 2) * from[1] + 2 * (1 - t) * t * controlPoint[1] + Math.pow(t, 2) * to[1];
    points.push([lat, lng]);
  }

  return points;
};

export const getPolylineMidpoint = (points) => {
  if (points.length === 2) {
    return [(points[0][0] + points[1][0]) / 2, (points[0][1] + points[1][1]) / 2];
  }
  let totalLength = 0;
  const segLengths = [];
  for (let i = 0; i < points.length - 1; i++) {
    const len = Math.sqrt(
      Math.pow(points[i+1][0] - points[i][0], 2) +
      Math.pow(points[i+1][1] - points[i][1], 2)
    );
    segLengths.push(len);
    totalLength += len;
  }
  const halfLen = totalLength / 2;
  let accumulated = 0;
  for (let i = 0; i < segLengths.length; i++) {
    if (accumulated + segLengths[i] >= halfLen) {
      const t = (halfLen - accumulated) / segLengths[i];
      return [
        points[i][0] + t * (points[i+1][0] - points[i][0]),
        points[i][1] + t * (points[i+1][1] - points[i][1])
      ];
    }
    accumulated += segLengths[i];
  }
  return points[Math.floor(points.length / 2)];
};
