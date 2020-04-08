import Express from 'express';
import config from '../../config';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import http from 'http';
const steam = require('steam-login');
import cors from 'cors';
import { community, communityLogin, tryToClientLogOn } from "./utilities/bot";
import { parseItems } from "./utilities/marketParser";
import { startGame, startTimer } from "./utilities/game";
const port = +config.port;
const app = new Express();

app.set("view options", {layout: false});
app.use(Express.static(__dirname + '/build'));
app.use(bodyParser.json());
app.use(require('express-session')({ resave: false, saveUninitialized: false, secret: config.secret }));
app.use(steam.middleware({
    realm: config.steamRealm,
    verify: config.steamVerify,
    apiKey: config.steamAPI
}));
app.use(function (req, res, next) {
    req.community = community;
    next()
});

let server = http.createServer(app);
export let io = require('socket.io').listen(server);

io.on('connection', socket => {
    console.log('socket connected');
    socket.on('betItem', data => {
        io.binary(false).emit('betItemPoolUpdate', data)
    });
    socket.on('chatMessage', data => {
        io.binary(false).emit('newChatMessage', data)
    });
});

//User.deleteMany({}).catch(err => console.log(err))
//Item.deleteMany({}).catch(err => console.log(err))

app.use(cors());
app.use('/', require('./routes/steam.router'));
app.use('/', require('./routes/config.router'));
app.use('/', require('./routes/user.router'));
app.use('/', require('./routes/game.router'));

if (!process.env.NODE_ENV === 'production') {
  app.get('/', function(req, res){
    res.redirect(`http://${config.host}:${+config.port}`);
  });
} else {
  app.get('/', function(req, res){
    res.render('/build/index.html');
  });
}

app.use(function(req, res, next){
    res.status(404);
    if (req.accepts('json')) {
        res.send({ error: 'Not found' });
        return;
    }
    res.type('txt').send('Not found');
});

communityLogin();
tryToClientLogOn();
parseItems(0, 1);
startTimer();
startGame();

mongoose.Promise = require('bluebird');
mongoose.connect(config.dbLink, (err) => {
    if (err) {
        console.log("Please check if you have Mongo installed. The following error occurred: ", err);
        return;
    }
    console.log('Api Server Started');
    server.listen(port, (err) => {
        if (err) {
            console.error('err:', err);
        } else {
            console.info(`===> api server is running at ${config.host}:${config.port}`)
        }
    });
});


