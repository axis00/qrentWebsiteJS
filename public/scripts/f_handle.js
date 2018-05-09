$(document).ready(function () {
    
    var cont = $('#content');
    
    $("#button").click(function () {
        $.ajax({
            url: '/getItems',
            host: 'localhost:8080',
            type: 'POST',
            success: function(data){
                console.log(data);
                console.log('done');
                for(var i = 0; i < data.length; i++){
                    var itemCont = $('<div>');
                    var imgCont = $('<div>');
                    var itemNameTitle = $('<p>');
                    var itemDescTitle = $('<p>');
                    var itemBrandTitle = $('<p>');
                    var itemRPTitle = $('<p>');
                    var itemNumberTitle = $('<p>');
                    
                    var deleteButton = $('<form>');
                    deleteButton.on('submit',function(evnt){
                        evnt.preventDefault();
                        console.log('calles');
                    });
                    
                    itemCont.attr('id', data[i].itemNumber);
                    deleteButton.html('<input name = "itemToDelete" type = "hidden" value = ' + data[i].itemNumber + '>' +
                                        '<input type = "submit" value = "delete">'
                                     );
                    deleteButton.attr('class', 'deleteForm');
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
                    itemCont.append(deleteButton);
                    
//                    for(var j = 0; j < data[i].images.length; j++){
//                        var imgTag = $('<img>');
//                        imgTag.attr('src', '/image?img=' + data[i].images[j]);
//                        imgCont.append(imgTag);
//                    }
                    
                    //itemCont.append(imgCont)
                    cont.append(itemCont);
                    }
                }
        });
    });
    
});