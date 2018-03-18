// Treehouse Techdegree Project 7: Twitter API

// Ronald van der Bergh

// I aim for an "exceeds expecations" grade with this submission.

// This project uses the Twitter API (REST) to access a user's Twitter account and display the five most recent tweets, followers, and private messages. The information is rendered using Pug templates with Express on Node.js.

// For extra credit, the application allows the user to send a tweet. If something goes wrong with routing, the user receives user friendly feedback. The user's personal Twitter background is displayed as a header.

// For this project, Treehouse provided CSS and HTML files.

const express = require('express');
const app = express();
const pug = require('pug');

// set up route to serve static files
app.use(express.static('public'));

// set up routes router - (contains main logic of the app)
const routes = require('../routes');
app.use(routes);

// set up view engine - will render with pug
app.set('view engine', 'pug');

// error handler
app.use((err, req, res, next) => {
    res.render('error', { errorMessage: err.message });
});

// if the resource can't be found, return a 404 error:
app.use((req, res, next) => {
    res.render('error', { errorMessage: 'Oops! That page does not exist. (404)' });
});

// run the app on port 3000, and send a message to the console stating the port
app.listen(3000, () => {
    console.log('Twitter API app listening on port 3000');
});