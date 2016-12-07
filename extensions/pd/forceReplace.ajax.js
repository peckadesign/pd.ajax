(function($, undefined) {

	/**
	 * @author Jiří Pudil
	 * I did magic.
	 *
	 * Umožňuje přes AJAX appendovat nový obsah (tj. např. snippet s produkty a odkaz "načíst další produkty") a zároveň
	 * v případě potřeby celý snippet nahradit novým obsahem (např. při zafiltrování). V případě, že nemáme donačítání
	 * obsahu, není tohle extension relevantní.
	 */
	$.nette.pd.ext('forceReplace', {
		start: function (xhr, settings) {
			$.nette.ext('snippets').before(this.callback);
		},
		complete: function () {
			$.nette.ext('snippets').beforeQueue.remove(this.callback);
		}
	}, {
		callback: function ($el) {
			if ($el.is('[data-ajax-append]') || $el.is('[data-ajax-prepend]')) {
				$el.empty();
			}
		}
	});

})(jQuery);
