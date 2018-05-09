$(document).ready(function () {
    
    var cont = $('#content');
    
    $("#button").click(function () {
        $.ajax({
            url: '/getItems',
            host: 'localhost:8080',
            type: 'POST',
            success: function(data){
                console.log(data);
                console.log(data[0].itemName);
                console.log('done');
                for(var i = 0; i < data.length; i++){
                    var itemCont = $('<div>');
                    var imgCont = $('<div>');
                    var itemNameTitle = $('<p>');
                    var itemDescTitle = $('<p>');
                    var itemBrandTitle = $('<p>');
                    var itemRPTitle = $('<p>');
                    var itemNumberTitle = $('<p>');
                    itemNameTitle.html(data[i].itemName);
                    itemDescTitle.html(data[i].itemDescription);
                    itemBrandTitle.html(data[i].itemBrand);
                    itemRPTitle.html(data[i].itemRentPrice);
                    itemNumberTitle.html(data[i].itemNumber);
                    
                    itemCont.append(itemNameTitle);
                    itemCont.append(itemDescTitle);
                    itemCont.append(itemBrandTitle);
                    itemCont.append(itemRPTitle);
                    itemCont.append(itemNumberTitle);
                    
                    for(var j = 0; j < data[i].images.length; j++){
//                        //image?img=4
                        var imgTag = $('<img>');
                        imgTag.attr('src', '/image?img=' + data[i].images);
                        imgCont.append(imgTag);
                    }
                    
                    cont.append(itemCont);
                    }
                }
        });
    });
});