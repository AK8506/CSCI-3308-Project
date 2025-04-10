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

  
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);


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
      if (!data.observation_time){ // no previous observations for this zone
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

app.listen(3000);