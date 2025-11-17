/**
 * Application-wide constants
 * Single source of truth for magic strings, colors, and configuration values
 */

// LocalStorage keys
export const STORAGE_KEYS = {
  GEOJSON_DATA: 'geojson-data'
} as const;

// Map colors for features and drawing
export const MAP_COLORS = {
  FEATURE_DEFAULT: '#3b82f6',      // blue-500
  FEATURE_SELECTED: '#ef4444',     // red-500
  FEATURE_HOVER: '#fbbf24',        // amber-400
  DRAWING: '#10b981',              // green-500
} as const;

// Map configuration defaults
export const MAP_DEFAULTS = {
  CENTER: [20, 0] as [number, number],  // Default center [lat, lon]
  ZOOM: 2,                               // Default zoom level
  MIN_ZOOM: 1,
  MAX_ZOOM: 19
} as const;

// Drawing configuration
export const DRAWING_CONFIG = {
  POINT_RADIUS: 6,
  POINT_RADIUS_SELECTED: 8,
  LINE_WEIGHT: 2,
  LINE_WEIGHT_SELECTED: 3,
  POLYGON_FILL_OPACITY: 0.2,
  DASH_ARRAY: '5, 5'
} as const;

// Z-index layers (from lowest to highest)
export const Z_INDEX = {
  MAP_BASE: 0,
  MAP_FEATURES: 100,
  MAP_CONTROLS: 1000,
  DRAWING_TOOLBAR: 1000,
  TOGGLE_BUTTON: 1100,      // Higher than map controls
  DRAWING_HINT: 1000,
  TOAST: 9999
} as const;

// Geometry types
export const GEOMETRY_TYPES = {
  POINT: 'Point',
  LINE_STRING: 'LineString',
  POLYGON: 'Polygon',
  MULTI_POINT: 'MultiPoint',
  MULTI_LINE_STRING: 'MultiLineString',
  MULTI_POLYGON: 'MultiPolygon'
} as const;

// Drawing tool modes
export const DRAW_MODES = {
  NONE: 'none',
  POINT: 'point',
  LINE: 'line',
  POLYGON: 'polygon'
} as const;

export type DrawMode = typeof DRAW_MODES[keyof typeof DRAW_MODES];