const express = require("express");
const session = require("express-session")
const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;

require("dotenv").config()

// Local packages
const {passportConfig,passport} = require("./configs/passport-config")
const userRoutes = require("./routes/userRoutes")
const carRoutes = require("./routes/carRoutes")
const adminRoutes = require("./routes/adminRoutes")
const mainApp = require(__dirname + "/utility/main");
const cloudinary = require(__dirname + "/utility/cloudinary");
const HttpError = require("./models/http-error")

const app = express();

app.use(session({
    secret: process.env.APP_SECRET || "123xyz",
    resave: false,
    saveUninitialized: false

}))

app.set('view engine', 'ejs');

app.use( express.json({limit: '50mb'}) );
app.use( express.urlencoded({
  limit: '100mb',
  extended: false,
  parameterLimit:500000
}));

app.use(express.static("public"));

// Configure passport
passportConfig(app)

// 								===========================
// 								===========================
// 									Temporary section
// 								===========================
// 								===========================

const User = require("./models/user")
const Car = require("./models/car")
const Rent = require("./models/rent")

// 								===========================
// 								===========================
// 									Maintenance section
// 								===========================
// 								===========================

async function closeRent(rentID){

		let rent = await mainApp.getOneDoc(Rent, rentID);
		if(rent.rentClosed==false){

		let resLeft = 0;
		let userUp = await mainApp.updateDocObj(User, rent.renter, {occupied:false});
		let carUp = await mainApp.updateDocObj(Car, rent.car, {availability:true,resourceLeft:resLeft});
		let rentUp = await mainApp.updateDocObj(Rent, rentID, {rentClosed:true});
		console.log("Rent closed automatically");
		
	}

}


// 								===========================
// 								===========================
// 										Get section
// 								===========================
// 								===========================

app.get("/", async function(req, res){

		let cars = await mainApp.getAllDocs(Car);


		if (req.isAuthenticated()) {

		let user = await mainApp.processUser(req.user);
		let homePack = {
			cars:cars,
			user:user,
			auth:true

		}
		res.render("home", homePack)

		}else{

		let homePack = {
			cars:cars,
			auth:false

		}
		res.render("home", homePack)

		}
	
});



// all user rents page

app.get("/myrents", async function(req, res){

	if (req.isAuthenticated()) {
		let user = await mainApp.processUser(req.user);
		let rents = [];
		let cars = [];

		for(let i=0;i<req.user.rents.length;i++){

			let rentID =  req.user.rents[i];
			let rent = await mainApp.getOneDoc(Rent, rentID);
			rents.push(rent)
		}

		for(let i=0;i<req.user.rents.length;i++){

			let carID =  rents[i].car;
			let car = await mainApp.getOneDoc(Car, carID);
			
			cars.push(car)
		}

		let accountPack={

			user:user,
			auth:true,
			rents:rents,
			cars:cars

		}
		res.render("rentsUser",accountPack)

	}else{


		res.redirect("/signin")
	}
	
});
//rent process 1


app.get("/rentprocess1/:carID/:renttime", async function(req, res){

		let car = await mainApp.getOneDoc(Car, req.params.carID);
		
		let rentTime = Number(req.params.renttime);
		let cost = rentTime*car.price;
		if (req.isAuthenticated()) {

			if((rentTime<1)||(rentTime>200)||!(Number.isInteger(rentTime))){

			console.log('con1')
			res.send("con1")



		}else if(req.user.ver==false){
			
			res.send("con2");

		}else if(req.user.credit<cost){
			
			res.send("con3");
		}else if(req.user.occupied==true){

			res.send("con4");
		}else if(car.availability==false){
			res.send("con5");
		}else{
			// update car to unavailable
		let upCar = await mainApp.updateDocObj(Car, car._id, {availability:false});

		// make rent 
		let start = new Date();
		let end = new Date(start.getTime()+(rentTime*60*60*1000))
		let makeRent = {

		car:car._id,
		renter:req.user._id,
		startTime:start.getTime(),
		endTime:end.getTime(),
		cost:cost,
		rentClosed:false
		}

		Rent.create(makeRent, async function (err, rent1) {

			if (err){console.log(err)}else{

			let deduction = req.user.credit - cost;
			var newRents;
			
			req.user.rents.push(rent1._id.toString());
			newRents = req.user.rents;
		

			let userUp = {

				credit:deduction,
				rents:newRents, 
				occupied:true
			}
			let userDeduct = await mainApp.updateDocObj(User, req.user._id, userUp);


			}

		console.log(req.params)
		res.send("/rentStatus/"+rent1._id);
		setTimeout(closeRent, (rentTime*60*60*1000), rent1._id);
		})


	




		}

	}else{
			console.log('signin')
			res.send("/signin")
		}
	
});


app.get("/rentStatus/:rentID", async function(req, res){

	if (req.isAuthenticated()) {

		let rent = await mainApp.getOneDoc(Rent, req.params.rentID);

		if((req.user._id==rent.renter)||(req.user.admin==true)){
		let car = await mainApp.getOneDoc(Car, rent.car);
		let user = await mainApp.processUser(req.user);
		let renter = await mainApp.getOneDoc(User, rent.renter);
		let rentPack = {

			user:user,
			car:car,
			renter:renter,
			auth:true,
			rent:rent

		}
		res.render("rentStatus", rentPack)
	}else{


		res.render("error",{message:"Unauthorized 1"})
	}
		}else{

		res.redirect("/signin")

		}
	
});

app.get("/rentReview/:rentID", async function(req, res){

	if (req.isAuthenticated()) {
		let rent = await mainApp.getOneDoc(Rent, req.params.rentID);
		let user = await mainApp.processUser(req.user);
		res.render("rentEnd",{user:user,auth:true, rent:rent})


	}else{


		res.redirect("/signin")
	}
	
});
app.get("/rentClose/:rentID", async function(req, res){

	if (req.isAuthenticated()) {

		let rent = await mainApp.getOneDoc(Rent, req.params.rentID);

		if(rent.rentClosed==false){
		let resLeft = Number(req.session.resLeft);
		console.log("Get method:" + resLeft);
		let userUp = await mainApp.updateDocObj(User, rent.renter, {occupied:false});
		let carUp = await mainApp.updateDocObj(Car, rent.car, {availability:true,resourceLeft:resLeft});
		let rentUp = await mainApp.updateDocObj(Rent, req.params.rentID, {rentClosed:true});
		res.redirect("/rentStatus/"+rent._id)
	}else{


		res.render("error",{message:"Unauthorized, rent already closed"})
	}



	}else{


		res.redirect("/signin")
	}
	
});




// Admin section

//adminHome







// 								===========================
// 								===========================
// 										Post section
// 								===========================
// 								===========================



//ad  car

app.post("/addCar/:userID", async function(req, res) {

	
	let user = await mainApp.getOneDoc(User, req.params.userID);
	if(user.admin==true){


		var package = JSON.parse(req.body.package);
		var prodTime = new Date();
		prodTime = prodTime.getTime();
		var resType = package.resType;
		var resUnit ;
		var images = [package.img1,package.img2,package.img3,package.img4,package.img5,package.img6];
		var imageUrl = [];

		for(let i = 0; i<images.length;i++){
		let imgData = images[i];
		let pack2 = {

			folder:"shareCarTemp/uploads"
		}
		let cloudRes = await cloudinary.uploadFile(imgData, pack2);
		imageUrl.push(cloudRes.data.url)	

		}

		if(resType=="Oil"){

			resUnit = "litres";
		}else{

			resUnit = "%"
		}

		// final prep

		let car = {


	name:package.name,
	brand:package.brand,
	model:package.model,
	age:prodTime,
	catagory:package.cat,
	price:package.price,
	mileage:package.mileage,
	mileageType:package.munit,
	resourceLeft:package.resource,
	resourceType:resType,
	resourceUnit:resUnit,
	about:package.about,
	availability:true,
	img1:imageUrl[0],
	img2:imageUrl[1],
	img3:imageUrl[2],
	img4:imageUrl[3],
	img5:imageUrl[4],
	img6:imageUrl[5]
		}


		Car.create(car, async function (err, car1) {

			if (err){console.log(err)}else{

	
		res.send("/car/"+car1._id);
		

	}
		})

	}else{ res.send(false)}
    

});

//edit car


app.post("/editcar/:userID/:carID", async function(req, res) {

	
	let user = await mainApp.getOneDoc(User, req.params.userID);
	if(user.admin==true){

		var car = await mainApp.getOneDoc(Car, req.params.carID);
		var package = JSON.parse(req.body.package);

		let name;
		let brand;
		let model;
		let catagory;
		let price;
		let mileage;
		let mileageType;
		let resourceLeft;
		let resourceType;
		let resourceUnit;
		let about;
		let img1;
		let img2;
		let img3;
		let img4;
		let img5;
		let img6;

		if(package.name==""){

			name= car.name;
		}else{

			name = package.name;
		}


		if(package.brand==""){

			brand= car.brand;
		}else{

			brand = package.brand;
		}

		if(package.model==""){

			model= car.model;
		}else{

			model = package.model;
		}

		if(package.cat==""){

			catagory= car.catagory;
		}else{

			catagory = package.cat;
		}

		if(package.price==""){

			price= car.price;
		}else{

			price = package.price;
		}

		if(package.mileage==""){

			mileage= car.mileage;
		}else{

			mileage = package.mileage;
		}

		if(package.about==""){

			about= car.about;
		}else{

			about = package.about;
		}

		if(package.munit==""){

			mileageType= car.mileageType;
		}else{

			mileageType = package.munit;
		}

		if(package.munit==""){

			mileageType= car.mileageType;
		}else{

			mileageType = package.munit;
		}
		if(package.resource==""){

			resourceLeft= car.resourceLeft;
		}else{

			resourceLeft = package.resource;
		}

		if(package.resType==""){

			resourceType= car.resourceType;
			resourceUnit = car.resourceUnit;
		}else{

			resourceType = package.resType;
			if(package.resType == "Oil"){

				resourceUnit = "litres"
			}else{

				resourceUnit = "%";
			}
		}

		if(!(package.img1=="")){

		let pack2 = {

			folder:"shareCarTemp/uploads"
		}
		let cloudRes = await cloudinary.uploadFile(package.img1, pack2);
		img1 = cloudRes.data.url;


		}else{

		img1 = car.img1;
		
		}

		if(!(package.img2=="")){

		let pack2 = {

			folder:"shareCarTemp/uploads"
		}
		let cloudRes = await cloudinary.uploadFile(package.img2, pack2);
		img2 = cloudRes.data.url;


		}else{

		img2 = car.img2;
		
		}

		if(!(package.img3=="")){

		let pack2 = {

			folder:"shareCarTemp/uploads"
		}
		let cloudRes = await cloudinary.uploadFile(package.img3, pack2);
		img3 = cloudRes.data.url;


		}else{

		img3 = car.img3;
		
		}

		if(!(package.img4=="")){

		let pack2 = {

			folder:"shareCarTemp/uploads"
		}
		let cloudRes = await cloudinary.uploadFile(package.img4, pack2);
		img4 = cloudRes.data.url;


		}else{

		img4 = car.img4;
		
		}

		if(!(package.img5=="")){

		let pack2 = {

			folder:"shareCarTemp/uploads"
		}
		let cloudRes = await cloudinary.uploadFile(package.img5, pack2);
		img5 = cloudRes.data.url;


		}else{

		img5 = car.img5;
		
		}

		if(!(package.img6=="")){

		let pack2 = {

			folder:"shareCarTemp/uploads"
		}
		let cloudRes = await cloudinary.uploadFile(package.img6, pack2);
		img6 = cloudRes.data.url;


		}else{

		img6 = car.img6;
		
		}

		let update = {

		 name,
		 brand,
		 model,
		 catagory,
		 price,
		 mileage,
		 mileageType,
		 resourceLeft,
		 resourceType,
		 resourceUnit,
		 about,
		 img1,
		 img2,
		 img3,
		 img4,
		 img5,
		 img6


		}

		let carUp = await mainApp.updateDocObj(Car, car._id, update);

		res.send("/car/"+car._id);








	}else{ res.send(false)}
    

});
//post oil

app.post("/postOil/:rentID", function(req, res) {
	console.log("Post accepted")
	req.session.resLeft = req.body.oilleft;
 	res.redirect("/rentClose/"+req.params.rentID)

    

});







// 								===========================
// 								===========================
// 									New Routes section
// 								===========================
// 								===========================

app.use("/",userRoutes)
app.use("/",carRoutes)
app.use("/",adminRoutes)


// Error for non-existing route
app.use((req, res, next) => {
	const error = new HttpError("This route doesn't exist.", 404);
	throw error;
  });
  
  
  
  // Middlware for error handling
  app.use((err,req,res,next)=>{
	  
	  if(res.headerSent){
		  return next(err)
	  }

	  let code = err.code || 500
	  let message = err.message || "Oops, an unknown error occured."
	  res.render("error",{message,code})
	  
  })





// Please apply your mongo key here
mongoose.connect(process.env.MONGO_KEY, { useNewUrlParser: true, useUnifiedTopology: true }).then(()=>{
	console.log("Connected to DB successfully.")
	let port = process.env.PORT;
	if (port == null || port == "") {
		port = 8888;
	}

	app.listen(port, function() {

		console.log("Server is up and running")

	});

}).catch((e)=>{
	console.log("Failed to connect DB.")
	console.log(e);
	
})



