const ACRCloud = require("acrcloud");
const fs = require("fs");
require("dotenv").config();

const acrRecogniser = new ACRCloud({
    host: process.env.ACR_HOST,
    access_key: process.env.ACR_ACCESS_KEY,
    access_secret: process.env.ACR_ACCESS_SECRET_CODE,
});

exports.recognise = (request, response) => {
    const musicFile = request.file;
    const musicFileBuffer = fs.readFileSync(musicFile.path);

    console.log(musicFile);

    acrRecogniser.identify(musicFileBuffer).then(
        recognitionResponse => {
            const recognitionResult = recognitionResponse;
            console.table(recognitionResult);
            response.status(200).json(recognitionResult);
        }
    ).catch(error => {
            console.error(error);
            response.status(500).json(
                {
                    status: 500,
                    message: "Internal server error",
                    error: `Sorry, an error occurred while trying to recognise this file.`,
                }
            );
        }
    );
};