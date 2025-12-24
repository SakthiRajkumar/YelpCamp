require('dotenv').config();
const mongoose = require('mongoose');
const cities = require('./cities');
const {places, descriptors} = require("./seedHelpers");
const Campground = require("../models/campground");

mongoose.connect(process.env.MONGODB_URI);

const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("DataBase Connected!");
});

const sample = array => array[Math.floor(Math.random()*array.length)];

const seedDB = async() =>{
    await Campground.deleteMany({});
    for(let i=0;i<50;i++){
        const random1000 = Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random()*20)+10;
        const camp = new Campground({
        author : '694aa36bea10bff46350d9e1',
        location: `${cities[random1000].city}, ${cities[random1000].state} `,
        title : `${sample(descriptors)} ${sample(places)}`,
        description : 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse voluptatum distinctio odit ipsam pariatur odio natus nobis eius quidem deserunt iure, ratione veniam, ad quisquam corporis rerum, ullam laudantium ducimus!',
        price,
        geometry: {
          type: "Point",
            coordinates: [
              cities[random1000].longitude,
              cities[random1000].latitude,
             ]
            },
        image:[{
          url: 'https://res.cloudinary.com/dqhmyteav/image/upload/v1766131592/YelpCamp/sloydhouqpnm13f3zhjv.jpg',
          fileName: 'YelpCamp/sloydhouqpnm13f3zhjv',
        },
        {
          url: 'https://res.cloudinary.com/dqhmyteav/image/upload/v1766131581/YelpCamp/bvplfpvo40gisip7ztto.jpg',
          fileName: 'YelpCamp/bvplfpvo40gisip7ztto',
        },
        {
          url: 'https://res.cloudinary.com/dqhmyteav/image/upload/v1766131593/YelpCamp/ysjybs5xrtekkfaveyy9.jpg',
          fileName: 'YelpCamp/ysjybs5xrtekkfaveyy9',
        }]

    })
    await camp.save();

    }
    
}
seedDB();