 $( document ).ready(function() {

$(".addCred").click(function(){


	let cred = $("#addedCredit").val();
	let user = $("#addedCredit").attr("data-user");
	let url = "/" + "addCredit/" + user + "/" + cred;

	
	$.get(url, function(string) {


	})

		location.reload()

})

});