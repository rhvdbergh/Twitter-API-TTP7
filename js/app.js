// Treehouse Techdegree Project 7: Twitter API

// Ronald van der Bergh

// I aim for an "exceeds expecations" grade with this submission.

// This project uses the Twitter API (REST) to access a user's Twitter account and display the five most recent tweets, followers, and private messages. The information is rendered using Pug templates with Express on Node.js.

// For extra credit, the application allows the user to send a tweet. If something goes wrong with routing, the user receives user friendly feedback. The user's personal Twitter background is displayed as a header.

// For this project, Treehouse provided CSS and HTML files.

const express = require('express');
const app = express();

const Twit = require('twit');
const config = require('./config.js');

const T = new Twit(config.accessDetails);

// general response
app.get('/', (req, res, next) => {

    res.send("You've reached the Twitter API app.");

});

// retrieve 5 most recent tweets
T.get('statuses/user_timeline', { count: 5 }, function(err, data, response) {
    console.log(data)
});

// retrieve 5 most recent friends (i.e. persons that the user started following)
T.get('friends/list', { count: 5 }, function(err, data, response) {
    console.log(data)
});

// retrieves last 5 private messages sent
// note, this API endpoint is deprecated and will be retired on June 19, 2018
T.get('direct_messages/sent', { count: 5 }, function(err, data, response) {
    console.log(data)
});

app.listen(3000, () => {
    console.log('Twitter API app listening on port 3000');
})