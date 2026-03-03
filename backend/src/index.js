const express=require('express')
const app=express()
const cors=require('cors')
const urlRoutes = require("./routes/url.routes");
const { redirectToOriginal } = require('./controllers/url.controllers');
const WrapAsync = require('./utils/WrapAsync');
const rateLimit=require('express-rate-limit')
const authRoutes=require('./routes/auth.routes')
const adminRoutes=require('./routes/admin.routes')
const cookieParser=require('cookie-parser')
const helmet=require('helmet')
const morgan = require("morgan");
const logger = require("./utils/logger");
const Url = require('./models/Url');

app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  })
);

app.use(express.json());
app.use(helmet());



app.use(cors({
  origin: ["http://localhost", "http://localhost:5173"],
  credentials: true
}));


app.use(cookieParser());

const globalLimiter=rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later."
  }
})
app.use(globalLimiter)

app.use("/api/url", urlRoutes);
app.get("/api/url/:shortCode", async (req, res) => {
  const baseUrl = process.env.BASE_URL || "http://localhost:5173";
  const url = await Url.findOne({ shortCode: req.params.shortCode });
  if (!url) return res.status(404).json({ message: "Not found" });

  if (!url.qrCode) {
    url.qrCode = await QRCode.toDataURL(`${baseUrl}/${url.shortCode}`);
    await url.save();
  }

  res.json({
    shortCode: url.shortCode,
    qrCode: url.qrCode
  });
});
app.get("/:shortCode", WrapAsync(redirectToOriginal));
app.use("/api/user", authRoutes);
app.use("/api/admin", adminRoutes)


app.use((err, req, res, next) => {

  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method
  });

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  const { statusCode = 500, message = "Something went wrong" } = err;

  res.status(statusCode).json({
    success: false,
    message
  });
});
module.exports=app