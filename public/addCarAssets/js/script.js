$(document).ready(function(){

$(".myLoader").hide();
	$("#img1").change(function(){

		$("#fileImg1").attr("src",window.URL.createObjectURL(this.files[0]))

	})

	$("#img2").change(function(){

		$("#fileImg2").attr("src",window.URL.createObjectURL(this.files[0]))

	})
	$("#img3").change(function(){

		$("#fileImg3").attr("src",window.URL.createObjectURL(this.files[0]))

	})
	$("#img4").change(function(){

		$("#fileImg4").attr("src",window.URL.createObjectURL(this.files[0]))

	})
	$("#img5").change(function(){

		$("#fileImg5").attr("src",window.URL.createObjectURL(this.files[0]))

	})
	$("#img6").change(function(){

		$("#fileImg6").attr("src",window.URL.createObjectURL(this.files[0]))

	})

	$('#submitBtn').click(function(){

		let name = $("#name").val();
		let brand = $("#brand").val();
		let model = $("#model").val();
		let cat = $("#catagory").val();
		let price = $("#price").val();
		let munit = $("#unit").val();
		let mileage = $("#mileage").val();
		let resType = $("#resType").val();
		let resource = $("#resource").val();
		let about = $("#about").val();
		let img1 = $("#submitBtn").attr("data-file1")
		let img2 = $("#submitBtn").attr("data-file2")
		let img3 = $("#submitBtn").attr("data-file3")
		let img4 = $("#submitBtn").attr("data-file4")
		let img5 = $("#submitBtn").attr("data-file5")
		let img6 = $("#submitBtn").attr("data-file6")
		let userID = $("#submitBtn").attr("data-user")

		let package = {

			name,
			brand,
			model,
			cat,
			price,
			munit,
			mileage,
			resType,
			resource,
			about,
			img1,
			img2,
			img3,
			img4,
			img5,
			img6,



		}

		if(name==""){

			alert("Please write the name of the car");
		}else if(brand==""){

			alert("Please write the brand of the car");
		}else if(model==""){

			alert("Please write the model of the car");
		}else if(cat==""){

			alert("Please select the catagory of the car");
		}else if(price==""){

			alert("Please write the price of the car");
		}else if(munit==""){

			alert("Please select the mileage unit of the car");
		}else if(mileage==""){

			alert("Please write the mileage of the car");
		}else if(resType==""){

			alert("Please select the resource type of the car");
		}else if(resource==""){

			alert("Please write the resource left of the car");
		}else if(about==""){

			alert("Please write something about the car");
		}else if(img1==""){

			alert("Please select image 1 of the car");

		}else if(img2==""){

			alert("Please select image 2 of the car");

		}else if(img3==""){

			alert("Please select image 3 of the car");

		}else if(img4==""){

			alert("Please select image 4 of the car");

		}else if(img5==""){

			alert("Please select image 5 of the car");

		}else if(img6==""){

			alert("Please select image 6 of the car");

		}else{


		package = JSON.stringify(package);
		console.log(sizeof(package));

		if(sizeof(package)>(2*52428800) ){alert("PLease add small size images, request is too large")}else{

			$(".myLoader").show();
			$(".infoCon").hide();
		
		$.post("/addcar/"+userID, {package:package}, function(ret){

               if(ret!=false){
                location.replace(ret);
            }else{

                alert("Bad request, car could not be added");
            }


              })
	}

		


		}




	})


})


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
        function readURL2(input) {

		

            if (input.files && input.files[0]) {
                var reader = new FileReader();
                
                reader.onload = function (e) {
                	
                
                    
                    $('#submitBtn').attr('data-file3', e.target.result);
                  
                	
                };

                reader.readAsDataURL(input.files[0]);
            }
        
                
        }
        function readURL3(input) {

		

            if (input.files && input.files[0]) {
                var reader = new FileReader();
                
                reader.onload = function (e) {
                	
                
                    
                    $('#submitBtn').attr('data-file4', e.target.result);
                  
                	
                };

                reader.readAsDataURL(input.files[0]);
            }
        
                
        }
        function readURL4(input) {

		

            if (input.files && input.files[0]) {
                var reader = new FileReader();
                
                reader.onload = function (e) {
                	
                
                    
                    $('#submitBtn').attr('data-file5', e.target.result);
                  
                	
                };

                reader.readAsDataURL(input.files[0]);
            }
        
                
        }
        function readURL5(input) {

		

            if (input.files && input.files[0]) {
                var reader = new FileReader();
                
                reader.onload = function (e) {
                	
                
                    
                    $('#submitBtn').attr('data-file6', e.target.result);
                  
                	
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