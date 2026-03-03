const express = require("express");
const router = express.Router();

const authCheck = require("../middleware/authCheck");
const isAdmin = require("../middleware/admin");

const {
  getAllUsers,
  deleteUser,
  getAllUrls,
  deleteUrl,
  getDashboardSummary,
  getGlobalAnalytics,
  toggleBanUser
} = require("../controllers/admin.controllers");


router.use(authCheck, isAdmin);


router.get("/dashboard", getDashboardSummary);

router.get("/users", getAllUsers);
router.delete("/users/:userId", deleteUser);

router.get("/urls", getAllUrls);
router.delete("/urls/:shortCode", deleteUrl);
router.get("/global-analytics", getGlobalAnalytics);
router.patch("/users/:userId/ban", toggleBanUser);
module.exports = router;