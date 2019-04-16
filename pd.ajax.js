/**
 * nette.ajax.js extension allowing to create disabled-by-deafult extensions
 *
 * @copyright Copyright (c) 2015-2019 Radek Šerý
 * @copyright Copyright (c) 2015      Jiří Pudil
 * @license MIT
 *
 * @version 1.5.0
 */
(function ($, undefined) {
	var extensions = {};
	var contexts = {};


	// Cleverer ajaxification
	$.nette.ext('init', false);
	$.nette.ext('init', {
		load: function (rh) {
			$(document).off('click.nette', this.linkSelector, rh).on('click.nette', this.linkSelector, rh);
			$(document).off('submit.nette', this.formSelector, rh).on('submit.nette', this.formSelector, rh);
			$(document).off('click.nette', this.buttonSelector, rh).on('click.nette', this.buttonSelector, rh);
		}
	}, {
		linkSelector: 'a.ajax',
		formSelector: 'form.ajax',
		buttonSelector: 'input.ajax[type="submit"], button.ajax[type="submit"], input.ajax[type="image"]'
	});

	// Allows calling $.nette.pd.ext('foo') to get pd extension context (same as $.nette.ext('bar') for common extension)
	$.nette.pd = {
		ext: function (name, callbacks, context) {
			if (callbacks === undefined) {
				return contexts[name];
			} else if (typeof name === 'string' && contexts[name] !== undefined) {
				throw "Cannot override already registered pd-ajax extension '" + name + "'.";
			} else {
				var extension = {};
				$.each(callbacks, function (event, callback) {
					extension[event] = $.proxy(callback, context);
				});
				extensions[name] = extension;
				contexts[name] = $.extend(context ? context : {}, {
					name: function () {
						return name;
					},
					ext: function (name, force) {
						var ext = $.nette.ext(name);
						var extPd = contexts[name];
						if (!(ext || extPd) && force) throw "Extension '" + this.name() + "' depends on disabled extension '" + name + "'.";
						return ext ? ext : extPd;
					}
				});
			}
		}
	};

	var getEnabledExtensions = function (settings) {
		if (settings.pd) {
			return settings.pd;
		}
		if (settings.nette) {
			var ext = '';

			// pd extension z elementu
			if (settings.nette.el.attr('data-ajax-pd')) {
				ext = settings.nette.el.attr('data-ajax-pd');
			}

			// Pokud el není formulář, ale existuje formulář, hledáme i na něm
			if (! settings.nette.isForm && settings.nette.form && settings.nette.form.attr('data-ajax-pd')) {
				ext = ((ext === '') ? '' : ext + ' ') + settings.nette.form.attr('data-ajax-pd');
			}

			// Pokud je el formulář a známe odesílací tlačítko, hledáme na něm
			if (settings.nette.isForm && settings.nette.form.get(0)['nette-submittedBy']) {
				var btn = settings.nette.form.get(0)['nette-submittedBy'];
				ext = ((ext === '') ? '' : ext + ' ') + btn.attr('data-ajax-pd');
			}

			return ext === '' ? [] : ext.split(' ');
		}

		return [];
	};


	$.nette.ext('pd', {
		init: function () {
			$.each(extensions, function (name, ext) {
				if (ext['init']) {
					ext.init();
				}
			});
		},
		load: function (handler) {
			$.each(extensions, function (name, ext) {
				if (ext['load']) {
					ext.load(handler);
				}
			});
		},
		prepare: function (settings) {
			settings.pd = getEnabledExtensions(settings);

			$.each(extensions, function (name, ext) {
				if (ext['prepare'] && settings.pd.indexOf(name) !== -1) {
					ext.prepare(settings);
				}
			});
		},
		before: function (xhr, settings) {
			var abort = false;

			$.each(extensions, function (name, ext) {
				if (ext['before'] && settings.pd.indexOf(name) !== -1) {
					if (ext.before(xhr, settings) === false) {
						abort = true;
					}
				}
			});

			return !abort;
		},
		start: function (xhr, settings) {
			$.each(extensions, function (name, ext) {
				if (ext['start'] && settings.pd.indexOf(name) !== -1) {
					ext.start(xhr, settings);
				}
			});
		},
		success: function (payload, status, xhr, settings) {
			$.each(extensions, function (name, ext) {
				if (ext['success'] && settings.pd.indexOf(name) !== -1) {
					ext.success(payload, status, xhr, settings);
				}
			});
		},
		complete: function (xhr, status, settings) {
			$.each(extensions, function (name, ext) {
				if (ext['complete'] && settings.pd.indexOf(name) !== -1) {
					ext.complete(xhr, status, settings);
				}
			});
		},
		error: function (xhr, status, error, settings) {
			$.each(extensions, function (i, ext) {
				if (ext['error'] && settings.pd.indexOf(name) !== -1) {
					ext.error(xhr, status, error, settings);
				}
			});
		}
	});


	// rozšíření extension snippets o nové funkce
	var snippetsExt = $.nette.ext('snippets');

	// najde a vrátí všechny snippety, které nemají zakázané cacheování
	snippetsExt.findSnippets = function () {
		var result = [];
		$('[id^="snippet-"]').each(function () {
			var $el = $(this);
			if (! $el.is('[data-history-nocache]')) {
				result.push({
					id: $el.attr('id'),
					html: $el.html()
				});
			}
		});
		return result;
	};

})(jQuery);
