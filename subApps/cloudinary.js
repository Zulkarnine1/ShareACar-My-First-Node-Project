var cloudinary = require('cloudinary').v2;

// Please use your own credentials
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
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




