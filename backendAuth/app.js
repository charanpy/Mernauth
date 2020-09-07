const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectDb = require('./config/db');

const app = express();
app.use(express.json());

////////////////////////////////////////
//^ config .env to ./config/config.env //
////////////////////////////////////////
require('dotenv').config({
            path: './config/config.env'
})
connectDb();
////////////////////////////
// ^ config for development //
////////////////////////////

if (process.env.NODE_ENV === 'development') {
            app.use(cors({
                        origin: process.env.CLIENT_URL
            }))

            //^Morgan gives info about each requests

            app.use(morgan('dev'));
}

//^Routes
const authRoute = require('./routers/auth');

//^Use Routes
app.use('/api/', authRoute);




//^test-route
app.get('/', (req, res) => {
            res.send('hi');
})

//^404 page

app.use((req, res, next) => {
            res.status(404).json({
                        success: false,
                        message: 'Page Not  Found!'
            })
});


const PORT = process.env.PORT || 3001;


app.listen(PORT, () => {
            console.log("Server started");
})