# best-faces

[@good_faces_bot](https://twitter.com/good_faces_bot) is probably the best Twitter account there is. It's pretty self-explanatory: just a lot of good faces posted regularly. I wanted to sift through the endless stream to find the best faces and this was the result!

## Requirements

 - [node](https://nodejs.org/en/)
 - [rust](https://www.rust-lang.org/tools/install)
 - Twitter API key, can get one [here](https://developer.twitter.com/en/docs/twitter-api/getting-started/getting-access-to-the-twitter-api)

## Running locally

First create a `.env` file with your `BEARER_TOKEN` for accessing Twitter's API and the `USER_ID` for the account you want to fetch tweets for.

Then, in the following order:

```
npm install
npm run fetch:tweets
npm run sort:tweets
npm run fetch:images
```

And for rust:

```
cargo install
cargo run
```

Finally for the site:

```
npm run generate:imports
npm run dev
```
