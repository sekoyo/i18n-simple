var http = require('http');
var express = require('express');
var app = express();
var exphbs  = require('express3-handlebars');
var i18n  = require('../../index');

process.env.PORT = process.env.PORT || 2637;

// Initialize locale.
i18n.init({
	supportedLangs: ['en-GB'],
	setLang: 'en-GB'
});

app.use(i18n.helpers);

// View engine.
app.engine('.hbs', exphbs({
	extname: '.hbs',
	defaultLayout: 'main'
}));
app.set('view engine', '.hbs');

// Global variables (accessible in views).
app.locals.site = {
	title: i18n.t('site.title'),
	description: i18n.t('site.description')
};

// Home route
app.get('/', function (req, res) {
	'use strict';
	res.render('home');
});

// Create an HTTP service.
http.createServer(app).listen(process.env.PORT, function () {
	'use strict';
	console.info('Listening to http on:', process.env.PORT);
});

module.exports = app;