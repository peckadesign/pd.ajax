(function($, undefined) {

	/**
	 * @author Radek Šerý
	 * Usage:
	 *   <a href="#" class="ajax" data-scroll-to="#target"></a>
	 *   <a href="#" class="ajax" data-scroll-to="#target" data-scroll-to-offset="30"></a>
	 *   <a href="#" class="ajax" data-scroll-to="#target" data-scroll-to-event="success"></a>
	 */
	$.nette.ext('scrollTo', {
		init: function () {
			var pdboxExt = $.nette.ext('pdbox');

			if (pdboxExt) {
				this.pdbox = pdboxExt.box;
			}
		},
		before: function (xhr, settings) {
			this.checkScroll(settings, 'before');
		},
		success: function (payload, status, xhr, settings) {
			this.checkScroll(settings, 'success');
		}
	}, {
		offset: 0,
		duration: 400,
		defaultEvent: 'before',
		checkScroll: function (settings, event) {
			if ('nette' in settings && settings.nette.el) {
				var $clickedEl = $(settings.nette.el);
				var scrollEvent = $clickedEl.data('scrollToEvent');

				if (scrollEvent === event || (! scrollEvent && event === this.defaultEvent)) {
					this.doScroll(settings, $clickedEl);
				}
			}
		},
		doScroll: function (settings, $clickedEl) {
			var dataOffset = $clickedEl.data('scrollToOffset');
			var offset = (dataOffset !== undefined) ? dataOffset : this.offset;
			var $scrollToEl = $( $clickedEl.data('scrollTo') );

			if ($scrollToEl.length) {
				// v pdboxu nelze scrollovat s documentem (zbytečné), ale je potřeba posunout samotný scroll pd-box-window
				if (this.pdbox && this.pdbox.isOpen) {
					var $pdbox = this.pdbox.window.elem;
					var top = $pdbox.scrollTop() + $scrollToEl.offset().top - $pdbox.offset().top - offset;

					$pdbox.stop().animate({
						scrollTop: top
					}, this.duration);
				}
				else {
					$('html, body').stop().animate({
						scrollTop: $scrollToEl.offset().top - offset
					}, this.duration);
				}
			}
		}
	});

})(jQuery);
