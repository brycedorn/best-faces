const fs = require('fs').promises;
const tweets = require('../data/tweets.json');

const fileName = 'data/tweets-ranked.json';

const MINIMUM_LIKE_THRESHOLD = 1000;

const rankTweets = async () => {
    const tweetsWithLikes = tweets.filter(({ tweet }) => tweet.public_metrics.like_count > MINIMUM_LIKE_THRESHOLD);

    const sortedTweets = tweetsWithLikes.sort((a, b) => {
        return b.tweet.public_metrics.like_count - a.tweet.public_metrics.like_count;
    });

    await fs.writeFile(fileName, JSON.stringify(sortedTweets), (errror) => {
        if (errror) {
            console.error(errror);
        }
    });

    console.log(`Found the top ${sortedTweets.length} faces and saved to ${fileName}!`);
}

rankTweets();