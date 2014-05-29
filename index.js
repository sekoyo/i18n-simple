var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var i18n = {};

/**
 * Init the module, passing options if desired.
 * @param  {Object} [options] Options object.
 */
i18n.init = function (options) {
	'use strict';

	i18n.options = _.extend({
		localePath: path.dirname(require.main.filename) + '/locale/',
		tplLookupName: '$',
		fallbackPrefs: {}
	}, options);

	if (i18n.options.setLang) {
		i18n.setLang(i18n.options.setLang);
	}
};

/**
 * Checks if a language exists. If `supportedLangs` was provided it
 * does not need to waste I/O on a check. Otherwise it will synchronously
 * check unless a callback is provided.
 * @param  {String} name The language (file) name without extension.
 * @param  {Function} [callback] Callback if you want the check to be async.
 * @return {Mixed} True/false for sync call else undefined.
 */
i18n.langExists = function (name, callback) {
	'use strict';

	if (i18n.options.supportedLangs) {
		return i18n.options.supportedLangs.indexOf(name) !== -1;
	}

	if (!callback) {
		return fs.existsSync(i18n.options.localePath + name);
	} else {
		fs.exists(i18n.options.localePath + name, callback);
	}
};

/**
 * Set the current language.
 * @param {String} name The language (file) name without extension.
 * @return {Boolean} True if a new language was set.
 */
i18n.setLang = function (name) {
	'use strict';

	if (i18n.langExists(name)) {
		i18n.lang = require(i18n.options.localePath + name);
		return true;
	} else if (i18n.options.fallbackPrefs[name]) {
		var fallbackLang = _.find(i18n.options.fallbackPrefs[name], i18n.langExists);

		if (fallbackLang) {
			console.log('setting lang to:', fallbackLang);
			i18n.lang = require(i18n.options.localePath + fallbackLang);
			return true;
		}
	}

	return false;
};

/**
 * Middleware which injects the lookup function.
 * lookup shorthand.
 * @param  {Object}   req
 * @param  {Object}   res
 * @param  {Function} next
 */
i18n.helpers = function (req, res, next) {
	'use strict';

	if (res.locals) {
		res.locals[i18n.options.tplLookupName] = i18n.t;
	}

	next();
};

/**
 * Lookup a translation using dot notation if the key is nested.
 * e.g. `site.description`.
 * @param  {String} lookupStr The lookup string.
 * @return {Mixed} The resulting translation or false if not found.
 */
i18n.lookup = function (lookupStr) {
	'use strict';

	if (!i18n.lang) {
		return false;
	}

	var result = lookupStr.split('.').reduce(function (obj, i) {
		return obj[i];
	}, i18n.lang);

	return result !== undefined ? result : false;
};

/**
 * Translate a dot-notated lookup string with optional args.
 * @param  {String} format Object lookup string e.g. `site.description`.
 * @return {String} The format if not found else translated string.
 */
i18n.t = function (format) {
	'use strict';

	var regex = /\{(\d+)\}/g,
		a = arguments;
	
	var doFormat = function(substr, valueIndex) {
		// Grab value using valueIndex.
		var value = a[valueIndex];
		
		// If it is in curly brackets, treat as label.
		var labelRegex = /^\{(.+)\}$/,
			isLabel = String(value).match(labelRegex);
		if (isLabel) {
			return i18n.lookup(isLabel[1]);
		}
		return value;
	};
	
	var pattern = i18n.lookup(format);
	return pattern ? pattern.replace(regex, doFormat) : format;
};

module.exports = i18n;