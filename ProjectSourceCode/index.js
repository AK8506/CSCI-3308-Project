const express = require('express');
const app = express();
const handlebars = require('express-handlebars');
const Handlebars = require('handlebars');
const path = require('path');
const pgp = require('pg-promise')();
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const axios = require('axios'); 
const fs = require('fs');
const multer = require('multer');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true });
	console.log('Created uploads directory');
}

// This allows serving static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const storage = multer.diskStorage({
  destination: function(req, file, cb) {
  cb(null, 'uploads/'); // Destination folder
},

filename: function(req, file, cb) {
// Create unique filename with original extension
 cb(null, Date.now() + '-' + file.originalname);
}
});

// Set up file filter if you want to restrict file types

const fileFilter = (req, file, cb) => {
if (file.mimetype.startsWith('image/')) {
cb(null, true);
} else {
  cb(new Error('Not an image! Please upload only images.'), false);
 }
};

const upload = multer({
storage: storage,
limits: {
   fileSize: 1024 * 1024 * 5 // Limit file size to 5MB
 },
 fileFilter: fileFilter
});


// create `ExpressHandlebars` instance and configure the layouts and partials dir.
const hbs = handlebars.create({
  extname: 'hbs',
  layoutsDir: __dirname + '/src/views/layouts',
  partialsDir: __dirname + '/src/views/partials',
});


// database configuration
const dbConfig = {
  host: 'db', // the database server
  port: 5432, // the database port
  database: process.env.POSTGRES_DB, // the database name
  user: process.env.POSTGRES_USER, // the user account to connect with
  password: process.env.POSTGRES_PASSWORD, // the password of the user account
};

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

const db = pgp(dbConfig);

// test your database
db.connect()
  .then(obj => {
    console.log('Database connection successful'); // you can view this message in the docker compose logs
    obj.done(); // success, release the connection;
  })
  .catch(error => {
    console.log('ERROR:', error.message || error);
  });

// Register hbs as view engine
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'src', 'views'));
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.
app.use(express.static(__dirname + '/'));



app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
// -------------------------------------  ROUTES for home.hbs   ---------------------------------------

app.get('/', (req, res) => {
  res.render('pages/home');
});

app.get('/reviews', (req, res) => {
  const mountain_name = req.query.mountain_name;
  const query = `select * from reviews where review_id in 
    (select review_id from mountains_to_reviews where mountain_id = 
    (select mountain_id from mountains where mountain_name = $1))
    order by date_posted desc;`

  const values = [mountain_name];
  db.any(query, values)
    .then(data => {
      res.status(200).json({
        data: data,
      });
    })
    .catch(err => {
      res.status(400).json({
        error: err,
      });
    });
  });

  
app.get('/review_images', (req, res) => {
  const review_id = req.query.review_id;
  const query = `select * from images where image_id in 
    (select image_id from reviews_to_images where review_id = $1)`

  const values = [review_id];
  db.any(query, values)
    .then(data => {
      res.status(200).json({
        data: data,
      });
    })
    .catch(err => {
      res.status(400).json({
        error: err,
      });
    });
  });


app.get('/weather', (req, res) => {
  // This function gets weather data from our db or from NWS api if cached data is too old.
  var nws_zone = req.query.nws_zone;
  // First get NWS zone from database
  var query = `select * from weather where nws_zone = $1 order by observation_time desc limit 1;`
  var values = [nws_zone];
  db.oneOrNone(query, values)
    .then(data => {
      if (!data){ // no previous observations for this zone
        var diffInMs = Infinity;
      } else {
        var observation_time = new Date(data.observation_time);
        var current_time = new Date();
        console.log(observation_time);
        console.log(current_time);
        var diffInMs = Math.abs(current_time.getTime() - observation_time.getTime());
      }
      if (diffInMs > 1000*60*60){  // stored data is outdated, update it first
        axios({
          url: 'https://api.weather.gov/zones/forecast/' + nws_zone + '/observations?limit=1',
          method: 'GET'
        }).then(results => {
          // Now update weather table
          var observation = results.data.features[0].properties;
          var time = observation.timestamp;
          if ('temperature' in observation){
            var temperature = observation.temperature.value;
          } else {
            var temperature = null;
          }
          if ('windSpeed' in observation){
            var wind_speed = observation.windSpeed.value;
          } else {
            var wind_speed = null;
          }
          if ('windGust' in observation){
            var wind_gust = observation.windGust.value;
          } else {
            var wind_gust = null;
          }
          if ('windDirection' in observation){
            var wind_direction = observation.windDirection.value;
          } else {
            var wind_direction = null;
          }
          if ('barometricPressure' in observation){
            var pressure = observation.barometricPressure.value;
          } else {
            var pressure = null;
          }
          if ('relativeHumidity' in observation){
            var humidity = observation.relativeHumidity.value;
          } else {
            var humidity = null;
          }
          if ('textDescription' in observation){
            var description = observation.textDescription;
          } else {
            var description = null;
          }
          if ('minTemperatureLast24Hours' in observation){
            var min_temp = observation.minTemperatureLast24Hours.value;
          } else {
            var min_temp = null;
          }
          if ('maxTemperatureLast24Hours' in observation){
            var max_temp = observation.maxTemperatureLast24Hours.value;
          } else {
            var max_temp = null;
          }
          if ('precipitationLastHour' in observation){
            var prec_last_hour = observation.precipitationLastHour.value;
          } else {
            var prec_last_hour = null;
          }
          if ('precipitationLast3Hours' in observation){
            var prec_last_3_hours = observation.precipitationLast3Hours.value;
          } else {
            var prec_last_3_hours = null;
          }
          if ('precipitationLast6Hours' in observation){
            var prec_last_6_hours = observation.precipitationLast6Hours.value;
          } else {
            var prec_last_6_hours = null;
          }
          
          query = `DELETE from weather where nws_zone = $1; INSERT INTO weather
      (nws_zone, observation_time, temperature, pressure, humidity, description,
      max_temp_last_24_hours, min_temp_last_24_hours, precipitation_last_hour, precipitation_last_3_hours, 
        precipitation_last_6_hours, wind_speed, wind_gust, wind_direction)
      VALUES
      (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
      ) returning *;`
      values = [nws_zone, time, temperature, pressure, humidity, description, max_temp, min_temp, prec_last_hour,
        prec_last_3_hours, prec_last_6_hours, wind_speed, wind_gust, wind_direction];
      db.one(query, values)
      .then(data => {
        res.status(200).json({
          data: data,
        });
      })
      .catch(err => {
        res.status(400).json({
          message: 'Error inserting weather into db',
          error: err,
        });
      });
          
        })
        .catch(err => {
          res.status(400).json({
            message: 'Error getting observations from NWS api' +  ' https://api.weather.gov/zones/forecast/' + nws_zone + '/observations',
            error: err,
          });
        });
      } else {  // stored weather data in db is up to date, return it
        res.status(200).json({
          data: data,
        });
      }
    })
    .catch(err => {
      res.status(400).json({
        message: 'Error getting cached weather data',
        error: err,
    });
  });
});


app.post('/update_nws_zone', (req, res) => {
  // This function updates the NWS zone stored in the database for the mountain given in the parameters
  // TODO figure out how to do this periodically (and maybe whenever admin user adds mountain)
  var mountain_name = req.body.mountain_name;

  // First get latitude and longitude from database
  var query = `select latitude, longitude, mountain_id from mountains where mountain_name = $1`
  var values = [mountain_name];

  db.one(query, values)
    .then(data => {
      var lat = data.latitude;
      var long = data.longitude;
      var mountain_id = data.mountain_id;
      
      // Now call National Weather Service API to get zone
      axios({
        url: 'https://api.weather.gov/points/' + lat + ',' + long,
        method: 'GET'
      }).then(results => {
        var zone = results.data.properties.forecastZone;
        zone = zone.split('forecast/')[1];
         // Finally update in our db
        var query = `update mountains set nws_zone = $1 where mountain_id = $2 returning *`
        var values = [zone, mountain_id];
        db.one(query, values)
        .then(data => {
          res.status(200).json({
            data: data,
          });
  
        })
        .catch(err => {
          res.status(400).json({
            message: 'Error updating zone in mountains table',
            error: err,
          });
        });
       
      })
      .catch(err => {
        res.status(400).json({
          message: 'Error getting zone from NWS',
          error: err,
        });
      });
  
    })
    .catch(err => {
      res.status(400).json({
        message: 'Error getting lat/long from db',
        error: err,
      });
    });

  });


app.get('/login', (req, res) => {
  res.render('pages/login');
});

app.get('/welcome', (req, res) => {
  res.json({status: 'success', message: 'Welcome!'});
});

// -------------------------------------  ROUTES for register.hbs   ---------------------------------------

app.get('/register', (req, res) => {
  res.render('pages/register');
});




app.get('/test', (req, res) => {
  res.status(302).redirect('/login');
});


app.post('/register', async (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  if(username == null) {
    console.log('null');
    res.status(400).render('pages/register', {message: 'username cannot be null'});
  } else {
  // check if username already exists
  const query = 'SELECT * FROM users WHERE username = $1';
  db.oneOrNone(query, [username])
    .then(async (user) => {
      if (user) {
        // User already exists
        res.render('pages/register', { message: 'Account already exists.' });
      } else {
        // Hash the password using bcrypt library
        const hash = await bcrypt.hash(password, 10);

        // Insert username and hashed password into the 'users' table
        const insertQuery = 'INSERT INTO users(username, email, password) VALUES($1, $2, $3)';
        db.none(insertQuery, [username, email, hash])
          .then(() => {
            res.status(200).render('pages/register', { message: 'Account created.' });
          })
          .catch((err) => {
            console.log(err);
            res.status(400).json ({
              error: err
            });
            res.render('pages/register', { message: 'Error creating account.' });
          });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({
        error: err,
        message: "bottom error"
      });
      res.render('pages/register', { message: 'Error creating account.' });
    });
  }
});


// -------------------------------------  ROUTES for login.hbs   ---------------------------------------

app.get('/login', (req, res) => {
  res.render('pages/login');
});

app.post('/login', async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const query = 'SELECT * FROM users WHERE username = $1';

  db.one(query, [username])
    .then(async (user) => {
      // check if password is correct
      let match = await bcrypt.compare(password, user.password);

      // password is correct
      if (match) {
        req.session.user = user;
        res.session.save();
        res.redirect('/home'); // redirect to home page
        res.status(200)
      } else {
        console.log('Password is incorrect');
        res.render('pages/login', { message: 'Password is incorrect' }); // make a messages.hbs file
      }
      message: "Successfully logged in";
    })
    .catch((err) => {
      console.log('User not found:', err);
      res.render('pages/login', { message: 'User not found' });
      message: err.message;
    });
});

app.get('/mountain/:id', async (req, res) => {
  const mountainId = req.params.id;
  const query = 'SELECT * FROM mountains WHERE mountain_id = $1';
  const passesQuery = `SELECT passes.pass_name FROM passes
JOIN mountains_to_passes ON passes.pass_id = mountains_to_passes.pass_id
WHERE mountains_to_passes.mountain_id = $1;`
  const reviewQuery =`SELECT reviews.review_id, reviews.username, reviews.rating, reviews.review AS review, reviews.date_posted AS date_posted, images.image_url AS image FROM mountains 
  JOIN mountains_to_reviews ON mountains.mountain_id = mountains_to_reviews.mountain_id 
  JOIN reviews ON mountains_to_reviews.review_id = reviews.review_id 
  LEFT JOIN reviews_to_images ON reviews.review_id = reviews_to_images.review_id 
  LEFT JOIN images ON reviews_to_images.image_id = images.image_id 
  WHERE mountains.mountain_id = $1`;
  
  db.oneOrNone(query, [mountainId])
    .then(async (mountain) => {
      if (mountain) {
        const [passes, reviews] = await Promise.all([
          db.any(passesQuery, [mountainId]),
          db.any(reviewQuery, [mountainId])
        ]);
        try {
            const response = await axios.get(`http://localhost:3000/weather`, {
              params: { nws_zone: mountain.nws_zone}
            });
            const weather_observations = response.data.data;
            if (weather_observations && weather_observations.humidity != null) {
              weather_observations.humidity = Math.round(weather_observations.humidity);
            }
            const fieldsToCheck = [
              'max_temp_last_24_hours',
              'min_temp_last_24_hours',
              'precipitation_last_hour',
              'precipitation_last_3_hours',
              'precipitation_last_6_hours',
              'wind_speed',
              'wind_gust',
              'wind_direction'
            ];
            
            fieldsToCheck.forEach(field => {
              if (weather_observations[field] == null) {
                weather_observations[field] = '--(Not found)--';
              }
            });
            const passString = passes.map(p => p.pass_name).join(', ');
            res.render('pages/mountain', {
              user: req.session.user,
              mountain_id: mountain.mountain_id,
              mountain_name: mountain.mountain_name,
              location_name: mountain.location_name,
              latitude: mountain.latitude,
              longitude: mountain.longitude,
              avg_rating: mountain.avg_rating,
              peak_elevation: mountain.peak_elevation,
              reviews: reviews,
              apiKey : process.env.GOOGLE_MAPS_API_KEY,
              nws_zone : mountain.nws_zone,
              passes: passString,
              currentObservations: weather_observations
            });

            
        } catch (error) {
          res.status(500).json({ error: 'Internal request failed', details: error });
        }
        
      } else {
        res.render('pages/mountain', {
          user: req.session.user,
          message: 'Mountain not found',
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.render('pages/mountain', {
        user: req.session.user,
        message: 'Error fetching mountain data',
      });
    });
});

const auth = (req, res, next) => {
  if (req.session && !req.session.user) {
    return res.redirect('/login');
  }
  next();
}

app.use(auth);


app.get('/profile', (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).send('Not authenticated');
  }
  try {
    res.status(200).json({
      username: req.session.user.username,
    });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  });
// -------------------------------------  ROUTES for logout.hbs   ---------------------------------------

// -------------------------------------  ROUTES for mountain.hbs   ---------------------------------------



// Path for user to post a review of a mountain
app.post('/mountain/:id', upload.single('file') , async (req, res) => {
  //const mountainId = req.params.id;
  const mountainId = 1;
  const username = req.session.user.username;
  const review = req.body.review;
  const date_posted = new Date();
  const rating = req.body.rating;
  image_cap = req.body.image_cap;

  // Insert the review into the reviews table
  const insertReviewQuery = `
    INSERT INTO reviews(username, review, date_posted, rating) 
    VALUES($1, $2, $3, $4) 
    RETURNING review_id
  `;

  const insertImageQuery = `
    INSERT INTO images(<u>image_url</u>, image_cap) 
    VALUES($1, $2) 
    RETURNING image_id
  `;
  const filePath = req.file ? req.file.path : null;
  const insertImageToReview = `INSERT INTO reviews_to_images(review_id, image_id) VALUES ($1, $2)`;

  db.one(insertReviewQuery, [username, review, date_posted, rating])
    .then((result) => {
      const reviewId = result.review_id;
      
      //insert into image table
      db.one(insertImageQuery, [filePath, image_cap])
        .then((result) => {
          const imageID = result.image_id;
          //link review id to image id
          db.none(insertImageToReview, [reviewId, imageID]);
        })

      // Link the review to the mountain in the mountains_to_reviews table
      const linkReviewQuery = `
        INSERT INTO mountains_to_reviews(mountain_id, review_id) 
        VALUES($1, $2)
      `;

      return db.none(linkReviewQuery, [mountainId, reviewId]);
    })
    .then(() => {
      console.log('Review posted and linked to mountain successfully');
      res.render('pages/mountain', { message: 'Review posted successfully' });
    })
    .catch((err) => {
      console.log(err);
      res.render('pages/mountain', { message: 'Error posting review' });
    });
});

// -------------------------------------  START THE SERVER   ---------------------------------------
if (require.main === module) {
  app.listen(3000, () => console.log('Server running'));
}
module.exports = {app, db};

