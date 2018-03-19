const express = require('express');
const router = express.Router(); // set up router

const Twit = require('twit');
const config = require('../js/config.js');
const T = new Twit(config.accessDetails);

// set up bodyParser
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });

let interpolationData = []; // a variable to hold data to interpolate in pug

// ------- retrieve the tweets, each section in succession

// retrieve 5 most recent tweets
router.get('/', (req, res, next) => {
    T.get('statuses/user_timeline', { count: 5 }, function(err, data, response) {

        if (err) {
            err.message = 'Something went wrong with trying to retrieve recent tweets. Please try again later.';
            return next(err);
        }

        // save the username - this assumes the user has at least one tweet
        interpolationData.screen_name = data[0].user.screen_name;
        interpolationData.name = data[0].user.name;
        interpolationData.friends_count = data[0].user.friends_count;
        interpolationData.profile_image_url = data[0].user.profile_image_url;
        interpolationData.profile_background_image_url = data[0].user.profile_background_image_url;
        interpolationData.profile_banner_url = data[0].user.profile_banner_url;
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
router.get('/', (req, res, next) => {
    T.get('friends/list', { count: 5 }, function(err, data, response) {

        interpolationData.friends = []; // array holding data about five most recent friends

        // if the rate limit is exceeded (more calls per hour than Twitter allows)
        // the following error object is returned by the Twitter API
        // { errors: [ { message: 'Rate limit exceeded', code: 88 } ] }
        // the rate limit is lowest for recent friends, so handle the error here
        // test if the object returned is an error
        // if so, redirect to an error page

        // Check to see if the data returned from Twitter API is an errors object
        if (data.errors) {
            if (data.errors[0].message === "Rate limit exceeded") {
                err.message = 'Rate limit exceeded. Please try again in 15 minutes.';
                return next(err);
            }
        }

        // if there is another error than rate limit exceeded
        if (err) {
            err.message = 'Something went wrong while trying to retrieve recent friends. Please try again later.';
            next(err);
        }

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
router.get('/', (req, res, next) => {
    // note, this API endpoint is deprecated and will be retired on June 19, 2018
    T.get('direct_messages/sent', { count: 5 }, function(err, data, response) {

        if (err) {
            err.message = 'Something went wrong while trying to retrieve direct messages. Please try again later.';
            return next(err);
        }

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
        next();
    });
});

// ------- render the data on the page
router.get('/', (req, res, next) => {
    // render the index.pug file with data passed in as an object
    res.render('index', interpolationData);
});

// send new tweet when "tweet" button is clicked
// this is in response to an AJAX call from the client
router.post('/send-tweet', urlencodedParser, (req, res, next) => {

    // twit module sends update status request to Twitter API
    // the req.body.tweetText contains the text the user wants to tweet
    T.post('statuses/update', { status: req.body.tweetText }, function(err, data, response) {

        if (err) {
            return next(err);
        }
        // needs the following info:
        // date, as in tweet.date
        // let date = new Date(tweet.created_at);
        // obj.date = date.toDateString();

        const now = new Date();
        let dateNow = now.toDateString();

        // construct an object containing info about this tweet - so the pug template can use 
        // dot notation (e.g. tweet.date) which is similar to the effect
        // of rendering a list of tweets with 'each tweet in tweets' in pug syntax
        const tweetInfo = {
            date: dateNow,
            text: req.body.tweetText,
            retweet_count: '0',
            favorite_count: '0'
        }

        // construct html to send back to render a single tweet
        // this will be injected into the page on the client-side using jQuery
        res.render('single-tweet', {
            profile_image_url: interpolationData.profile_image_url,
            screen_name: interpolationData.screen_name,
            name: interpolationData.name,
            tweet: tweetInfo
        });
        console.log('User has sent a tweet! Twitter API router listening on port 3000');
    });
});

module.exports = router;