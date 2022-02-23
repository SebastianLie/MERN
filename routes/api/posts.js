const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');
const checkObjectId = require('../../middleware/checkObjectId');

const { check, validationResult } = require('express-validator');


// @route POST api/posts
// @desc  test route
// @access public
router.post('/',[ auth, [
    check('text', 'text is required').not().isEmpty()
]] , async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array() });
    }
    try {
        // bring in fields name and avatar from user 
        const user = await User.findById(req.user.id).select('-password');
        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            user: req.user.id
        });
        const post = await newPost.save();
        res.json(post);
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
    
});

// @route    GET api/posts
// @desc     Get all posts
// @access   Private
router.get('/', auth, async (req, res) => {
    try {
      const posts = await Post.find().sort({ date: -1 }); // get most recent posts, so sort by most recent 
      res.json(posts);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });

// @route    GET api/posts/:id
// @desc     Get post by ID
// @access   Private
router.get('/:id', auth, checkObjectId('id'), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    res.json(post);
  } catch (err) {
    console.error(err.message);

    res.status(500).send('Server Error');
  }
});


// @route    DELETE api/posts
// @desc     del a post
// @access   Private
router.delete('/:id', auth, async (req, res) => {
    try {
      const post = await Post.findById(req.params.id); // get most recent posts, so sort by most recent 
      if (!post){
        return res.status(404).json({msg: "Post not found"});
    }

      //check user is owner of post
      if (post.user.toString() != req.user.id) {
          return res.status(401).json({msg:'User not authorised'})
      }
      await post.remove();
      res.json({msg: 'post removed'});
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({msg: "Post not found"});
      }
      res.status(500).send('Server Error');
    }
  });

// @route    PUT api/posts/like:id
// @desc     like a post
// @access   Private
router.put('/like/:id', auth, async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post){
          return res.status(404).json({msg: "Post not found"});
      }
      // check if the post already liked by user
      if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({msg: "post already liked"})
      }
      post.likes.unshift({ user: req.user.id});

      await post.save();
      res.json(post.likes);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({msg: "Post not found"});
      }
      res.status(500).send('Server Error');
    }
  });

// @route    PUT api/posts/unlike:id
// @desc     unlike a post
// @access   Private
router.put('/unlike/:id', auth, async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post){
          return res.status(404).json({msg: "Post not found"});
      }
      // check if the post not yet liked by user
      if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(400).json({msg: "post not yet been liked"})
      }
      const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);
      post.likes.splice(removeIndex, 1);

      await post.save();
      res.json(post.likes)
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({msg: "Post not found"});
      }
      res.status(500).send('Server Error');
    }
  });


// @route POST api/posts/comment/:id
// @desc  comment on a post
// @access private
router.post('/comment/:id',[ auth, [
    check('text', 'text is required').not().isEmpty()
]] , async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array() });
    }
    try {
        // bring in fields name and avatar from user 
        const user = await User.findById(req.user.id).select('-password');
        const post = await Post.findById(req.params.id);
        const newComment = new Post({
            text: req.body.text,
            name: user.name,
            user: req.user.id
        });
        post.comments.unshift(newComment)
        await post.save();
        res.json(post.comments);
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }

});

// @route DELETE api/posts/comment/:id/:comment_id
// @desc  comment on a post
// @access private
router.delete('/comment/:id/:comment_id', auth , async (req, res) => {
    try {
        const post = await Post.findById(req.params.id); // get most recent posts, so sort by most recent 
        if (!post){
          return res.status(404).json({msg: "Post not found"});
        }
        const comment = post.comments.find(comment => comment.id === req.params.comment_id);
        if (!comment) {
            return res.status(404).json({msg: "Comment not found"});
        }
        //check user is owner of post
        if (comment.user.toString() != req.user.id) { // if comment not equal to logged in user
            return res.status(401).json({msg:'User not authorised'})
        }
        const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id);
        post.comments.splice(removeIndex, 1);
        await post.save();
        res.json({msg: 'comment removed'});
      } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
          return res.status(404).json({msg: "Post not found"});
        }
        res.status(500).send('Server Error');
      }
});
module.exports = router;