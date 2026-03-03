const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true
  },
  shortCode: {
    type: String,
    required: true,
    unique: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  clicks: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    default: null 
  },
  qrCode: {
    type: String,
    default: null
  },
}, { timestamps: true });

 
urlSchema.index({ createdAt: -1 }); 
urlSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);
urlSchema.index({ clicks: -1 });  

const Url = mongoose.model("Url", urlSchema);

module.exports = Url;