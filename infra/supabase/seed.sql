-- Development seed data for Magic Cave Calendars
-- This file is loaded automatically when the Supabase container starts

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Insert development accounts
INSERT INTO account (id, email, name, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'parent@example.com', 'Development Parent', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'admin@example.com', 'Admin User', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert development children
INSERT INTO child (id, account_id, name, age, created_at, updated_at) VALUES
('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Alex', 8, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Jamie', 6, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample calendar
INSERT INTO advent_calendar_v2 (id, account_id, child_id, year, title, description, created_at, updated_at) VALUES
('770e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', 2024, 'Alex''s Magic Advent Calendar', 'A magical journey through December', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample calendar days
INSERT INTO calendar_day_v2 (id, calendar_id, day_number, photo_url, text_content, created_at, updated_at) VALUES
('880e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440000', 1, 'https://example.com/photo1.jpg', 'Welcome to your magical advent calendar! Today is the first day of December. What makes you feel magical?', NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440000', 2, 'https://example.com/photo2.jpg', 'Today let''s think about kindness. Who showed you kindness this week?', NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440000', 3, 'https://example.com/photo3.jpg', 'What''s your favorite winter activity? Let''s plan to do it together!', NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440000', 4, 'https://example.com/photo4.jpg', 'Today is about gratitude. What are you thankful for today?', NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440000', 5, 'https://example.com/photo5.jpg', 'Let''s talk about dreams. What do you want to be when you grow up?', NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440000', 6, 'https://example.com/photo6.jpg', 'What makes you laugh? Let''s share our silliest jokes!', NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440000', 7, 'https://example.com/photo7.jpg', 'Today is about family. What''s your favorite family tradition?', NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440007', '770e8400-e29b-41d4-a716-446655440000', 8, 'https://example.com/photo8.jpg', 'What''s your favorite color? Let''s create something with that color!', NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440008', '770e8400-e29b-41d4-a716-446655440000', 9, 'https://example.com/photo9.jpg', 'Today let''s think about helping others. How can we help someone today?', NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440009', '770e8400-e29b-41d4-a716-446655440000', 10, 'https://example.com/photo10.jpg', 'What''s your favorite animal? Tell me why you like it!', NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440010', '770e8400-e29b-41d4-a716-446655440000', 11, 'https://example.com/photo11.jpg', 'Today is about creativity. What would you create if you could make anything?', NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440011', '770e8400-e29b-41d4-a716-446655440000', 12, 'https://example.com/photo12.jpg', 'What makes you feel brave? Let''s talk about courage!', NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440012', '770e8400-e29b-41d4-a716-446655440000', 13, 'https://example.com/photo13.jpg', 'Today is about friendship. Who is your best friend and why?', NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440013', '770e8400-e29b-41d4-a716-446655440000', 14, 'https://example.com/photo14.jpg', 'What''s your favorite food? Let''s imagine a magical feast!', NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440014', '770e8400-e29b-41d4-a716-446655440000', 15, 'https://example.com/photo15.jpg', 'Today let''s talk about stars and dreams. What do you dream about?', NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440015', '770e8400-e29b-41d4-a716-446655440000', 16, 'https://example.com/photo16.jpg', 'What makes you happy? Let''s list all the things that bring us joy!', NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440016', '770e8400-e29b-41d4-a716-446655440000', 17, 'https://example.com/photo17.jpg', 'Today is about music. What''s your favorite song?', NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440017', '770e8400-e29b-41d4-a716-446655440000', 18, 'https://example.com/photo18.jpg', 'What would you do if you could fly? Let''s imagine an adventure!', NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440018', '770e8400-e29b-41d4-a716-446655440000', 19, 'https://example.com/photo19.jpg', 'Today is about love. Who do you love and why?', NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440019', '770e8400-e29b-41d4-a716-446655440000', 20, 'https://example.com/photo20.jpg', 'What''s your favorite game? Let''s play it together!', NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440020', '770e8400-e29b-41d4-a716-446655440000', 21, 'https://example.com/photo21.jpg', 'Today let''s talk about the future. What are you excited about?', NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440021', '770e8400-e29b-41d4-a716-446655440000', 22, 'https://example.com/photo22.jpg', 'What makes you feel peaceful? Let''s find some calm together.', NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440022', '770e8400-e29b-41d4-a716-446655440000', 23, 'https://example.com/photo23.jpg', 'Today is about giving. What would you like to give to someone special?', NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440023', '770e8400-e29b-41d4-a716-446655440000', 24, 'https://example.com/photo24.jpg', 'Merry Christmas! What made this month magical for you?', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample chat memory
INSERT INTO chat_memory (id, account_id, child_id, session_id, message_type, content, created_at) VALUES
('990e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', 'session-001', 'user', 'Hi! I''m excited about my advent calendar!', NOW()),
('990e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', 'session-001', 'assistant', 'That''s wonderful! I''m so excited too. Advent calendars are magical because they help us count down to Christmas while learning and growing together. What''s your favorite part about December so far?', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample analytics events
INSERT INTO analytics_events (id, account_id, child_id, event_type, event_data, created_at) VALUES
('aa0e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', 'calendar_opened', '{"calendar_id": "770e8400-e29b-41d4-a716-446655440000", "day": 1}', NOW()),
('aa0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', 'surprise_opened', '{"calendar_id": "770e8400-e29b-41d4-a716-446655440000", "day": 1}', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample product types
INSERT INTO product_types (id, name, description, base_price, features, created_at, updated_at) VALUES
('bb0e8400-e29b-41d4-a716-446655440000', 'Basic Advent Calendar', 'Simple advent calendar with daily surprises', 29.99, '["24 daily surprises", "Basic customization", "Email delivery"]', NOW(), NOW()),
('bb0e8400-e29b-41d4-a716-446655440001', 'Premium Advent Calendar', 'Enhanced advent calendar with AI personalization', 49.99, '["24 daily surprises", "AI personalization", "Photo integration", "Chat with AI parent", "Premium support"]', NOW(), NOW()),
('bb0e8400-e29b-41d4-a716-446655440002', 'Family Advent Calendar', 'Multi-child family advent calendar', 79.99, '["24 daily surprises", "Up to 3 children", "Family sharing", "AI personalization", "Photo integration", "Chat with AI parent", "Premium support"]', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample templates
INSERT INTO template_catalog (id, name, description, theme, difficulty_level, estimated_completion_time, tags, is_active, created_at, updated_at) VALUES
('cc0e8400-e29b-41d4-a716-446655440000', 'Winter Wonderland', 'A magical winter-themed advent calendar', 'winter', 'easy', 30, '["winter", "snow", "magic", "holiday"]', true, NOW(), NOW()),
('cc0e8400-e29b-41d4-a716-446655440001', 'Space Adventure', 'Explore the cosmos with daily space discoveries', 'space', 'medium', 45, '["space", "stars", "adventure", "science"]', true, NOW(), NOW()),
('cc0e8400-e29b-41d4-a716-446655440002', 'Animal Friends', 'Meet adorable animals from around the world', 'animals', 'easy', 25, '["animals", "nature", "cute", "educational"]', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Development seed data loaded successfully!';
END $$;