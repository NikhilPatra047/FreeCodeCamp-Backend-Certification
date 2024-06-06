require('dotenv').config();
const cors = require('cors');
const bodyParser = require('body-parser');
const express = require('express');
const isUrl = require('is-url');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// variables
let counter = 0;
const shortenedUrls = {};

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
})

app.get("/api/shorturl/:input", function (req, res) {
  const { input } = req.params;
  const original_url = shortenedUrls[input];
  res.redirect(original_url);
});


app.post("/api/shorturl", (req, res) => {
  const url = req.body.url;
  console.log("shortedned", shortenedUrls);
  if (isUrl(url)) {
    counter++; 
    shortenedUrls[counter] = url;
    res.json({ original_url: url, short_url: counter });
  } else {
    res.json({ error: 'invalid url' });
  }
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
