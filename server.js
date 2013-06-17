/*jshint node: true */
var http = require('http'),
    fs = require('fs'),
    path = require('path'),
    io = require('socket.io');

   

var server = http.createServer(function (req, res) {
    'use strict';
    var filePath = '.' + req.url,
        contentType = 'text/html',
        extName;

    console.log('request starting...' + filePath);
    if (filePath === './') {
        filePath = './index.html';
    }
    extName = path.extname(filePath);
    switch (extName) {
    case '.js':
        contentType = 'text/javascript';
        break;
    case '.css':
        contentType = 'text/css';
        break;
    }

    path.exists(filePath, function (exists) {
        if (exists) {
            fs.readFile(filePath, function (error, content) {
                if (error) {
                    res.writeHead(500);
                    res.end();
                } else {
                    res.writeHead(200, {
                        'Content-Type': contentType
                    });
                    res.end(content, 'utf-8');
                }
            });
        } else {
            res.writeHead(404);
            res.end();
        }
    });
});

var socket = io.listen(server);

/*

    5 - statków:
        1 - 5 masztów
        1 - 4 maszty
        1 - 3 maszty
        1 - 2 maszty

    LEGENDA

    0 - puste pole
    1 - statek
    2 - pudlo
    3 - trafione


 */

 var users = {};

    var tab1 = [
        [1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0],
        [0, 1, 0, 0, 1, 0, 0, 0],
        [0, 1, 0, 0, 1, 0, 0, 0],
        [0, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1]
    ],
    tab2 = [
        [0, 0, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 0, 0, 1],
        [0, 0, 0, 0, 0, 0, 0, 1],
        [0, 0, 0, 0, 0, 0, 0, 1],
        [0, 0, 0, 0, 0, 0, 0, 1],
        [0, 1, 1, 0, 0, 0, 0, 1]
    ],
    players = [];
    var amountClients = 0,
    trafionePlayer1 = 0,
    trafionePlayer2 = 0,
    trafiony = 0;

socket.configure('development', function (){
    socket.set('log level', 0);
});

socket.on('connection', function (client) {
    'use strict';
    var username;
    amountClients++;

    console.log("Rozmiar tablicy: " + players.length);

    players.push(client);

    if(Object.keys(users).length===2){
        client.emit('nieGra', 'Nie mozesz sie podlaczyc - jest wystarczajaco graczy');
    }else{
        client.on('setNick', function(nickname){
            users[nickname]=nickname;
            client.username = nickname;
            
            if(amountClients==2){
                players[1].emit('twojaTablica', {'statki' : tab2, 'rival' : players[0].username, 'status' : 1});
                players[0].emit('twojaTablica', {'statki' : tab1, 'rival' : players[1].username, 'status' : 0});

            }
            if(amountClients<2){
                client.emit('waitForPlayer', 'poczekaj na drugiego gracza');
            }
        });
    }

    client.on('shot', function(msg){
        if(this===players[0]){
            if(tab2[msg.x][msg.y]===1){
                client.emit('pudlo', {x: msg.x, y: msg.y, traf: 1});
                trafionePlayer1++;
                trafiony = 1;
                if(trafionePlayer1===14 || trafionePlayer2===14){
                    if(trafionePlayer1===14){
                        players[0].emit('end', 'koniec gry wygrales');
                        players[1].emit('end', 'koniec gry wygral przeciwnik');
                    }else{
                        players[0].emit('end', 'koniec gry wygral przeciwnik');
                        players[1].emit('end', 'koniec gry wygreles');
                    }
                }
            }else{
                trafiony = 0;
            }
            players[1].emit('odpShot', {'x' : msg.x, 'y' : msg.y, 'status' : 1, 'trafiony' : trafiony});
        }else{
            if(tab1[msg.x][msg.y]===1){
                client.emit('pudlo', {x: msg.x, y: msg.y, traf: 1});
                trafionePlayer2++;
                trafiony = 1;
                if(trafionePlayer1===14 || trafionePlayer2===14){
                    if(trafionePlayer1===14){
                        players[0].emit('end', 'koniec gry wygrales');
                        players[1].emit('end', 'koniec gry wygral przeciwnik');
                    }else{
                        players[0].emit('end', 'koniec gry wygral przeciwnik');
                        players[1].emit('end', 'koniec gry wygreles');
                    }
                }
            }else{
                trafiony = 0;
            }
            players[0].emit('odpShot', {'x' : msg.x, 'y' : msg.y, 'status' : 1, 'trafiony' : trafiony});
        }
    });

});

server.listen(3030);
