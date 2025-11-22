import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import DOMPurify from 'dompurify';

/**
 * Middleware to handle validation errors
 */
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export const sanitizeHtml = (content: string): string => {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: []
  });
};

/**
 * Validation rules for calendar creation
 */
export const validateCalendarCreation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters')
    .customSanitizer(sanitizeHtml),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters')
    .customSanitizer(sanitizeHtml),

  body('year')
    .isInt({ min: 2024, max: 2030 })
    .withMessage('Year must be between 2024 and 2030'),

  body('theme')
    .optional()
    .isIn(['snow', 'forest', 'candy', 'stars'])
    .withMessage('Invalid theme selection')
];

/**
 * Validation rules for calendar day updates
 */
export const validateCalendarDayUpdate = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters')
    .customSanitizer(sanitizeHtml),

  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters')
    .customSanitizer(sanitizeHtml),

  body('photo_url')
    .optional()
    .isURL()
    .withMessage('Photo URL must be a valid URL'),

  body('text_content')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Text content must be less than 2000 characters')
    .customSanitizer(sanitizeHtml)
];

/**
 * Validation rules for chat messages
 */
export const validateChatMessage = [
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters')
    .customSanitizer(sanitizeHtml)
];

/**
 * Validation rules for YouTube URLs
 */
export const validateYouTubeUrls = [
  body('youtube_urls')
    .isArray({ min: 0, max: 10 })
    .withMessage('YouTube URLs must be an array with maximum 10 items'),

  body('youtube_urls.*')
    .isURL()
    .withMessage('Each YouTube URL must be a valid URL')
    .matches(/^https:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)/)
    .withMessage('URL must be a valid YouTube URL')
];

/**
 * Validation rules for child profile updates
 */
export const validateChildProfileUpdate = [
  body('child_name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Child name must be between 1 and 100 characters')
    .customSanitizer(sanitizeHtml),

  body('display_name')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Display name must be less than 50 characters')
    .customSanitizer(sanitizeHtml),

  body('chat_persona')
    .isIn(['mummy', 'daddy', 'custom'])
    .withMessage('Chat persona must be mummy, daddy, or custom'),

  body('custom_persona_prompt')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Custom persona prompt must be less than 1000 characters')
    .customSanitizer(sanitizeHtml),

  body('theme')
    .isIn(['snow', 'forest', 'candy', 'stars'])
    .withMessage('Theme must be snow, forest, candy, or stars')
];

/**
 * General input sanitization middleware
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Recursively sanitize string values in request body
  const sanitizeObject = (obj: unknown): unknown => {
    if (typeof obj === 'string') {
      return sanitizeHtml(obj);
    } else if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    } else if (obj && typeof obj === 'object') {
      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  next();
};