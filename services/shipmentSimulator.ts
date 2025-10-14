import { PackageDetails, TrackingEvent, City } from '../types';
import { CITIES } from '../data/cities';

const PARTNERS = {
  INTERNATIONAL: 'IntelliTrack Global',
  USA: 'FedEx',
  UK: 'UPS UK',
  GERMANY: 'DHL Express',
  JAPAN: 'Japan Post',
  LOCAL: 'USPS'
};

const getPartnerForCountry = (country: string): string => {
  const upperCountry = country.toUpperCase();
  if (upperCountry.includes('USA')) return PARTNERS.USA;
  if (upperCountry.includes('UNITED KINGDOM')) return PARTNERS.UK;
  if (upperCountry.includes('GERMANY')) return PARTNERS.GERMANY;
  if (upperCountry.includes('JAPAN')) return PARTNERS.JAPAN;
  return PARTNERS.LOCAL;
}

const getNextLocation = (currentLocation: string, destinationLocation: string): City => {
  const destinationCity = CITIES.find(c => destinationLocation.includes(c.name));
  const currentIndex = CITIES.findIndex(c => currentLocation.includes(c.name));
  
  // Simple routing: if there's a destination and it's in our list, move towards it.
  if (destinationCity && currentIndex !== -1) {
    const destIndex = CITIES.findIndex(c => c.name === destinationCity.name);
    if(currentIndex < destIndex) return CITIES[currentIndex + 1];
    if(currentIndex > destIndex) return CITIES[currentIndex - 1];
  }
  
  // Fallback for random movement
  const nextIndex = (currentIndex + 1) % CITIES.length;
  return CITIES[nextIndex];
};

/**
 * Simulates the next tracking event for a package with enhanced realism.
 * @param packageDetails The current details of the package.
 * @returns The updated package details with a new event.
 */
export const simulateNextEvent = (packageDetails: PackageDetails): PackageDetails => {
  if (packageDetails.status.toLowerCase() === 'delivered') {
    return packageDetails;
  }

  const lastEvent = packageDetails.history[0];
  const lastEventDate = new Date(lastEvent.date.replace(',', ''));

  // Introduce variability in event timing
  const randomHours = (Math.random() * 6) + 4; // 4 to 10 hours
  const nextEventDate = new Date(lastEventDate.getTime() + randomHours * 3600 * 1000);
  const formattedDate = `${nextEventDate.toISOString().slice(0, 10)}, ${nextEventDate.toTimeString().slice(0, 5)}`;

  let newEvent: TrackingEvent;
  const currentCityName = lastEvent.location.split(',')[0].trim();
  const destinationCity = CITIES.find(c => packageDetails.destination.cityStateZip.includes(c.name));

  // Determine the next logical step in the journey
  const status = lastEvent.status.toLowerCase();
  
  if (status.includes('created') || status.includes('picked up')) {
    newEvent = { date: formattedDate, status: 'Departed from Origin Facility', location: lastEvent.location, partner: PARTNERS.INTERNATIONAL };
  } else if (status.includes('departed')) {
    const nextCity = getNextLocation(lastEvent.location, packageDetails.destination.cityStateZip);
    newEvent = { date: formattedDate, status: 'Arrived at International Hub', location: `${nextCity.name}, ${nextCity.country}`, partner: PARTNERS.INTERNATIONAL, details: "Processing at sort facility." };
  } else if (status.includes('arrived at international hub')) {
     if (destinationCity && lastEvent.location.includes(destinationCity.country)) {
         newEvent = { date: formattedDate, status: 'International shipment release - Import', location: lastEvent.location, partner: getPartnerForCountry(destinationCity.country), details: "Customs clearance processing complete." };
     } else {
         newEvent = { date: formattedDate, status: 'Departed from International Hub', location: lastEvent.location, partner: PARTNERS.INTERNATIONAL };
     }
  } else if (status.includes('release - import')) {
    const deliveryPartner = getPartnerForCountry(packageDetails.destination.country);
    newEvent = { date: formattedDate, status: 'Tendered to delivery partner', location: lastEvent.location, partner: deliveryPartner, details: `Package transferred to ${deliveryPartner} for final delivery.`};
  } else if (status.includes('tendered') || status.includes('local facility')) {
     newEvent = { date: formattedDate, status: 'Out for delivery', location: packageDetails.destination.cityStateZip, partner: lastEvent.partner, details: "On vehicle for delivery today." };
  } else if (status.includes('out for delivery')) {
     newEvent = { date: formattedDate, status: 'Delivered', location: packageDetails.destination.cityStateZip, partner: lastEvent.partner, details: `Package delivered. Signed by: RECIPIENT.` };
  } else {
    // Fallback state
    const nextCity = getNextLocation(lastEvent.location, packageDetails.destination.cityStateZip);
    newEvent = { date: formattedDate, status: 'In Transit to Next Facility', location: `${nextCity.name}, ${nextCity.country}`, partner: PARTNERS.INTERNATIONAL };
  }
  
  const newHistory = [newEvent, ...packageDetails.history];
  
  return {
    ...packageDetails,
    status: newEvent.status,
    history: newHistory,
  };
};
