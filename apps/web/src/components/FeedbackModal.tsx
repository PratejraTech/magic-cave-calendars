import React, { useState } from 'react';
import { Modal } from './ui/modal';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Star, MessageSquare, Lightbulb, Bug, Send } from 'lucide-react';

export type FeedbackType = 'rating' | 'comment' | 'suggestion' | 'bug_report' | 'feature_request';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: {
    type: FeedbackType;
    content: string;
    rating?: number;
    productId?: string;
    templateId?: string;
  }) => Promise<void>;
  productId?: string;
  templateId?: string;
  title?: string;
  trigger?: React.ReactNode;
}

const feedbackTypes = [
  {
    value: 'rating' as FeedbackType,
    label: 'Rate Experience',
    icon: Star,
    description: 'How would you rate your experience?',
  },
  {
    value: 'comment' as FeedbackType,
    label: 'General Comment',
    icon: MessageSquare,
    description: 'Share your thoughts or feedback',
  },
  {
    value: 'suggestion' as FeedbackType,
    label: 'Suggestion',
    icon: Lightbulb,
    description: 'Suggest an improvement or new feature',
  },
  {
    value: 'bug_report' as FeedbackType,
    label: 'Report Issue',
    icon: Bug,
    description: 'Report a problem or bug you encountered',
  },
  {
    value: 'feature_request' as FeedbackType,
    label: 'Feature Request',
    icon: Send,
    description: 'Request a new feature or enhancement',
  },
];

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  productId,
  templateId,
  title = 'Share Your Feedback',
}) => {
  const [selectedType, setSelectedType] = useState<FeedbackType>('comment');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState<number | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        type: selectedType,
        content: content.trim(),
        rating: selectedType === 'rating' ? rating : undefined,
        productId,
        templateId,
      });

      // Reset form
      setContent('');
      setRating(undefined);
      setSelectedType('comment');
      onClose();
    } catch (error) {
      // Error handled silently - could show user notification
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setContent('');
      setRating(undefined);
      setSelectedType('comment');
      onClose();
    }
  };

  const renderRatingInput = () => {
    if (selectedType !== 'rating') return null;

    return (
      <div className="space-y-3">
        <Label className="text-sm font-medium">Rate your experience (1-5 stars)</Label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`p-1 rounded-full transition-colors ${
                rating && star <= rating
                  ? 'text-yellow-400 hover:text-yellow-500'
                  : 'text-gray-300 hover:text-yellow-400'
              }`}
            >
              <Star className="w-6 h-6 fill-current" />
            </button>
          ))}
        </div>
        {rating && (
          <p className="text-sm text-gray-600">
            {rating === 1 && 'Poor'}
            {rating === 2 && 'Fair'}
            {rating === 3 && 'Good'}
            {rating === 4 && 'Very Good'}
            {rating === 5 && 'Excellent'}
          </p>
        )}
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="md"
    >
      <div className="space-y-6">
        {/* Feedback Type Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">What type of feedback do you have?</Label>
          <RadioGroup value={selectedType} onValueChange={(value) => setSelectedType(value as FeedbackType)}>
            <div className="grid gap-3">
              {feedbackTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <div key={type.value} className="flex items-center space-x-3">
                    <RadioGroupItem value={type.value} id={type.value} />
                    <Label
                      htmlFor={type.value}
                      className="flex items-center space-x-3 cursor-pointer flex-1"
                    >
                      <Icon className="w-4 h-4 text-gray-500" />
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-gray-500">{type.description}</div>
                      </div>
                    </Label>
                  </div>
                );
              })}
            </div>
          </RadioGroup>
        </div>

        {/* Rating Input (for rating type) */}
        {renderRatingInput()}

        {/* Content Input */}
        <div className="space-y-2">
          <Label htmlFor="feedback-content" className="text-sm font-medium">
            {selectedType === 'rating' ? 'Additional comments (optional)' : 'Your feedback'}
          </Label>
          <Textarea
            id="feedback-content"
            placeholder={
              selectedType === 'rating'
                ? 'Tell us more about your experience...'
                : selectedType === 'bug_report'
                ? 'Describe the issue you encountered...'
                : selectedType === 'suggestion'
                ? 'Describe your suggestion...'
                : selectedType === 'feature_request'
                ? 'What feature would you like to see?'
                : 'Share your thoughts...'
            }
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="resize-none"
            required={selectedType !== 'rating'}
          />
          <p className="text-xs text-gray-500">
            {content.length}/5000 characters
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              !content.trim() ||
              (selectedType === 'rating' && !rating)
            }
            className="flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Feedback
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};