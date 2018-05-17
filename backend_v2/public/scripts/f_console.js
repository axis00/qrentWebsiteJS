var last = false;
var _filters = ['returned','loaned','missing'];

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
        if(pageNumber > 1){
            pageNumber--;
            loaditems((pageNumber - 1) * 10,((pageNumber - 1) * 10) + 10);
        }
    });

    $('#filterBtn').on('click',function(){
        var checked = $('input:checked');
        _filters = [];
        for(i = 0 ; i < checked.length; i++){
            _filters.push(checked[i].value);
        }

        console.log(_filters);

        loaditems((pageNumber - 1) * 10,((pageNumber - 1) * 10) + 10);

    });

});
    
function loaditems(lower,upper,filter) {

    var cont = $('#content');
    cont.html("");

    $.ajax({
        url: '/getItems',
        host: 'qrent.com',
        type: 'POST',
        data: {lowerLim: lower, upperLim: upper , filter : JSON.stringify(_filters)},
        success: function(data){
            last = data.length < 10;
            for(var i = 0; i < data.length; i++){
                var itemCont = $('<div class="jumbotron">');
                var imgCont = $('<div>');
                var itemLink = $('<a class = "qrent-link">');
                var itemNameTitle = $('<h2 class="card-title">');
                var itemDescTitle = $('<h7 class="card-text">');
                var itemBrandTitle = $('<p>');
                var itemRPTitle = $('<h4>');
                var itemStatus = $('<h4 id = "stat">');
                
                var deleteForm = $('<form>');
                var returnForm = $('<form>');
                deleteForm.on('submit',function(evnt){
                    evnt.preventDefault();
                    $.ajax({
                        url: '/deleteItem',
                        host: 'service.qrent.com',
                        type: 'POST',
                        data: $(this).serialize(),
                        success: function(data){
                            if(data == 'success'){
                                $(evnt.target).parent().parent().fadeOut();
                            }
                        },
                        error: function(err){
                            console.log(err);
                        }
                    });
                });

                returnForm.on('submit',function(evnt){
                    evnt.preventDefault();
                    console.log('sdf');
                    $.ajax({
                        url: '/returnItem',
                        host: 'service.qrent.com',
                        type: 'POST',
                        data: $(this).serialize(),
                        success: function(data){
                            if(data == 'success'){
                                $(evnt.target).parent().parent().find('#stat').html('returned');
                                $(event.target).hide();
                            }
                        },
                        error: function(err){
                            console.log(err);
                        }
                    });
                });
                
                itemCont.attr('id', data[i].itemNumber);
                deleteForm.html('<input name = "itemToDelete" type = "hidden" value = ' + data[i].itemNumber + '>' +
                                    '<input type = "submit" value = "Delete" class="shadow-sm btn btn-danger item-btn">');
                deleteForm.attr('class', 'deleteForm');
                
                returnForm.html('<input name = "itemToReturn" type = "hidden" value = ' + data[i].itemNumber + '>' +
                                    '<input type = "submit" value = "Returned" class="shadow-sm btn btn-success item-btn" id="returnBtn">');
                returnForm.attr('class','returnForm');

                itemLink.attr('href','/item?id='+ data[i].itemNumber);
                itemNameTitle.html(data[i].itemName);
                itemDescTitle.html(data[i].itemDescription);
                itemBrandTitle.html(data[i].itemBrand);
                itemRPTitle.html(data[i].itemRentPrice + " PHP / Day");
                itemStatus.html(data[i].status);
                
                itemLink.append(itemNameTitle);
                itemCont.append(itemLink);
                itemCont.append(itemRPTitle);
                itemCont.append(itemStatus);
                itemCont.append($('<br/>'));
                itemCont.append(itemBrandTitle);
                itemCont.append(itemDescTitle);

                var formCont = $('<div class = "item-formCont">');
                itemCont.append(formCont);

                formCont.append(deleteForm);
                if(data[i].status != 'returned'){
                    formCont.append(returnForm);
                }

                cont.append(itemCont);           

            }
        }  
    });
}