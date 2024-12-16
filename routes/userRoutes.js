const express = require("express");
const router = express.Router();
const { jwtAuthMiddleware, generateToken } = require("./../jwt");
const User = require("../models/user");

router.post("/signup", async (req, res) => {
  try {
    const data = req.body;

    // Validate required fields
    if (!data.email || !data.password) {
      return res
        .status(400)
        .json({
          error: "Email, and Password are required",
          status: 400, 
        });
    }

    // Create a new Person document
    const newUser = new User(data);
    const response = await newUser.save();
    console.log("Data saved:", response);

    // Create payload for JWT
    const payload = {
      id: response.id,
    };
    console.log("Payload:", JSON.stringify(payload));

    // Generate JWT
    const token = generateToken(payload);
    console.log("Generated Token:", token);

    res.status(200).json({ response, token });
  } catch (err) {
    if (err.code === 11000) {
      // Check which field caused the duplication error
      const duplicateField = Object.keys(err.keyValue)[0];
      const message = `${
        duplicateField.charAt(0).toUpperCase() + duplicateField.slice(1)
      } already exists`;
      console.log(message);
      res.status(409).json({ message, status: 409 });
    } else {
      console.error("Internal server error:", err);
      res.status(500).json({ error: "Something went wrong!", status: 500 });
    }
  }
});

router.get("/profile", jwtAuthMiddleware, async (req, res) => {
  try {
    const userData = req.user;

    const userId = userData.id;

    const user = await User.findById(userId);
    console.log(user);

    res
      .status(200)
      .json({ user, status: 200, message: "profile shown suuccessfully" });
  } catch (error) {
    console.log(err);
    res.status(500).json({ message: "internal server error", status: 500 });
  }
});

router.put("/profile/password", jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // Extract the id from the token
    const { currentPassword, newPassword } = req.body; // Extract current and new passwords from request body

    // Check if currentPassword and newPassword are present in the request body
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Both currentPassword and newPassword are required' });
    }

    // Find the user by userID
    const user = await User.findById(userId);

    // If user does not exist or password does not match, return error
    if (!user || !(await user.comparePassword(currentPassword))) {
        return res.status(401).json({ message: 'Invalid current password'  , status : 401 });
    }

    // Update the user's password
    user.password = newPassword;
    await user.save();


    console.log("password updated suuccessfully");
    res.status(200).json({ status: 200, message: "password updated suuccessfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error", status: 500 });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { adharCardNumber, password } = req.body;

    const user = await User.findOne({ adharCardNumber: adharCardNumber });
    if (!user || !(await user.comparePassword(password))) {
      return res
        .status(401)
        .json({ message: "invalid adharCardNumber or password", status: 401 });
    }

    const payload = {
      id: user.id,
    };

    const token = generateToken(payload);
    console.log("token : ", token);

    // res.json({token});
    res
      .status(200)
      .json({ token, status: 200, message: "login suuccessfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error", status: 500 });
  }
});

module.exports = router;
