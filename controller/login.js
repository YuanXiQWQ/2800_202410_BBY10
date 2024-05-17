// routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Login Handle
router.post('/loggingin', async (req, res) => {
    const { email, password } = req.body;
    let errors = [];

    if (!email || !password) {
        errors.push({ msg: 'Please enter all fields' });
    }

    if (errors.length > 0) {
        return res.render('login', { errors, email, password });
    }

    try {
        // Find user by email
        const user = await User.findOne({ email: email });
        if (!user) {
            errors.push({ msg: 'Invalid email or password' });
            return res.render('login', { errors, email, password });
        }

        // Compare entered password with stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            errors.push({ msg: 'Invalid email or password' });
            return res.render('login', { errors, email, password });
        }

        // If credentials match, set session and redirect to dashboard
        req.session.user = user;
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.render('login', { errors: [{ msg: 'Server error, please try again later.' }], email, password });
    }
});

module.exports = router;
