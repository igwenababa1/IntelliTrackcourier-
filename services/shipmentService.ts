import { PackageDetails, TrackingEvent, City, NewShipmentData, DeclaredItem, DeliveryEvidence } from '../types';
import { CITIES } from '../data/cities';

// --- MOCK DATA ---
const MOCK_DB: { [key: string]: PackageDetails } = {
  'ITK-9X81-GBL-774A': {
    id: 'ITK-9X81-GBL-774A',
    status: 'In Transit',
    estimatedDelivery: '2026-05-08',
    history: [
      { date: '2026-05-06, 18:30', status: 'Arrived at International Hub', location: 'Frankfurt, Germany', details: 'Package is being processed at the sorting facility.', partner: 'DHL Express' },
      { date: '2026-05-06, 09:15', status: 'Departed from Origin Country', location: 'Shanghai, China', details: 'In transit via air cargo.', partner: 'IntelliTrack Global' },
      { date: '2026-05-05, 14:00', status: 'International shipment release - Import', location: 'Shanghai, China', details: 'Customs clearance completed successfully.', partner: 'IntelliTrack Global' },
      { date: '2026-05-05, 11:22', status: 'Shipment picked up from sender', location: 'Shanghai, China', details: 'Courier has collected the package.', partner: 'IntelliTrack Global' },
    ],
    origin: {
      name: 'Global Tech Industries Corp.',
      street: '123 Innovation Dr',
      cityStateZip: 'Shanghai 200000',
      country: 'China',
      email: 'logistics@globaltech-corp.com',
    },
    destination: {
      name: 'Dr. Evelyn Carter',
      street: '456 Market St, Suite 700',
      cityStateZip: 'New York, NY 10001',
      country: 'USA',
      email: 'ecarter@precision-med.org',
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
    advancedOptions: ['Extended Warranty', 'Tamper-Proof Seal'],
  },
  'ITK-5V22-DOM-991B': {
    id: 'ITK-5V22-DOM-991B',
    status: 'Delivered',
    estimatedDelivery: '2026-05-05',
    history: [
      { date: '2026-05-05, 11:45', status: 'Delivered', location: 'London, UK', details: 'Proof of Delivery: E.WHITE.', partner: 'UPS UK' },
      { date: '2026-05-05, 08:00', status: 'Out for delivery', location: 'London, UK', details: 'On board with courier for final delivery.', partner: 'UPS UK' },
      { date: '2026-05-04, 21:00', status: 'Arrived at local facility', location: 'London, UK', partner: 'UPS UK' },
      { date: '2026-05-03, 15:30', status: 'Departed from facility', location: 'New York, USA', partner: 'FedEx' },
      { date: '2026-05-03, 10:00', status: 'Shipment picked up', location: 'New York, USA', partner: 'FedEx' },
    ],
    origin: {
      name: 'Arthur Pendelton',
      street: '789 Broadway, Penthouse Q',
      cityStateZip: 'New York, NY 10003',
      country: 'USA',
      email: 'a.pendelton@lawrence-group.com',
    },
    destination: {
      name: 'Victoria Wellington',
      street: '10 Downing St',
      cityStateZip: 'London SW1A 2AA',
      country: 'United Kingdom',
      email: 'v.wellington@exeter-holdings.co.uk',
    },
    service: 'Express Worldwide',
    weight: '0.8 kg',
    dimensions: '25cm x 15cm x 5cm',
    declaredItems: [
        { description: 'Signed Legal Contracts', quantity: 1, value: 10, countryOfOrigin: 'USA' },
    ],
    insuranceValue: 100,
    specialHandling: [],
    advancedOptions: [],
    deliveryEvidence: {
        signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAoAAAAFoCAYAAABa2elYAAAB/ElEQVR4nO3BMQEAAADCoPVPbQo/oAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgA8NAAAB/2G20wAAAABJRU5ErkJggg==',
        photo: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/ALID/9k='
    }
  },
  'QR-MOCK-34159-XYZ': {
    id: 'TRK-QR-8832-LIVE',
    status: 'Out for Delivery',
    estimatedDelivery: '2026-05-06',
    history: [
      { date: '2026-05-06, 08:30', status: 'Out for delivery', location: 'Los Angeles, USA', details: 'Scheduled for delivery today.', partner: 'USPS' },
      { date: '2026-05-05, 19:45', status: 'Tendered to delivery partner', location: 'Los Angeles, USA', details: 'Package handed off to USPS for final delivery.', partner: 'IntelliTrack Global' },
      { date: '2026-05-04, 05:00', status: 'Departed from hub', location: 'Tokyo, Japan', partner: 'IntelliTrack Global' },
      { date: '2026-05-03, 11:00', status: 'Shipment picked up', location: 'Tokyo, Japan', partner: 'IntelliTrack Global' },
    ],
    origin: {
      name: 'Anime Collectibles',
      street: 'Shibuya Crossing',
      cityStateZip: 'Tokyo 150-8010',
      country: 'Japan',
      email: 'sales@anime-collectibles.example.jp',
    },
    destination: {
      name: 'Marcus Vance',
      street: '1 Hollywood Blvd',
      cityStateZip: 'Los Angeles, CA 90028',
      country: 'USA',
      email: 'm.vance@studio-exec.com',
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
    advancedOptions: [],
  },
  'ITK-PRM-112M-48P': {
    id: 'ITK-PRM-112M-48P',
    status: 'Processing',
    estimatedDelivery: '2026-05-15',
    history: [
      { date: '2026-05-06, 16:00', status: 'Shipment picked up from sender', location: 'Sydney, Australia', details: 'Package collected by IntelliTrack courier.', partner: 'IntelliTrack Global' },
      { date: '2026-05-06, 10:30', status: 'Shipment Created', location: 'Sydney, Australia', details: 'Shipping label created, awaiting pickup.', partner: 'IntelliTrack Global' },
    ],
    origin: {
      name: 'Aussie Exports',
      street: '1 Bondi Beach',
      cityStateZip: 'Sydney, NSW 2026',
      country: 'Australia',
      email: 'exports@aussie.example.com.au',
    },
    destination: {
      name: 'California Imports',
      street: '200 Santa Monica Pier',
      cityStateZip: 'Los Angeles, CA 90401',
      country: 'USA',
      email: 'imports@cali.example.com',
    },
    service: 'Standard',
    weight: '3.1 kg',
    dimensions: '40cm x 40cm x 10cm',
    declaredItems: [
        { description: 'Hand-carved Boomerang', quantity: 2, value: 75, countryOfOrigin: 'Australia' },
        { description: 'Local Surf Wax', quantity: 5, value: 10, countryOfOrigin: 'Australia' },
    ],
    insuranceValue: 200,
    specialHandling: ['Handle with Care'],
    advancedOptions: [],
  },
  'ITK-EXP-33AQ-82V': {
    id: 'ITK-EXP-33AQ-82V',
    status: 'Delivered',
    estimatedDelivery: '2026-05-01',
    history: [
      { date: '2026-05-01, 14:20', status: 'Delivered', location: 'Dubai, UAE', details: 'Delivered to front door.', partner: 'IntelliTrack Global' },
      { date: '2026-05-01, 09:00', status: 'Out for delivery', location: 'Dubai, UAE', partner: 'IntelliTrack Global' },
      { date: '2026-04-30, 11:00', status: 'Arrived at local facility', location: 'Dubai, UAE', partner: 'IntelliTrack Global' },
      { date: '2026-04-29, 04:00', status: 'Departed from hub', location: 'Frankfurt, Germany', partner: 'DHL Express' },
      { date: '2026-04-28, 18:00', status: 'Arrived at International Hub', location: 'Frankfurt, Germany', partner: 'DHL Express' },
      { date: '2026-04-27, 22:00', status: 'Shipment picked up', location: 'Tokyo, Japan', partner: 'IntelliTrack Global' },
    ],
    origin: {
      name: 'Tokyo Electronics',
      street: '1-1-2 Oshiage, Sumida',
      cityStateZip: 'Tokyo 131-0045',
      country: 'Japan',
      email: 'shipping@tokyo-electronics.example.jp',
    },
    destination: {
      name: 'Dubai Luxury Goods',
      street: '1 Sheikh Mohammed bin Rashid Blvd',
      cityStateZip: 'Dubai',
      country: 'UAE',
      email: 'purchasing@dubai-luxury.example.ae',
    },
    service: 'Express',
    weight: '1.2 kg',
    dimensions: '20cm x 20cm x 15cm',
    declaredItems: [
        { description: 'High-end Digital Camera', quantity: 1, value: 1200, countryOfOrigin: 'Japan' },
        { description: 'High-Speed Memory Cards', quantity: 3, value: 50, countryOfOrigin: 'Japan' },
    ],
    insuranceValue: 1500,
    specialHandling: ['Fragile', 'Electronics'],
    advancedOptions: ['Tamper-Proof Seal'],
    deliveryEvidence: {
        signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAoAAAAFoCAYAAABa2elYAAAB/ElEQVR4nO3BMQEAAADCoPVPbQo/oAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgA8NAAAB/2G20wAAAABJRU5ErkJggg==',
        photo: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/ALID/9k='
    }
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
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const generatedId = `ITK-${Math.floor(1000 + Math.random() * 9000)}-${chars[Math.floor(Math.random() * chars.length)]}XX-Y${Math.floor(100 + Math.random() * 900)}`;
  const newId = (data.trackingNumber && data.trackingNumber.trim() !== '') ? data.trackingNumber.trim() : generatedId;
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

/**
 * Adds a piece of delivery evidence to a shipment's record.
 * This is a mock function that directly mutates the in-memory database.
 * @param packageId The ID of the package to update.
 * @param type The type of evidence being added.
 * @param data The base64 encoded data for the evidence.
 * @returns The updated package details.
 */
export const addDeliveryEvidence = (packageId: string, type: 'photo' | 'signature' | 'audio', data: string): PackageDetails | null => {
    if (MOCK_DB[packageId]) {
        const currentDetails = MOCK_DB[packageId];
        const currentEvidence = currentDetails.deliveryEvidence || {};
        
        const newEvidence: DeliveryEvidence = {
            ...currentEvidence,
            [type]: data,
        };
        
        const updatedDetails: PackageDetails = {
            ...currentDetails,
            deliveryEvidence: newEvidence,
        };

        if (updatedDetails.status.toLowerCase() !== 'delivered') {
            const now = new Date();
            const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            
            const deliveryEvent: TrackingEvent = {
                date: formattedDate,
                status: 'Delivered',
                location: currentDetails.destination.cityStateZip,
                details: `Proof of Delivery: ${type} captured.`,
                partner: 'IntelliTrack Global',
            };
            
            updatedDetails.status = 'Delivered';
            updatedDetails.history = [deliveryEvent, ...currentDetails.history];
        }
        
        MOCK_DB[packageId] = updatedDetails;
        console.log(`Added ${type} evidence to ${packageId}.`);
        return updatedDetails;
    }
    console.error(`Could not find package with ID ${packageId} to add evidence.`);
    return null;
};