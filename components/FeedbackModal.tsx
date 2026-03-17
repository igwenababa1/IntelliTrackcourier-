import React, { useState, useEffect } from 'react';
import Icon from './Icon';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: { rating: number; category: string; comment: string }) => Promise<void>;
}

type Category = 'Bug Report' | 'Feature Request' | 'General Comment' | 'Praise';

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState<Category | ''>('');
  const [comment, setComment] = useState('');
  const [submissionState, setSubmissionState] = useState<'idle' | 'submitting' | 'submitted'>('idle');

  useEffect(() => {
    // Reset form when modal is opened
    if (isOpen) {
      setRating(0);
      setCategory('');
      setComment('');
      setSubmissionState('idle');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !category || !comment.trim()) {
      alert('Please fill out all fields.');
      return;
    }

    setSubmissionState('submitting');
    await onSubmit({ rating, category, comment });
    setSubmissionState('submitted');

    setTimeout(() => {
      onClose();
    }, 2000); // Close modal after 2 seconds
  };

  if (!isOpen) {
    return null;
  }
  
  const StarIcon = ({ size = 28 }: { size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  );

  return (
    <div className="feedback-modal-overlay" onClick={onClose}>
      <div className="feedback-modal-content" onClick={(e) => e.stopPropagation()}>
        {submissionState === 'submitted' ? (
           <div className="feedback-thank-you">
                <div className="icon"><Icon name="check-circle" style={{ width: 60, height: 60 }} /></div>
                <h3>Thank You!</h3>
                <p>Your feedback has been submitted and helps us improve.</p>
           </div>
        ) : (
          <>
            <div className="feedback-modal-header">
              <h2 className="feedback-modal-title">Share Your Feedback</h2>
              <button className="feedback-modal-close-button" onClick={onClose} aria-label="Close feedback modal">
                <Icon name="close" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="feedback-form-group">
                <label>How would you rate your experience?</label>
                <div 
                    className="feedback-rating-stars"
                    onMouseLeave={() => setHoverRating(0)}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={(hoverRating || rating) >= star ? 'active' : ''}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                    >
                      <StarIcon />
                    </button>
                  ))}
                </div>
              </div>

              <div className="feedback-form-group">
                <label>What is your feedback about?</label>
                <div className="feedback-category-options">
                  {(['Bug Report', 'Feature Request', 'General Comment', 'Praise'] as Category[]).map(cat => (
                      <button
                        key={cat}
                        type="button"
                        className={category === cat ? 'selected' : ''}
                        onClick={() => setCategory(cat)}
                      >{cat}</button>
                  ))}
                </div>
              </div>

              <div className="feedback-form-group">
                <label>Please provide more details:</label>
                <textarea
                  className="feedback-textarea"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us what you think..."
                  required
                />
              </div>

              <button
                type="submit"
                className="feedback-submit-button"
                disabled={submissionState === 'submitting'}
              >
                {submissionState === 'submitting' ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;