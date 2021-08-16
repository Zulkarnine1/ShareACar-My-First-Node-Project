const HttpError = require("../models/http-error")
const mainApp = require("../utility/main")
const Car = require("../models/car")
const User = require("../models/user")
const Rent = require("../models/rent")

const adminHome = async function(req, res) {

    try {
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
    } catch (error) {
    console.log(error)
    const err = new HttpError("Internal server error.", 500);
    return next(err);
    }

    		

}

const adminCars = async function(req, res){


    		let user = await mainApp.processUser(req.user);
    		let cars = await mainApp.getAllDocs(Car);
    		let pack = {

    		user:user,
			auth:true,
			cars:cars
			
			

    		};

    		res.render("admincars", pack)
	
}


const adminDeleteCar = async function(req, res, next){

    const car = await Car.findById(req.params.carID)

    if(car.availability){
        await car.remove()
        res.redirect("/adminCars")
    }else{
        return next(new HttpError("Cannot delete car as a user is renting it already.",422))
    }

}


const adminRents = async function(req, res){

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

}



const adminRenters = async function(req, res){

    	let renters = await mainApp.getAllDocs(User);
    	let user = await mainApp.processUser(req.user);

    	let pack = {

    		user:user,
			auth:true,
			renters:renters
    		};

    		res.render("adminRenters", pack)

}

const getEditUser = async function(req, res){


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

}


const getAddCredit = async function(req, res){

            const userUp = await User.findById(req.params.userID)
            userUp.credit += Number(req.body.credit)
    		await userUp.save()

    		res.redirect("/edituser/"+req.params.userID);


    	

}


const getAddCar = async function(req, res){



    	let user = await mainApp.processUser(req.user);

    	let pack = {

    		user:user,
			auth:true

    		};

    		res.render("addCar", pack)



}


const getEditCar = async function(req, res){

    	let user = await mainApp.processUser(req.user);
    	let car = await mainApp.getOneDoc(Car, req.params.carID);

    	let pack = {

    		user:user,
			auth:true,
			car:car
    		};

    		res.render("editCar", pack)
}


exports.adminHome = adminHome
exports.adminCars = adminCars
exports.adminDeleteCar = adminDeleteCar
exports.adminRents = adminRents
exports.adminRenters = adminRenters
exports.getEditUser = getEditUser
exports.getAddCredit = getAddCredit
exports.getAddCar = getAddCar
exports.getEditCar = getEditCar