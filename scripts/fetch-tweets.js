// Get User Tweet timeline by user ID
// https://developer.twitter.com/en/docs/twitter-api/tweets/timelines/quick-start

const fs = require('fs').promises;
const fsExists = require('fs.promises.exists');
const needle = require('needle');
const dotenv = require('dotenv');

dotenv.config();

const userId = process.env.USER_ID;
const url = `https://api.twitter.com/2/users/${userId}/tweets`;
const outputDir = 'data';
const fileName = `${outputDir}/tweets.json`;

// The code below sets the bearer token from your environment variables
// To set environment variables on macOS or Linux, run the export command below from the terminal:
// export BEARER_TOKEN='YOUR-TOKEN'
const bearerToken = process.env.BEARER_TOKEN;

const getUserTweets = async () => {
    let userTweets = [];

    // we request the author_id expansion so that we can print out the user name later
    let params = {
        "max_results": 100,
        "tweet.fields": "created_at,public_metrics",
        "media.fields": "height,media_key,type,url,width",
        "expansions": "attachments.media_keys"
    }

    const options = {
        headers: {
            "User-Agent": "v2UserTweetsJS",
            "authorization": `Bearer ${bearerToken}`
        }
    }

    let hasNextPage = true;
    let nextToken = null;
    console.log("Retrieving Tweets...");

    while (hasNextPage) {
        let resp = await getPage(params, options, nextToken);
        if (resp && resp.meta && resp.meta.result_count && resp.meta.result_count > 0) {
            if (resp.data) {
                const dataWithIncludes = resp.data.map((tweet, i) => ({ tweet, media: resp.includes.media[i] }));
                userTweets.push.apply(userTweets, dataWithIncludes);
            }
            if (resp.meta.next_token) {
                nextToken = resp.meta.next_token;
                console.log("Retrieving next page...")
            } else {
                hasNextPage = false;
            }
        } else {
            hasNextPage = false;
        }
    }

    const existingDirectory = await fsExists(outputDir);
    if (!existingDirectory) {
        await fs.mkdir(outputDir);
    }

    await fs.writeFile(fileName, JSON.stringify(userTweets), (errror) => {
        if (errror) {
            console.error(errror);
        }
    });

    console.log(`Got ${userTweets.length} Tweets from good_faces_bot (user ID ${userId}) and saved to ${fileName}!`);
}

const getPage = async (params, options, nextToken) => {
    if (nextToken) {
        params.pagination_token = nextToken;
    }

    try {
        const resp = await needle('get', url, params, options);

        if (resp.statusCode != 200) {
            console.log(`${resp.statusCode} ${resp.statusMessage}:\n${resp.body}`);
            return;
        }
        return resp.body;
    } catch (err) {
        throw new Error(`Request failed: ${err}`);
    }
}

getUserTweets();