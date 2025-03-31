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

app.listen(3000);