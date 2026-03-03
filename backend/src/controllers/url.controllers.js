const { nanoid } = require("nanoid");
const Url = require("../models/Url");
const ExpressError = require("../utils/ExpressError");
const { redisClient } = require("../config/redis");
const Analytics = require("../models/Analytics");
const UAParser = require("ua-parser-js");
const geoip = require("geoip-lite");
const QRCode = require("qrcode");

const createShortUrl = async (req, res) => {
  const { originalUrl, customCode, expiresInDays } = req.body;

  let shortId;

  if (customCode) {

    const existing = await Url.findOne({ shortCode: customCode });

    if (existing) {
      throw new ExpressError(409, "Custom code already in use");
    }

    shortId = customCode;
  } else {
    let existing;

    do {
      shortId = nanoid(8);
      existing = await Url.findOne({ shortCode: shortId });
    } while (existing);
  }

  let expiresAt = null;
  if (expiresInDays) {
    const days = Number(expiresInDays);

    expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);
  }

  const shortUrl = `${process.env.BASE_URL}/${shortId}`;
  const qrCode = await QRCode.toDataURL(shortUrl);

  const newUrl = new Url({
    originalUrl,
    shortCode: shortId,
    expiresAt,
    createdBy: req.user?.id || null,
    qrCode
  });


  await newUrl.save();  

  res.status(201).json({
    success: true,
    shortUrl: `${process.env.BASE_URL}/${shortId}`,
    shortCode: shortId,
    qrCode
  });
};

const redirectToOriginal = async (req, res) => {
  const { shortCode } = req.params;

  const urlDoc = await Url.findOne({ shortCode });

  if (!urlDoc) {
    throw new ExpressError(404, "Short URL not found");
  }

  if (!urlDoc.isActive) {
    throw new ExpressError(410, "This link has been deactivated");
  }

  if (urlDoc.expiresAt && urlDoc.expiresAt < new Date()) {
    throw new ExpressError(410, "This link has expired");
  }

  const ip =
    req.headers["x-forwarded-for"]?.split(",").shift() ||
    req.socket?.remoteAddress;

  const parser = new UAParser(req.headers["user-agent"]);
  const browser = parser.getBrowser().name || "Unknown";
  const device = parser.getDevice().type || "desktop";

  const geo = geoip.lookup(ip);
  const country = geo?.country || "Unknown";

  await Analytics.create({
    shortCode,
    ip,
    country,
    browser,
    device,
  });

  await Url.updateOne({ shortCode }, { $inc: { clicks: 1 } });

  const cachedURL = await redisClient.get(shortCode);

  if (cachedURL) {
    return res.redirect(cachedURL);
  }

  await redisClient.set(shortCode, urlDoc.originalUrl, {
    EX: 60 * 60,
  });

  return res.redirect(302, urlDoc.originalUrl);
};

const getUrlAnalytics = async (req, res) => {
  const { shortCode } = req.params;

  const urlDoc = await Url.findOne({ shortCode }).lean();

  if (!urlDoc) {
    throw new ExpressError(404, "Short URL not found");
  }

  res.status(200).json({
    success: true,
    clicks: urlDoc.clicks,   
    countries: await Analytics.aggregate([
      { $match: { shortCode } },
      { $group: { _id: "$country", count: { $sum: 1 } } },
      { $project: { _id: 0, country: "$_id", count: 1 } }
    ]),
    browsers: await Analytics.aggregate([
      { $match: { shortCode } },
      { $group: { _id: "$browser", count: { $sum: 1 } } },
      { $project: { _id: 0, browser: "$_id", count: 1 } }
    ]),
    devices: await Analytics.aggregate([
      { $match: { shortCode } },
      { $group: { _id: "$device", count: { $sum: 1 } } },
      { $project: { _id: 0, device: "$_id", count: 1 } }
    ])
  });
};

const getAllUrls = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const sortField = req.query.sort || "createdAt";
  const order = req.query.order === "asc" ? 1 : -1;

  const skip = (page - 1) * limit;

  const total = await Url.countDocuments();

  const urls = await Url.find()
    .sort({ [sortField]: order })
    .skip(skip)
    .limit(limit)
    .lean();

  res.status(200).json({
    success: true,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: urls
  });
};

const getTopUrls = async (req, res) => {
  const topUrls = await Url.find()
    .sort({ clicks: -1 })
    .limit(10)
    .lean();

  res.status(200).json({
    success: true,
    data: topUrls.map(u => ({
      shortCode: u.shortCode,
      shortUrl: `${process.env.BASE_URL}/${u.shortCode}`,
      originalUrl: u.originalUrl,
      clicks: u.clicks,
      createdAt: u.createdAt,
      expiresAt: u.expiresAt,
      isActive: u.isActive
    }))
  });
};

const getMyUrls = async (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const sortField = req.query.sort || "createdAt";
  const order = req.query.order === "asc" ? 1 : -1;
  const skip = (page - 1) * limit;

  const total = await Url.countDocuments({ createdBy: userId });

  const urls = await Url.find({ createdBy: req.user.id })
    .sort({ [sortField]: order })
    .skip(skip)
    .limit(limit)
    .select("shortCode originalUrl clicks isActive expiresAt qrCode") 
    .lean();

  res.status(200).json({
    success: true,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: urls
  });
};

const getAnalytics = async (req, res) => {
  const { shortCode } = req.params;
  const totalClicks = await Analytics.countDocuments({ shortCode });

  const countries = await Analytics.aggregate([
    { $match: { shortCode } },
    { $group: { _id: "$country", count: { $sum: 1 } } },
    { $project: { _id: 0, country: "$_id", count: 1 } }
  ]);

  const browsers = await Analytics.aggregate([
    { $match: { shortCode } },
    { $group: { _id: "$browser", count: { $sum: 1 } } },
    { $project: { _id: 0, browser: "$_id", count: 1 } }
  ]);

  const devices = await Analytics.aggregate([
    { $match: { shortCode } },
    { $group: { _id: "$device", count: { $sum: 1 } } },
    { $project: { _id: 0, device: "$_id", count: 1 } }
  ]);

  res.json({
    success: true,
    totalClicks,
    countries,
    browsers,
    devices
  });
};

const getTimelineAnalytics = async (req, res) => {
  const { shortCode } = req.params;

  const timeline = await Analytics.aggregate([
    { $match: { shortCode } },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt"
          }
        },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        date: "$_id",
        count: 1
      }
    },
    { $sort: { date: 1 } }
  ]);

  res.json({
    success: true,
    timeline
  });
};

const toggleUrlStatus = async (req, res) => {
  const { shortCode } = req.params;

  const url = await Url.findOne({ shortCode });

  if (!url) {
    throw new ExpressError(404, "URL not found");
  }

  if (!url.createdBy || url.createdBy.toString() !== req.user.id) {
    throw new ExpressError(403, "Not authorized");
  }

  url.isActive = !url.isActive;
  await url.save();

  res.json({
    success: true,
    message: `URL ${url.isActive ? "activated" : "deactivated"}`,
    isActive: url.isActive
  });
};

const deleteUrl = async (req, res) => {
  const { shortCode } = req.params;

  const url = await Url.findOne({ shortCode });

  if (!url) {
    throw new ExpressError(404, "URL not found");
  }

  if (!url.createdBy || url.createdBy.toString() !== req.user.id) {
    throw new ExpressError(403, "Not authorized");
  }

  await Url.deleteOne({ shortCode });

  await redisClient.del(shortCode);

  res.json({
    success: true,
    message: "URL deleted successfully"
  });
};


module.exports = { createShortUrl , redirectToOriginal, getUrlAnalytics, getAllUrls, getTopUrls, getMyUrls, getAnalytics, getTimelineAnalytics, toggleUrlStatus, deleteUrl};