const express = require("express");
require("dotenv").config();

console.log(process.env.TESTE); // remove this after you've confirmed it is working

const app = express();

const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Alive");
});

app.listen(PORT, () => {
  console.log(`Api running on: http://0.0.0.0:${PORT}`);
});
