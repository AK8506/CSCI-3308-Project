const express = require('express');
const app = express();
app.use(express.static('public'));

const handlebars = require('express-handlebars');
const Handlebars = require('handlebars');
const path = require('path');
const pgp = require('pg-promise')();
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const axios = require('axios');

// Session middleware using .env variable
app.use(session({
  secret: process.env.SESSION_SECRET,
  saveUninitialized: false,
  resave: false,
}));

app.use((req, res, next) => {
  res.locals.loggedIn = !!req.session.user;
  res.locals.username = req.session.user ? req.session.user.username : null;
  next();
});

// Configure handlebars
const hbs = handlebars.create({
  extname: 'hbs',
  layoutsDir: path.join(__dirname, 'layouts'),
  partialsDir: path.join(__dirname, 'partials'),
  defaultLayout: 'Main',
});
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/'));

// Database config
const dbConfig = {
  host: 'db',
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
};
const db = pgp(dbConfig);

// Test DB connection
db.connect()
  .then(obj => {
    console.log('Database connection successful');
    obj.done();
  })
  .catch(error => {
    console.log('ERROR:', error.message || error);
  });

// ROUTES

// Homepage (no cards here anymore)
app.get('/', (req, res) => {
  res.render('home', { title: 'Home' });
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/welcome', (req, res) => {
  res.json({ status: 'success', message: 'Welcome!' });
});

app.get('/test', (req, res) => {
  res.redirect('/login');
});

// ✅ Dashboard route (card content moved here)
app.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  const mountains = [
    {
      id: 1,
      name: 'Aspen',
      imageURL: '/images/aspen.jpg',
      rating: 4.5,
      reviews: 128
    },
    {
      id: 2,
      name: 'Breckenridge',
      imageURL: '/images/breck.jpg',
      rating: 4.2,
      reviews: 94
    },
    {
      id: 3,
      name: 'Telluride',
      imageURL: '/images/telluride.jpg',
      rating: 4.8,
      reviews: 203
    },
    {
      id: 4,
      name: 'Vail',
      imageURL: '/images/vail.jpg',
      rating: 4.6,
      reviews: 152
    }
  ];

  const generateStars = (rating) => {
    const full = '★'.repeat(Math.floor(rating));
    const half = rating % 1 >= 0.5 ? '½' : '';
    const empty = '☆'.repeat(5 - Math.ceil(rating));
    return full + half + empty;
  };

  const enhanced = mountains.map(m => ({
    ...m,
    ratingHTML: generateStars(m.rating)
  }));

  res.render('dashboard', {
    title: 'Dashboard',
    username: req.session.user.username,
    mountains: enhanced
  });
});

// Register user with duplicate checks
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username) {
    return res.status(400).render('register', { message: 'Username cannot be null' });
  }

  try {
    const existingUser = await db.oneOrNone(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser) {
      if (existingUser.username === username) {
        return res.render('register', { message: 'Username is already taken.' });
      }
      if (existingUser.email === email) {
        return res.render('register', { message: 'Email is already registered.' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const existingPassword = await db.oneOrNone(
      'SELECT * FROM users WHERE password = $1',
      [hashedPassword]
    );

    if (existingPassword) {
      return res.render('register', { message: 'This password is already in use. Please choose another.' });
    }

    await db.none(
      'INSERT INTO users(username, email, password) VALUES($1, $2, $3)',
      [username, email, hashedPassword]
    );

    res.render('register', { message: 'Account created.' });

  } catch (err) {
    console.log(err);
    res.status(400).render('register', { message: 'Account already exists.' });
  }
});

// ✅ Login user and redirect to dashboard
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT * FROM users WHERE username = $1';

  try {
    const user = await db.one(query, [username]);
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      req.session.user = user;
      req.session.save(() => {
        res.redirect('/dashboard');
      });
    } else {
      res.render('login', { message: 'Password is incorrect' });
    }
  } catch (err) {
    console.log('User not found:', err);
    res.render('login', { message: 'User not found' });
  }
});

// Auth middleware
const auth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};
app.use(auth);

// Profile route
app.get('/profile', (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).send('Not authenticated');
  }
  res.status(200).json({ username: req.session.user.username });
});

// Logout
app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.render('logout');
  });
});

if (require.main === module) {
  app.listen(3000, () => console.log('Server running'));
}

module.exports = { app, db };
