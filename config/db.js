// for doing db connection

// load packages 
const mongoose = require('mongoose');
const config = require('config');

// get global var from default.json file
const db = config.get('mongoURI');

const connectDB = async () => {
    try {
        await mongoose.connect(db);
        console.log(`MongoDB connected...`)
    } catch(err) {
        console.error(err.message);
        // exit process with failure
        process.exit(1);

    }
}

module.exports = connectDB;
