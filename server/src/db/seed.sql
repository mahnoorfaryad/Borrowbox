-- Sample data for BorrowBox
-- Password for every seeded user is: Password123
-- (hash below corresponds to bcrypt of "Password123", 10 rounds)

INSERT INTO users (name, email, password_hash, phone, area, role) VALUES
('Admin User', 'admin@borrowbox.app', '$2b$10$NOshIj7QYxwZFb4e2R0GTe4agka7aWeLp/29TtcUMF574Rz9C3d8S', '0300-0000000', 'City Center', 'admin'),
('Ali Khan', 'ali@borrowbox.app', '$2b$10$NOshIj7QYxwZFb4e2R0GTe4agka7aWeLp/29TtcUMF574Rz9C3d8S', '0301-1111111', 'Block B, DHA', 'member'),
('Sara Ahmed', 'sara@borrowbox.app', '$2b$10$NOshIj7QYxwZFb4e2R0GTe4agka7aWeLp/29TtcUMF574Rz9C3d8S', '0302-2222222', 'Gulberg', 'member'),
('Bilal Raza', 'bilal@borrowbox.app', '$2b$10$NOshIj7QYxwZFb4e2R0GTe4agka7aWeLp/29TtcUMF574Rz9C3d8S', '0303-3333333', 'Johar Town', 'member');

INSERT INTO categories (name) VALUES
('Power Tools'), ('Home & Garden'), ('Electronics'), ('Kitchen'), ('Sports & Outdoor');

INSERT INTO items (owner_id, category_id, title, description, condition, max_days, pickup_area, image_url) VALUES
(2, 1, 'Cordless Drill 18V', '18V cordless drill with two batteries, charger and a set of bits. Please return charged and clean.', 'good', 5, 'Block B, DHA', ''),
(2, 2, 'Extension Ladder 12ft', 'Sturdy aluminium ladder, great for painting or gutter cleaning.', 'good', 3, 'Block B, DHA', ''),
(3, 3, 'HD Projector', '1080p home projector with HDMI cable and remote.', 'new', 7, 'Gulberg', ''),
(3, 3, 'DSLR Camera Kit', 'Canon DSLR with 18-55mm lens, extra battery and 32GB SD card.', 'good', 4, 'Gulberg', ''),
(4, 5, 'Camping Tent (4P)', '4-person waterproof tent, easy setup, includes stakes and rainfly.', 'fair', 6, 'Johar Town', ''),
(4, 3, 'Bluetooth Speaker', 'Portable speaker, 12h battery life, great sound.', 'good', 3, 'Johar Town', '');
