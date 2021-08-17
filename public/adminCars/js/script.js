
$(".addcar").click(function(){



	location.href = "/addcar";
})


$(".deleteCar").click(function(){

	let link = $(this).attr("data-deleteLink")
	$.ajax({
		url: link,
		type: 'DELETE',
		success: function(response) {
		  location.href = "/admincars"
		}
	 });
	console.log(link);
	$(this).closest(".selectCar").remove();
	
})


