(function($, undefined) {

	/**
	 * @author Radek Šerý
	 *
	 * Přidává spinner nad tlačítko při odeslání formuláře. V případě AJAXových formulářů dojde k odstranění po
	 * dokončení requestu, v případě neAJAXových formulářů se odstraní po uplynutí timeoutu, který je převzat
	 * z extension 'uniqueForm'
	 */
	$.nette.pd.ext('btnSpinner', {
		init: function () {
			var ext = this;
			var spinnerExt = $.nette.ext('spinner');
			var uniqueFormExt = $.nette.ext('uniqueForm');

			if (! this.spinnerHtml) {
				if (spinnerExt) {
					this.spinnerHtml = spinnerExt.spinnerHtml;
				}
				else {
					// pokud nemáme žádný spinner, extension nebude existovat
					return false;
				}
			}

			if (! this.timeout) {
				this.timeout = uniqueFormExt ? uniqueFormExt.timeout : 60000;
			}

			// AJAXové formuláře se sem nedostanou, protože nette ajax volá e.stopPropagation() nad submit event
			$(document).on('submit', 'form', function (e) {
				if (this['nette-submittedBy']) {
					var $btn = $(this['nette-submittedBy']);

					if ($btn.is('[data-no-spinner], [data-no-btn-spinner]')) {
						return;
					}

					var $form = $(this);
					var $spinner = $(ext.spinnerHtml);

					$btn.append($spinner);

					$form.data('btnSpinnerTimeout', setTimeout(function() {
						$spinner.remove();
						$form.removeData('btnSpinnerTimeout')
					}, ext.timeout));
				}
			});
		},
		start: function (xhr, settings) {
			if ('nette' in settings && settings.nette.el && settings.nette.el.length) {
				settings.$btnSpinner = $(this.spinnerHtml);
				settings.nette.el.append(settings.$btnSpinner);
			}
		},
		complete: function (xhr, status, settings) {
			if (! ('forceRedirect' in xhr) && ! ('forceReload' in xhr) && '$btnSpinner' in settings) {
				settings.$btnSpinner.remove();
			}

			if ('nette' in settings && 'form' in settings.nette && settings.nette.form) {
				var $form = $(settings.nette.form);

				clearTimeout($form.data('btnSpinnerTimeout'));
				$form.removeData('btnSpinnerTimeout');
			}
		}
	}, {
		timeout: undefined,
		spinnerHtml: undefined
	});

})(jQuery);
