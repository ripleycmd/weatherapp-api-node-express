const express = require('express');
const hbs = require('hbs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
const axios = require('axios');
const request = require('request');

// Finding a public directory
const publicDirectory = path.join(__dirname, '/public');
// Setting express to use the static files from public directory
app.use(express.static(publicDirectory));

const viewsPath = path.join(__dirname, '/views');
const partialPath = path.join(__dirname, '/views/partials');

hbs.registerPartials(partialPath);

// setting node.js view engine to use handlebars files
app.set('view engine', 'hbs');
//setting the views from HBS to come from our views path variable
app.set('views', viewsPath);
app.use(express.static('views/images'));

// Parse URL- encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const timeStampCoverter = (timestamp) => {
  let date = new Date(timestamp * 1000);
  let hrs = date.getHours();
  let mins = '0' + date.getMinutes();
  let formattedTime = hrs + ':' + mins.substr(-2);
  return formattedTime;
};

const dPlusMTimestampConverter = (timestamp) => {
  let date = new Date(timestamp * 1000);
  var months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  let day = date.getDate();
  let month = months[date.getMonth()];
  let formattedDate = day + ' ' + month;
  return formattedDate;
};

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/result', async (req, res) => {
  try {
    const drawer = false;
    const city = req.body.city;
    const country = req.body.country;
    const weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&units=metric&appid=b7e53a69e8d57ee9c4e219dc0de83c6d`;
    const apiResponse = await axios.get(weatherURL);
    let iconCode = apiResponse.data.weather[0].icon;
    iconUrl = 'http://openweathermap.org/img/w/' + iconCode + '.png';

    res.render('index', {
      drawer: true,
      weather: apiResponse.data.main.temp,
      cityName: city,
      info: apiResponse.data.weather[0].description,
      iconPic: iconUrl,
    });
  } catch (e) {
    console.error(e.response);
    res.render('index', {
      msg: e.response.data.message,
    });
  }
});

app.get('/krakow', async (req, res) => {
  try {
    const krakowImage =
      'https://images.fineartamerica.com/images/artworkimages/mediumlarge/2/krakow-cityscape-travel-poster-inspirowl-design.jpg';
    weatherURLKrk =
      'https://api.openweathermap.org/data/2.5/onecall?lat=50.0647&lon=19.9450&exclude=hourly&units=metric&appid=b7e53a69e8d57ee9c4e219dc0de83c6d';
    apiResponseKrk = await axios.get(weatherURLKrk);
    let krkIconCode = apiResponseKrk.data.current.weather[0].icon;
    let iconUrl1 = 'http://openweathermap.org/img/w/' + krkIconCode + '.png';
    let sunrise = timeStampCoverter(apiResponseKrk.data.current.sunrise);
    let sunset = timeStampCoverter(apiResponseKrk.data.current.sunset);
    const daily = apiResponseKrk.data.daily;

    const dailyTemp = daily.map((x) => Math.round(x.temp.day));
    let dailyDayDate = daily.map((x) => x.dt);
    let arrImgDaily = daily.map(
      (x) => 'http://openweathermap.org/img/wn/' + x.weather[0].icon + '.png'
    );
    let arrDescDaily = daily.map((x) => x.weather[0].description);
    let arrDay = dailyDayDate.map((x) => dPlusMTimestampConverter(x));

    res.render('krakow', {
      imgKrakow: krakowImage,
      // krkTemp: Math.round(apiResponseKrk.data.current.temp),
      // krkIconPic: iconUrl1,
      // krkSunrise: sunrise,
      // krkSunset: sunset,
      imgDaily: arrImgDaily,
      dayTempList: dailyTemp,
      dailyDesc: arrDescDaily,
      mapDay: arrDay,
    });
  } catch (e) {
    console.error(e.response);
    res.render('krakow', {
      msg: e.response.data.message,
    });
  }
});

// app.post('/krakow', (req, res) => {
//   res.render('krakow');
// });

app.get('*', (req, res) => {
  res.render('error');
});

app.listen(port, () => console.log(`Example app listening on port port!`));
