-- sql/create_schema.sql

-- Set up the categories table
-- This table stores the different joke categories (e.g., "Funny", "Lame", "Tech").
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- Set up the jokes table
-- This table stores the actual joke text and links it to a category.
CREATE TABLE IF NOT EXISTS jokes (
    id SERIAL PRIMARY KEY,
    joke_text TEXT NOT NULL,
    category_id INTEGER NOT NULL REFERENCES categories(id)
);
-- Insert default categories into the categories table
-- This ensures the application has some categories to work with immediately.
INSERT INTO categories (name)
VALUES 
    ('Funny Joke'), 
    ('Lame Joke'),
    ('Tech Joke')
ON CONFLICT (name) DO NOTHING; -- Prevents re-insertion if the categories already exist