(function($, undefined) {

	// Is History API reliably supported? (based on Modernizr & PJAX)
	if (!(window.history && history.pushState && window.history.replaceState)) {
		return;
	}

	/**
	 * @author Radek Šerý
	 *
	 * Extension pro AJAXové odkazy, které mění url, ale v historii nahrazují stávající state, tj. v historii se projeví
	 * pouze poslední request. Použito např. pro odkazy na varianty produktu - lze sdílet vždy aktuální variantu, ale
	 * klik na zpět vrací na výpis a ne na všechny proklikané varianty.
	 */
	$.nette.pd.ext('replaceState', {
		init: function() {
			this.historyExt = $.nette.ext('history');
			this.snippetsExt = $.nette.ext('snippets');
		},
		before: function (xhr, settings) {
			if (! settings.nette) {
				this.href = null;
			} else if (! settings.nette.form) {
				this.href = settings.nette.ui.href;
			} else if (settings.nette.form.get(0).method === 'get') {
				this.href = settings.nette.form.get(0).action || window.location.href;
			} else {
				this.href = null;
			}
		},
		success: function(payload) {
			var redirect = payload.redirect || payload.url; // backwards compatibility for 'url'
			if (redirect) {
				var regexp = new RegExp('//' + window.location.host + '($|/)');
				if ((redirect.substring(0,4) === 'http') ? regexp.test(redirect) : true) {
					this.href = redirect;
				} else {
					window.location.href = redirect;
				}
			}

			if (this.href && this.href !== window.location.href) {
				history.replaceState({
					nette: true,
					href: this.href,
					title: document.title,
					ui: (this.historyExt && this.historyExt.cache && this.snippetsExt) ? this.snippetsExt.findSnippets() : null
				}, document.title, this.href);
			}

			this.href = null;
		}
	});

})(jQuery);
