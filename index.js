const express = require("express");
const PORT = process.env.PORT || 3000;
const app = express();
const userAPI = require("./routes/user");

app.use(userAPI);

app.listen(PORT, () => {
    console.log(`App started on port ${PORT}`);
});