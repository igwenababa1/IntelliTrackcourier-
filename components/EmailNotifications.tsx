import React from 'react';
import { PackageDetails } from '../types';
import Icon from './Icon';

interface EmailModalBaseProps {
    onClose: () => void;
    children: React.ReactNode;
}

const EmailModalBase: React.FC<EmailModalBaseProps> = ({ onClose, children }) => (
    <div className="email-modal-overlay" onClick={onClose}>
        <div className="email-modal-container" onClick={(e) => e.stopPropagation()}>
            {children}
        </div>
    </div>
);


interface DeliveryConfirmationEmailProps {
    details: PackageDetails;
    onClose: () => void;
    onViewEvidence: () => void;
    onLeaveFeedback: () => void;
}

export const DeliveryConfirmationEmail: React.FC<DeliveryConfirmationEmailProps> = ({ details, onClose, onViewEvidence, onLeaveFeedback }) => {
    return (
        <EmailModalBase onClose={onClose}>
            <header className="email-modal-header">
                <div className="email-modal-brand">
                    <Icon name="globe-check" style={{ color: 'var(--primary-color)' }} />
                    IntelliTrack
                </div>
                <span className="email-modal-subject">Your package has been delivered</span>
            </header>
            <div className="email-modal-body">
                <Icon name="check-circle" style={{ color: '#10b981', width: 48, height: 48, marginBottom: '1rem' }} />
                <h2>Great News, {details.destination.name}!</h2>
                <p>
                    Your package with tracking number <strong>{details.id}</strong> from <strong>{details.origin.name}</strong> was successfully delivered on {new Date(details.history[0].date).toLocaleDateString()}.
                </p>
                <div className="email-info-box">
                    <h4>Delivery Summary</h4>
                    <p style={{margin: 0}}>
                        <strong>Contents:</strong> {details.declaredItems.map(item => `${item.quantity}x ${item.description}`).join(', ')}<br />
                        <strong>Service:</strong> {details.service}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                     <button onClick={onViewEvidence} className="email-modal-cta-button">
                        View Delivery Evidence
                    </button>
                    <button onClick={onLeaveFeedback} className="email-modal-cta-button secondary">
                        Leave Feedback
                    </button>
                </div>
            </div>
            <footer className="email-modal-footer">
                Thank you for choosing IntelliTrack. You are receiving this email because you are the recipient of this shipment.
            </footer>
        </EmailModalBase>
    );
};


interface CustomsHoldEmailProps {
    details: PackageDetails;
    onClose: () => void;
    onContactSupport: () => void;
}

export const CustomsHoldEmail: React.FC<CustomsHoldEmailProps> = ({ details, onClose, onContactSupport }) => {
    return (
        <EmailModalBase onClose={onClose}>
            <header className="email-modal-header warning">
                <div className="email-modal-brand" style={{ color: '#991b1b' }}>
                    <Icon name="alert-triangle" />
                    IntelliTrack - Action Required
                </div>
                <span className="email-modal-subject">Important Update on Shipment {details.id}</span>
            </header>
            <div className="email-modal-body">
                <h2>Important Update on Your Shipment</h2>
                <p>
                    Dear {details.destination.name},<br/>
                    We are writing to inform you that your shipment, <strong>{details.id}</strong>, is currently being held for a routine inspection by customs authorities in <strong>{details.history[0].location}</strong>.
                </p>
                <p>
                    This is often a standard procedure for international shipments and does not necessarily indicate a problem. However, it may cause a delay in the final delivery.
                </p>
                <div className="email-info-box" style={{ backgroundColor: '#fffbeb', borderColor: '#fde68a' }}>
                    <h4 style={{ color: '#b45309' }}>What to do next:</h4>
                    <ol style={{ paddingLeft: '1.5rem', margin: 0 }}>
                        <li><strong>No immediate action is needed from you.</strong> We will notify you if customs requires any additional documentation.</li>
                        <li>We are actively monitoring the situation and will provide updates as they become available.</li>
                        <li>You can track your shipment for the latest status or contact our AI assistant for help.</li>
                    </ol>
                </div>
                <button onClick={onContactSupport} className="email-modal-cta-button">
                    Contact Support
                </button>
            </div>
            <footer className="email-modal-footer">
                We apologize for any inconvenience this may cause and appreciate your patience.
            </footer>
        </EmailModalBase>
    );
};