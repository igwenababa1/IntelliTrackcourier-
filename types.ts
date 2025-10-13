export interface Location {
  lat: number;
  lng: number;
}

export interface TrackingEvent {
  date: string;
  status: string;
  location: string;
  locationCoords: Location;
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
  origin: Address;
  destination: Address;
  contents: string; // The description used for generating the image
  history: TrackingEvent[];
  deliveryPreference: string;
  availableDeliveryOptions: string[];
}