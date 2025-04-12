const express = require('express');
const app = express();
const handlebars = require('express-handlebars');
const Handlebars = require('handlebars');
const path = require('path');
const pgp = require('pg-promise')();
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');

app.use(session({
  secret: 'super duper secret',  // Secret key to sign the session ID cookie
  resave: false,              // Don't resave session if it wasn't modified
  saveUninitialized: false,    // Save session even if not modified
}));

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
app.use(express.static(__dirname + '/'));
// -------------------------------------  ROUTES for home.hbs   ---------------------------------------

app.get('/', (req, res) => {
  res.render('pages/home');
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


/*
app.get('/mountain', (req, res) => {
  const periodsTest = [
    {
      name: "This Afternoon",
      temperature: 70,
      temperatureUnit: "F",
      windSpeed: "15 to 20 mph",
      windDirection: "NW",
      icon: "https://api.weather.gov/icons/land/day/few?size=medium",
      shortForecast: "Sunny",
      probabilityOfPrecipitation: 0
    },
    {
      name: "Tonight",
      temperature: 38,
      temperatureUnit: "F",
      windSpeed: "5 to 15 mph",
      windDirection: "NW",
      icon: "https://api.weather.gov/icons/land/night/skc?size=medium",
      shortForecast: "Clear",
      probabilityOfPrecipitation: 10
    },
    {
      name: "Friday",
      temperature: 84,
      temperatureUnit: "F",
      windSpeed: "5 to 10 mph",
      windDirection: "SW",
      icon: "https://api.weather.gov/icons/land/day/few?size=medium",
      shortForecast: "Cloudy",
      probabilityOfPrecipitation: 40
    },
    {
      name: "Friday Night",
      temperature: 45,
      temperatureUnit: "F",
      windSpeed: "15 to 20 mph",
      windDirection: "NE",
      icon: "https://api.weather.gov/icons/land/night/skc?size=medium",
      shortForecast: "Clear",
      probabilityOfPrecipitation: 0
    },
    {
      name: "Saturday",
      temperature: 45,
      temperatureUnit: "F",
      windSpeed: "15 to 20 mph",
      windDirection: "NE",
      icon: "https://api.weather.gov/icons/land/day/rain_showers,40?size=medium",
      shortForecast: "Chance Rain Showers",
      probabilityOfPrecipitation: 40
    },
    {
      name: "Saturday Night",
      temperature: 35,
      temperatureUnit: "F",
      windSpeed: "30 to 40 mph",
      windDirection: "NE",
      icon: "https://api.weather.gov/icons/land/night/tsra_hi,30?size=medium",
      shortForecast: "Chance Showers And Thunderstorms",
      probabilityOfPrecipitation: 30
    }
  ];
  const currObs = {
      description: "Sunny with a few Clouds. Lots of precipitation on the ground",
      temperature: 70,
      max_temp_last_24_hours: 80,
      min_temp_last_24_hours: 54,
      precipitation_last_6_hours: 20,
      humidity: 20,
      pressure: 820,
      wind_speed: 4,
      wind_gust : 15,
      wind_direction: 50,
      observation_time: "10:10"
  };

  const mountainInfo = {
    mountain_name: "Test Vail",
    location_name : "Test Vail, CO",
    lattitude: 39.606144,
    longitude:-106.354972,
    avg_rating: 4.0,
    peak_elevation: 11570
  };
  const paired = [];
  for (let i = 0; i < periodsTest.length; i += 2) {
    paired.push([periodsTest[i], periodsTest[i + 1]]);
  }
  res.render('pages/mountain', {
    reviews: [
      {
        username: "John Doe",
        review_id: 1,
        review: "This is an amazing mountain. Highly recommend",
        date_posted: "2025-04-06",
        image: "https://i.insider.com/5980b7ca87543302234a1a57?width=800&format=jpeg&auto=webp",
        rating: 4.5
      },
      {
        username: "Jane Smith",
        review_id: 2,
        review: "It was okay.",
        date_posted: "2025-04-05",
        rating: 3.5
      },
      {
        username: "Alex Johnson",
        review_id: 3,
        review: "This is a really long review that has been repeated quite a while to test the overflowing and fitting of the thing. This is a really long review that has been repeated quite a while to test the overflowing and fitting of the thing. This is a really long review that has been repeated quite a while to test the overflowing and fitting of the thing. This is a really long review that has been repeated quite a while to test the overflowing and fitting of the thing. This is a really long review that has been repeated quite a while to test the overflowing and fitting of the thing. This is a really long review that has been repeated quite a while to test the overflowing and fitting of the thing. ",
        date_posted: "2025-04-04",
        image: "https://i.insider.com/5980b7ca87543302234a1a57?width=800&format=jpeg&auto=webp",
        rating: 4.0
      }
    ], apiKey : process.env.API_KEY,
      periods : paired,
      currentObservations: currObs,
      mountain: mountainInfo
  });
});
*/



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

app.get('/mountain', (req, res) => {
  res.render('pages/mountain', {
    user: req.session.user,
  });
});

// Path for user to post a review of a mountain
app.post('/mountain', (req, res) => {
  const username = req.session.user.username;
  const review = req.body.review;
  const date_posted = new Date();
  const rating = req.body.rating;
  const query = 'INSERT INTO reviews(username, review ,date_posted, rating) VALUES($1, $2, $3, $4)';

  db.none(query, [username, review, date_posted, rating])
    .then(() => {
      console.log('Review posted successfully');
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