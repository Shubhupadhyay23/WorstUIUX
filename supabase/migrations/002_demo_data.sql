
-- DEMO DATA for CivicFix AI

INSERT INTO users (id, name, email, password_hash, role) VALUES 
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Admin User', 'admin@civicfix.ai', '$2b$10$YourHashedPasswordHere', 'ADMIN'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Jane Citizen', 'jane@example.com', '$2b$10$YourHashedPasswordHere', 'CITIZEN');

INSERT INTO complaints (id, user_id, title, description, location_text, category, severity, priority, department, status) VALUES 
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Pothole near college', 'Huge pothole causing accidents.', 'College North Gate', 'Road Damage', 'HIGH', 8, 'Public Works', 'REPORTED'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Broken streetlight', 'Street is completely dark at night.', 'Main St', 'Streetlight', 'MEDIUM', 5, 'Public Works', 'REPORTED');
