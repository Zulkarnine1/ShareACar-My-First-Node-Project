module.exports.processUser = processUser;

function processUser(user) {
  var name = user.name;
  var Fname = name.substr(0, name.indexOf(" "));

  let userData = {
    name: Fname,
    id: user._id,
    profileImg: user.profileImg,
    admin: user.admin,
  };

  return userData;
}

module.exports.getAllDocs = getAllDocs;

function getAllDocs(Model) {
  return new Promise(function (resolve) {
    Model.find({}, null, function (err, docs) {
      resolve(docs);
    });
  });
}

module.exports.getOneDoc = getOneDoc;

function getOneDoc(Model, id) {
  return new Promise(function (resolve) {
    Model.findById(id, function (err, doc) {
      resolve(doc);
    });
  });
}

module.exports.updateDocObj = updateDocObj;

function updateDocObj(Model, id, update) {
  return new Promise(function (resolve) {
    Model.findByIdAndUpdate(id, update, null, function (err, result) {
      if (err) {
        console.log(err);
      } else {
        resolve(true);
      }
    });
  });
}

module.exports.searchID = searchID;

function searchID(Model, id) {
  return new Promise(function (resolve) {
    Model.findById(id, function (err, doc) {
      if (err) {
        console.log(err);
      } else {
        if (!(doc == undefined)) {
          resolve({ bool: true, doc: doc });
        } else {
          resolve({ bool: false });
        }
      }
    });
  });
}

module.exports.aggSearch = aggSearch;

function aggSearch(Model, query) {
  return new Promise(function (resolve) {
    var agg = [
      {
        $search: {
          text: {
            query: query,
            path: ["name", "catagory", "brand", "model", "about"],
          },
          highlight: {
            path: ["name", "catagory", "brand", "model", "about"],
          },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          img1: 1,
          price: 1,
        },
      },
    ];

    Model.aggregate(agg).then(function (res) {
      resolve(res);
    });
  });
}

module.exports.closeRent = closeRent;
async function closeRent(rentID) {
  let rent = await mainApp.getOneDoc(Rent, rentID);
  if (rent.rentClosed == false) {
    let resLeft = 0;
    let userUp = await mainApp.updateDocObj(User, rent.renter, { occupied: false });
    let carUp = await mainApp.updateDocObj(Car, rent.car, { availability: true, resourceLeft: resLeft });
    let rentUp = await mainApp.updateDocObj(Rent, rentID, { rentClosed: true });
    console.log("Rent closed automatically");
  }
}
