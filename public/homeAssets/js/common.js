


 $( document ).ready(function() {
    

 $("#searchBtn").click(function(){

 			let query = $("#searchInput").val();
 			if(!(query==0)){
            let url = location.origin + "/" + "search/" + query;
            window.location.href = url.toString();
        }

        })


 	$('#searchInput').keypress(function(e){
      if(e.keyCode==13){
      $('#searchBtn').trigger("click");
      return false;
  }
    });

 

    
});