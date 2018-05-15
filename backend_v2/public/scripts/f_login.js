var homeurl = "http://qrent.com";

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
					//alert('pending account');
                    window.location = "../html/pages/error404/pending.html"
				}else{
					//alert('login failed');
                    window.location = "../html/pages/error404/failed.html"
				}

			}
		});
	});

});