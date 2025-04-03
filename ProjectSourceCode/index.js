const express = require('express');
const app = express();
const handlebars = require('express-handlebars');
const Handlebars = require('handlebars');
const path = require('path');
const pgp = require('pg-promise')();
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');

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

// -------------------------------------  ROUTES for home.hbs   ---------------------------------------

app.get('/', (req, res) => {
  res.render('pages/home');
});

// -------------------------------------  ROUTES for register.hbs   ---------------------------------------

app.get('/register', (req, res) => {
  res.render('pages/register');
});

app.post('/register', async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

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
        const insertQuery = 'INSERT INTO users(username, password) VALUES($1, $2)';
        db.none(insertQuery, [username, hash])
          .then(() => {
            res.render('pages/register', { message: 'Account created.' });
          })
          .catch((err) => {
            console.log(err);
            res.render('pages/register', { message: 'Error creating account.' });
          });
      }
    })
    .catch((err) => {
      console.log(err);
      res.render('pages/register', { message: 'Error checking account.' });
    });
});


// -------------------------------------  ROUTES for login.hbs   ---------------------------------------

app.post('/login', (req, res) => {
  req.render('pages/login');
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
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
}

app.use(auth);

// -------------------------------------  ROUTES for logout.hbs   ---------------------------------------
app.get('/logout', (req, res) => {
    req.session.destroy(function (err) {
      res.render('pages/logout');
    });
  });

// -------------------------------------  START THE SERVER   ---------------------------------------

app.listen(3000);