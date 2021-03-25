
$(".addcar").click(function(){



	location.href = "/addcar";
})


$(".deleteCar").click(function(){


	$(this).closest(".selectCar").remove();
	
})


