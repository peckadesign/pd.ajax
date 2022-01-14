(function($, undefined) {

	/**
	 * @author Radek Šerý
	 *
	 * Cookie consent extension, které zajistí spuštění scriptů.
	 */
	$.nette.pd.ext('cookieConsent', {
		success: function (payload, status, xhr, settings) {
			if (! 'nette' in settings || ! settings.nette.form) {
				return;
			}

			var consentCategories = this.getAcceptedCategories(settings.nette.form[0]);

			if (consentCategories.length) {
				var scripts = this.getScripts(consentCategories);
				this.runScripts(scripts);
			}

			this.closeCookieConsent(settings);
		}
	}, {
		getAcceptedCategories: function (form) {
			var categories = [];
			var acceptAll = form['nette-submittedBy'] && $(form['nette-submittedBy']).is('[data-cookie-consent-accept-all]')

			for (var i = 0; i < form.elements.length; i++) {
				var consent = form.elements[i].getAttribute('data-cookie-consent-category');

				if (consent && (acceptAll || form.elements[i].checked)) {
					categories.push(consent);
				}
			}

			return categories;
		},
		getScripts: function (categories) {
			var selectors = [];

			categories.forEach(function(category) {
				selectors.push('script[data-cookie-consent="' + category + '"]');
			});

			return document.querySelectorAll(selectors.join(','));
		},
		runScripts: function (scripts) {
			for (var i = 0; i < scripts.length; i++) {
				this.runScript(scripts[i])
			}
		},
		runScript: function (script) {
			var scriptRunnable = document.createElement('script');

			if (script.src) {
				scriptRunnable.src = script.src;
			} else {
				scriptRunnable.innerHTML = script.innerHTML;
			}

			scriptRunnable.async = script.async
			scriptRunnable.defer = script.defer

			scriptRunnable.crossOrigin = script.crossOrigin
			scriptRunnable.referrerPolicy = script.referrerPolicy

			script.insertAdjacentElement('afterend', scriptRunnable);
			script.remove();
		},
		closeCookieConsent: function (settings) {
			var $modal = settings.nette.form.closest('.js-cookie-modal');
			var closingDuration = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--pdbox-closing-duration') || 0);

			$modal.addClass('cookie-modal--close');

			setTimeout(function() {
				$modal.remove();
			}, closingDuration);
		}
	});

})(jQuery);
