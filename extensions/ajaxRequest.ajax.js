(function($, undefined) {

	/**
	 * @author Radek Šerý
	 *
	 * Pro všechny AJAXové requesty vloží do url parametr 'ajax'. Díky tomu nedochází k míchání zacacheovaných stránek
	 * pro AJAXové a neAJAXové requesty (např. při stránkování), což je problém především (pouze) v MS Edge.btnSpinner.ajax.js
	 */
	$.nette.ext('ajaxRequest', {
		before: function(xhr, settings) {
			var s = '?';
			if ((i = settings.url.search(/\?/)) !== -1) {
				s = '&';
			}

			settings.url += s + 'ajax';
		}
	});

})(jQuery);
