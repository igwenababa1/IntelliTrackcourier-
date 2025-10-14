import React, { useState, useMemo } from 'react';
import { NewShipmentData, Address, ServiceOption, DeclaredItem } from '../types';
import Icon from './Icon';

interface CreateShipmentProps {
  onCreateShipment: (data: NewShipmentData) => void;
  isLoading: boolean;
}

const SERVICE_COSTS: Record<ServiceOption, number> = {
    'Standard': 15,
    'Express': 35,
    'Overnight': 70,
    'Same-Day': 120,
    'Weekend': 50
};

const INSURANCE_COSTS: Record<number, number> = {
    0: 0,
    100: 5,
    500: 15,
    1000: 25,
};

const CreateShipment: React.FC<CreateShipmentProps> = ({ onCreateShipment, isLoading }) => {
  const [origin, setOrigin] = useState<Address>({ name: '', street: '', cityStateZip: '', country: '' });
  const [destination, setDestination] = useState<Address>({ name: '', street: '', cityStateZip: '', country: '' });
  const [weight, setWeight] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [service, setService] = useState<ServiceOption>('Standard');
  const [declaredItems, setDeclaredItems] = useState<DeclaredItem[]>([
      { description: '', quantity: 1, value: 0, countryOfOrigin: '' }
  ]);
  const [insuranceValue, setInsuranceValue] = useState<number>(0);
  const [specialHandling, setSpecialHandling] = useState<string[]>([]);
  
  const totalCost = useMemo(() => {
    const serviceCost = SERVICE_COSTS[service];
    const insuranceCost = INSURANCE_COSTS[insuranceValue];
    return serviceCost + insuranceCost;
  }, [service, insuranceValue]);

  const handleAddressChange = (type: 'origin' | 'destination', field: keyof Address, value: string) => {
    const setter = type === 'origin' ? setOrigin : setDestination;
    setter(prev => ({ ...prev, [field]: value }));
  };
  
  const handleItemChange = (index: number, field: keyof DeclaredItem, value: string | number) => {
      const newItems = [...declaredItems];
      // Type assertion to satisfy TypeScript
      (newItems[index] as any)[field] = value;
      setDeclaredItems(newItems);
  };

  const addItem = () => {
      setDeclaredItems([...declaredItems, { description: '', quantity: 1, value: 0, countryOfOrigin: '' }]);
  };

  const removeItem = (index: number) => {
      if (declaredItems.length > 1) {
          setDeclaredItems(declaredItems.filter((_, i) => i !== index));
      }
  };
  
  const handleHandlingChange = (option: string, checked: boolean) => {
      if(checked) {
          setSpecialHandling(prev => [...prev, option]);
      } else {
          setSpecialHandling(prev => prev.filter(item => item !== option));
      }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || !isFormValid()) return;
    
    const shipmentData: NewShipmentData = {
      origin,
      destination,
      weight,
      dimensions,
      service,
      declaredItems,
      insuranceValue,
      specialHandling
    };
    onCreateShipment(shipmentData);
  };
  
  const isFormValid = () => {
      return (
          origin.name && origin.street && origin.cityStateZip && origin.country &&
          destination.name && destination.street && destination.cityStateZip && destination.country &&
          weight && dimensions &&
          declaredItems.every(item => item.description && item.quantity > 0 && item.value >= 0 && item.countryOfOrigin)
      );
  }

  return (
    <div className="create-shipment-container">
      <h1>Create New Shipment</h1>
      <form className="create-shipment-form" onSubmit={handleSubmit}>
        
        {/* Addresses Section */}
        <section className="form-section">
          <h2 className="form-section-title">Addresses</h2>
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Origin Address */}
            <div>
              <h3>From (Sender)</h3>
              <div className="form-grid">
                <div className="form-field"><label>Full Name</label><input type="text" value={origin.name} onChange={e => handleAddressChange('origin', 'name', e.target.value)} required /></div>
                <div className="form-field"><label>Street Address</label><input type="text" value={origin.street} onChange={e => handleAddressChange('origin', 'street', e.target.value)} required /></div>
                <div className="form-field"><label>City, State/Province, ZIP</label><input type="text" value={origin.cityStateZip} onChange={e => handleAddressChange('origin', 'cityStateZip', e.target.value)} required /></div>
                <div className="form-field"><label>Country</label><input type="text" value={origin.country} onChange={e => handleAddressChange('origin', 'country', e.target.value)} required /></div>
              </div>
            </div>
            {/* Destination Address */}
            <div>
              <h3>To (Recipient)</h3>
              <div className="form-grid">
                <div className="form-field"><label>Full Name</label><input type="text" value={destination.name} onChange={e => handleAddressChange('destination', 'name', e.target.value)} required /></div>
                <div className="form-field"><label>Street Address</label><input type="text" value={destination.street} onChange={e => handleAddressChange('destination', 'street', e.target.value)} required /></div>
                <div className="form-field"><label>City, State/Province, ZIP</label><input type="text" value={destination.cityStateZip} onChange={e => handleAddressChange('destination', 'cityStateZip', e.target.value)} required /></div>
                <div className="form-field"><label>Country</label><input type="text" value={destination.country} onChange={e => handleAddressChange('destination', 'country', e.target.value)} required /></div>
              </div>
            </div>
          </div>
        </section>

        {/* Package Details Section */}
        <section className="form-section">
          <h2 className="form-section-title">Package Details</h2>
          <div className="form-grid">
            <div className="form-field"><label>Total Weight (kg)</label><input type="text" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g., 2.5 kg" required /></div>
            <div className="form-field"><label>Dimensions (cm)</label><input type="text" value={dimensions} onChange={e => setDimensions(e.target.value)} placeholder="e.g., 30x20x15 cm" required /></div>
          </div>
        </section>
        
        {/* Customs Declaration */}
        <section className="form-section">
            <h2 className="form-section-title">
              <Icon name="shield-check" className="title-icon" />
              <span>Official Customs Declaration</span>
            </h2>
            <p className="form-section-subtitle">
                Provide accurate details for all items to ensure smooth international customs clearance. Approved by the World Commerce Organization.
            </p>
            <div className="declared-items-list">
                {declaredItems.map((item, index) => (
                    <div key={index} className="declared-item">
                        <div className="form-field"><label>Description</label><input type="text" value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} required /></div>
                        <div className="form-field"><label>Qty</label><input type="number" min="1" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)} required /></div>
                        <div className="form-field"><label>Value (USD)</label><input type="number" min="0" value={item.value} onChange={e => handleItemChange(index, 'value', parseFloat(e.target.value) || 0)} required /></div>
                        <div className="form-field"><label>Country of Origin</label><input type="text" value={item.countryOfOrigin} onChange={e => handleItemChange(index, 'countryOfOrigin', e.target.value)} required /></div>
                        <button type="button" className="remove-item-button" onClick={() => removeItem(index)} disabled={declaredItems.length <= 1}><Icon name="close" /></button>
                    </div>
                ))}
            </div>
            <button type="button" className="add-item-button" onClick={addItem}>+ Add Another Item</button>
        </section>

        {/* Shipping Options */}
        <section className="form-section">
            <h2 className="form-section-title">Advanced Options</h2>
            <div style={{marginBottom: '2rem'}}>
                <label style={{ display: 'block', marginBottom: '1rem', fontWeight: '600', color: 'white' }}>Shipping Insurance</label>
                <div className="options-group">
                    {Object.entries(INSURANCE_COSTS).map(([value, cost]) => (
                        <label key={value} className={`radio-option ${insuranceValue === Number(value) ? 'selected' : ''}`}>
                            <input type="radio" name="insurance" value={value} checked={insuranceValue === Number(value)} onChange={() => setInsuranceValue(Number(value))} />
                            Insure up to ${value} (+${cost})
                        </label>
                    ))}
                </div>
            </div>
             <div>
                <label style={{ display: 'block', marginBottom: '1rem', fontWeight: '600', color: 'white' }}>Special Handling</label>
                <div className="options-group">
                    {['Fragile', 'Perishable', 'Handle with Care', 'This Side Up'].map(opt => (
                        <label key={opt} className="checkbox-option">
                            <input type="checkbox" checked={specialHandling.includes(opt)} onChange={e => handleHandlingChange(opt, e.target.checked)} />
                            {opt}
                        </label>
                    ))}
                </div>
            </div>
        </section>


        {/* Service Options Section */}
        <section className="form-section">
          <h2 className="form-section-title">Delivery Service</h2>
          <div className="service-options">
            <div className={`service-option ${service === 'Standard' ? 'selected' : ''}`} onClick={() => setService('Standard')}>
              <h3 className="service-option-title">Standard</h3>
              <p className="service-option-details">5-7 Business Days</p>
              <span className="service-option-price">${SERVICE_COSTS['Standard']}</span>
            </div>
            <div className={`service-option ${service === 'Express' ? 'selected' : ''}`} onClick={() => setService('Express')}>
              <h3 className="service-option-title">Express</h3>
              <p className="service-option-details">2-3 Business Days</p>
              <span className="service-option-price">${SERVICE_COSTS['Express']}</span>
            </div>
            <div className={`service-option ${service === 'Overnight' ? 'selected' : ''}`} onClick={() => setService('Overnight')}>
              <h3 className="service-option-title">Overnight</h3>
              <p className="service-option-details">Next Business Day</p>
              <span className="service-option-price">${SERVICE_COSTS['Overnight']}</span>
            </div>
            <div className={`service-option ${service === 'Same-Day' ? 'selected' : ''}`} onClick={() => setService('Same-Day')}>
              <h3 className="service-option-title">Same-Day</h3>
              <p className="service-option-details">Within 12 hours</p>
              <span className="service-option-price">${SERVICE_COSTS['Same-Day']}</span>
            </div>
            <div className={`service-option ${service === 'Weekend' ? 'selected' : ''}`} onClick={() => setService('Weekend')}>
              <h3 className="service-option-title">Weekend</h3>
              <p className="service-option-details">Guaranteed Saturday</p>
              <span className="service-option-price">${SERVICE_COSTS['Weekend']}</span>
            </div>
          </div>
          
           <div className="submit-button-container">
                <div className="total-cost-display">
                    <span className="total-cost-label">Total Estimated Cost</span>
                    <p className="total-cost-value">${totalCost.toFixed(2)}</p>
                </div>
                <button type="submit" className="submit-button" disabled={isLoading || !isFormValid()}>
                    {isLoading ? 'Creating...' : 'Create Shipment'}
                </button>
           </div>

        </section>
      </form>
    </div>
  );
};

export default CreateShipment;