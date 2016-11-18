(function($, undefined) {

	/**
	 * @author Radek Šerý
	 * @desc propíše GET parametry do url
	 *
	 * Otestováno u formulářů, kde action je aktuální stránka, tj. url se po odeslání nezmění - v tu chvíli history
	 * neudělá pushState (nejspíš protože url se nezměnila a GET history ignoruje), tudíž jej musíme zavolat sami.
	 * History vypnout nemůžeme, protože by nefungovalo zpět - při začátku requestu se pravděpodobně volá replaceState,
	 * který uloží snippety do cache. Bez history (data-ajax-off="history") by se při kroku zpět před filtr nenačetly
	 * z cache snippety. Pro formuláře, kde je action rozdílná by toto rozšíření nemuselo být ani potřeba? Řešit,
	 * až nastane...
	 */
	$.nette.pd.ext('formGetHistory', {
		success: function (payload, status, xhr, settings) {
			if (window.history && history.pushState && window.history.replaceState && !navigator.userAgent.match(/((iPod|iPhone|iPad).+\bOS\s+[1-4]|WebApps\/.+CFNetwork)/)) {
				var href = window.location.href;

				if ((i = href.search(/\?/)) != -1)
					href = href.substring(0, i);

				href += '?' + settings.data;

				window.history.pushState({
					nette: true,
					href: href,
					title: document.title,
					ui: this.ext('snippets', true).findSnippets()
				}, document.title, href);
			}

		}
	});

})(jQuery);
