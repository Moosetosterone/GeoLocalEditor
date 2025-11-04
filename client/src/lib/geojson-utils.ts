import type { GeoJSONFeature, GeoJSONFeatureCollection } from "@shared/schema";

export function createEmptyFeatureCollection(): GeoJSONFeatureCollection {
  return {
    type: "FeatureCollection",
    features: [],
  };
}

export function validateGeoJSON(json: string): { valid: boolean; error?: string; data?: GeoJSONFeatureCollection } {
  try {
    const parsed = JSON.parse(json);
    
    if (parsed.type === "FeatureCollection") {
      if (!Array.isArray(parsed.features)) {
        return { valid: false, error: "features must be an array" };
      }
      return { valid: true, data: parsed };
    } else if (parsed.type === "Feature") {
      return { 
        valid: true, 
        data: {
          type: "FeatureCollection",
          features: [parsed]
        }
      };
    } else {
      return { valid: false, error: "Must be a FeatureCollection or Feature" };
    }
  } catch (e) {
    return { valid: false, error: e instanceof Error ? e.message : "Invalid JSON" };
  }
}

export function formatGeoJSON(data: GeoJSONFeatureCollection): string {
  return JSON.stringify(data, null, 2);
}

export function csvToGeoJSON(csv: string): GeoJSONFeatureCollection {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) {
    return createEmptyFeatureCollection();
  }

  const headers = lines[0].split(',').map(h => h.trim());
  const latIndex = headers.findIndex(h => /lat/i.test(h));
  const lonIndex = headers.findIndex(h => /lon|lng/i.test(h));

  if (latIndex === -1 || lonIndex === -1) {
    return createEmptyFeatureCollection();
  }

  const features: GeoJSONFeature[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const lat = parseFloat(values[latIndex]);
    const lon = parseFloat(values[lonIndex]);

    if (!isNaN(lat) && !isNaN(lon)) {
      const properties: Record<string, any> = {};
      headers.forEach((header, idx) => {
        if (idx !== latIndex && idx !== lonIndex) {
          properties[header] = values[idx];
        }
      });

      features.push({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [lon, lat]
        },
        properties
      });
    }
  }

  return {
    type: "FeatureCollection",
    features
  };
}

export function geoJSONToCSV(data: GeoJSONFeatureCollection): string {
  if (!data.features || data.features.length === 0) {
    return "lat,lon";
  }

  const allProperties = new Set<string>();
  data.features.forEach(feature => {
    Object.keys(feature.properties || {}).forEach(key => allProperties.add(key));
  });

  const propertyHeaders = Array.from(allProperties);
  const headers = ['lat', 'lon', ...propertyHeaders];

  const rows = data.features.map(feature => {
    const coords = feature.geometry.coordinates;
    let lat = 0, lon = 0;

    if (feature.geometry.type === 'Point') {
      [lon, lat] = coords;
    } else if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'LineString') {
      const firstCoord = feature.geometry.type === 'Polygon' ? coords[0][0] : coords[0];
      [lon, lat] = firstCoord;
    }

    const values = [lat, lon, ...propertyHeaders.map(prop => feature.properties?.[prop] || '')];
    return values.join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
