const Twit = require('twit');
const config = require('./config.js')
const { NovelCovid } = require("novelcovid");
const image2base64 = require('image-to-base64');

let T = new Twit({
    consumer_key: config.consumer_key,
    consumer_secret: config.consumer_secret,
    access_token: config.access_token,
    access_token_secret: config.access_token_secret,
    timeout_ms: 60 * 1000,
})

setInterval(tweet, config.rate);
tweet()

async function tweet() {
    const wikiImage = await image2base64("https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/COVID-19_Outbreak_World_Map.svg/330px-COVID-19_Outbreak_World_Map.svg.png");

    const track = new NovelCovid();

    const stats = await track.all();
    const countryStats = await track.countries();

    let confirmed = stats.cases;
    let active = stats.cases - stats.deaths - stats.recovered;
    let recovered = stats.recovered;
    let deaths = stats.deaths;
    let todayDeaths = 0;
    let todayCases = 0;
    countryStats.forEach(country => { todayDeaths += country.todayDeaths; todayCases += country.todayCases; });

    const countryInput = "USA";
    const country = await track.countries('USA');
    console.log(country);

    let unitedStates = `\n\n🗽 United States Statistics:\nConfirmed Cases: ${country.cases.toLocaleString()} (+${country.todayCases.toLocaleString()})\nRecovered: ${country.recovered.toLocaleString()}\nDeaths: ${country.deaths.toLocaleString()} (+${country.todayDeaths})`;
    let worldWide = `🌍 Worldwide Coronavirus Statistics\nConfirmed Cases: ${confirmed.toLocaleString()} (+${todayCases.toLocaleString()})\nRecovered: ${recovered.toLocaleString()}\nDeaths: ${deaths.toLocaleString()} (+${todayDeaths.toLocaleString()})`
    let hashtags = `\n\n#coronavirus #corona #covid19`

    T.post('media/upload', { media_data: wikiImage }, function (err, data, response) {
        let mediaIdStr = data.media_id_string
        let altText = "Small flowers in a planter on a sunny balcony, blossoming."
        var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }

        T.post('media/metadata/create', meta_params, function (err, data, response) {
            if (!err) {
                let params = { status: worldWide + unitedStates + hashtags, media_ids: [mediaIdStr] }
                T.post('statuses/update', params, tweeted);
            }
        })
    })

    function tweeted(err, data, response) {
        if (err) {
            console.log(err);
        } else {
            console.log("Tweet successful");
        }
    }
}

console.log('Twitter bot online.')