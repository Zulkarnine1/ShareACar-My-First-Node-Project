# Shareacar - My First Web Application

[![](https://res.cloudinary.com/south-china-university-of-technology/image/upload/v1595278397/shareCarTemp/WeChat_Screenshot_20200718122206_krtebw.png)](https://shareacar88.herokuapp.com/)

## Contents

1. [Introduction](https://github.com/Zulkarnine1/ShareACar/blob/master/README.md#introduction)
2. [Features](https://github.com/Zulkarnine1/ShareACar/blob/master/README.md#features)
3. [Installation](https://github.com/Zulkarnine1/ShareACar/blob/master/README.md#installation)
4. [General Architecture](https://github.com/Zulkarnine1/ShareACar/blob/master/README.md#general-application-architecture)
5. [Database Design](https://github.com/Zulkarnine1/ShareACar/blob/master/README.md#database-design)
6. [App Flowchart](https://github.com/Zulkarnine1/ShareACar/blob/master/README.md#app-flowchart)
7. [Challenges Faced, Critical Problems Solved and Experience Gained](https://github.com/Zulkarnine1/ShareACar/blob/master/README.md#challenges-faced-critical-problems-solved-and-experience-gained)

## Introduction

Live link - [Heroku app](https://shareacar88.herokuapp.com/)

Shareacar is a car rental web application built mostly based on NodeJs(Express) and MongoDB. The core idea behind the application is that a car rental business will be able to rent it's cars to users through the web app.

As this was my first built web app, I faced quite a lot of difficulties white working on it such as:

- Designing the application's architecture and database.
- Handling media storage.
- Integrating different API's to simplify the app and enhance performance.
- Designing the flow of the application, the system in which users will carry out their actions.
- Implementing business logic in application.

The tech stack for this application mainly comprised of:

1. NodeJs
2. ExpressJs
3. MongoDB
4. Mongoose (ODM)
5. EJS(templating)

## Features

### Application Features (_User Based_)

1. An admin is a previliged user, have access to all actions such as read, creating, deleting and updating cars and rents.
2. The admin can also read, update and delete users but can't create them.
3. A user can rent a car based on the metrics provided by the system. There is a credit system that is renewed by the admin. A user spends credit when renting a car.
4. A user can only rent a car if the account is verified and has a verified driving license attached to it. The admin verifies both the user and license.
5. The car has resource attributes on it, which the user needs to maintain to be able to drive the car.
6. The rent model keeps track of the rented car, if the user has exceeded the paid renting time, the car will stop and the user is required to recharge.

### Development Features (_Tech Based_)

1. The cars and the users can be searched as this feature is implemented with mongo aggregated search.
2. All the media such as car images, user's avatar and license are stored in a cloud platform called cloudinary and this is done using the cloudinary API and express-fileupload.
3. Session-based authentication with PassportJs.

## Installation

In this section I will describe the installation process and the environment setup needed to run the application locally. However, one must have node installed in the machine in order to follow the steps below.

The code base can be cloned either by downloading as zip from github or using the following command-

```sh
git clone https://github.com/Zulkarnine1/ShareACar-My-First-Node-Project.git
```

Then the dependencies can be installed using the following command-

```sh
npm i
```

After the dependencies are install a ".env" file needs to be created the following environment variables are to be added in the file-

```sh
APP_SECRET=
MONGO_KEY=
CLOUDINARY_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

- The APP_SECRET is used for the session secret.
- The MONGO_KEY should be the link to the database with the auth credentials added in it.
- The CLOUDINARY credentails can be obtained from the cloudinary dashboard by opening a free account.

Finally, the application can be run by going to the root directory in terminal and executing the following command:

```sh
node app.js
```

## General Application Architecture

![](https://drive.google.com/uc?export=view&id=1FbLOot3zjJuFgA-bDZfHOVBUS2yIrle6)

This application had a handful of components working together since the overall business logic wasn't too complicated. Some special components are the following:

- Cloudinary - Used to store all the media such as images.
- Mongoose - It's an ODM that makes it easier to carry out tasks with mongoDB.

## Database Design

![](https://drive.google.com/uc?export=view&id=1YB5saP2okIcjHtg1SKWgllrwmNta53pF)

The following are some of the key points about the database design:

1. As I used a NoSQL database I didn't need any associative table for establishing relation between the user and the car.

2. The model rent is not an associative relation of car and user, it is rather used to track the rents themselves.

Most of the attributes of the models are explanatory, but I will explain some in the following line:

1. Car

- mileage stores the value of mileage of the car and the mileageType stores the unit of mileage like "km/l"
- resourceLeft represents the amount of resource left in number, resourceType is the type of resource, that is if the car runs on oil or electricity and resourceUnit is the unit of the resource such as "litres" or "gallons".
- availability represents if a car is available for rent or no because the car maybe in workshop or occupied by other renter.

2. User

- ver represents if the user has been verified or no, if the user is not verified the user cannot rent a car.
- occupied shows if the user has a car rented already, At any given time a user can only rent one car.
- rents array maintains the relationship of the user with the rents, it represents the rents that the user has been associated with.

## App Flowchart

![](https://drive.google.com/uc?export=view&id=1AQxzYgLFXddiPeTV9mxy-TLbl_Zax2s3)

## Challenges Faced, Critical Problems Solved and Experience Gained

### Challenges:

- One of the main challenge for me was to find a practical and sustainable way of storing the media files. As there were quite a lot of media attached to the application, these needed to be stored somewhere so that they could be rendered fast and wouldn't be lost if the server was down.
- The other main challenge was to maintain the business logic and the systems flow. This mostly consisted while planning and then again when implementing the plan as sometimes while working on the planned task some logical issued would rise, which would require to be fixed so the plan would also require to be updated.
- When I worked on this application I had very little idea of how nodeJs works so I didn't know how to organize the files and also what the different HTTP methods were.

### Critical Problems Solved:

As mentioned before the media storage was a big issue for me in the project. To solve this issue I looked for different services that I could use to store my media. I could use storage services of the major cloud platforms like AWS, GCP or Azure but there was one issue with all of them which was they required credit card even for getting a free account credits.

Then I came across my saviour CLOUDINARY. It is a platform that provided storage services for media, mainly images, video and PDF. They provide ample storage space for free which I could use for testing. Then I started going through the docs of cloudinary. Not only was there service amazing but there docs were brilliant, it took me only one read to grasp how it works. Then I started implementing it in code.

After reading the docs I came to a conclusion that I could make a utility function in app which I could call in different places where I would need it eg. when registering user to store the avatar or when adding a car and storing the car images. The function I implemented is the following -

```sh
var cloudinary = require('cloudinary').v2;

// Please use your own credentials
cloudinary.config({
  cloud_name: '',
  api_key: '',
  api_secret: ''
});

module.exports.uploadFile = uploadFile;
function uploadFile(file, options){

	return new Promise( function(resolve, reject){

        cloudinary.uploader.upload(file, options, function(error, result) {

            if(error){
                console.log("Not uploading");
                reject(error)

            }else{
                console.log("Uploading");
                resolve({bool:true, data:result})
            }
        })
    })

}
```

I think the function itself is pretty self explanatory so I don't want to go over explaining each line. I had to use the cloudinary upload function which took some time to ran, therefore I returned it's result as a promise. The function uploadFile takes 2 params, the first one is the file itself and the second one options is for adding any upload options to the file such as storing it in a special folder in cloudinary or making it private/public. So if things went well and there were no errors we would resolve the result otherwise we would reject and send back the error.

### Experience Gained:

- Some basic concepts of how web applications work and how to design systems.
- How to go through docs and integrate API's with the core application.
- Basics of how NoSQL database works and how to use the mongoose with mongoDB.
- How session based authentication works and how to use it with passportJs.
- What authorization is, difference between authorization and authentication and how to implement it.
- How to deal with Promise based functions and how to use async/await.
