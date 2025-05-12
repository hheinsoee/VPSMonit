import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { SystemData, ApiContextType } from "@/types";
import { API_ENDPOINTS } from "@/constants/Config";
// Create context with a default value
const ApiContext = createContext<ApiContextType>({
  data: null,
  loading: true,
  error: null,
  refresh: () => {},
});

interface ApiProviderProps {
  children: ReactNode;
}

export const ApiProvider: React.FC<ApiProviderProps> = ({ children }) => {
  const [data, setData] = useState<SystemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  const setupEventSource = () => {
    // Close existing connection if any
    if (eventSource) {
      eventSource.close();
    }

    setLoading(true);
    setError(null);

    // Create new EventSource connection
    const newEventSource = new EventSource(API_ENDPOINTS.REALTIME);

    newEventSource.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        setData(parsedData);
        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to parse data"),
        );
        setLoading(false);
      }
    };

    newEventSource.onerror = (err) => {
      console.error("Error with SSE connection:", err);
      setError(new Error("Connection error"));
      setLoading(false);
      newEventSource.close();
    };

    setEventSource(newEventSource);
  };

  // Initialize the connection
  useEffect(() => {
    setupEventSource();

    // Cleanup on unmount
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  // Function to manually refresh the connection
  const refresh = () => {
    setupEventSource();
  };

  return (
    <ApiContext.Provider value={{ data, loading, error, refresh }}>
      {children}
    </ApiContext.Provider>
  );
};

// Custom hook to use the API context
export const useApi = () => useContext(ApiContext);
