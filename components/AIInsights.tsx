import React, { useState } from 'react';
import { TrackingEvent } from '../types';
import { summarizeShipmentJourney } from '../services/geminiService';
import Icon from './Icon';
import Loader from './Loader';

interface AIInsightsProps {
  history: TrackingEvent[];
}

const AIInsights: React.FC<AIInsightsProps> = ({ history }) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGetSummary = async () => {
    setIsLoading(true);
    try {
      const result = await summarizeShipmentJourney(history);
      setSummary(result);
    } catch (error) {
      console.error(error);
      setSummary("Failed to generate summary.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="sidebar-section">
      <h4 className="sidebar-section-title">
         <Icon name="package" className="title-icon" />
         <span>AI Insights</span>
      </h4>
      <div className="ai-insights-content">
        {isLoading ? (
          <Loader />
        ) : summary ? (
          <p className="ai-insights-summary">{summary}</p>
        ) : (
          <button
            className="ai-insights-button"
            onClick={handleGetSummary}
            disabled={isLoading}
          >
            Get AI Summary of Journey
          </button>
        )}
      </div>
    </section>
  );
};

export default AIInsights;
