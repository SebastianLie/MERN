const express = require('express');
const { check, validationResult } = require('express-validator');

const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const config = require('config');
const router = express.Router();
// const { check, validationResult }

// @route POST api/users
// @desc  test route
// @access public
// this poost request handling also handles validation of requests
router.post('/', [
    check('name', 'Name is required').not().isEmpty(), 
    check('email', 'Please include a valid email') .isEmail(),
    check('password', 'Please enter a password with 6 or more chars').isLength({ min: 6})
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array() });
    }
    const {name, email, password} = req.body;
    try {
        let user = await User.findOne({ email });
        // see if user exists
        if (user) {
            // make sure to add a return if its not the last res.json or res.status
            return res.status(400).json({errors: [{msg: "User already exists"}] })
        }
         
        // get users gravatar
        const avatar = gravatar.url(email, {
            s:'200',
            r: 'pg',
            d: 'mm'
        });
        user = new User({
            name, email, avatar, password 
        });
        // create salt to hash password with
        const salt = await bcrypt.genSalt(10);

        // encrypt password using bcrypt
        user.password = await bcrypt.hash(password, salt);

        await user.save(); // gives a promise

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
