const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const findOrCreate = require('mongoose-findorcreate');
//my apps
const databaseApp = require(__dirname + "/subApps/databaseSchema");
const signUpApp = require(__dirname + "/subApps/signup");
const mainApp = require(__dirname + "/subApps/main");
const cloudinary = require(__dirname + "/subApps/cloudinary");
const app = express();

app.set('view engine', 'ejs');

app.use( bodyParser.json({limit: '50mb'}) );
app.use(bodyParser.urlencoded({
  limit: '100mb',
  extended: false,
  parameterLimit:500000
}));
app.use(express.static("public"));

//session init
app.use(session({
    secret: "",
    resave: false,
    saveUninitialized: false

}))

app.use(passport.initialize());
app.use(passport.session());

// Please apply your mongo key here
const connect = mongoose.connect("", { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
const userSchema = new mongoose.Schema(databaseApp.getUserSchema());
const carSchema = new mongoose.Schema(databaseApp.getCarSchema());
const rentSchema = new mongoose.Schema(databaseApp.getRentSchema());




userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);


const User = new mongoose.model("users", userSchema);
const Car = new mongoose.model("cars", carSchema);
const Rent = new mongoose.model("rents", rentSchema);



passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});


// 								===========================
// 								===========================
// 									Maintainence section
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


app.get("/car/:carID", async function(req, res){

		let car = await mainApp.getOneDoc(Car, req.params.carID);

		if(car==undefined){

			res.render("error",{message:"No such car exists"})
		}else{
		if (req.isAuthenticated()) {

		let user = await mainApp.processUser(req.user);
		let homePack = {
			car:car,
			user:user,
			auth:true

		}
		res.render("carDis", homePack)

		}else{

		let homePack = {
			car:car,
			auth:false

		}
		res.render("carDis", homePack)

		}
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


		res.render("error",{message:"Unauthorized"})
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


app.get("/account", async function(req, res){

	if (req.isAuthenticated()) {

		
		let rents = [];
		let cars = [];
		let user = await mainApp.processUser(req.user);

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
			user1:req.user,
			auth:true,
			rents:rents,
			cars:cars

		}
		res.render("userAcc",accountPack)


	}else{

		res.redirect("/signin")

	}


	
});


app.get("/editaccount", function(req, res){

	if (req.isAuthenticated()) {

	let accountPack={

			user:req.user,
			auth:true

		}
	res.render("editAcc", accountPack)
	
	}else{

		res.redirect("/signin")

	}
	
});


app.get("/search/:query", async function(req, res){

	let query = req.params.query;
	var result = [];
	
	
	if(ObjectId.isValid(query.toString())){
		
	let car = await mainApp.searchID(Car, query);
	if(car.bool==true){


		result.push(car.doc);

	}
		
	}
	


	var aggRet = await mainApp.aggSearch(Car, query.toString());
	result = result.concat(aggRet);



	



	if (req.isAuthenticated()) {
		let user = await mainApp.processUser(req.user);
	let searchPack={

			user:user,
			auth:true,
			query:query,
			result:result


		}
	res.render("searchCar", searchPack)
	
	}else{

		let searchPack={

			
			auth:false,
			query:query,
			result:result

		}

	res.render("searchCar", searchPack)
	}

	
});


app.get("/signin", function(req, res){

	res.render("signin")
	
});

app.get("/signup", function(req, res){

	res.render("signup")
	
});

app.get("/signOut", function(req, res) {

    req.logout();
    res.redirect("/");

})


// Admin section

//adminHome


/*if (req.isAuthenticated()) {

    	if(req.user.admin==true){



    	}else{

    		res.render("error",{message:"Unauthorized, this page can only be accessed by admin accounts"})

    	}

    }else{

    	res.redirect("/signin")
    }*/

app.get("/adminhome", async function(req, res) {

    if (req.isAuthenticated()) {

    	if(req.user.admin==true){
    		let user = await mainApp.processUser(req.user);
    		let cars = await mainApp.getAllDocs(Car);
    		let rents = await mainApp.getAllDocs(Rent);
    		let users = await mainApp.getAllDocs(User);
    		let customers = users.length;

    		let pack = {

    		user:user,
			auth:true,
			customers:customers,
			cars:cars,
			rents:rents
			

    		};

    		res.render("adminHome", pack)

    	}else{

    		res.render("error",{message:"Unauthorized, this page can only be accessed by admin accounts"})

    	}

    }else{

    	res.redirect("/signin")
    }

})

app.get("/adminCars", async function(req, res){

	if (req.isAuthenticated()) {

    	if(req.user.admin==true){

    		let user = await mainApp.processUser(req.user);
    		let cars = await mainApp.getAllDocs(Car);
    		let pack = {

    		user:user,
			auth:true,
			cars:cars
			
			

    		};

    		res.render("admincars", pack)
    	}else{

    		res.render("error",{message:"Unauthorized, this page can only be accessed by admin accounts"})

    	}

    }else{

    	res.redirect("/signin")
    }
	
});


app.get("/deleteCar/:carID", function(req, res){

	if (req.isAuthenticated()) {

    	if(req.user.admin==true){

    		Car.findByIdAndRemove(req.params.carID, function(err, exploto){

    			res.redirect("/adminCars")
    			console.log('Doc deleted')
    		})


    	}else{

    		res.render("error",{message:"Unauthorized, this page can only be accessed by admin accounts"})

    	}

    }else{

    	res.redirect("/signin")
    }
	
});


app.get("/adminRents", async function(req, res){

	if (req.isAuthenticated()) {

    	if(req.user.admin==true){

    	let user = await mainApp.processUser(req.user);
    		let rents = await mainApp.getAllDocs(Rent);
    		let cars = await mainApp.getAllDocs(Car);
    		let pack = {

    		user:user,
			auth:true,
			rents:rents,
			cars:cars
			
			

    		};

    		res.render("adminRents", pack)

    	}else{

    		res.render("error",{message:"Unauthorized, this page can only be accessed by admin accounts"})

    	}

    }else{

    	res.redirect("/signin")
    }


})


app.get("/adminRenters", async function(req, res){

	if (req.isAuthenticated()) {

    	if(req.user.admin==true){

    	let renters = await mainApp.getAllDocs(User);
    	let user = await mainApp.processUser(req.user);

    	let pack = {

    		user:user,
			auth:true,
			renters:renters
			
			
			

    		};

    		res.render("adminRenters", pack)

    	}else{

    		res.render("error",{message:"Unauthorized, this page can only be accessed by admin accounts"})

    	}

    }else{

    	res.redirect("/signin")
    }


})


app.get("/editUser/:userID", async function(req, res){

	if (req.isAuthenticated()) {

    	if(req.user.admin==true){

    	let rents = [];
		let cars = [];
		let user = await mainApp.processUser(req.user);
		let targetUser = await mainApp.getOneDoc(User, req.params.userID);

		for(let i=0;i<targetUser.rents.length;i++){

			let rentID =  targetUser.rents[i];
			let rent = await mainApp.getOneDoc(Rent, rentID);
			
			rents.push(rent)
		}

		for(let i=0;i<targetUser.rents.length;i++){

			let carID =  rents[i].car;
			let car = await mainApp.getOneDoc(Car, carID);
			
			cars.push(car)
		}

		let accountPack={
			user:user,
			user1:targetUser,
			auth:true,
			rents:rents,
			cars:cars

		}

		res.render("adminVEuser", accountPack)

    	}else{

    		res.render("error",{message:"Unauthorized, this page can only be accessed by admin accounts"})

    	}

    }else{

    	res.redirect("/signin")
    }

})


app.get("/addcredit/:userID/:credit", async function(req, res){

	if (req.isAuthenticated()) {

    	if(req.user.admin==true){

    		let userUp = await mainApp.updateDocObj(User, req.params.userID, {credit:Number(req.params.credit)});

    		res.send("/edituser/"+req.params.userID);


    	}else{

    		res.redirect("/error")

    	}

    }else{

    	res.redirect("/signin")
    }


})

app.get("/addcar", async function(req, res){

	if (req.isAuthenticated()) {

    	if(req.user.admin==true){


    	let user = await mainApp.processUser(req.user);

    	let pack = {

    		user:user,
			auth:true
			
			
			
			

    		};

    		res.render("addCar", pack)

    	}else{

    		res.render("error",{message:"Unauthorized, this page can only be accessed by admin accounts"})

    	}

    }else{

    	res.redirect("/signin")
    }

})

app.get("/editcar/:carID", async function(req, res){

	if (req.isAuthenticated()) {

    	if(req.user.admin==true){


    	let user = await mainApp.processUser(req.user);
    	let car = await mainApp.getOneDoc(Car, req.params.carID);

    	let pack = {

    		user:user,
			auth:true,
			car:car
			
			
			
			

    		};

    		res.render("editCar", pack)

    	}else{

    		res.render("error",{message:"Unauthorized, this page can only be accessed by admin accounts"})

    	}

    }else{

    	res.redirect("/signin")
    }

})

app.get("/error", function(req, res){

	res.render("error",{message:"Unauthorized, this page can only be accessed by admin accounts"})

})


// 								===========================
// 								===========================
// 										Post section
// 								===========================
// 								===========================

// signup post route

app.post("/signUp", async function(req, res) {

	
	let ageVer = await signUpApp.checkAge(req.body.dob);
	if(ageVer==false){
		res.send("Age less than 18 years not allowed")
	}else{
    User.register({ username: req.body.username }, req.body.password, function(err, user) {

        if (err) {
            console.log(err)

            res.redirect('/signUp?error=' + encodeURIComponent('Email already taken'));
        } else {


            passport.authenticate("local")(req, res, function() {

                let query = { username: req.body.username };
                let update = {

                    name: req.body.name + " ",
                    email: req.body.username,
                    profileImg: "https://media.publit.io/file/Sokogate/Sokogate/12055105.jpg",
                    mobileNum: req.body.userMobile,
                    dateofbirth:req.body.dob,
                    credit:100000,
                    admin:false,
                    ver:false,
                    rents:[]



                };
                User.findOneAndUpdate(query, update, function(err, result) {

                    if (err) { console.log(err) } else {



                    }
                }).then(res.redirect("/"));

            })
        }


    })}
});

// signin post route

app.post("/signIn", function(req, res) {

	
    const username = req.body.username;
    const password = req.body.password;

    const user = new User({

        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function(err) {

        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function() {

                console.log("Sign in successful");
                if(req.user.admin==true){

                res.redirect("/adminhome");

                }else{

                res.redirect("/");

                }

            })
        }

    })

});

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




app.post("/userEditAcc/:userID", async function(req, res) {
	
	
	let user = await mainApp.getOneDoc(User, req.params.userID);
	var edition = JSON.parse(req.body.package);
	let name;
	let mNum;
	let profileImg;
	let license;
	//accept profile img
	if(!(edition.img1=="")){

		let pack2 = {

			folder:"shareCarTemp/Profile"
		}
		let cloudRes = await cloudinary.uploadFile(edition.img1, pack2);
		profileImg = cloudRes.data.url;


	}else{

		profileImg = user.profileImg;
	}
	//accept icense img
	if(!(edition.img2=="")){

		let pack3 = {

			folder:"shareCarTemp/License"
		}
		let cloudRes1 = await cloudinary.uploadFile(edition.img2, pack3);
		license = cloudRes1.data.url;
	}else{

		license = user.license;
	}

	//accept name

	if(!(edition.name=="")){


		name = edition.name;
	}else{

		name = user.name;
	}

	//accept number

	if(!(edition.mobileNum=="")){


		mNum = edition.mobileNum;
	}else{

		mNum = user.mobileNum;
	}

	let update = {

		name:name,
		mobileNum:mNum,
		profileImg:profileImg,
		license:license

	}

	User.findByIdAndUpdate(user._id, update , null , function(err, result){

			if (err) {console.log(err)}else{

			User.findById(user._id, function (err, doc) {

				if (err) {console.log(err)}else{

					if(!(doc.license==undefined)){

						User.findByIdAndUpdate(user._id, {ver:true} , null , function(err, result){
									

									if (err) {console.log(err)}else{

										res.send("/account")
									}
							})

					}else{


						res.send(false);
					}

				}
			

		});
			}

		})

    

});


let port = process.env.PORT;
if (port == null || port == "") {
    port = 8888;
}

app.listen(port, function() {

    console.log("Server is up and running")

});
