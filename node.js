app.engine('hbs', exphbs.engine({ defaultLayout: 'Main', extname: '.hbs' }));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get('/', (req, res) => res.render('home'));
app.get('/register', (req, res) => res.render('register'));
app.get('/login', (req, res) => res.render('login'));
app.get('/discover', (req, res) => res.render('discover'));
