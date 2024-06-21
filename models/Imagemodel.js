const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://admin:9850196991@login.ovc0xx7.mongodb.net/");

const imageSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    likes: {
        type: Number,
        default: 0
    },
    comments:{
        type:Array,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }
 
});

const Image = mongoose.model('Image', imageSchema);

module.exports = Image;
