import { PackageDetails, TrackingEvent, City, NewShipmentData, DeclaredItem } from '../types';
import { CITIES } from '../data/cities';

// --- MOCK DATA ---
const MOCK_DB: { [key: string]: PackageDetails } = {
  'IT123456789': {
    id: 'IT123456789',
    status: 'In Transit',
    estimatedDelivery: '2024-08-15',
    history: [
      { date: '2024-08-12, 18:30', status: 'Arrived at International Hub', location: 'Frankfurt, Germany', details: 'Package is being processed at the sorting facility.', partner: 'DHL Express' },
      { date: '2024-08-11, 09:15', status: 'Departed from Origin Country', location: 'Shanghai, China', details: 'In transit via air cargo.', partner: 'IntelliTrack Global' },
      { date: '2024-08-10, 14:00', status: 'International shipment release - Import', location: 'Shanghai, China', details: 'Customs clearance completed successfully.', partner: 'IntelliTrack Global' },
      { date: '2024-08-10, 11:22', status: 'Shipment picked up from sender', location: 'Shanghai, China', details: 'Courier has collected the package.', partner: 'IntelliTrack Global' },
    ],
    origin: {
      name: 'Global Tech Inc.',
      street: '123 Innovation Dr',
      cityStateZip: 'Shanghai 200000',
      country: 'China',
    },
    destination: {
      name: 'Jane Doe',
      street: '456 Market St',
      cityStateZip: 'New York, NY 10001',
      country: 'USA',
    },
    service: 'International Priority',
    weight: '2.5 kg',
    dimensions: '30cm x 20cm x 15cm',
    declaredItems: [
        { description: 'Micro-controller Unit', quantity: 5, value: 50, countryOfOrigin: 'China' },
        { description: 'LED Display Panel', quantity: 2, value: 120, countryOfOrigin: 'Taiwan' },
    ],
    insuranceValue: 500,
    specialHandling: ['Fragile', 'Handle with Care'],
  },
  'IT987654321': {
    id: 'IT987654321',
    status: 'Delivered',
    estimatedDelivery: '2024-08-05',
    history: [
      { date: '2024-08-05, 11:45', status: 'Delivered', location: 'London, UK', details: 'Proof of Delivery: E.WHITE.', partner: 'UPS UK' },
      { date: '2024-08-05, 08:00', status: 'Out for delivery', location: 'London, UK', details: 'On board with courier for final delivery.', partner: 'UPS UK' },
      { date: '2024-08-04, 21:00', status: 'Arrived at local facility', location: 'London, UK', partner: 'UPS UK' },
      { date: '2024-08-03, 15:30', status: 'Departed from facility', location: 'New York, USA', partner: 'FedEx' },
      { date: '2024-08-03, 10:00', status: 'Shipment picked up', location: 'New York, USA', partner: 'FedEx' },
    ],
    origin: {
      name: 'John Smith',
      street: '789 Broadway',
      cityStateZip: 'New York, NY 10003',
      country: 'USA',
    },
    destination: {
      name: 'Emily White',
      street: '10 Downing St',
      cityStateZip: 'London SW1A 2AA',
      country: 'United Kingdom',
    },
    service: 'Express Worldwide',
    weight: '0.8 kg',
    dimensions: '25cm x 15cm x 5cm',
    declaredItems: [
        { description: 'Signed Legal Contracts', quantity: 1, value: 10, countryOfOrigin: 'USA' },
    ],
    insuranceValue: 100,
    specialHandling: [],
  },
  'QR-MOCK-34159-XYZ': {
    id: 'QR-MOCK-34159-XYZ',
    status: 'Out for Delivery',
    estimatedDelivery: '2024-08-13',
    history: [
      { date: '2024-08-13, 08:30', status: 'Out for delivery', location: 'Los Angeles, USA', details: 'Scheduled for delivery today.', partner: 'USPS' },
      { date: '2024-08-12, 19:45', status: 'Tendered to delivery partner', location: 'Los Angeles, USA', details: 'Package handed off to USPS for final delivery.', partner: 'IntelliTrack Global' },
      { date: '2024-08-11, 05:00', status: 'Departed from hub', location: 'Tokyo, Japan', partner: 'IntelliTrack Global' },
      { date: '2024-08-10, 11:00', status: 'Shipment picked up', location: 'Tokyo, Japan', partner: 'IntelliTrack Global' },
    ],
    origin: {
      name: 'Anime Collectibles',
      street: 'Shibuya Crossing',
      cityStateZip: 'Tokyo 150-8010',
      country: 'Japan',
    },
    destination: {
      name: 'Mark Johnson',
      street: '1 Hollywood Blvd',
      cityStateZip: 'Los Angeles, CA 90028',
      country: 'USA',
    },
    service: 'Standard International',
    weight: '5.1 kg',
    dimensions: '50cm x 40cm x 30cm',
    declaredItems: [
        { description: 'Limited Edition Figurine', quantity: 1, value: 250, countryOfOrigin: 'Japan' },
        { description: 'Hardcover Art Book', quantity: 2, value: 80, countryOfOrigin: 'Japan' },
    ],
    insuranceValue: 0,
    specialHandling: ['Fragile'],
  },
};


// Simulate a network request
const apiCall = <T>(data: T, delay: number = 800): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), delay));


/**
 * Fetches shipment details by tracking ID.
 * @param trackingId The ID of the shipment to track.
 * @returns A promise that resolves to the package details or null if not found.
 */
export const getShipmentDetails = async (
  trackingId: string
): Promise<PackageDetails | null> => {
  console.log(`Fetching details for: ${trackingId}`);
  
  // Case-insensitive lookup, also find QR codes by prefix matching
  const upperTrackingId = trackingId.toUpperCase();
  const foundKey = Object.keys(MOCK_DB).find(key => key.toUpperCase() === upperTrackingId || upperTrackingId.startsWith('QR-MOCK') && key.startsWith('QR-MOCK'));
  
  if (foundKey && MOCK_DB[foundKey]) {
    // If it's a QR mock, update the ID to the full one found from the scan.
    const details = MOCK_DB[foundKey];
    if(trackingId.startsWith('QR-MOCK')) {
        const qrId = Object.keys(MOCK_DB).find(k => k.startsWith('QR-MOCK-')) || 'QR-MOCK-34159-XYZ';
        const updatedDetails = MOCK_DB[qrId] || MOCK_DB['QR-MOCK-34159-XYZ'];
        return apiCall(updatedDetails);
    }
    return apiCall(details);
  }
  
  // Simulate not found
  return apiCall(null, 500);
};

/**
 * Creates a new shipment and adds it to the database.
 * @param data The data for the new shipment.
 * @returns A promise that resolves to the newly created package details.
 */
export const createShipment = async (data: NewShipmentData): Promise<PackageDetails> => {
  const newId = `IT${Math.floor(100000000 + Math.random() * 900000000)}`;
  const today = new Date();
  let deliveryDate = new Date();

  switch (data.service) {
      case 'Express':
          deliveryDate.setDate(today.getDate() + 3);
          break;
      case 'Overnight':
          deliveryDate.setDate(today.getDate() + 1);
          break;
      case 'Same-Day':
          deliveryDate.setDate(today.getDate());
          break;
      case 'Weekend': {
          const dayOfWeek = today.getDay(); // 0=Sun, 6=Sat
          let daysUntilSaturday = 6 - dayOfWeek;
          if (daysUntilSaturday <= 0) { // If it's Saturday or Sunday, get next Saturday
              daysUntilSaturday += 7;
          }
          deliveryDate.setDate(today.getDate() + daysUntilSaturday);
          break;
      }
      case 'Standard':
      default:
          deliveryDate.setDate(today.getDate() + 7);
          break;
  }

  const now = new Date();
  const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  const initialEvent: TrackingEvent = {
      date: formattedDate,
      status: 'Shipment Created',
      location: data.origin.cityStateZip,
      details: 'Shipping label created, awaiting pickup.',
      partner: 'IntelliTrack Global',
  };
  
  const newPackage: PackageDetails = {
      id: newId,
      status: initialEvent.status,
      estimatedDelivery: deliveryDate.toISOString().split('T')[0],
      history: [initialEvent],
      ...data
  };
  
  MOCK_DB[newId] = newPackage;
  
  console.log('Created new shipment:', newPackage);
  return apiCall(newPackage, 1000);
};


/**
 * Returns a list of cities that are part of a package's journey.
 * @param history The tracking history of the package.
 * @returns An array of City objects.
 */
export const getJourneyPath = (history: TrackingEvent[]): City[] => {
  const journeyCities: City[] = [];
  const addedCities = new Set<string>();

  [...history].reverse().forEach(event => {
    const locationName = event.location.split(',')[0].trim();
    if (!addedCities.has(locationName)) {
      const cityData = CITIES.find(c => c.name === locationName);
      if (cityData) {
        journeyCities.push(cityData);
        addedCities.add(locationName);
      }
    }
  });

  return journeyCities;
};
