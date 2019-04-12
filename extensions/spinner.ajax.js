(function($, undefined) {

	/**
	 * @author Radek Šerý
	 *
	 * Spinner
	 *  - přidává překrytí a spinner:
	 *    0. Spinner lze zakázat pomocí data-no-spinner - pak se nepokračuje vůbec dál a hotovo. Druhá (lepší) možnost
	 *       vypnutí je pomocí data-ajax-off="spinner".
	 *    1. Pokud existuje data-spinner, tak vloží ajax-loader a ajax-overlay do prvku odpovídajícímu selektoru data atributu.
	 *    2. Pokud není data-spinner, najde se nejbližší ajax-wrap:
	 *       a. Pokud uvnitř existuje ajax-spinner, vloží se ajax-loader a ajax-overlay do něj.
	 *       b. Když ne, vloží se přímo na konec ajax-wrap.
	 */
	$.nette.ext('spinner', {
		start: function (xhr, settings) {
			var $placeholder = this.getPlaceholder(settings);
			var spinner = this;
			settings.spinnerQueue = settings.spinnerQueue || [];

			if ($placeholder.length) {
				$placeholder.each(function() {
					var i = settings.spinnerQueue.push($(spinner.spinnerHtml));
					$(this).append(settings.spinnerQueue[i-1]);
				});
			}
		},
		complete: function (xhr, status, settings) {
			if (! ('forceRedirect' in xhr) && ! ('forceReload' in xhr) && 'spinnerQueue' in settings) {
				var l = settings.spinnerQueue.length;
				for (var i = 0; i < l; i++) {
					settings.spinnerQueue[i].remove();
				}
			}
		}
	}, {
		spinnerHtml: '<div class="ajax-overlay"></div><div class="ajax-loader"></div>',
		getPlaceholder: function(settings) {
			var $placeholder = $();

			if (settings.nette) {
				var $el = settings.nette.el;
				$placeholder = this.getElementPlaceholder($el);

			} else if (settings.spinner) {
				$placeholder = $(settings.spinner);
			}

			return $placeholder;
		},
		getElementPlaceholder: function($el) {
			var $placeholder = $();
			var $wrap = null;

			if($el.is('[data-no-spinner]'))
				return $placeholder;

			$placeholder = $($el.data('spinner'));

			if ($placeholder.length === 0 && ($wrap = $el.closest('.ajax-wrap')).length) {
				if (($placeholder = $wrap.find('.ajax-spinner')).length === 0) {
					$placeholder = $wrap;
				}
			}

			return $placeholder;
		}
	});

})(jQuery);
