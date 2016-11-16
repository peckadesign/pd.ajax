(function($, undefined) {

	/**
	 * @author Jiří Pudil
	 * I did magic.
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
