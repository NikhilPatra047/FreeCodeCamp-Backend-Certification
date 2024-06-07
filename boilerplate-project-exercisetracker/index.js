const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
require('dotenv').config()

// Mongoose connect
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Mongoose Schema
const Schema = mongoose.Schema;
const userSchema = new Schema({
  username: { type: String, required: true },
  count: Number,
  log: [Object]
});

// Mongoose model
const User = mongoose.model("User", userSchema);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors())
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.route("/api/users").post(async function (req, res) {
  const { username } = req.body;
  const result = await User.create({ username });
  res.json({ username: result.username, _id: result._id });
}).get(async function(req, res) {
  const queryResults = await User.find({});
  console.log("queryResilts", queryResults);
  const formattedResults = queryResults.map((item) => {
    return {
      username: item.username,
      _id: item._id,
    }
  });
  res.send(formattedResults);
});

app.post("/api/users/:_id/exercises", async function(req, res) {
  const { _id } = req.params;
  const { description, duration, date } = req.body;
  const format_duration = Number(duration);
  const format_date = date.length === 0? new Date().toDateString(): new Date(date).toDateString();

  const user = await User.findById({ _id });
  
  if (user === null) {
    res.json({ error: "User not found" });
  } else {
    const exercise = {
      description, 
      duration: format_duration,
      date: format_date
    };
    user.log.push(exercise);
    user.count = user.log.length;
    const query = await User.findByIdAndUpdate({ _id }, { username: user.username, count: user.count, _id: user._id, log: user.log }, { new: true, upsert: true });
    res.json({
      username: query.username, 
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date,
      _id: query._id
    });
  }
});

app.get("/api/users/:_id/logs", async function (req, res) {
  const { _id } = req.params; 
  const user = await User.find({ _})
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
