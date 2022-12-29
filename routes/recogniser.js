const express = require("express");
const recogniser = require("../recogniser/recogniser");
const router = express.Router();
const multer = require("multer");
const os = require("os");
const upload = multer({dest: os.tmpdir()});

router.post("/recognise", upload.single("file"), recogniser.recognise);

module.exports = router;