-- Users table
CREATE TABLE IF NOT EXISTS users (
    username VARCHAR(50) PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(60) NOT NULL
);

-- Mountains table
CREATE TABLE IF NOT EXISTS mountains (
    mountain_id SERIAL PRIMARY KEY,
    mountain_name VARCHAR(100) NOT NULL,
    location_name VARCHAR(100),
    latitude FLOAT,
    longitude FLOAT,
    peak_elevation INT,
    avg_rating FLOAT,
    nws_zone VARCHAR(20)
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    review_id SERIAL PRIMARY KEY,
    username VARCHAR(50) REFERENCES users(username) ON DELETE CASCADE,
    review TEXT,
    date_posted TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    rating FLOAT
);

-- Join table: mountain to review (many-to-many)
CREATE TABLE IF NOT EXISTS mountains_to_reviews (
    mountain_id INT REFERENCES mountains(mountain_id) ON DELETE CASCADE,
    review_id INT REFERENCES reviews(review_id) ON DELETE CASCADE,
    PRIMARY KEY (mountain_id, review_id)
);

-- Images table
CREATE TABLE IF NOT EXISTS images (
    image_id SERIAL PRIMARY KEY,
    url TEXT
);

-- Join table: reviews to images
CREATE TABLE IF NOT EXISTS reviews_to_images (
    review_id INT REFERENCES reviews(review_id) ON DELETE CASCADE,
    image_id INT REFERENCES images(image_id) ON DELETE CASCADE,
    PRIMARY KEY (review_id, image_id)
);

-- Weather cache table
CREATE TABLE IF NOT EXISTS weather (
    nws_zone VARCHAR(20),
    observation_time TIMESTAMP,
    temperature FLOAT,
    pressure FLOAT,
    humidity FLOAT,
    description TEXT,
    max_temp_last_24_hours FLOAT,
    min_temp_last_24_hours FLOAT,
    precipitation_last_hour FLOAT,
    precipitation_last_3_hours FLOAT,
    precipitation_last_6_hours FLOAT,
    wind_speed FLOAT,
    wind_gust FLOAT,
    wind_direction FLOAT
);
