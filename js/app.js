// Treehouse Techdegree Project 7: Twitter API

// Ronald van der Bergh

// I aim for an "exceeds expecations" grade with this submission.

// This project uses the Twitter API (REST) to access a user's Twitter account and display the five most recent tweets, followers, and private messages. The information is rendered using Pug templates with Express on Node.js.

// For extra credit, the application allows the user to send a tweet. If something goes wrong with routing, the user receives user friendly feedback. The user's personal Twitter background is displayed as a header.

// For this project, Treehouse provided CSS and HTML files.

const express = require('express');
const app = express();

const pug = require('pug');

const Twit = require('twit');
const config = require('./config.js');

const T = new Twit(config.accessDetails);

let interpolationData = []; // a variable to hold data to interpolate in pug

// set up route to serve static files
app.use(express.static('public'));

// set up view engine - we'll render with pug
app.set('view engine', 'pug');

// ------- retrieve the tweets, each section in succession

// retrieve 5 most recent tweets
app.get('/', (req, res, next) => {
    T.get('statuses/user_timeline', { count: 5 }, function(err, data, response) {

        // save the username - this assumes the user has at least one tweet
        interpolationData.screen_name = data[0].user.screen_name;
        interpolationData.name = data[0].user.name;
        interpolationData.friends_count = data[0].user.friends_count;
        interpolationData.tweets = []; // array holding data about five most recent tweets


        // cycle through each tweet and retrieve the data to render
        data.forEach((tweet) => {

            // build a tweet object to store in interpolationData.tweets
            // has to contain -message content -# of retweets -# of likes -date tweeted

            let obj = {};
            obj.text = tweet.text;
            obj.retweet_count = tweet.retweet_count;
            obj.favorite_count = tweet.favorite_count;
            obj.created_at = tweet.created_at;
            let date = new Date(tweet.created_at);
            obj.date = date.toDateString();

            interpolationData.tweets.push(obj);
        });

        next();
    });
});

// retrieve 5 most recent friends (i.e. persons that the user started following)
app.get('/', (req, res, next) => {
    T.get('friends/list', { count: 5 }, function(err, data, response) {
        // console.log(data);

        interpolationData.friends = []; // array holding data about five most recent friends

        // cycle through each tweet and retrieve the data to render
        data.users.forEach((friend) => {

            // build a friend object to store in interpolationData.friends
            // has to contain -profile image -real name -screenname

            let obj = {};
            obj.profile_image_url = friend.profile_image_url;
            obj.name = friend.name;
            obj.screen_name = friend.screen_name;

            interpolationData.friends.push(obj);
        });
        next();
    });
});

// retrieves last 5 private messages sent
app.get('/', (req, res, next) => {
    // note, this API endpoint is deprecated and will be retired on June 19, 2018
    T.get('direct_messages/sent', { count: 5 }, function(err, data, response) {
        console.log(data)

        interpolationData.directMessages = []; // array holding data about five most recent direct messages sent

        data.forEach((directMessage) => {

            // build a direct message object to store in interpolationData.directMessages
            // has to contain -message body -date the message was sent -time the message was sent

            let obj = {};
            obj.text = directMessage.text;
            let date = new Date(directMessage.created_at);
            obj.date = date.toDateString();
            obj.time = date.toTimeString();

            interpolationData.directMessages.push(obj);
        });

        console.log(interpolationData.directMessages);

        next();
    });
});

// ------- render the data on the page
app.get('/', (req, res, next) => {
    // render the index.pug file with data passed in as an object
    res.render('index', interpolationData);
});

// run the app on port 3000, and send a message to the console stating the port
app.listen(3000, () => {
    console.log('Twitter API app listening on port 3000');
});