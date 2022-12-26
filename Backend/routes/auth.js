const { Router } = require("express");
const express = require("express");
const User = require("../models/User");
const bcrypt = require('bcryptjs');
const router = express.Router();
const jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require("express-validator");
const JWT_SECRET="priyeshisagoofb$oy";

// Route1:create a user using: POST"/api/auth/login"
router.post(
  "/createuser",
  [
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password must be at least 5 characters").isLength({
      min: 5, 
    }),
  ],
  async (req, res) => {
    let success = false;
    //If there  are error return the bad requet
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success,errors: errors.array() });
    }
    //check whether the user with the same email exists already
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({ success,error: "sorry a user with this email already exists" });
      }
      const salt= await bcrypt.genSalt(10);
      secPass=await bcrypt.hash(req.body.password,salt);
      user = await User.create({
        name: req.body.name,
        password: secPass,
        email: req.body.email,
      });
      const data={
        user:{
            id:user.id
        }
      }
      const authtoken = jwt.sign(jwt,JWT_SECRET);
      //res.json(user)
      success=true;
      res.json({success,authtoken});
    } catch (error) {
      console.error(error.message);
      res.status(500).send("some error occured");
    }
}
);
//Route2:Authenticate a user using: POST"/api/auth/login"
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists(),
  ], async (req, res) => {
    let success  = false;
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ error: "Please try to login with correct credentials" });
      }
  
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        success=false;
        return res.status(400).json({success, error: "Please try to login with correct credentials" });
      }
  
      const data = {
        user: {
          id: user.id
        }
      }
      const authtoken = jwt.sign(data, JWT_SECRET);
      success=true;
      res.json({success, authtoken })
  
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  });
  //Route3:Get Loggedin User details using: POST"/api/auth/getuser": Login Required
  router.post('/getuser',fetchuser, async (req, res) => {
  try {
   userId= req.user.id;
   const user = await User.findById(userId).select("-password")
   res.send(user)

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
})
module.exports = router;
