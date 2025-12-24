const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const imageSchema = new Schema({
    url :String,
    fileName: String
});
imageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload','/upload/w_200,h_200');
});
const opts = { toJSON: { virtuals: true } };
const campgroundSchema = new Schema({
    title : String,
    image :[imageSchema],
    price : Number,
    description : String,
    location : String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    author : {
        type : Schema.Types.ObjectId,
        ref : "User"
    },
    reviews:[{
        type:Schema.Types.ObjectId,
        ref:"Review"
    }]
}, opts); 

campgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0, 20)}...</p>`
});

campgroundSchema.post('findOneAndDelete',async function(data){
    if(data){
        await Review.deleteMany({
            _id: {
                $in : data.reviews
            }
        })
    
    }
})

module.exports = mongoose.model('Campground', campgroundSchema);