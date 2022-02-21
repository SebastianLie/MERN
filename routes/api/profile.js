const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

const { check, validationResult } = require('express-validator');


// @route GET api/profile/me
// @desc  get current user profile
// @access public
router.get('/me', auth, async (req, res) => {
    try {
        // bring in fields name and avatar from user 
        const profile = await Profile.findOne({ user: req.user.id}).populate('user', ['name', 'avatar']);
        if (!profile) {
            return res.status(400).json({msg: "No profile for user"});
        }
        res.json(profile);
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route POST api/profile
// @desc  create or update user profile
// @access private
router.post('/', auth, [
    check('status', 'status is required').not().isEmpty(),
    check('skills', 'skills is required').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array() });
    }
    const {
        website,
        status,
        skills,
        youtube,
        twitter,
        instagram,
        linkedin,
        facebook,
        // spread the rest of the fields we don't need to check
        ...rest
      } = req.body;
  
      // build a profile
      const profileFields = {
        user: req.user.id,
        website:
          website && website !== ''
            ? normalize(website, { forceHttps: true })
            : '',
        status: status,
        skills: Array.isArray(skills)
          ? skills
          : skills.split(',').map((skill) => skill.trim()), // map a trim on each part of the array, map takes in function of each 
        ...rest
      };
      try {
        // Using upsert option (creates new doc if no match is found):
        let profile = await Profile.findOneAndUpdate(
          { user: req.user.id }, // identify profile by user id
          { $set: profileFields }, // this is the actual setting
          { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        return res.json(profile);
      } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server Error');
      }
});
// @route    GET api/profile
// @desc     Get all profiles
// @access   Public
router.get(
    '/',
    async (req, res) => {
      try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);  
        res.json(profiles);
      } catch (err) {
        console.error(err.message);
        return res.status(500).json({ msg: 'Server error' });
      }
    }
  );

// @route    GET api/profile/user/:user_id
// @desc     Get profile by user ID
// @access   Public
router.get(
    '/user/:user_id',
    async ({ params: { user_id } }, res) => {
      try {
        const profile = await Profile.findOne({
          user: user_id
        }).populate('user', ['name', 'avatar']);
  
        if (!profile) return res.status(400).json({ msg: 'Profile not found' });
  
        return res.json(profile);
      } catch (err) {
        console.error(err.message);
        return res.status(500).json({ msg: 'Server error' });
      }
    }
  );
// @route    DELETE api/profile
// @desc     delete profile user and posts
// @access   private
router.delete(
    '/', auth,
    async (req, res) => {
      try {
        await Profile.findOneAndRemove({ user: req.user_id });
        await User.findOneAndRemove({ _id: req.user_id });
  
        res.json({msg: 'User Deleted'});
      } catch (err) {
        console.error(err.message);
        return res.status(500).json({ msg: 'Server error' });
      }
    }
  );

// @route    PUT api/profile/experience put because we are updating part of a profile
// @desc     Add profile experience
// @access   Private
router.put(
    '/experience',
    auth,
    // check all the required fields
    check('title', 'Title is required').notEmpty(),
    check('company', 'Company is required').notEmpty(),
    check('from', 'From date is required and needs to be from the past')
      .notEmpty()
      .custom((value, { req }) => (req.body.to ? value < req.body.to : true)),
    async (req, res) => {
        // typical check error block
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      try {
        const profile = await Profile.findOne({ user: req.user.id });
  
        profile.experience.unshift(req.body);
  
        await profile.save();
  
        res.json(profile);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
    }
  );


// @route    DELETE api/profile/experience/:exp_id
// @desc     Delete experience from profile
// @access   Private

router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
      const foundProfile = await Profile.findOne({ user: req.user.id });
  
      foundProfile.experience = foundProfile.experience.filter(
        (exp) => exp._id.toString() !== req.params.exp_id
      );
  
      await foundProfile.save();
      return res.status(200).json(foundProfile);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: 'Server error' });
    }
  });
  
// @route    PUT api/profile/education
// @desc     Add profile education
// @access   Private
router.put(
    '/education',
    auth,
    check('school', 'School is required').notEmpty(),
    check('degree', 'Degree is required').notEmpty(),
    check('fieldofstudy', 'Field of study is required').notEmpty(),
    check('from', 'From date is required and needs to be from the past')
      .notEmpty()
      .custom((value, { req }) => (req.body.to ? value < req.body.to : true)),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      try {
        const profile = await Profile.findOne({ user: req.user.id });
  
        profile.education.unshift(req.body);
  
        await profile.save();
  
        res.json(profile);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
    }
  );
  
// @route    DELETE api/profile/education/:exp_id
// @desc     Delete education from profile
// @access   Private

router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
      const foundProfile = await Profile.findOne({ user: req.user.id });
  
      foundProfile.education = foundProfile.education.filter(
        (edu) => edu._id.toString() !== req.params.edu_id
      );
  
      await foundProfile.save();
      return res.status(200).json(foundProfile);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: 'Server error' });
    }
  });

  module.exports = router;