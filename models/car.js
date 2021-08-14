const mongoose = require("mongoose")

const Schema = mongoose.Schema

const carSchema = new Schema({
    name:String,
	brand:String,
	model:String,
	age:Number,
	catagory:String,
	price:Number,
	mileage:Number,
	mileageType:String,
	resourceLeft:Number,
	resourceType:String,
	resourceUnit:String,
	about:String,
	availability:Boolean,
	img1:String,
	img2:String,
	img3:String,
	img4:String,
	img5:String,
	img6:String,
})

module.exports = mongoose.model("cars", carSchema)