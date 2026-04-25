const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
const serverless = require('serverless-http');
require('dotenv').config();

const app = express();

const publicDir = path.join(__dirname, '..', 'public');

// Middleware
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Authentication middleware
function requireAuth(req, res, next) {
  const authCookie = req.cookies.auth;
  if (authCookie === 'authenticated') {
    next();
  } else {
    res.redirect('/login');
  }
}

// Routes
app.get('/login', (req, res) => {
  res.sendFile(path.join(publicDir, 'login.html'));
});

app.post('/login', (req, res) => {
  const { password } = req.body;
  if (password === process.env.PASSWORD) {
    res.cookie('auth', 'authenticated', { maxAge: 24 * 60 * 60 * 1000 }); // 1 day
    res.redirect('/');
  } else {
    res.send('Invalid password. <a href="/login">Try again</a>');
  }
});

app.get('/logout', (req, res) => {
  res.clearCookie('auth');
  res.redirect('/login');
});

app.get('/', requireAuth, (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.get('*', requireAuth, (req, res) => {
  res.sendFile(path.join(publicDir, req.path));
});

module.exports = serverless(app);
