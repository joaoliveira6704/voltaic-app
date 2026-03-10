const express = require("express");

const app = express();

const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Alive");
});

app.listen(PORT, () => {
  console.log(`Api running on: http://0.0.0.0:${PORT}`);
});
