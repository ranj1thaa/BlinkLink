const { body, validationResult } = require('express-validator');

const validateSignup = [
  body("username")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters"),

  body("email")
    .isEmail()
    .withMessage("Invalid email format"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    next();
  }
];

const validateLogin=[
  body("email")
    .isEmail()
    .withMessage("Invalid email format"),

  body("password")
    .isLength({min:6})
    .withMessage("Password must be at least 6 characters"),

  (req, res, next)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    next()
  }
]

const validateShorten=[
  body("originalUrl")
    .notEmpty()
    .withMessage("Original URL is required")
    .bail()
    .isURL()
    .withMessage("Invalid URL format"),
  body("customCode")
    .optional()
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage("Custom code can only contain letters, numbers, '-' and '_'"),
  body("expiresInDays")
    .optional()
    .isInt({ min: 1 })
    .withMessage("expiresInDays must be a positive number"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    next();
  }
]

module.exports = { validateSignup, validateLogin, validateShorten };