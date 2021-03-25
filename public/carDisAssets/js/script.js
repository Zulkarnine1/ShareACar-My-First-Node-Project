	$(document).ready(function(){


		$(".miniimgBtn").click(function(){

			$(".mainImg").attr("src", $(this).attr("data-value"))

		})

		$(".rentNowBtn").click(function(){

			let rentTime = Number($(this).attr("data-value0"));
			let car = $(location).attr("href").split('/').pop();
			let url = "/rentprocess1/"+ car + "/" + rentTime;

			$.get(url, function(ret){

				if(ret=="con1"){

					alert("Unauthorized renting request")
				}else if(ret=="con2"){

					alert("Account not verified yet, please upload license in account to verify.")
				} else if(ret=="con3"){

					alert("Insufficient credit, please contact admin to recharge credit")
				}else if(ret=="con4"){

					alert("You already have a rent in progress, user not allowed to have 2 rents at the same time")
				}else if(ret=="con5"){
					alert("Car is not avaailable for rent")
				}else{
				location.href = ret;
			}
			})
		})

	})