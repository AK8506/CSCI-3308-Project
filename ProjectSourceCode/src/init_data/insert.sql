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
    ),
    (
        'test2', 'I love this place', '2023-01-04', 5.0
    ),
    (
        'test1', 'Not much snow unfortunately', '2023-05-04', 2.2
    );

INSERT INTO mountains
    (mountain_name, location_name, latitude, longitude, avg_rating, peak_elevation)
    VALUES
    (
        'TestMT', 'Testing City', 45, -116, 'Epic', 3.5, 12000
    ),
    (
        'TestMT2', 'Testing City2', 36.01, -106.7, 'Ikon', 4.2, 15000

    );

INSERT INTO images
    (image_url, image_cap)
    VALUES
    (
        'testing.com', 'Testing image'
    ),
    (
        'testing2.com', 'Testing image2'
    ),
    (
        'testing3.com', 'Testing image3'
    ),
    (
        'testing4.com', 'Testing image4'
    );

INSERT INTO mountains_to_reviews
    (mountain_id, review_id)
    VALUES
    (
        1, 1
    ),
    (
        1,2
    ),
    (
        2,3
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

    ),
    (
        2, 3
    ),
    (
        1, 2
    );   


INSERT INTO passes 
    (pass_name)
    VALUES
    (
        'Test pass 1'
    ),
    (
        'Test pass 2'
    );

INSERT INTO mountains_to_passes 
    (mountain_id, pass_id)
    VALUES
    (
        1,1
    );

