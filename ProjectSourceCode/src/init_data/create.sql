DROP TABLE IF EXISTS users;
CREATE TABLE users (
  username VARCHAR(50) PRIMARY KEY,
  email VARCHAR(60) NOT NULL,
  password VARCHAR(60) NOT NULL
);


DROP TABLE IF EXISTS reviews;
CREATE TABLE reviews (
  review_id SERIAL PRIMARY KEY,
  username VARCHAR(50) REFERENCES users(username),
  review TEXT,
  date_posted DATE NOT NULL,
  rating DECIMAL NOT NULL
);

DROP TABLE IF EXISTS images;
CREATE TABLE images (
  image_id SERIAL PRIMARY KEY,
  image_url VARCHAR(50) NOT NULL,
  image_cap VARCHAR(100) NOT NULL
);

DROP TABLE IF EXISTS mountains;
CREATE TABLE mountains (
  mountain_id SERIAL PRIMARY KEY,
  mountain_name VARCHAR(100) NOT NULL,
  location_name VARCHAR(100) NOT NULL,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  avg_rating DECIMAL NOT NULL,
  peak_elevation INT NOT NULL,
  nws_zone VARCHAR(10)
);

DROP TABLE IF EXISTS mountains;
CREATE TABLE mountains (
  mountain_id SERIAL PRIMARY KEY,
  mountain_name VARCHAR(100) NOT NULL,
  location_name VARCHAR(100) NOT NULL,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  pass VARCHAR(100) NOT NULL,
  avg_rating DECIMAL NOT NULL,
  peak_elevation INT NOT NULL,
  nws_zone VARCHAR(10),
  forecast_office VARCHAR(3),
  grid_x INTEGER,
  grid_y INTEGER
);

DROP TABLE IF EXISTS weather;
CREATE TABLE weather (
  nws_zone VARCHAR(10),
  observation_time TIMESTAMP NOT NULL,
  temperature DECIMAL,
  pressure DECIMAL,
  humidity DECIMAL,
  description VARCHAR(100),
  max_temp_last_24_hours DECIMAL,
  min_temp_last_24_hours DECIMAL,
  precipitation_last_hour DECIMAL,
  precipitation_last_3_hours DECIMAL,
  precipitation_last_6_hours DECIMAL,
  wind_speed DECIMAL,
  wind_gust DECIMAL,
  wind_direction INTEGER,
  PRIMARY KEY(nws_zone, observation_time)
);

DROP TABLE IF EXISTS reviews_to_images;
CREATE TABLE reviews_to_images (
  review_id INT NOT NULL,
  image_id INT NOT NULL
);

DROP TABLE IF EXISTS mountains_to_images;
CREATE TABLE mountains_to_images (
  mountain_id INT NOT NULL,
  image_id INT NOT NULL
);

DROP TABLE IF EXISTS mountains_to_reviews;
CREATE TABLE mountains_to_reviews (
  mountain_id INT NOT NULL,
  review_id INT NOT NULL
);

DROP TABLE IF EXISTS mountains_to_passes;
CREATE TABLE mountains_to_passes (
  mountain_id INT NOT NULL,
  pass_id INT NOT NULL
);

DROP TABLE IF EXISTS passes;
CREATE TABLE passes (
  pass_id SERIAL PRIMARY KEY,
  pass_name VARCHAR(50)
);
