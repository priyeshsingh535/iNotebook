const mongoose = require('mongoose');

const mongoURI = "mongodb+srv://Alya:3446@newcluster.txwaw3i.mongodb.net/test"

const connectToMongo = ()=>{
    mongoose.connect(mongoURI, ()=>{
        console.log("Connected to Mongodb Successfully");
    })
}

module.exports = connectToMongo;