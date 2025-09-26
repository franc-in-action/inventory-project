// src/modules/locations/contexts/LocationsContext.jsx
import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import {
  fetchLocations,
  fetchLocationById,
  createLocation,
  updateLocation,
  deleteLocation as deleteLocationApi,
} from "../locationsApi.js";

const LocationsContext = createContext();

export function LocationsProvider({ children }) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLocations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchLocations();
      setLocations(data);
    } catch (err) {
      console.error("[LocationsContext] Failed to fetch locations:", err);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addLocation = async (payload) => {
    const newLocation = await createLocation(payload);
    setLocations((prev) => [...prev, newLocation]);
    return newLocation;
  };

  const updateLocationById = async (id, payload) => {
    const updated = await updateLocation(id, payload);
    setLocations((prev) => prev.map((loc) => (loc.id === id ? updated : loc)));
    return updated;
  };

  const deleteLocationById = async (id) => {
    await deleteLocationApi(id);
    setLocations((prev) => prev.filter((loc) => loc.id !== id));
  };

  // NEW: get a location by ID from state or fallback to API
  const getLocationById = async (id) => {
    const loc = locations.find((l) => l.id === id);
    if (loc) return loc;

    try {
      const data = await fetchLocationById(id);
      return data;
    } catch (err) {
      console.error("[LocationsContext] Failed to fetch location by ID:", err);
      return null;
    }
  };

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  return (
    <LocationsContext.Provider
      value={{
        locations,
        loading,
        loadLocations,
        addLocation,
        updateLocationById,
        deleteLocationById,
        getLocationById, // exposed helper
      }}
    >
      {children}
    </LocationsContext.Provider>
  );
}

export function useLocations() {
  return useContext(LocationsContext);
}
