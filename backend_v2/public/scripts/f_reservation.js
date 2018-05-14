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
        url: '/getReservations',
        host: 'localhost:8000',
        type: 'POST',
        data: {lowerLim: lower, upperLim: upper},
        success: function(data){
                console.log(data);          
                for(i in data){
                    var contTemp = $('#reservationTemplate').clone();
                    contTemp.attr('id','res' + i);            
                    cont.append(contTemp);
                    var sel = '#' + contTemp.attr('id');
                    $(sel + ' .reservationTitle').html(data[i].itemName);
                    $(sel + ' .reservationStatus').html(data[i].status);
                    $(sel + ' .requestDate').html(data[i].requestdate);
                    $(sel + ' .endDate').html(data[i].enddate);
                    $(sel + ' .rentPrice').html(data[i].itemRentPrice);
                    //TODO approve
                }

            }
    });
}