-- Drop the unique index on rank (it should be unique per discipline, not globally)
DROP INDEX IF EXISTS belt_levels_rank_key;

-- Create a proper unique index on discipline + rank
CREATE UNIQUE INDEX IF NOT EXISTS belt_levels_discipline_rank_key ON belt_levels(discipline, rank);

-- Insert discipline-specific belt levels
-- Taekwondo
INSERT INTO belt_levels (discipline, color, rank, min_age, min_sessions, requirements) VALUES
  ('Taekwondo', 'White', 1, 5, 0, '[]'::jsonb),
  ('Taekwondo', 'Yellow', 2, 6, 12, '[]'::jsonb),
  ('Taekwondo', 'Green', 3, 7, 24, '[]'::jsonb),
  ('Taekwondo', 'Blue', 4, 8, 40, '[]'::jsonb),
  ('Taekwondo', 'Red', 5, 10, 60, '[]'::jsonb),
  ('Taekwondo', 'Black', 6, 12, 90, '[]'::jsonb)
ON CONFLICT (discipline, rank) DO NOTHING;

-- Karate
INSERT INTO belt_levels (discipline, color, rank, min_age, min_sessions, requirements) VALUES
  ('Karate', 'White', 1, 5, 0, '[]'::jsonb),
  ('Karate', 'Yellow', 2, 6, 12, '[]'::jsonb),
  ('Karate', 'Orange', 3, 7, 20, '[]'::jsonb),
  ('Karate', 'Green', 4, 8, 32, '[]'::jsonb),
  ('Karate', 'Blue', 5, 9, 48, '[]'::jsonb),
  ('Karate', 'Brown', 6, 11, 72, '[]'::jsonb),
  ('Karate', 'Black', 7, 14, 100, '[]'::jsonb)
ON CONFLICT (discipline, rank) DO NOTHING;

-- Kickboxing
INSERT INTO belt_levels (discipline, color, rank, min_age, min_sessions, requirements) VALUES
  ('Kickboxing', 'White', 1, 6, 0, '[]'::jsonb),
  ('Kickboxing', 'Yellow', 2, 7, 12, '[]'::jsonb),
  ('Kickboxing', 'Green', 3, 8, 24, '[]'::jsonb),
  ('Kickboxing', 'Blue', 4, 9, 40, '[]'::jsonb),
  ('Kickboxing', 'Brown', 5, 11, 60, '[]'::jsonb),
  ('Kickboxing', 'Black', 6, 14, 90, '[]'::jsonb)
ON CONFLICT (discipline, rank) DO NOTHING;

-- BJJ (with stripe support)
INSERT INTO belt_levels (discipline, color, rank, min_age, min_sessions, requirements) VALUES
  ('BJJ', 'White', 1, 16, 0, '[]'::jsonb),
  ('BJJ', 'Blue', 2, 16, 100, '[]'::jsonb),
  ('BJJ', 'Purple', 3, 16, 200, '[]'::jsonb),
  ('BJJ', 'Brown', 4, 18, 300, '[]'::jsonb),
  ('BJJ', 'Black', 5, 19, 400, '[]'::jsonb)
ON CONFLICT (discipline, rank) DO NOTHING;

-- Grappling
INSERT INTO belt_levels (discipline, color, rank, min_age, min_sessions, requirements) VALUES
  ('Grappling', 'White', 1, 16, 0, '[]'::jsonb),
  ('Grappling', 'Blue', 2, 16, 100, '[]'::jsonb),
  ('Grappling', 'Purple', 3, 16, 200, '[]'::jsonb),
  ('Grappling', 'Brown', 4, 18, 300, '[]'::jsonb),
  ('Grappling', 'Black', 5, 19, 400, '[]'::jsonb)
ON CONFLICT (discipline, rank) DO NOTHING;

-- Set up next_level_id references for each discipline
UPDATE belt_levels t SET next_level_id = (
  SELECT n.id FROM belt_levels n 
  WHERE n.discipline = t.discipline AND n.rank = t.rank + 1
);

-- Insert discipline levels for non-belt disciplines
INSERT INTO discipline_levels (discipline, level_name, level_order, description) VALUES
  ('Boxing', 'Beginner', 1, 'Foundation training'),
  ('Boxing', 'Intermediate', 2, 'Technique development'),
  ('Boxing', 'Advanced', 3, 'Sparring and strategy'),
  ('Boxing', 'Competition', 4, 'Fight preparation'),
  ('MMA', 'Foundation', 1, 'Basic striking and grappling'),
  ('MMA', 'Intermediate', 2, 'Combination training'),
  ('MMA', 'Advanced', 3, 'Full MMA integration'),
  ('MMA', 'Fighter', 4, 'Competition ready'),
  ('Self-Defense', 'Awareness', 1, 'Situational awareness'),
  ('Self-Defense', 'Basic Defense', 2, 'Core defensive techniques'),
  ('Self-Defense', 'Advanced Defense', 3, 'Complex scenarios'),
  ('Self-Defense', 'Instructor', 4, 'Teaching capability'),
  ('Fitness', 'Starter', 1, 'Getting started'),
  ('Fitness', 'Active', 2, 'Regular training'),
  ('Fitness', 'Fit', 3, 'Peak performance'),
  ('Fitness', 'Elite', 4, 'Elite athlete'),
  ('Fat Loss', 'Week 1-4', 1, 'Initial phase'),
  ('Fat Loss', 'Week 5-8', 2, 'Building phase'),
  ('Fat Loss', 'Week 9-12', 3, 'Transformation phase'),
  ('Fat Loss', 'Maintenance', 4, 'Long-term maintenance'),
  ('Kalaripayattu', 'Meythari', 1, 'Body conditioning'),
  ('Kalaripayattu', 'Kolthari', 2, 'Wooden weapons'),
  ('Kalaripayattu', 'Ankathari', 3, 'Metal weapons'),
  ('Kalaripayattu', 'Verumkai', 4, 'Empty hand combat'),
  ('Kalaripayattu', 'Gurukkal', 5, 'Master instructor')
ON CONFLICT (discipline, level_order) DO NOTHING;