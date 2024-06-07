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
  log: [{
    description: String,
    duration: Number,
    date: String
  }],
  count: Number
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
  const username = req.body.username;
  const user = await User.create({ username });
  if (!user) {
    res.json({ error: "User not found" });
  } else {
    res.json(user);
  }
}).get(async function (req, res) {
  const user = await User.find({});
  if (!user) {
    res.json({ error: "User not found" });
  } else {
    res.json(user);
  }
});

app.post("/api/users/:_id/exercises", async function(req, res) {
  const { _id } = req.params; 
  const { description, duration, date } = req.body; 
  const formatted_duration = parseInt(duration);
  const formatted_date = !date? new Date().toDateString(): new Date(date).toDateString();

  const exercise = {
    description,
    duration: formatted_duration,
    date: formatted_date
  };

  const user = await User.findById({ _id });
  if (!user) {
    res.json({ error: "User not found" });
  } else {
    user.log.push(exercise);
    user.count = user.log.length;
    const newUser = await User.findByIdAndUpdate({ _id }, { username: user.username, count: user.count, _id, log: user.log }, { new: true, upsert: true });
    res.json({
      username: newUser.username,
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date,
      _id
    });
  }
});

app.get("/api/users/:_id/logs", async function (req, res) {
  const { _id } = req.params; 
  const { from, to, limit } = req.query; 
  const formatted_from_date = new Date(Date.parse(from)).getTime();
  const formatted_to_date = new Date(Date.parse(to)).getTime();

  const user = await User.findById({ _id });
  if (!user) {
    res.json({ error: "User not found" });
  } else {
    if (from || to || limit) {
      const logs = user.log;
      const filteredLogs = logs.filter((log) => {
        const log_date = (new Date(log.date)).toISOString().split("T")[0];
        return true;
      });

      const slicedLogs = limit? filteredLogs.slice(0, limit): filteredLogs;
      user.log = slicedLogs;
    }

    res.json(user);
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
