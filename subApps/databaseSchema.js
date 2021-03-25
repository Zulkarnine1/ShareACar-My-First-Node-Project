// ======= Database Schema for users ===============
module.exports.getUserSchema = getUserSchema;

function getUserSchema (){

	let userSchema = {

	username:String,
	name:String,
	email:String,
	password:String,
	profileImg:String,
	mobileNum:String,
	license:String,
	credit:Number,
	admin:Boolean,
	dateofbirth:String,
	ver:Boolean,
	occupied:Boolean,
	rents:[]



};

return userSchema;
};


// ======= Database Schema for cars ===============
module.exports.getCarSchema = getCarSchema;

function getCarSchema (){

	let carSchema = {

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



};

return carSchema;
};


// ======= Database Schema for cars ===============
module.exports.getRentSchema = getRentSchema;

function getRentSchema (){

	let rentSchema = {

		car:String,
		renter:String,
		startTime:Number,
		endTime:Number,
		cost:Number,
		rentClosed:Boolean,


	}

	return rentSchema;
}