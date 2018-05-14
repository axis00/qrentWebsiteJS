var last = false;

$(document).ready(function () {

    var pageNumber = 1;
    
    loaditems((pageNumber - 1) * 10,((pageNumber - 1) * 10) + 10);

    $('#nextBtn').on('click',function(){
        if(!last){
            pageNumber++;
            loaditems((pageNumber - 1) * 10,((pageNumber - 1) * 10) + 10);
        }
        
    });

    $('#backBtn').on('click',function(){
        if(pageNumber){
            pageNumber--;
            loaditems((pageNumber - 1) * 10,((pageNumber - 1) * 10) + 10);
        }
    });

});
    
function loaditems(lower,upper) {

    var cont = $('#content');
    cont.html("");

    $.ajax({
        url: '/getItems',
        host: 'localhost:8000',
        type: 'POST',
        data: {lowerLim: lower, upperLim: upper},
        success: function(data){
            console.log(data);
            console.log('done');
            last = data.length < 10;
            for(var i = 0; i < data.length; i++){
                var itemCont = $('<div class="jumbotron">');
                var imgCont = $('<div>');
                var itemNameTitle = $('<p>');
                var itemDescTitle = $('<p>');
                var itemBrandTitle = $('<p>');
                var itemRPTitle = $('<p>');
                var itemNumberTitle = $('<p>');
                
                var deleteForm = $('<form>');
                deleteForm.on('submit',function(evnt){
                    evnt.preventDefault();
                    $.ajax({
                        url: '/deleteItem',
                        host: 'localhost:8000',
                        type: 'POST',
                        data: $(this).serialize(),
                        success: function(data){
                            if(data == 'success'){
                                $(evnt.target).parent().fadeOut();
                            }
                        },
                        error: function(err){
                            console.log(err);
                        }
                    });
                });
                
                itemCont.attr('id', data[i].itemNumber);
                deleteForm.html('<input name = "itemToDelete" type = "hidden" value = ' + data[i].itemNumber + '>' +
                                    '<input type = "submit" value = "delete" class="btn btn-danger">'
                                 );
                deleteForm.attr('class', 'deleteForm');
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
                itemCont.append(deleteForm);

                cont.append(itemCont);           

            }
        }  
    });
}