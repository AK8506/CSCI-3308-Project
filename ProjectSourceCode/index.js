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
  host: process.env.HOST, // the database server
  port: process.env.PORT, // the database port
  database: process.env.POSTGRES_DB, // the database name
  user: process.env.POSTGRES_USER, // the user account to connect with
  password: process.env.POSTGRES_PASSWORD, // the password of the user account
};

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    resave: true,
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

function mmToInches(mm) {
  return Math.round(mm / 25.4 * 10) /10;
}
function cToF(celsius) {
  return (Math.round(celsius * 9/5 * 10)/10 + 32);
}
function kmhToMph(kmh) {
  return Math.round(kmh * 0.621371 * 10) / 10;
}

app.get('/', (req, res) => {
  res.render('pages/home', {
    user: req.session.user,
  });
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

 
  async function get_forecast(mountain_name){
    var query = `select mountains.forecast_office as mtn_forecast_office,
         mountains.grid_x as mtn_grid_x, mountains.grid_y as mtn_grid_y, forecasts.* from mountains
          left join forecasts
           on mountains.forecast_office = forecasts.forecast_office
            and mountains.grid_x = forecasts.grid_x
            and mountains.grid_y = forecasts.grid_y
          where mountain_name = $1 order by generation_time desc, period_number asc;`
   
    var values = [mountain_name];

    try {
      const data = await db.any(query, values); // This will be an array of forecast information for each upcoming period

        if (!data[0].generation_time){ // no previous observations for this zone
          var diffInMs = Infinity;
        } else {
          var generation_time = new Date(data[0].generation_time);
          var current_time = new Date();
          console.log(generation_time);
          console.log(current_time);
          var diffInMs = Math.abs(current_time.getTime() - generation_time.getTime());
        }
        if (diffInMs > 1000*60*60){  // stored data is outdated, update it first
          var grid_x = data[0].mtn_grid_x;
          var grid_y = data[0].mtn_grid_y;
          var forecast_office = data[0].mtn_forecast_office;  // https://api.weather.gov/gridpoints/TOP/31,80/forecast 
          const results = await axios({  
            url: 'https://api.weather.gov/gridpoints/' + forecast_office + '/' + grid_x + ',' + grid_y + '/forecast',
            method: 'GET'
          });
            // Now update forecasts table
            var forecast = results.data.properties;
            var generation_time = forecast.generatedAt;
            var forecast_array = forecast.periods;
            
            var values_str = ''
            for (let i = 0; i < forecast_array.length; i++) {
              period_forecast = forecast_array[i];
            if ('number' in period_forecast){
              var period_number = period_forecast.number;
            } else {
              var period_number = null;
            }
            if ('name' in period_forecast){
              var period_name = period_forecast.name;
            } else {
              var period_name = null;
            }
            if ('temperature' in period_forecast){
              var temperature = period_forecast.temperature;
            } else {
              var temperature = null;
            }
            if ('temperatureUnit' in period_forecast){
              var temperatureUnit = period_forecast.temperatureUnit;
            } else {
              var temperatureUnit = null;
            }
            if ('windSpeed' in period_forecast){
              var windSpeed = period_forecast.windSpeed;
            } else {
              var windSpeed = null;
            }
            if ('windDirection' in period_forecast){
              var windDirection = period_forecast.windDirection;
            } else {
              var windDirection = null;
            }
            if ('icon' in period_forecast){
              var icon = period_forecast.icon;
            } else {
              var icon = null;
            }
            if ('shortForecast' in period_forecast){
              var shortForecast = period_forecast.shortForecast;
            } else {
              var shortForecast = null;
            }
            if ('probabilityOfPrecipitation' in period_forecast){
              var probabilityOfPrecipitation = period_forecast.probabilityOfPrecipitation.value;
            } else {
              var probabilityOfPrecipitation = null;
            }
            values_str = values_str + `('${forecast_office}', ${grid_x}, ${grid_y}, '${generation_time}', ${period_number}, '${period_name}', '${temperatureUnit}',
            ${temperature}, '${windSpeed}', '${windDirection}', '${icon}', '${shortForecast}', ${probabilityOfPrecipitation})`
            if (i < forecast_array.length - 1){
              values_str = values_str + ','
            }
          }
  
          // Delete all old data for this location and insert new forecast
          var query = `DELETE from forecasts where forecast_office = $1 and grid_x = $2 and grid_y = $3;
             INSERT INTO forecasts
            (forecast_office, grid_x, grid_y, generation_time, period_number, period_name, temperatureUnit,
            temperature, windSpeed, windDirection, icon, shortForecast, probabilityOfPrecipitation)
           VALUES ` + values_str + ` returning *`
           values = [forecast_office, grid_x, grid_y];
        const insertedData = db.any(query, values);
          return {data: insertedData};
        } else {  // stored weather data in db is up to date, return it
          return {data: data};
        }
      } catch(err) {
        return {error: err};
    };
  }

async function getWeatherData(nws_zone) {
  // This function gets weather data from our db or from NWS api if cached data is too old.
  var query = `select * from weather where nws_zone = $1 order by observation_time desc limit 1;`
  var values = [nws_zone];

  try {
    const data = await db.oneOrNone(query, values);

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
      const results = await axios({
        url: 'https://api.weather.gov/zones/forecast/' + nws_zone + '/observations?limit=1',
        method: 'GET'
      });

      var observation = results.data.features[0].properties;
      var time = observation.timestamp;

      if ('temperature' in observation){
        var temperature = cToF(observation.temperature.value);

      } else {
        var temperature = null;
      }
      if ('windSpeed' in observation){
        var wind_speed = kmhToMph(observation.windSpeed.value);
      } else {
        var wind_speed = null;
      }
      if ('windGust' in observation){
        var wind_gust = kmhToMph(observation.windGust.value);
      } else {
        var wind_gust = null;
      }
      if ('windDirection' in observation){
        var wind_direction = observation.windDirection.value;
      } else {
        var wind_direction = null;
      }
      if ('barometricPressure' in observation){
        var pressure = Math.round(observation.barometricPressure.value/100);
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
      if ('minTemperatureLast24Hours' in observation && observation.minTemperatureLast24Hours && observation.minTemperatureLast24Hours.value !== null){
        var min_temp = cToF(observation.minTemperatureLast24Hours.value);
      } else {
        var min_temp = null;
      }
      if ('maxTemperatureLast24Hours' in observation && observation.maxemperatureLast24Hours && observation.maxTemperatureLast24Hours.value !== null){
        var max_temp = cToF(observation.maxTemperatureLast24Hours.value);
      } else {
        var max_temp = null;
      }
      if ('precipitationLastHour' in observation){
        var prec_last_hour = mmToInches(observation.precipitationLastHour.value);
      } else {
        var prec_last_hour = null;
      }
      if ('precipitationLast3Hours' in observation){
        var prec_last_3_hours = mmToInches(observation.precipitationLast3Hours.value);
      } else {
        var prec_last_3_hours = null;
      }
      if ('precipitationLast6Hours' in observation){
        var prec_last_6_hours = mmToInches(observation.precipitationLast6Hours.value);
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
      ) returning *;`;

      values = [nws_zone, time, temperature, pressure, humidity, description, max_temp, min_temp, prec_last_hour,
        prec_last_3_hours, prec_last_6_hours, wind_speed, wind_gust, wind_direction];

      const insertedData = await db.one(query, values);
      return { data: insertedData };

    } else {  // stored weather data in db is up to date, return it
      return { data: data };
    }

  } catch (err) {
    return {
      message: 'Error getting or inserting weather data',
      error: err,
    };
  }
}


app.post('/update_nws_point', (req, res) => {
  // This function updates the NWS zone stored in the database for the mountain given in the parameters
  var mountain_name = req.body.mountain_name;

  // First get latitude and longitude from database
  var query = `select latitude, longitude, mountain_id from mountains where mountain_name = $1`
  var values = [mountain_name];

  db.one(query, values)
    .then(data => {
      var lat = data.latitude;
      var long = data.longitude;
      var mountain_id = data.mountain_id;

      
      // Now call National Weather Service API to get zone, forecast office, and grid points
      axios({
        url: 'https://api.weather.gov/points/' + lat + ',' + long,
        method: 'GET'
      }).then(results => {
        var zone = results.data.properties.forecastZone;
        var forecast_office = results.data.properties.gridId;
        var grid_x = results.data.properties.gridX;
        var grid_y = results.data.properties.gridY;

        zone = zone.split('forecast/')[1];

         // Finally update in our db
        var query = `update mountains set nws_zone = $1, forecast_office = $2, grid_x = $3, grid_y = $4 where mountain_id = $5 returning *`
        var values = [zone, forecast_office, grid_x, grid_y, mountain_id];

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



app.get('/welcome', (req, res) => {
  res.json({ status: 'success', message: 'Welcome!' });
});

// -------------------------------------  ROUTES for register.hbs   ---------------------------------------

app.get('/register', (req, res) => {
  res.render('pages/register', {user: req.session.user});
});




app.get('/test', (req, res) => {
  res.status(302).redirect('/login');
});


app.post('/register', async (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  if (username == null) {
    console.log('null');
    res.status(400).render('pages/register', { user: req.session.user, message: 'username cannot be null' });
  } else {
    // check if username already exists
    const query = 'SELECT * FROM users WHERE username = $1';
    db.oneOrNone(query, [username])
      .then(async (user) => {
        if (user) {
          // User already exists
          res.render('pages/register', { user: req.session.user, message: 'Account already exists.' });
        } else {
          // Hash the password using bcrypt library
          const hash = await bcrypt.hash(password, 10);

          // Insert username and hashed password into the 'users' table
          const insertQuery = 'INSERT INTO users(username, email, password) VALUES($1, $2, $3)';
          db.none(insertQuery, [username, email, hash])
            .then(() => {
              res.status(200).render('pages/login', {user: req.session.user, message: 'Account created.' });
            })
            .catch((err) => {
              console.log(err);
              res.status(400).json({
                error: err
              });
              res.render('pages/register', {user: req.session.user, message: 'Error creating account.' });
            });
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(400).json({
          error: err,
          message: "bottom error"
        });
        res.render('pages/register', { user: req.session.user, message: 'Error creating account.' });
      });
  }
});


// -------------------------------------  ROUTES for login.hbs   ---------------------------------------

app.get('/login', (req, res) => {
  res.render('pages/login' ,{user: req.session.user});
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
        req.session.save();
        res.redirect('/'); // redirect to home page
        res.status(200)
      } else {
        //console.log('Password is incorrect');
        res.render('pages/login', { user: req.session.user, message: 'Password is incorrect' }); 
      }
      message: "Successfully logged in";
    })
    .catch((err) => {
      //console.log('User not found:', err);
      res.render('pages/login', { user: req.session.user, message: 'User not found' });
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
        const weather_response = await getWeatherData(mountain.nws_zone);
        const weather_observations = weather_response.data; 

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


// -------------------------------------  ROUTES for logout.hbs   ---------------------------------------
app.get('/logout', (req, res) => {
  req.session.destroy(function (err) {
    res.render('pages/home' , {user: null});
  });
});

// -------------------------------------  ROUTES for mountain.hbs   ---------------------------------------



// Path for user to post a review of a mountain
app.post('/mountain/:id', upload.single('file') , async (req, res) => {
  const mountainId = req.params.id;
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
    INSERT INTO images(image_url, image_cap) 
    VALUES($1, $2) 
    RETURNING image_id
  `;
  const filePath = req.file ? `/${req.file.path}` : null;
  console.log(filePath);
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
      res.render('pages/mountain', { user: req.session.user, message: 'Review posted successfully' });
    })
    .catch((err) => {
      console.log(err);
      res.render('pages/mountain', { user: req.session.user, message: 'Error posting review' });
    });
});

// -------------------------------------  START THE SERVER   ---------------------------------------
if (require.main === module) {
  app.listen(3000, () => console.log('Server running'));
}
module.exports = { app, db };

