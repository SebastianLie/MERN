const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('config')
const auth = require('../../middleware/auth');
const User = require('../../models/User');

const { check, validationResult } = require('express-validator');
// @route GET api/auth
// @desc  test route
// @access public
router.get('/', auth, async (req, res) => {
    console.log("Getting User Data");
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch(err) {
        res.status(500).send('Server Error');
    }
});

// @route POST api/auth
// @desc  authenticate user and validate token
// @access public
// this poost request handling also handles validation of requests
router.post('/', [
    check('email', 'Please include a valid email') .isEmail(),
    check('password', 'Password required').exists()
], async (req, res) => {
    // check for errors in the body
    console.log("Posting Login Credentials");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array() });
    }
    const {email, password} = req.body;
    try {
        let user = await User.findOne({ email });
        // see if user exists
        if (!user) {
            // make sure to add a return if its not the last res.json or res.status
            return res.status(400).json({errors: [{msg: "Invalid credentials"}] })
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({errors: [{msg: "Invalid credentials"}] });
        }
        const payload = { // get payload of user id
            user: {
                id: user.id
            }
        }
        jwt.sign( // sign token
            payload,  
            config.get('jwtSecret'), //secret
            {expiresIn: 36000}, //optional but recommended
            (err, token) => { // is the callback
                if (err) throw err;
                // return json webtoken 
                res.json({ token })

            })
        
    } catch(err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
    
});

module.exports = router;