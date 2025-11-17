import { useState, useCallback, useEffect } from "react";
import type { GeoJSONFeature, GeoJSONFeatureCollection } from "@shared/schema";
import { createEmptyFeatureCollection, formatGeoJSON, validateGeoJSON } from "@/lib/geojson-utils";
import { STORAGE_KEYS } from "@/lib/constants";

export interface UseGeoDataReturn {
  geoData: GeoJSONFeatureCollection;
  codeValue: string;
  codeError: string | null;
  selectedFeature: GeoJSONFeature | null;

  // Actions
  setCodeValue: (value: string) => void;
  setSelectedFeature: (feature: GeoJSONFeature | null) => void;
  addFeature: (feature: GeoJSONFeature) => void;
  removeFeature: (feature: GeoJSONFeature) => void;
  updateFeatureProperties: (featureId: string | number, properties: Record<string, any>) => void;
  replaceData: (data: GeoJSONFeatureCollection) => void;
  reset: () => void;
}

/**
 * Custom hook to manage GeoJSON data state with validation and persistence
 * 
 * Responsibilities:
 * - State management for GeoJSON data
 * - Code editor synchronization
 * - LocalStorage persistence
 * - Feature CRUD operations
 * - Validation
 * 
 * @returns {UseGeoDataReturn} GeoJSON state and actions
 */
export function useGeoData(): UseGeoDataReturn {
  const [geoData, setGeoData] = useState<GeoJSONFeatureCollection>(createEmptyFeatureCollection);
  const [codeValue, setCodeValueState] = useState(formatGeoJSON(geoData));
  const [codeError, setCodeError] = useState<string | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<GeoJSONFeature | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.GEOJSON_DATA);
      if (stored) {
        const parsed = JSON.parse(stored);
        setGeoData(parsed);
        setCodeValueState(formatGeoJSON(parsed));
      }
    } catch (e) {
      console.error("Failed to load stored data", e);
      // Fall back to empty state - don't crash the app
    }
  }, []);

  // Persist to localStorage whenever geoData changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.GEOJSON_DATA, JSON.stringify(geoData));
    } catch (e) {
      console.error("Failed to save data to localStorage", e);
    }
  }, [geoData]);

  /**
   * Internal helper to update geoData and sync code editor
   */
  const updateGeoData = useCallback((updater: (data: GeoJSONFeatureCollection) => GeoJSONFeatureCollection) => {
    const newData = updater(geoData);
    setGeoData(newData);
    setCodeValueState(formatGeoJSON(newData));
  }, [geoData]);

  /**
   * Handle code editor changes with validation
   */
  const setCodeValue = useCallback((value: string) => {
    setCodeValueState(value);
    const result = validateGeoJSON(value);

    if (result.valid && result.data) {
      setCodeError(null);
      setGeoData(result.data);
    } else {
      setCodeError(result.error || "Invalid GeoJSON");
    }
  }, []);

  /**
   * Add a new feature to the collection
   */
  const addFeature = useCallback((feature: GeoJSONFeature) => {
    updateGeoData(data => ({
      ...data,
      features: [...data.features, feature]
    }));
  }, [updateGeoData]);

  /**
   * Remove a feature from the collection
   */
  const removeFeature = useCallback((feature: GeoJSONFeature) => {
    updateGeoData(data => ({
      ...data,
      features: data.features.filter(f => f.id !== feature.id)
    }));

    // Clear selection if the deleted feature was selected
    if (selectedFeature?.id === feature.id) {
      setSelectedFeature(null);
    }
  }, [updateGeoData, selectedFeature]);

  /**
   * Update properties of a specific feature
   */
  const updateFeatureProperties = useCallback((featureId: string | number, properties: Record<string, any>) => {
    updateGeoData(data => ({
      ...data,
      features: data.features.map(f => 
        f.id === featureId ? { ...f, properties } : f
      )
    }));

    // Update selected feature if it's the one being modified
    if (selectedFeature?.id === featureId) {
      setSelectedFeature({ ...selectedFeature, properties });
    }
  }, [updateGeoData, selectedFeature]);

  /**
   * Replace entire dataset (for imports)
   */
  const replaceData = useCallback((data: GeoJSONFeatureCollection) => {
    setGeoData(data);
    setCodeValueState(formatGeoJSON(data));
    setCodeError(null);
  }, []);

  /**
   * Reset to empty state
   */
  const reset = useCallback(() => {
    const empty = createEmptyFeatureCollection();
    setGeoData(empty);
    setCodeValueState(formatGeoJSON(empty));
    setCodeError(null);
    setSelectedFeature(null);
  }, []);

  return {
    geoData,
    codeValue,
    codeError,
    selectedFeature,
    setCodeValue,
    setSelectedFeature,
    addFeature,
    removeFeature,
    updateFeatureProperties,
    replaceData,
    reset
  };
}