// just like user model

const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'user'
    },
    website: {
        type:String
    },
    location: {
        type:String
    },
    curent: {
        type:String
    }, 
    bio: {
        type:String
    }, 
    githubusername: {
        type:String
    },
    experience: [{
        title: {
            type: String,
            required: true
        },
        company: {
            type:String,
            required: true
        },
        location: {
            type: String
        },
        from: {
            type: Date,
            required: true
        },
        to: {
            type: Date
        },
        current: {
            type: Boolean,
            default: false
        }
    }],
    education: [{
        school: {
            type: String,
            required: true
        },
        degree: {
            type: String,
            required: true
        },
        fieldofstudy: {
            type: String,
            required: true
        },
        from: {
            type: Date,
            required: true
        }
    }]
})

module.exports = Profile = mongoose.model('profile', ProfileSchema);