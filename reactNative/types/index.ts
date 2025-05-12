// System monitoring data types
export interface SystemData {
  cpuLoad: number[];
  mem: {
    free: number;
    total: number;
    usedPercent: string;
  };
  uptime: number;
  disk: {
    filesystem: string;
    size: string;
    used: string;
    available: string;
    capacity: string;
    mount: string;
  }[];
  net: {
    iface: string;
    ip4: string;
    mac: string;
    internal: boolean;
  }[];
}

// API Context types
export interface ApiContextType {
  data: SystemData | null;
  loading: boolean;
  error: Error | null;
  refresh: () => void;
}

// Component prop types
export interface SectionProps {
  title: string;
  children: React.ReactNode;
}

// Theme types
export type ThemeType = 'light' | 'dark';

// Navigation types
export type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  Details: { item: string; id: number };
};