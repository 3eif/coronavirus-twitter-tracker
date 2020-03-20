const Twit = require('twit');
const config = require('./config.js')
const novelcovid = require('novelcovid')
const image2base64 = require('image-to-base64');

let T = new Twit({
    consumer_key: config.consumer_key,
    consumer_secret: config.consumer_secret,
    access_token: config.access_token,
    access_token_secret: config.access_token_secret,
    timeout_ms: 60 * 1000,
})

setInterval(tweet, config.tweetRateMinutes * 600,000);
tweet()

async function tweet() {
    image2base64("https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/COVID-19_Outbreak_World_Map.svg/330px-COVID-19_Outbreak_World_Map.svg.png") // you can also to use url
        .then(async (resp) => {
            await novelcovid.all()
                .then((data) => {
                    let tweet = `🌍 Worldwide Coronavirus Statistics\nConfirmed Cases: ${data.cases} cases\nDeaths: ${data.deaths} deaths\nRecovered: ${data.recovered} recovered`
                    T.post('media/upload', { media_data: resp }, function (err, data, response) {
                        let mediaIdStr = data.media_id_string
                        let altText = "Small flowers in a planter on a sunny balcony, blossoming."
                        var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }

                        T.post('media/metadata/create', meta_params, function (err, data, response) {
                            if (!err) {
                                let params = { status: tweet, media_ids: [mediaIdStr] }

                                T.post('statuses/update', params, tweeted);
                            }
                        })
                    })

                    function tweeted(err, data, response) {
                        if (err) {
                            console.log("Something went wrong!");
                        }
                        else {
                            console.log("Tweet successful");
                        }
                    }
                }).catch((err) => console.error(err));
        }).catch((error) => {
            console.log(error);
        })
}

console.log('Twitter bot online.')