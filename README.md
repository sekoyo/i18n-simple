# i18n-simple

i18n-simple is a fast, simple yet powerful string translator. It's goal is to put the focus back on rock solid string translation without providing logic to set the language according to cookies or query strings - the implementation is up to you.

## Translation file format

Your translations should be:

- `.js` files using node module export
- Valid javascript objects
- Support for `{1}`, `{2}` style tokens out the box
- By default they go in a `locale/` folder in the located next to your server start script, e.g. `locale/en-US.js`

	module.exports = {
		site: {
			title: 'My Site',
			description: 'A site that is all mine'
		},
		bankBalance: 'Hi {1}, your balance is {2}',
	};

## Setup

	// Require in the module.
	var i18n = require('i18n-simple');

	// Initialize the module.
	i18n.init(options); // See Options section

	// Use the moduke.
	i18n.t('site.title'); // Returns 'My Site'
	i18n.t('bankBalance', 'Bob', -1203);  // Returns 'Hi Bob, your balance is -1203'

## Options

It is recommended you list your available languages with the `supportedLangs` option to save the module having to make a file I/O check.

	i18n.init({
		supportedLangs: ['en-GB', 'pt-BR', 'pt-PT'],
		setLang: 'en-GB', // Set the initial language.
		fallbackPrefs: {
			'pt-BR': ['pt-PT']
		},
		tplLookupName: 'l' // Default template helper name translate is `$`
	});

You might have an app which isn't aware of supported languages, or tries to set the language according to a query string, http header or cookie. In this case you can set a fallback preference:

	i18n.init({
		fallbackPrefs: {
			'pt-BR': ['pt-PT']
		}
	});

If Brazilian portuguese doesn't exist the app will fallback to portuguese.

## API

**setLang(name)**

Set the current language. This is the file name minus the extension e.g. `en-US`.

**t(format, [args])**

Translate a string e.g. `i18n.t('site.title')` or `i18n.t('bankBalance', 'Bob', '$67')`.

**lookup(lookupStr)**

This is the internal lookup method before tokens are translated. Useful if you want to override `t` method to do your own token parsing.

## Connect/Express middleware

If you want to use the translate method in templates run this middleware before your routes.

	app.use(i18n.helpers);

In Handlebars for example you can now translate in your template like so:

	<p>Site title is: {{$ 'site.title'}}</p>
	<p>Your bank balance: {{$ 'bankBalance' 'Bob' '$14,461'}}</p>

## Yo Dawg. I hear you like lookups in your lookups?

There is a special syntax for instances where you want tokens to resolve to another lookup:

	transports: {
		yacht: 'Yacht',
		bike: 'Bike'
	},
	modeOfTransport: 'Your preferred mode of transport is by {0}'

	i18n.t('modeOfTransport', '{transports.yacht'); // Your preferred mode of transport is by Yacht