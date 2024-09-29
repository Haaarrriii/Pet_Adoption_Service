const express = require('express');
const fs = require('fs');
const path = require('path');
const session = require('express-session');

const app = express();
const port = 3000;
// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Define routes
app.get('/', (req, res) => {
  res.render('Home');
});

app.get('/Home', (req, res) => {
  res.render('Home');
});

app.get('/Contact', (req, res) => {
  res.render('Contact');
});

app.get('/CatCare', (req, res) => {
  res.render('CatCare');
});
app.get('/DogCare', (req, res) => {
  res.render('DogCare');
});
// Define other routes similarly
app.get('/Find', (req, res) => {
  res.render('Find');
});

app.get('/GiveAway', (req, res) => {
  res.render('GiveAway');
});

app.get('/pets', (req, res) => {
  res.render('pets');
});


app.get('/privacyPolicy', (req, res) => {
  res.render('privacyPolicy');
});

app.use(session({
  secret: 'harry-secret-key', 
  resave: false,             
  saveUninitialized: true,   
  cookie: { secure: false }  
}));

// Route to render the createAccount page
app.get('/createAccount', (req, res) => {
  res.render('createAccount', { message: '' }); 
});
const loginFilePath = path.join(__dirname, 'login.txt');
const petFilePath = path.join(__dirname, 'petInfo.txt');

app.post('/createAccount', (req, res) => {
  const { username, password } = req.body;
  const usernamePattern = /^[a-zA-Z0-9]+$/;
  const passwordPattern = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{4,}$/;

  if (!usernamePattern.test(username)) {
    res.render('createAccount', { message: 'Username can only contain letters and digits.' });
    return;
  }

  if (!passwordPattern.test(password)) {
    res.render('createAccount', { message: 'Password must be at least 4 characters long, and contain at least one letter and one digit.' });
    return;
  }

  
  fs.readFile(loginFilePath, 'utf8', (err, data) => {
    if (err) {
      res.render('createAccount', { message: 'Error reading user data. Please try again later.' });
      return;
    }

    const users = data.split('\n').map(line => line.split(':')[0]);
    if (users.includes(username)) {
      res.render('createAccount', { message: 'Username already exists. Please choose a different username.' });
    } else {
      fs.appendFile(loginFilePath, `${username}:${password}\n`, (err) => {
        if (err) {
          res.render('createAccount', { message: 'Error saving user data. Please try again later.' });
        } else {
          res.render('createAccount', { message: 'Account successfully created. You can now log in.' });
        }
      });
    }
  });
});
app.get('/GiveAway', (req, res) => {
  const loggedIn = req.query.loggedIn === 'true';
  res.render('GiveAway', { loggedIn });
});

app.post('/GiveAway', (req, res) => {
  const { username, password } = req.body;
  req.session.username = username;
  req.session.passwrod=password;
  console.log('Received login attempt:', { username, password });
  fs.readFile(loginFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.send('Error reading login data.');
    }

    const users = data.split('\n').map(line => line.split(':'));
    const user = users.find(([user, pass]) => user === username && pass === password);

    if (user) {
      console.log('Login successful, redirecting to /GiveAway?loggedIn=true');
      loggedIn=true;
      res.redirect('/GiveAway');
    } else {
      res.send(`
        <p>Invalid username or password. Please try again or create a new account.</p>
        <button onclick="window.location.href='/createAccount'">Create New Account</button>
        <button onclick="window.location.href='/GiveAway'">Try again</button>
    `);
    }
  });
});

app.post('/submitPet', (req, res) => {
  const { type, breed, age, gender, petDescription, familyName, givenName, email } = req.body;
  const username = req.session.username;
  fs.appendFile('petsInfo.txt', `:${username}:${type}:${breed}:${age}:${gender}:${petDescription}:${familyName}:${givenName}:${email}\n`, err => {
    if (err) {
      return res.send('Error saving pet data. Please try again later.');
    }
    res.send(`
        <p>Pet Information submitted successfully</p>
        <button onclick="window.location.href='/Home'">Go to Home</button>
    `);
  });

  
});

app.get('/logOut', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.send('Error logging out. Please try again.');
    }
    res.send('<h1>You have been logged out successfully.</h1><a href="/Home">Go to Home</a>');
    loggedIn=false;
  });
 
});

app.post('/pets', (req, res) => {
  const { type, breed, age, gender} = req.body;


  res.redirect('/pets');  
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
