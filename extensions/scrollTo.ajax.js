(function($, undefined) {

	/**
	 * @author Radek Šerý
	 * Usage: <a href="#" class="ajax" data-scroll-to="#target"></a>
	 * @todo Předělat při vhodné příležitosti hledání pdboxu na něco jako $.nette.ext('pdbox').box
	 */
	$.nette.ext('scrollTo', {
		before: function (xhr, settings) {
			if ((scrollToEl = (settings.nette !== undefined) ? settings.nette.el.data('scrollTo') : false) && $(scrollToEl).length) {
				// v pdboxu nelze scrollovat s documentem (zbytečné), ale je potřeba posunout samotný scroll pd-box-window
				if ($('body').hasClass('pd-box-open')) {
					var top = 0;
					var $pdbox = $(scrollToEl).closest('.pd-box-window');
					if ($pdbox.length) // offset elementu je pozice vůči viewportu a ten je fixovaný na okno -> proto k aktuální pozici scrollu pd-box-window přičteme offset elementu
						top = $pdbox.scrollTop() + $(scrollToEl).offset().top - $pdbox.offset().top;

					$('.pd-box-window').stop().animate({
						scrollTop: top
					}, 400);
				}
				else {
					$('html, body').stop().animate({
						scrollTop: $(scrollToEl).offset().top
					}, 400);
				}
			}
		}
	});

})(jQuery);
