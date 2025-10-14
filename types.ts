
// Fix: Removed circular dependency by defining and exporting the City interface here.
export interface City {
  name: string;
  country: string;
  lat: number;
  lng: number;
}

export interface TrackingEvent {
  date: string;
  status: string;
  location: string;
  details?: string;
  partner?: string;
}

export interface Address {
  name: string;
  street: string;
  cityStateZip: string;
  country: string;
}

export interface DeclaredItem {
  description: string;
  quantity: number;
  value: number; // Per item value
  countryOfOrigin: string;
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
  declaredItems: DeclaredItem[];
  insuranceValue: number;
  specialHandling: string[];
}

export type ServiceOption = 'Standard' | 'Express' | 'Overnight' | 'Same-Day' | 'Weekend';

export interface NewShipmentData {
  origin: Address;
  destination: Address;
  service: ServiceOption;
  weight: string;
  dimensions: string;
  declaredItems: DeclaredItem[];
  insuranceValue: number;
  specialHandling: string[];
}