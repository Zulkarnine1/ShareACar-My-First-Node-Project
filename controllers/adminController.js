const HttpError = require("../models/http-error");
const mainApp = require("../utility/main");
const cloudinary = require("../utility/cloudinary");
const Car = require("../models/car");
const User = require("../models/user");
const Rent = require("../models/rent");

const adminHome = async function (req, res, next) {
  try {
    let user = await mainApp.processUser(req.user);
    let cars = await mainApp.getAllDocs(Car);
    let rents = await mainApp.getAllDocs(Rent);
    let users = await mainApp.getAllDocs(User);
    let customers = users.length;

    let pack = {
      user: user,
      auth: true,
      customers: customers,
      cars: cars,
      rents: rents,
    };
    res.render("adminHome", pack);
  } catch (error) {
    console.log(error);
    const err = new HttpError("Internal server error.", 500);
    return next(err);
  }
};

const adminCars = async function (req, res, next) {
  try {
    let user = await mainApp.processUser(req.user);
    let cars = await mainApp.getAllDocs(Car);
    let pack = {
      user: user,
      auth: true,
      cars: cars,
    };

    res.render("admincars", pack);
  } catch (error) {
    console.log(error);
    const err = new HttpError("Internal server error.", 500);
    return next(err);
  }
};

const adminDeleteCar = async function (req, res, next) {
  try {
    const car = await Car.findById(req.params.carID);

    if (car.availability) {
      await car.remove();
      res.redirect("/adminCars");
    } else {
      return next(new HttpError("Cannot delete car as a user is renting it already.", 422));
    }
  } catch (error) {
    console.log(error);
    const err = new HttpError("Internal server error.", 500);
    return next(err);
  }
};

const adminRents = async function (req, res, next) {
  try {
    let user = await mainApp.processUser(req.user);
    let rents = await mainApp.getAllDocs(Rent);
    let cars = await mainApp.getAllDocs(Car);
    let pack = {
      user: user,
      auth: true,
      rents: rents,
      cars: cars,
    };
    res.render("adminRents", pack);
  } catch (error) {
    console.log(error);
    const err = new HttpError("Internal server error.", 500);
    return next(err);
  }
};

const adminRenters = async function (req, res, next) {
  try {
    let renters = await mainApp.getAllDocs(User);
    let user = await mainApp.processUser(req.user);

    let pack = {
      user: user,
      auth: true,
      renters: renters,
    };

    res.render("adminRenters", pack);
  } catch (error) {
    console.log(error);
    const err = new HttpError("Internal server error.", 500);
    return next(err);
  }
};

const getEditUser = async function (req, res, next) {
  try {
    let rents = [];
    let cars = [];
    let user = await mainApp.processUser(req.user);
    let targetUser = await mainApp.getOneDoc(User, req.params.userID);

    for (let i = 0; i < targetUser.rents.length; i++) {
      let rentID = targetUser.rents[i];
      let rent = await mainApp.getOneDoc(Rent, rentID);

      rents.push(rent);
    }

    for (let i = 0; i < targetUser.rents.length; i++) {
      let carID = rents[i].car;
      let car = await mainApp.getOneDoc(Car, carID);

      cars.push(car);
    }

    let accountPack = {
      user: user,
      user1: targetUser,
      auth: true,
      rents: rents,
      cars: cars,
    };

    res.render("adminVEuser", accountPack);
  } catch (error) {
    console.log(error);
    const err = new HttpError("Internal server error.", 500);
    return next(err);
  }
};

const getAddCredit = async function (req, res, next) {
  try {
    const userUp = await User.findById(req.params.userID);
    userUp.credit += Number(req.body.credit);
    await userUp.save();

    res.redirect("/edituser/" + req.params.userID);
  } catch (error) {
    console.log(error);
    const err = new HttpError("Internal server error.", 500);
    return next(err);
  }
};

const getAddCar = async function (req, res, next) {
  try {
    let user = await mainApp.processUser(req.user);

    let pack = {
      user: user,
      auth: true,
    };

    res.render("addCar", pack);
  } catch (error) {
    console.log(error);
    const err = new HttpError("Internal server error.", 500);
    return next(err);
  }
};

const getEditCar = async function (req, res, next) {
  try {
    let user = await mainApp.processUser(req.user);
    let car = await mainApp.getOneDoc(Car, req.params.carID);

    let pack = {
      user: user,
      auth: true,
      car: car,
    };

    res.render("editCar", pack);
  } catch (error) {
    console.log(error);
    const err = new HttpError("Internal server error.", 500);
    return next(err);
  }
};

const postAddCar = async function (req, res, next) {
  try {
    var package = JSON.parse(req.body.package);
    var prodTime = new Date();
    prodTime = prodTime.getTime();
    var resType = package.resType;
    var resUnit;
    var images = [package.img1, package.img2, package.img3, package.img4, package.img5, package.img6];
    var imageUrl = [];

    for (let i = 0; i < images.length; i++) {
      let imgData = images[i];
      let pack2 = {
        folder: "shareCarTemp/uploads",
      };
      let cloudRes = await cloudinary.uploadFile(imgData, pack2);
      imageUrl.push(cloudRes.data.url);
    }

    if (resType == "Oil") {
      resUnit = "litres";
    } else {
      resUnit = "%";
    }

    const car = new Car({
      name: package.name,
      brand: package.brand,
      model: package.model,
      age: prodTime,
      catagory: package.cat,
      price: package.price,
      mileage: package.mileage,
      mileageType: package.munit,
      resourceLeft: package.resource,
      resourceType: resType,
      resourceUnit: resUnit,
      about: package.about,
      availability: true,
      img1: imageUrl[0],
      img2: imageUrl[1],
      img3: imageUrl[2],
      img4: imageUrl[3],
      img5: imageUrl[4],
      img6: imageUrl[5],
    });

    await car.save();

    res.send("/car/" + car._id);
  } catch (error) {
    console.log(error);
    res.send(false);
  }
};

const postEditCar = async function (req, res, next) {
  try {
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

    if (package.name == "") {
      name = car.name;
    } else {
      name = package.name;
    }

    if (package.brand == "") {
      brand = car.brand;
    } else {
      brand = package.brand;
    }

    if (package.model == "") {
      model = car.model;
    } else {
      model = package.model;
    }

    if (package.cat == "") {
      catagory = car.catagory;
    } else {
      catagory = package.cat;
    }

    if (package.price == "") {
      price = car.price;
    } else {
      price = package.price;
    }

    if (package.mileage == "") {
      mileage = car.mileage;
    } else {
      mileage = package.mileage;
    }

    if (package.about == "") {
      about = car.about;
    } else {
      about = package.about;
    }

    if (package.munit == "") {
      mileageType = car.mileageType;
    } else {
      mileageType = package.munit;
    }

    if (package.munit == "") {
      mileageType = car.mileageType;
    } else {
      mileageType = package.munit;
    }
    if (package.resource == "") {
      resourceLeft = car.resourceLeft;
    } else {
      resourceLeft = package.resource;
    }

    if (package.resType == "") {
      resourceType = car.resourceType;
      resourceUnit = car.resourceUnit;
    } else {
      resourceType = package.resType;
      if (package.resType == "Oil") {
        resourceUnit = "litres";
      } else {
        resourceUnit = "%";
      }
    }

    if (!(package.img1 == "")) {
      let pack2 = {
        folder: "shareCarTemp/uploads",
      };
      let cloudRes = await cloudinary.uploadFile(package.img1, pack2);
      img1 = cloudRes.data.url;
    } else {
      img1 = car.img1;
    }

    if (!(package.img2 == "")) {
      let pack2 = {
        folder: "shareCarTemp/uploads",
      };
      let cloudRes = await cloudinary.uploadFile(package.img2, pack2);
      img2 = cloudRes.data.url;
    } else {
      img2 = car.img2;
    }

    if (!(package.img3 == "")) {
      let pack2 = {
        folder: "shareCarTemp/uploads",
      };
      let cloudRes = await cloudinary.uploadFile(package.img3, pack2);
      img3 = cloudRes.data.url;
    } else {
      img3 = car.img3;
    }

    if (!(package.img4 == "")) {
      let pack2 = {
        folder: "shareCarTemp/uploads",
      };
      let cloudRes = await cloudinary.uploadFile(package.img4, pack2);
      img4 = cloudRes.data.url;
    } else {
      img4 = car.img4;
    }

    if (!(package.img5 == "")) {
      let pack2 = {
        folder: "shareCarTemp/uploads",
      };
      let cloudRes = await cloudinary.uploadFile(package.img5, pack2);
      img5 = cloudRes.data.url;
    } else {
      img5 = car.img5;
    }

    if (!(package.img6 == "")) {
      let pack2 = {
        folder: "shareCarTemp/uploads",
      };
      let cloudRes = await cloudinary.uploadFile(package.img6, pack2);
      img6 = cloudRes.data.url;
    } else {
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
      img6,
    };

    let carUp = await mainApp.updateDocObj(Car, car._id, update);

    res.send("/car/" + car._id);
  } catch (error) {
    console.log(error);
    res.send(false);
  }
};

exports.adminHome = adminHome;
exports.adminCars = adminCars;
exports.adminDeleteCar = adminDeleteCar;
exports.adminRents = adminRents;
exports.adminRenters = adminRenters;
exports.getEditUser = getEditUser;
exports.getAddCredit = getAddCredit;
exports.getAddCar = getAddCar;
exports.getEditCar = getEditCar;
exports.postAddCar = postAddCar;
exports.postEditCar = postEditCar;
