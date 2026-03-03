const express=require('express')
const { signup, login, logout } = require('../controllers/auth.controllers')
const { validateSignup, validateLogin } = require('../middleware/validators')
const authCheck=require('../middleware/authCheck')
const router=express.Router()
router.post('/login',validateLogin ,login)
router.post('/signup',validateSignup,signup)
router.post('/logout',authCheck, logout)
router.get('/me', authCheck, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});
module.exports=router