const mongoose = require("mongoose")
const passportLocalMongoose = require('passport-local-mongoose');
const findOrCreate = require('mongoose-findorcreate');

mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

const Schema = mongoose.Schema

const userSchema = new Schema({

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
})

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);


module.exports = mongoose.model("users", userSchema)