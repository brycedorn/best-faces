const fs = require('fs');
const https = require('https');
const Stream = require('stream').Transform;

const tweets = require('../data/tweets-ranked.json');

const imageDir = 'images';
const fileTypeRegexp = new RegExp('.*\\.(png|jpg|gif|bmp)', 'i');

function downloadImage(url, fileName) {
    https.request(url, function(response) {
        const data = new Stream();

        response.on('data', function(chunk) { 
            data.push(chunk);
        });

        response.on('end', function() {
            const fileType = fileTypeRegexp.exec(url)[1];
            fs.writeFileSync(`${imageDir}/${fileName}.${fileType}`, data.read()); 
        });
    }).end();
};

tweets.forEach((tweet, i) => {
    const delay = Math.floor(i / 50) * 1000;

    if (!fs.existsSync(imageDir)){
        fs.mkdirSync(imageDir);
    }

    setTimeout(() => {
        console.log(`Downloading ${i + 1} of ${tweets.length} after ${delay}ms delay.`);
        downloadImage(tweet.media.url, tweet.media.media_key);
    }, [delay]);
});