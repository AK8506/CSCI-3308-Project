
INSERT INTO mountains
    (mountain_name, location_name, latitude, longitude, avg_rating, peak_elevation, mountain_image, avg_snow_quality, avg_lift_infrastructure, avg_difficulty)
    VALUES
    (
        'Aspen Mountain', 'Aspen', 39.1875, -106.8167, 0, 11212, 'https://www.aspensnowmass.com/-/media/aspen-snowmass/images/visual-story-row/winter/2024-25/aspen-mountain-town-visual-story-20240801.jpg?mw=1920&mh=1000&hash=487B2120227D2681C6E115E9F49148C2', 0, 0,0
    ),
    (
        'Breckenridge', 'Breckenridge', 39.4817, -106.0384, 0, 12998, 'https://brecknetwork.com/wp-content/uploads/2018/03/BreckWinterOverview-AlexNeuschaefer-1-1.jpg', 0, 0,0
    ),
    (
        'Vail', 'Vail', 39.6403, -106.3742, 0, 11570, 'https://scene7.vailresorts.com/is/image/vailresorts/20220204_VL_DUNN_02:Large-Hero?resMode=sharp2&w=2880&h=900&wid=412&fit=vfit,1&hei=309&dpr=on,2.625', 0, 0,0
    ),
    (
        'Keystone', 'Keystone', 39.5792, -105.9347, 0, 12408, 'https://scoutski.com/proc-images/w720-h382-c720x382/assets/uploads/location/image/65/Keystone%20Ski%20Resort.jpg', 0, 0,0
    ),
    (
        'Copper Mountain', 'Copper Mountain', 39.5022, -106.1511, 0, 12313, 'https://images.squarespace-cdn.com/content/v1/6255e8aebe87e470fdd12049/f6ce3cab-d11c-4807-8d17-e33028394609/Copper-Mountain.jpeg', 0, 0,0
    ),
    (
        'Steamboat', 'Steamboat Springs', 40.4850, -106.8317, 0, 10568, 'https://cdn.sanity.io/images/tk10onam/production/f99a9e5228738591173ee24b0d11fcc26498324e-4928x3280.jpg', 0, 0,0
    ),
    (
        'Telluride', 'Telluride', 37.9375, -107.8123, 0, 13150, 'https://www.telluride.com/site/assets/files/43286/dsc02434_rb-2000x1333-a2545d65-8165-422a-9be7-d83e5db6efc4.1400x1097.webp', 0, 0,0
    ),
    (
        'Winter Park', 'Winter Park', 39.8917, -105.7631, 0, 12060, 'https://bloximages.newyork1.vip.townnews.com/gazette.com/content/tncms/assets/v3/editorial/4/97/497df90a-e7c4-5081-9359-69bc6224068b/5b373a875e1ec.image.jpg?crop=1799%2C1012%2C0%2C0', 0, 0,0
    ),
    (
        'Crested Butte', 'Crested Butte', 38.8990, -106.9659, 0, 12162, 'https://travelcrestedbutte.com/wp-content/uploads/IMG_0256.jpg', 0, 0,0
    ),
    (
        'Arapahoe Basin', 'Dillon', 39.6425, -105.8719, 0, 13050, 'https://upload.wikimedia.org/wikipedia/commons/9/91/Eastwall.jpg', 0, 0,0
    );


INSERT INTO passes
    (pass_name)
    VALUES
    (
        'Ikon Pass'
    ),
    (
        'Epic Pass'
    ),
    (
        'Mountain Collective'
    );

-- reference the following sites for passes:
-- https://www.epicpass.com/
-- https://www.ikonpass.com/
-- https://mountaincollective.com/

INSERT INTO mountains_to_passes
    (mountain_id, pass_id)
    VALUES
    (
        1, 1 -- Ikon Pass at Aspen Mountain
    ),
    (
        1, 3 -- Mountain Collective at Aspen Mountain
    ),
    (
        2, 2 -- Epic Pass at Breckenridge
    ),
    (
        3, 2 -- Epic Pass at Vail
    ),
    (
        7, 2 -- Epic Pass at Telluride
    ),
    (
        5, 1 -- Ikon Pass at Copper Mountain
    ),
    (
        6, 1 -- Ikon Pass at Steamboat
    ),
    (
        8, 1 -- Ikon Pass at Winter Park
    ),
    (
        10, 1 -- Ikon Pass at Arapahoe Basin
    ),
    (
        4, 2 -- Epic Pass at Keystone
    ),
    (
        9, 2 -- Epic Pass at Crested Butte
    );

