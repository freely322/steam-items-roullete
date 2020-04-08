import path from 'path';
import Express from 'express';
import httpProxy from 'http-proxy';
import connectHistoryApiFallback from 'connect-history-api-fallback';
import config from '../config';
const app = new Express();
const port = config.port;

app.use('/', connectHistoryApiFallback());
app.use('/',Express.static(path.join(__dirname,"..",'build')));
app.use('/',Express.static(path.join(__dirname,"..",'static')));

const targetUrl = `http://${config.host}:${+config.port+1}`;
const proxy = httpProxy.createProxyServer({
    target:targetUrl
});

if(process.env.NODE_ENV !== 'production') {
    const Webpack = require('webpack');
    const WebpackDevMiddleware = require('webpack-dev-middleware');
    const WebpackHotMiddleware = require('webpack-hot-middleware');
    const webpackConfig = require('../webpack.dev');

    const compiler = Webpack(webpackConfig);

    app.use(WebpackDevMiddleware(compiler, {
        publicPath: '/',
        stats: {colors: true},
        lazy: false,
        watchOptions: {
            aggregateTimeout: 300,
            ignored: /node_modules/,
            poll: true
        },
    }));
    app.use(WebpackHotMiddleware(compiler));
    app.use('/api',(req,res) => {
        proxy.web(req, res, {target: `${targetUrl}`})
    });
} else {
    const Webpack = require('webpack');

    const webpackConfig = require('../webpack.prod');

    const compiler = Webpack(webpackConfig);

    app.get('/!*', function (req, res) {
        res.sendFile(path.join(__dirname, 'build', 'index.html'));
    });
}


app.listen(port, (err) => {
    if(err) {
      console.error("The following error has occurred while trying to start the server: ", err)
    } else {
      console.log(`===> open http://${config.host}:${config.port} in a browser to view the app`);
    }
});

app.use(function(req, res, next){
    res.status(404);

    // respond with json
    if (req.accepts('json')) {
        res.send({ error: 'Not found' });
        return;
    }

    // default to plain-text. send()
    res.type('txt').send('Not found');
});
