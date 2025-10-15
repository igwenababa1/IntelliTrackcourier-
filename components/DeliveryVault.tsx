import React, { useState, useEffect } from 'react';
import { PackageDetails } from '../types';
import { analyzeDeliveryEvidence } from '../services/geminiService';
import Icon from './Icon';

const SkeletonElement = ({ style }: { style?: React.CSSProperties }) => (
  <div className="skeleton" style={{ ...style, borderRadius: '0.25rem' }}></div>
);

const AIAnalysisSkeleton = () => (
  <div>
    <SkeletonElement style={{ width: '90%', height: '1.2rem', marginBottom: '1rem', opacity: 0.8 }} />
    <SkeletonElement style={{ width: '100%', height: '1rem', marginBottom: '0.5rem', opacity: 0.6 }} />
    <SkeletonElement style={{ width: '70%', height: '1rem', marginBottom: '1.5rem', opacity: 0.6 }} />
    <SkeletonElement style={{ width: '50%', height: '1.1rem', marginBottom: '1rem', opacity: 0.7 }} />
    <SkeletonElement style={{ width: '80%', height: '1rem', marginBottom: '0.5rem', opacity: 0.5 }} />
    <SkeletonElement style={{ width: '75%', height: '1rem', opacity: 0.5 }} />
  </div>
);


interface DeliveryVaultProps {
  details: PackageDetails;
  setPackageDetails: React.Dispatch<React.SetStateAction<PackageDetails | null>>;
}

const DeliveryVault: React.FC<DeliveryVaultProps> = ({ details, setPackageDetails }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { deliveryEvidence } = details;

    useEffect(() => {
        const performAnalysis = async () => {
            if (deliveryEvidence && deliveryEvidence.photo && deliveryEvidence.signature && !deliveryEvidence.aiAnalysis) {
                setIsLoading(true);
                setError(null);
                try {
                    const analysis = await analyzeDeliveryEvidence({
                        photo: deliveryEvidence.photo,
                        signature: deliveryEvidence.signature,
                    });
                    
                    // Update the main packageDetails state with the new analysis
                    setPackageDetails(prevDetails => {
                        if (!prevDetails) return null;
                        return {
                            ...prevDetails,
                            deliveryEvidence: {
                                ...prevDetails.deliveryEvidence,
                                aiAnalysis: analysis,
                            }
                        };
                    });

                } catch (e: any) {
                    setError(e.message || "An error occurred during AI analysis.");
                } finally {
                    setIsLoading(false);
                }
            }
        };
        performAnalysis();
    }, [deliveryEvidence, setPackageDetails]);

    if (!deliveryEvidence || (!deliveryEvidence.photo && !deliveryEvidence.signature && !deliveryEvidence.audio)) {
        return (
            <div className="delivery-vault-container">
                <h3>No Delivery Evidence Available</h3>
                <p>Delivery confirmation has not yet been provided for this shipment.</p>
            </div>
        );
    }
    
    return (
        <div className="delivery-vault-container">
            <h3>Verified Delivery Evidence</h3>
            <div className="evidence-grid">
                {deliveryEvidence.photo && (
                    <div className="evidence-item">
                        <h4>Delivery Photo</h4>
                        <img src={deliveryEvidence.photo} alt="Delivery confirmation" />
                    </div>
                )}
                {deliveryEvidence.signature && (
                    <div className="evidence-item">
                        <h4>Recipient Signature</h4>
                        <img src={deliveryEvidence.signature} alt="Recipient signature" />
                    </div>
                )}
                {deliveryEvidence.audio && (
                     <div className="evidence-item">
                        <h4>Voice Confirmation</h4>
                        <audio src={deliveryEvidence.audio} controls />
                    </div>
                )}
            </div>

            <div className="ai-analysis-section">
                <h3 className="ai-analysis-title">
                    <Icon name="shield-check" /> AI Verification Summary
                </h3>
                {isLoading && <AIAnalysisSkeleton />}
                {error && <p style={{color: '#ef4444'}}>{error}</p>}
                {deliveryEvidence.aiAnalysis && (
                    <div>
                        <p className="ai-analysis-summary">
                           "{deliveryEvidence.aiAnalysis.summary}"
                        </p>
                        <h4>Verification Points:</h4>
                        <ul className="verification-list">
                            {deliveryEvidence.aiAnalysis.verificationPoints.map((point, index) => (
                                <li key={index} className="verification-item">
                                    <Icon name="check-circle" className="icon" />
                                    <span><strong>{point.key}:</strong> {point.value}</span>
                                </li>
                            ))}
                            <li className="verification-item">
                                <Icon name="check-circle" className="icon" />
                                <span><strong>Confidence Score:</strong> {deliveryEvidence.aiAnalysis.confidence}%</span>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeliveryVault;