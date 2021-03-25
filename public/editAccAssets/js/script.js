$(document).ready(function(){
  

	$("#file1").change(function(){

		$("#img1").attr("src",window.URL.createObjectURL(this.files[0]))

	})

	$("#file2").change(function(){

		$("#img2").attr("src",window.URL.createObjectURL(this.files[0]))

	})

	$("#nameIn").change(function(){

		$('#submitBtn').attr('data-name', $(this).val());
	})
	$("#mnumIn").change(function(){

		$('#submitBtn').attr('data-mnum', $(this).val());
	})

	$("#submitBtn").click(function(){

		
		let p2 = $(this).attr("data-user")
		let url = "/userEditAcc/"+p2;
		let img1 = $(this).attr("data-file1")
		let img2 = $(this).attr("data-file2")
		let name = $(this).attr("data-name")
		let mobileNum = $(this).attr("data-mnum");

		let package = {


			img1,
			img2,
			name,
			mobileNum
		}

		package = JSON.stringify(package);
		console.log(sizeof(package));

		if(sizeof(package)>52428800 ){alert("PLease add small size images, request is too large")}else{
		
		$.post(url, {package:package}, function(ret){

               if(ret!=false){
                location.replace(ret);
            }else{

                alert("You have not added a license so your account is still not verified, please edit again");
            }


              })
	}



	})


});

function readURL(input) {

		

            if (input.files && input.files[0]) {
                var reader = new FileReader();
                
                reader.onload = function (e) {
                	
                
                    
                    $('#submitBtn').attr('data-file1', e.target.result);
                  
                	
                };

                reader.readAsDataURL(input.files[0]);
            }
        
                
        }


        function readURL1(input) {

		

            if (input.files && input.files[0]) {
                var reader = new FileReader();
                
                reader.onload = function (e) {
                	
                
                    
                    $('#submitBtn').attr('data-file2', e.target.result);
                  
                	
                };

                reader.readAsDataURL(input.files[0]);
            }
        
                
        }



         function sizeof(object){

  // initialise the list of objects and size
  var objects = [object];
  var size    = 0;

  // loop over the objects
  for (var index = 0; index < objects.length; index ++){

    // determine the type of the object
    switch (typeof objects[index]){

      // the object is a boolean
      case 'boolean': size += 4; break;

      // the object is a number
      case 'number': size += 8; break;

      // the object is a string
      case 'string': size += 2 * objects[index].length; break;

      // the object is a generic object
      case 'object':

        // if the object is not an array, add the sizes of the keys
        if (Object.prototype.toString.call(objects[index]) != '[object Array]'){
          for (var key in objects[index]) size += 2 * key.length;
        }

        // loop over the keys
        for (var key in objects[index]){

          // determine whether the value has already been processed
          var processed = false;
          for (var search = 0; search < objects.length; search ++){
            if (objects[search] === objects[index][key]){
              processed = true;
              break;
            }
          }

          // queue the value to be processed if appropriate
          if (!processed) objects.push(objects[index][key]);

        }

    }

  }

  // return the calculated size
  return size;

}