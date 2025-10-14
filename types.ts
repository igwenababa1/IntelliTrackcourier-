// Fix: Populate the contents of types.ts
export interface TrackingEvent {
  date: string;
  status: string;
  location: string;
  details?: string;
}

export interface Address {
  name: string;
  street: string;
  cityStateZip: string;
  country: string;
}

export interface PackageDetails {
  id: string;
  status: string;
  estimatedDelivery: string;
  history: TrackingEvent[];
  origin: Address;
  destination: Address;
  service: string;
  weight: string;
  dimensions: string;
  contents: string;
}

export interface City {
  name: string;
  country: string;
  lat: number;
  lng: number;
}
