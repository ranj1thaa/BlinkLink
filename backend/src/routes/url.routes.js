const express = require("express");
const router = express.Router();
const { createShortUrl, getUrlAnalytics, getAllUrls, getTopUrls, getMyUrls, getAnalytics, getTimelineAnalytics, toggleUrlStatus, deleteUrl } = require("../controllers/url.controllers");
const WrapAsync = require("../utils/WrapAsync");
const rateLimit = require("express-rate-limit");
const authCheck=require('../middleware/authCheck');
const { validateShorten } = require("../middleware/validators");

const shortenLimiter=rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, 
  message: {
    success: false,
    message: "Too many URLs created. Try again later."
  }
})


router.post("/shorten",authCheck,shortenLimiter,validateShorten, WrapAsync(createShortUrl));
router.get("/", WrapAsync(getAllUrls));
router.get("/top", WrapAsync(getTopUrls));
router.get("/my", authCheck, WrapAsync(getMyUrls));
router.get("/analytics/:shortCode/timeline",authCheck,WrapAsync(getTimelineAnalytics));
router.get("/analytics/:shortCode", authCheck, WrapAsync(getAnalytics));
router.patch("/:shortCode/toggle", authCheck, toggleUrlStatus);
router.delete("/:shortCode", authCheck, deleteUrl);

router.get("/:shortCode", WrapAsync(getUrlAnalytics));
module.exports = router;