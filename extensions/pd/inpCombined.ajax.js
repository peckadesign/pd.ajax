(function($, undefined) {

	/**
	 * @author Radek Šerý
	 *
	 * Inicializace .inp-combined elementů
	 */
	$.nette.ext('inpCombined', {
		init: function() {
			var snippetsExt = this.ext('snippets', true);
			var ext = this;


			snippetsExt.after(function($el) {
				$el.find(ext.selector + '__input')
					.trigger('focusout')
					.hide().show();
			});


			var className = ext.selector.substring(1);

			$(document)
				.on('focusin', this.selector + '__input', function(e) {
					$(this).closest(ext.selector).addClass(className + '--focus');
				})
				.on('focusout change', ext.selector + '__input', function(e) {
					var $inpCombined = $(this).closest(ext.selector);

					if ($inpCombined.hasClass(className + '--static')) {
						return;
					}

					if ($(this).val().length) {
						$inpCombined.addClass(className + '--filled');
					} else {
						$inpCombined.removeClass(className + '--filled');
					}

					if (e.type === 'focusout') {
						$inpCombined.removeClass(className + '--focus');
					}
				})
				.find(ext.selector + '__input')
					.trigger('focusout')
					.hide().show();
		}
	}, {
		selector: '.inp-combined'
	});

})(jQuery);
