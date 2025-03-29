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
  pass VARCHAR(100) NOT NULL,
  avg_rating DECIMAL NOT NULL,
  peak_elevation INT NOT NULL
);

DROP TABLE IF EXISTS mountains_to_images;
CREATE TABLE mountains_to_images (
  mountain_id INT NOT NULL,
  image_id INT NOT NULL
);

DROP TABLE IF EXISTS reviews_to_images;
CREATE TABLE reviews_to_images (
  review_id INT NOT NULL,
  image_id INT NOT NULL
);

DROP TABLE IF EXISTS mountains_to_reviews;
CREATE TABLE mountains_to_reviews (
  mountain_id INT NOT NULL,
  review_id INT NOT NULL
);