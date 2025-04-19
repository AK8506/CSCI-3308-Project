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
        'test1', 'Not much snow unfortunately', '2023-05-04', 2.5
    );

INSERT INTO mountains
    (mountain_name, location_name, latitude, longitude, avg_rating, peak_elevation, mountain_image)
    VALUES
    (
        'TestMT', 'Testing City', 45, -116, 3.5, 12000, 'https://t4.ftcdn.net/jpg/01/30/24/67/360_F_130246761_XVWbg4AGgGu7SlcKi2QPR23J03U710mP.jpg'
    ),
    (
        'TestMT2', 'Testing City2', 36.01, -106.7, 4.2, 15000, 'https://t4.ftcdn.net/jpg/01/30/24/67/360_F_130246761_XVWbg4AGgGu7SlcKi2QPR23J03U710mP.jpg'
    ),
    (
        'Aspen Mountain', 'Aspen', 39.1875, -106.8167, 0, 11212, 'https://www.aspensnowmass.com/-/media/aspen-snowmass/images/visual-story-row/winter/2024-25/aspen-mountain-town-visual-story-20240801.jpg?mw=1920&mh=1000&hash=487B2120227D2681C6E115E9F49148C2'
    ),
    (
        'Breckenridge', 'Breckenridge', 39.4817, -106.0384, 0, 12998, 'https://brecknetwork.com/wp-content/uploads/2018/03/BreckWinterOverview-AlexNeuschaefer-1-1.jpg'
    ),
    (
        'Vail', 'Vail', 39.6403, -106.3742, 0, 11570, 'https://scene7.vailresorts.com/is/image/vailresorts/20220204_VL_DUNN_02:Large-Hero?resMode=sharp2&w=2880&h=900&wid=412&fit=vfit,1&hei=309&dpr=on,2.625'
    ),
    (
        'Keystone', 'Keystone', 39.5792, -105.9347, 0, 12408, 'https://scoutski.com/proc-images/w720-h382-c720x382/assets/uploads/location/image/65/Keystone%20Ski%20Resort.jpg'
    ),
    (
        'Copper Mountain', 'Copper Mountain', 39.5022, -106.1511, 0, 12313, 'https://images.squarespace-cdn.com/content/v1/6255e8aebe87e470fdd12049/f6ce3cab-d11c-4807-8d17-e33028394609/Copper-Mountain.jpeg'
    ),
    (
        'Steamboat', 'Steamboat Springs', 40.4850, -106.8317, 0, 10568, 'https://cdn.sanity.io/images/tk10onam/production/f99a9e5228738591173ee24b0d11fcc26498324e-4928x3280.jpg'
    ),
    (
        'Telluride', 'Telluride', 37.9375, -107.8123, 0, 13150, 'https://www.telluride.com/site/assets/files/43286/dsc02434_rb-2000x1333-a2545d65-8165-422a-9be7-d83e5db6efc4.1400x1097.webp'
    ),
    (
        'Winter Park', 'Winter Park', 39.8917, -105.7631, 0, 12060, 'https://bloximages.newyork1.vip.townnews.com/gazette.com/content/tncms/assets/v3/editorial/4/97/497df90a-e7c4-5081-9359-69bc6224068b/5b373a875e1ec.image.jpg?crop=1799%2C1012%2C0%2C0'
    ),
    (
        'Crested Butte', 'Crested Butte', 38.8990, -106.9659, 0, 12162, 'https://travelcrestedbutte.com/wp-content/uploads/IMG_0256.jpg'
    ),
    (
        'Arapahoe Basin', 'Dillon', 39.6425, -105.8719, 0, 13050, 'https://upload.wikimedia.org/wikipedia/commons/9/91/Eastwall.jpg'
    );

INSERT INTO images
    (image_url, image_cap)
    VALUES
    (
        'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg', 'Testing image'
    ),
    (
        'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg', 'Testing image2'
    ),
    (
        'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg', 'Testing image3'
    ),
    (
        'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg', 'Testing image4'
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
        1, 2
    );   


INSERT INTO reviews_to_images
    (review_id, image_id)
    VALUES
    (
        2, 4
    ),
    (
        3, 3
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
    ),
    (
        'Ikon Pass'
    ),
    (
        'Epic Pass'
    );

-- reference the following sites for passes:
-- https://www.epicpass.com/
-- https://www.ikonpass.com/
-- https://mountaincollective.com/

INSERT INTO mountains_to_passes
    (mountain_id, pass_id)
    VALUES
    (
        1, 1 -- Test pass 1 at TestMT
    ),
    (
        3, 3 -- Ikon Pass at Aspen Mountain
    ),
    (
        4, 4 -- Epic Pass at Breckenridge
    ),
    (
        5, 4 -- Epic Pass at Vail
    ),
    (
        9, 4 -- Epic Pass at Telluride
    ),
    (
        7, 3 -- Ikon Pass at Copper Mountain
    ),
    (
        8, 3 -- Ikon Pass at Steamboat
    ),
    (
        10, 3 -- Ikon Pass at Winter Park
    ),
    (
        12, 3 -- Ikon Pass at Arapahoe Basin
    ),
    (
        6, 4 -- Epic Pass at Keystone
    ),
    (
        11, 4 -- Epic Pass at Crested Butte
    );

