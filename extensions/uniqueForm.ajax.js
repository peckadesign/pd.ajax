(function ($) {
	/**
	 * @author Vít Kutný
	 *
	 * Unique form
	 *  - zamezí duplicitnímu odeslání ajaxového formuláře
	 *   - dvojklik
	 *   - dlouhotrvající request, kdy uživatel zkusí formulář odeslat znovu
	 *   - pokud je navěšené odeslání po změně hodnoty inputu, tak po změně a potvrzení enterem dochází jak k odeslání formuláře enterem a zároveň přes event
	 */
	$.nette.ext('uniqueForm', {
		start: function (xhr, settings) {
			if ('nette' in settings && 'form' in settings.nette && settings.nette.form) {
				settings.nette.form
					.bind('submit', this.formSubmitHandler)
					.find(this.inputSubmitSelector).each(this.inputSubmitBeforeHandler)
				;
			}
		},
		complete: function (xhr, status, settings) {
			if ('nette' in settings && 'form' in settings.nette && settings.nette.form) {
				settings.nette.form
					.unbind('submit', this.formSubmitHandler)
					.find(this.inputSubmitSelector).each(this.inputSubmitAfterHandler)
				;
			}
		}
	}, {
		formSubmitHandler: function () {
			return false;
		},
		inputSubmitSelector: 'input[type=submit], button[type=submit], input[type=image]',
		inputSubmitBeforeHandler: function () {
			var $this = $(this);
			if (!$this.prop('disabled')) {
				//disable not disabled inputs
				$this.data('uniqueFormDisabled', true);
				$this.prop('disabled', true);
			}
		},
		inputSubmitAfterHandler: function () {
			var $this = $(this);
			if ($this.data('uniqueFormDisabled')) {
				//enable inputs disabled by this extension
				$this.prop('disabled', false);
				$this.removeData('uniqueFormDisabled');
			}
		}
	});
})(jQuery);
