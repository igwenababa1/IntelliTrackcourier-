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

export interface PackageDetails {
  id: string;
  status: string;
  estimatedDelivery: string;
  origin: string;
  destination: string;
  contents: string; // The description used for generating the image
  history: TrackingEvent[];
  deliveryPreference: string;
  availableDeliveryOptions: string[];
}
