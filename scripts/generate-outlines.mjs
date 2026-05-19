import fs from "node:fs/promises";
import path from "node:path";

const GEOJSON_URL =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries.geojson";
const OUTPUT_DIR = path.resolve("public/outlines");
const WIDTH = 320;
const HEIGHT = 200;
const PADDING = 22;

const countriesSource = await fs.readFile("src/data/countries.ts", "utf8");
const countryCodes = [
  ...countriesSource.matchAll(/\{ country: "[^"]+", capital: "[^"]+", code: "([A-Z]{2})" \}/g),
].map((match) => match[1]);

const response = await fetch(GEOJSON_URL);

if (!response.ok) {
  throw new Error(`Cannot download Natural Earth GeoJSON: ${response.status} ${response.statusText}`);
}

const geojson = await response.json();
const requestedCodes = new Set(countryCodes);
const featuresByCode = new Map();

for (const feature of geojson.features) {
  const value = feature.properties.ISO_A2;

  if (typeof value === "string" && value !== "-99" && requestedCodes.has(value.toUpperCase())) {
    featuresByCode.set(value.toUpperCase(), feature);
  }
}

for (const key of ["ISO_A2_EH", "WB_A2"]) {
  for (const feature of geojson.features) {
    const value = feature.properties[key];

    if (
      typeof value === "string" &&
      value !== "-99" &&
      requestedCodes.has(value.toUpperCase()) &&
      !featuresByCode.has(value.toUpperCase())
    ) {
      featuresByCode.set(value.toUpperCase(), feature);
    }
  }
}

await fs.rm(OUTPUT_DIR, { recursive: true, force: true });
await fs.mkdir(OUTPUT_DIR, { recursive: true });

function getPolygons(geometry) {
  if (geometry.type === "Polygon") {
    return [geometry.coordinates];
  }

  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates;
  }

  return [];
}

function normalizePolygons(polygons) {
  const longitudes = polygons.flatMap((polygon) => polygon.flatMap((ring) => ring.map(([longitude]) => longitude)));
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);

  if (maxLongitude - minLongitude <= 180) {
    return polygons;
  }

  return polygons.map((polygon) =>
    polygon.map((ring) => ring.map(([longitude, latitude]) => [longitude < 0 ? longitude + 360 : longitude, latitude])),
  );
}

function ringArea(ring) {
  let area = 0;

  for (let index = 0; index < ring.length; index += 1) {
    const [x1, y1] = ring[index];
    const [x2, y2] = ring[(index + 1) % ring.length];
    area += x1 * y2 - x2 * y1;
  }

  return Math.abs(area) / 2;
}

function getBounds(points) {
  const longitudes = points.map(([longitude]) => longitude);
  const latitudes = points.map(([, latitude]) => latitude);

  return {
    minLongitude: Math.min(...longitudes),
    maxLongitude: Math.max(...longitudes),
    minLatitude: Math.min(...latitudes),
    maxLatitude: Math.max(...latitudes),
  };
}

function getCenter(bounds) {
  return {
    longitude: (bounds.minLongitude + bounds.maxLongitude) / 2,
    latitude: (bounds.minLatitude + bounds.maxLatitude) / 2,
  };
}

function distanceBetween(first, second) {
  return Math.hypot(first.longitude - second.longitude, first.latitude - second.latitude);
}

function getReadablePolygons(polygons) {
  const parts = polygons.map((polygon) => {
    const exterior = polygon[0];
    const bounds = getBounds(exterior);

    return {
      polygon,
      bounds,
      area: ringArea(exterior),
      center: getCenter(bounds),
    };
  });
  const largest = parts.reduce((best, part) => (part.area > best.area ? part : best), parts[0]);
  const largestSize = Math.max(
    largest.bounds.maxLongitude - largest.bounds.minLongitude,
    largest.bounds.maxLatitude - largest.bounds.minLatitude,
    0.1,
  );

  return parts
    .filter((part) => {
      const areaRatio = part.area / largest.area;
      const distance = distanceBetween(part.center, largest.center);

      return part === largest || (areaRatio >= 0.001 && distance <= largestSize * 2);
    })
    .map((part) => part.polygon);
}

function buildPath(feature) {
  const polygons = getReadablePolygons(normalizePolygons(getPolygons(feature.geometry)));
  const rings = polygons.flat();
  const bounds = getBounds(rings.flat());
  const { minLongitude, maxLongitude, minLatitude, maxLatitude } = bounds;
  const sourceWidth = Math.max(maxLongitude - minLongitude, 0.0001);
  const sourceHeight = Math.max(maxLatitude - minLatitude, 0.0001);
  const scale = Math.min((WIDTH - PADDING * 2) / sourceWidth, (HEIGHT - PADDING * 2) / sourceHeight);
  const drawingWidth = sourceWidth * scale;
  const drawingHeight = sourceHeight * scale;
  const offsetX = (WIDTH - drawingWidth) / 2;
  const offsetY = (HEIGHT - drawingHeight) / 2;

  return polygons
    .flatMap((polygon) => polygon)
    .map((ring) => {
      const commands = ring.map(([longitude, latitude], index) => {
        const x = offsetX + (longitude - minLongitude) * scale;
        const y = offsetY + (maxLatitude - latitude) * scale;
        const command = index === 0 ? "M" : "L";

        return `${command}${x.toFixed(1)} ${y.toFixed(1)}`;
      });

      return `${commands.join(" ")} Z`;
    })
    .join(" ");
}

const missing = [];

for (const code of countryCodes) {
  const feature = featuresByCode.get(code);

  if (!feature) {
    missing.push(code);
    continue;
  }

  const pathData = buildPath(feature);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img"><path d="${pathData}" fill="#172033" fill-rule="evenodd"/></svg>\n`;

  await fs.writeFile(path.join(OUTPUT_DIR, `${code.toLowerCase()}.svg`), svg, "utf8");
}

if (missing.length > 0) {
  throw new Error(`Missing outlines for: ${missing.join(", ")}`);
}

console.log(`Generated ${countryCodes.length} country outlines in ${OUTPUT_DIR}`);
