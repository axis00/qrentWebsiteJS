$(document).ready(function () {
    
    $("#button").click(function () {
        $.ajax({
            url: '/getItems',
            host: 'localhost:8080',
            type: 'POST',
            success: function(data){
                console.log(data);
                console.log('done');
                var items = JSON.parse(data);
                console.log(items);
            }
        });
    });
});