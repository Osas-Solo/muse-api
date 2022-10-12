const express = require("express");
const PORT = process.env.PORT || 3000;
const app = express();
const prettify = require("express-prettify");
const userAPI = require("./routes/user");
const bodyParser = require("body-parser");
const path = require("path");

const publicPath = path.resolve(__dirname, "public");
app.use(express.static(publicPath));

app.use(prettify({
    always: true,
    spaces: 4,
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use("/user-api", userAPI);

app.listen(PORT, () => {
    console.log(`App started on port ${PORT}`);
});