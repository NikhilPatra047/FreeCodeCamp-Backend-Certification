require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();

// Mongoose connect 
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Schema
const Schema = mongoose.Schema;
const urlSchema = new Schema({
  original_url: { required: true, type: String },
  short_url: { required: true, type: Number }
});
// Model
const Url = mongoose.model("Url", urlSchema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get("/api/shorturl/:input", async (req, res) => {
  const input_url = req.params.input;

  const query = await Url.findOne({ short_url: input_url }).exec();
  query === null
  ? res.json({ error: "URL not found" })
  : res.json({ original_url: query.original_url, short_url: query.short_url });
});

app.post("/api/shorturl", async(req, res) => {
  const bodyUrl = req.body.url;
  const regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*)/;

  if (bodyUrl.match(regex) === null) {
    res.json({
      error: "Invalid URL"
    });
  } else {
    let index = 1;
    const query = await Url.findOne({ original_url: bodyUrl }).exec();
    index = query !== null? query.short_url + 1: index;
    const newQuery = await Url.findOneAndUpdate({ original_url: bodyUrl }, { original_url: bodyUrl, short_url: index }, { new: true, upsert: true }).exec();
    
    newQuery === null
    ? res.json({ error: "Something went wrong" })
    : res.json({ original_url: bodyUrl, short_url: newQuery.short_url });
  }
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
