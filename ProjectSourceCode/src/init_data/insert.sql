INSERT INTO users
    (username, email, password)
    VALUES
    (
        'test1', 'test1@gmail.com', 'wheeeeee'
    ), 
    (
        'test2', 'test2@gmail.com', 'wheeeeee2222'
    );


INSERT INTO reviews 
    (username, review, date_posted, rating)
    VALUES 
    (
        'test1', 'Pretty good test run here at this mountain', '2022-07-22', 4.5
    );

INSERT INTO mountains
    (mountain_name, location_name, latitude, longitude, pass, avg_rating, peak_elevation)
    VALUES
    (
        'TestMT', 'Testing City', 31.11, 32.011, 'Epic', 3.5, 12000
    );

INSERT INTO images
    (image_url, image_cap)
    VALUES
    (
        'testing.com', 'Testing image'
    );

INSERT INTO mountains_to_reviews
    (mountain_id, review_id)
    VALUES
    (
        1, 1
    );   

INSERT INTO mountains_to_images
    (mountain_id, image_id)
    VALUES
    (
        0, 2
    );   


INSERT INTO reviews_to_images
    (review_id, image_id)
    VALUES
    (
        2, 4
    );   

INSERT INTO passes 
    (pass_name)
    VALUES
    (
        'Test pass 1'
    );

INSERT INTO mountains_to_passes 
    (mountain_id, pass_id)
    VALUES
    (
        1,1
    );