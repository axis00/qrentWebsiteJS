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
                for(i in data)(function(i){
                    var contTemp = $('#reservationTemplate').clone();
                    contTemp.attr('id','res' + i);            
                    cont.append(contTemp);
                    var sel = '#' + contTemp.attr('id');
                    $(sel + ' .reservationTitle').html(data[i].itemName);
                    $(sel + ' .reservationStatus').html(data[i].status);
                    $(sel + ' .requestDate').html(data[i].requestdate);
                    $(sel + ' .endDate').html(data[i].enddate);
                    $(sel + ' .rentPrice').html(data[i].itemRentPrice + " PHP/DAY");
                    $(sel + ' .reservee').html(data[i].client);
                    $(sel + ' #approve').on('click',function(){
                        var resId = data[i].ReservationID;
                        console.log(resId);
                        $.ajax({
                            url: '/approveReservation',
                            host: 'localhost:8000',
                            type: 'POST',
                            data: {reservID: resId},
                            success: function(data){
                                if(data == 'success'){
                                    $(sel + ' .reservationStatus').html("Approved");
                                }
                            }
                        });
                    });

                    $(sel + ' #cancel').on('click',function(){
                        var resId = data[i].ReservationID;
                        console.log(resId);
                        $.ajax({
                            url: '/cancelReservation',
                            host: 'localhost:8000',
                            type: 'POST',
                            data: {reservID: resId},
                            success: function(data){
                                if(data == 'success'){
                                    $(sel + ' .reservationStatus').html("rejected");
                                }
                            }
                        });
                    });
                })(i);

            }
    });
}