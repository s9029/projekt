/*jshint node: true, browser: true, jquery: true */
/*global io: false */
$(document).ready(function () {
    'use strict';
    var socket = io.connect('http://localhost:3030'),
        myShip = [],
        myShots = [],
        status,
        rivalNickname,
        x,
        y,
        strzal;

    console.log('connecting…');

    socket.on('connect', function () {
        console.log('connected!');
    });

    socket.on('wiadom', function (msg){
        var data = msg.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        console.log("dostalem" + data);
        //$('body').text(data);
    });

    socket.on('nieGra', function (msg) {
        var data = msg.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        $('body').text(data);
    });

    socket.on('waitForPlayer', function (msg){
        var data = msg.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        $('#start').text(data);
    });

    socket.on('twojaTablica', function (msg){
        console.log(msg);
        myShip = msg.statki;
        status = msg.status;
        rivalNickname = msg.rival;
        $('#start').hide();
        for(var i=0; i<myShip.length; i++){
            myShots[i] = new Array(8);
            for(var j=0; j<myShip.length; j++){
                if(myShip[i][j]===1){
                    $('#myShip').append('<div id="'+i+'-'+j+'" style="background-color: red;"></div>');
                } else{
                    $('#myShip').append('<div id="'+i+'-'+j+'"></div>');    
                }
                $('#myShots').append('<div id="'+i+'-'+j+'"></div>');
                myShots[i][j] = 0;
            }
        }
        $('#myShip').show();
        $('#myShots').show();

        $('#myShots div').click(function (e){
            if(status===0){
                return ;
            }else{
                var pos = $(this).attr('id').split('-');
                strzal = $(this);
                x = pos[0];
                y = pos[1];
                console.log("x = " + x + ", y = " + y);
                myShots[x][y] = 1;
                socket.emit('shot', {'x' : x, 'y' : y});
                $(this).css('background-color', 'yellow');
                status = 0;
            }
        }); 


    });

    socket.on('pudlo', function(msg){
        console.log("x = " + msg.x + ", y = " + msg.y + ", traf = " + msg.traf);
        var id = msg.x+"-"+msg.y;
        $('#myShots div').each(function(value, key){
            if($(this).attr('id')===id){
                $(this).css('background-color', 'pink');
            }
        });
    });

    socket.on('end', function(msg){
        $('#start').show();
        $('#start').text(msg);
        $('#myShip').hide();
        $('#myShots').hide();
    });

    socket.on('odpShot', function (msg){
        var id = '#' + msg.x + '-' + msg.y;
        var idMyShip = '#myShip ' + id;
        var idMyShot = '#myShots ' + id;
        if(msg.trafiony===1){
            myShip[msg.x][msg.y] = 3;
            $(idMyShip).css('background-color', 'pink');
        }else{
            myShip[msg.x][msg.y] = 2;
            $(idMyShip).css('background-color', 'green');
        }
        status = msg.status;
    });

    $('#nick').keypress(function (event){
        if(event.keyCode===13){
            socket.emit('setNick', $('#nick').val());
        }
    });

    
});
