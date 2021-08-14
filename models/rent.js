const mongoose = require("mongoose")

const Schema = mongoose.Schema

const rentSchema = new Schema({
    car:String,
		renter:String,
		startTime:Number,
		endTime:Number,
		cost:Number,
		rentClosed:Boolean,
})

module.exports = mongoose.model("rents", rentSchema)