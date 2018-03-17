// client-side javascript to send ajax request to Twitter API app and update
// page dynamically when user sends tweet

$('button').on('click', (event) => {

    event.preventDefault();
    const tweetText = $('textarea').val(); // get the text of the tweet

    // send post request to server
    // server will respond with html to inject as latest tweet 
    // in list
    $.post('/send-tweet', { tweetText }, (htmlToPrepend) => {
        // insert the returned html into the page as the latest tweet
        $('.app--tweet--list').prepend(htmlToPrepend);
        // remove the oldest tweet so only five tweets are displayed
        $('.app--tweet--list').children().last().remove();
        // empty the text entry box
        $('textarea').val('');
    });
});