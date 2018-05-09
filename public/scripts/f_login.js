var homeurl = "http://localhost:8080";

$(document).ready(function(){
	
	$("#loginform").submit(function(evnt){
		evnt.preventDefault();
		$.ajax({
			url:'/login',
			type: 'POST',
			data: $("#loginform").serialize(),
			success: function(data){
				if(data == '1_authenticated'){
					window.location.replace(homeurl);
				}else if(data == 'unapproved'){
					alert('pending account');
					//TODO handle this stylize
				}else{
					alert('login failed');
					//TODO handle this properly
				}

			}
		});
	});

});