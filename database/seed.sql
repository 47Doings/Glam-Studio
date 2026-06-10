-- Services
INSERT INTO services (name, price, duration_minutes) VALUES
('Haircut & Style', 120.00, 45),
('Full Braids', 200.00, 120),
('Manicure', 80.00, 30),
('Makeup', 150.00, 60),
('Pedicure', 90.00, 40),
('Hair Treatment', 180.00, 90);

-- Stylists
INSERT INTO stylists (name, specialty, working_hours_start, working_hours_end, working_days, status) VALUES
('Abena K.', 'Haircut & Style', '09:00', '17:00', ARRAY['monday','tuesday','wednesday','thursday','friday'], 'active'),
('Efua O.', 'Full Braids', '09:00', '17:00', ARRAY['monday','tuesday','wednesday','thursday','friday'], 'active'),
('Ama M.', 'Makeup', '09:00', '17:00', ARRAY['monday','tuesday','wednesday','thursday','friday'], 'active'),
('Kofi D.', 'Manicure', '09:00', '17:00', ARRAY['monday','tuesday','wednesday','thursday','friday'], 'active'),
('Akua B.', 'Makeup', '09:00', '17:00', ARRAY['monday','tuesday','wednesday','thursday','friday'], 'active'),
('Yaa S.', 'Haircut & Style', '09:00', '17:00', ARRAY['monday','tuesday','wednesday','thursday','friday'], 'active');

-- Stylist services
INSERT INTO stylist_services (stylist_id, service_id) VALUES
(1, 1), -- Abena: Haircut & Style
(1, 6), -- Abena: Hair Treatment
(2, 2), -- Efua: Full Braids
(2, 6), -- Efua: Hair Treatment
(3, 4), -- Ama: Makeup
(4, 3), -- Kofi: Manicure
(4, 5), -- Kofi: Pedicure
(5, 4), -- Akua: Makeup
(5, 6), -- Akua: Hair Treatment
(6, 1), -- Yaa: Haircut & Style
(6, 2); -- Yaa: Full Braids