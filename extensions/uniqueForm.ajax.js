(function ($, document) {
	/**
	 * @author Vít Kutný
	 *
	 * Unique form
	 *  - zamezí duplicitnímu odeslání formuláře
	 *   - dvojklik
	 *   - dlouhotrvající request, kdy uživatel zkusí formulář odeslat znovu
	 *   - pokud je navěšené odeslání po změně hodnoty inputu, tak po změně a potvrzení enterem dochází jak k odeslání formuláře enterem a zároveň přes event
	 */
	$.nette.ext('uniqueForm', {
		init: function () {
			var uniqueForm = this;
			$(document).on('submit', 'form', function (event) {
				var $form = $(this);
				uniqueForm.formSubmitBeforeHandler.apply(uniqueForm, [$form]);
				setTimeout(function () {
					//disable je třeba nastavit opožděně, aby formulář odeslal v POST requestu i submit button
					$form.find(uniqueForm.inputSubmitSelector).each(uniqueForm.inputSubmitBeforeHandler);
				}, 0); //setTimeout() re-queues the new JavaScript at the end of the execution queue
				$form.data('uniqueFormTimeout', setTimeout(function () {
					uniqueForm.formSubmitAfterHandler.apply(uniqueForm, [$form]);
					$form.find(uniqueForm.inputSubmitSelector).each(uniqueForm.inputSubmitAfterHandler)
				}, uniqueForm.timeout));
			});
		},
		start: function (xhr, settings) {
			if ('nette' in settings && 'form' in settings.nette && settings.nette.form) {
				var $form = settings.nette.form;
				this.formSubmitBeforeHandler.apply(this, [$form]);
				$form.find(this.inputSubmitSelector).each(this.inputSubmitBeforeHandler);
			}
		},
		complete: function (xhr, status, settings) {
			if ('nette' in settings && 'form' in settings.nette && settings.nette.form) {
				var $form = settings.nette.form;
				this.formSubmitAfterHandler.apply(this, [$form]);
				$form.find(this.inputSubmitSelector).each(this.inputSubmitAfterHandler)
			}
		}
	}, {
		timeout: 5000,
		formSubmitHandler: function () {
			return false;
		},
		formSubmitBeforeHandler: function ($form) {
			clearTimeout($form.data('uniqueFormTimeout'));
			$form.removeData('uniqueFormTimeout')
				.bind('submit', this.formSubmitHandler)
			;
		},
		formSubmitAfterHandler: function ($form) {
			clearTimeout($form.data('uniqueFormTimeout'));
			$form.removeData('uniqueFormTimeout')
				.unbind('submit', this.formSubmitHandler)
			;
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
})(window.jQuery, window.document);
