// main part of app

// load packages
const express = require('express');
const connectDB = require('./config/db');

const app = express();

// connect MongoDB
connectDB();

app.get('/', (req, res) => res.send(`API Running`));

// Define routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/posts', require('./routes/api/posts'));


const PORT = process.env.PORT || 5000; //port number!

app.listen(PORT, () => console.log(`Server started at port ${PORT}`))