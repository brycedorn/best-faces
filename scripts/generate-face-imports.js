const fsExists = require('fs.promises.exists');
const fs = require('fs').promises;
const tweets = require('../data/tweets-ranked.json');

const outputFileName = 'js/face-imports.js';
const inputFacesDir = 'faces';

function generatePath(tweet, index = -1) {
    const suffix = index > -1 ? `_${index}` : '';
    return `${inputFacesDir}/${tweet.media.media_key}${suffix}.png`;
}

function noFileName(string) {
    return `face${string.replace('.png', '').replace('faces/','')}`;
}

const generateImports = async () => {
    await fs.writeFile(outputFileName, '', () => {
        console.log('Generated face-imports.js.');
    });

    tweets.forEach(async tweet => {
        let output = '';
        let numFaces = 0;
        let facePaths = [];

        const { url } = tweet.media;

        // Check if there are multiple
        let hasMultiple = await fsExists(generatePath(tweet, 0));

        if (hasMultiple) {
            while (hasMultiple) {
                facePaths.push(generatePath(tweet, numFaces));
                numFaces += 1;
                hasMultiple = await fsExists(generatePath(tweet, numFaces));
            }
        } else {
            const hasOne = await fsExists(generatePath(tweet));

            if (hasOne) {
                facePaths.push(generatePath(tweet));
            }
        }

        facePaths.forEach(facePath => {
            output += `import ${noFileName(facePath)} from "../${facePath}";\n`;
        });

        output += `export const facesFor${tweet.tweet.id} = [${facePaths.map(noFileName).join(',')}];\n`;

        await fs.appendFile(outputFileName, output);
    });

    console.log(`Generated imports for detected faces in ${tweets.length} tweets and saved to ${outputFileName}!`);
}

generateImports();