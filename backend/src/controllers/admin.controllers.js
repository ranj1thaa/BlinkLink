const User = require("../models/User");
const Url = require("../models/Url");
const Analytics = require("../models/Analytics");
const ExpressError = require("../utils/ExpressError");

const getAllUsers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || "";

  const query = {
    $or: [
      { username: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } }
    ]
  };

  const total = await User.countDocuments(query);

  const users = await User.find(query)
    .select("-password")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  res.json({
    success: true,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    users
  });
};


const deleteUser = async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    throw new ExpressError(404, "User not found");
  }


  const userUrls = await Url.find({ createdBy: userId });

  const shortCodes = userUrls.map(u => u.shortCode);

  await Url.deleteMany({ createdBy: userId });


  await Analytics.deleteMany({
    shortCode: { $in: shortCodes }
  });

  await User.findByIdAndDelete(userId);

  res.json({
    success: true,
    message: "User and related data deleted successfully"
  });
};

const getAllUrls = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || "";

  const query = {
    $or: [
      { shortCode: { $regex: search, $options: "i" } },
      { originalUrl: { $regex: search, $options: "i" } }
    ]
  };

  const total = await Url.countDocuments(query);

  const urls = await Url.find(query)
    .populate("createdBy", "username email role")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  res.json({
    success: true,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    urls
  });
};

const deleteUrl = async (req, res) => {
  const { shortCode } = req.params;

  const url = await Url.findOne({ shortCode });
  if (!url) {
    throw new ExpressError(404, "URL not found");
  }

  await Url.deleteOne({ shortCode });
  await Analytics.deleteMany({ shortCode });

  res.json({
    success: true,
    message: "URL deleted successfully"
  });
};

const getDashboardSummary = async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalUrls = await Url.countDocuments();
  const totalClicks = await Analytics.countDocuments();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);


  const clicksToday = await Analytics.countDocuments({
    createdAt: { $gte: today }
  });


  const clicksYesterday = await Analytics.countDocuments({
    createdAt: { $gte: yesterday, $lt: today }
  });

  const clickGrowth =
    clicksYesterday === 0
      ? 100
      : ((clicksToday - clicksYesterday) / clicksYesterday) * 100;

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  const newUsersThisWeek = await User.countDocuments({
    createdAt: { $gte: weekStart }
  });

  const newUrlsThisWeek = await Url.countDocuments({
    createdAt: { $gte: weekStart }
  });

  const topUrls = await Url.find()
    .sort({ clicks: -1 })
    .limit(5)
    .select("shortCode clicks originalUrl")
    .lean();

  res.json({
    success: true,
    totalUsers,
    totalUrls,
    totalClicks,
    clicksToday,
    clicksYesterday,
    clickGrowth: clickGrowth.toFixed(2),
    newUsersThisWeek,
    newUrlsThisWeek,
    topUrls
  });
};

const getGlobalAnalytics = async (req, res) => {

  const totalClicks = await Analytics.countDocuments();

  const countries = await Analytics.aggregate([
    { $group: { _id: "$country", count: { $sum: 1 } } },
    { $project: { _id: 0, country: "$_id", count: 1 } },
    { $sort: { count: -1 } }
  ]);

  const browsers = await Analytics.aggregate([
    { $group: { _id: "$browser", count: { $sum: 1 } } },
    { $project: { _id: 0, browser: "$_id", count: 1 } },
    { $sort: { count: -1 } }
  ]);

  const devices = await Analytics.aggregate([
    { $group: { _id: "$device", count: { $sum: 1 } } },
    { $project: { _id: 0, device: "$_id", count: 1 } },
    { $sort: { count: -1 } }
  ]);

  const timeline = await Analytics.aggregate([
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
    { $project: { _id: 0, date: "$_id", count: 1 } },
    { $sort: { date: 1 } }
  ]);

  const topUrls = await Url.find()
    .sort({ clicks: -1 })
    .limit(10)
    .select("shortCode clicks originalUrl")
    .lean();

  const topUsers = await Url.aggregate([
    { $group: { _id: "$createdBy", totalUrls: { $sum: 1 } } },
    { $sort: { totalUrls: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user"
      }
    },
    { $unwind: "$user" },
    {
      $project: {
        username: "$user.username",
        totalUrls: 1
      }
    }
  ]);

  res.json({
    success: true,
    totalClicks,
    countries,
    browsers,
    devices,
    timeline,
    topUrls,
    topUsers
  });
};

const toggleBanUser = async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    throw new ExpressError(404, "User not found");
  }

  user.isBanned = !user.isBanned;
  await user.save();

  res.json({
    success: true,
    message: user.isBanned ? "User banned" : "User unbanned"
  });
};

module.exports = {
  toggleBanUser,
  getGlobalAnalytics,
  getAllUsers,
  deleteUser,
  getAllUrls,
  deleteUrl,
  getDashboardSummary
};