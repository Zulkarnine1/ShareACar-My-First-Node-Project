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