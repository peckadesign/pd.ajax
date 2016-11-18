(function($, undefined) {

	/**
	 * @author Radek Šerý
	 * Force redirect
	 * - extension, které i při použití history.nette.ajax.js (které vypíná "redirect" extension) umožňuje refresh stránky
	 * - "dočasné" řešení, "brzy" by mělo být součástí přímo history.nette.ajax.js - viz https://github.com/vojtech-dobes/history.nette.ajax.js/issues/1
 	 */
	$.nette.ext('forceRedirect', {
		success: function(payload, status, xhr, settings) {
			if (payload.forceRedirect)
				window.location.href = payload.forceRedirect;
		}
	});

})(jQuery);
