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
			$(document).on('submit', 'form', function () {
				if (uniqueForm.isExtensionOff(this) || this.target === '_blank' || (this.target === '_parent' && window.parent !== window)) {
					return true;
				}

				uniqueForm.formSubmitBeforeHandler.call(uniqueForm, this);
				$(this).data('uniqueFormTimeout', setTimeout(uniqueForm.formSubmitAfterHandler.bind(uniqueForm, this), uniqueForm.timeout));
			});
		},
		start: function (xhr, settings) {
			if ('nette' in settings && 'form' in settings.nette && settings.nette.form) {
				this.formSubmitBeforeHandler.call(this, settings.nette.form);
			}
		},
		complete: function (xhr, status, settings) {
			if (! ('forceRedirect' in xhr) && 'nette' in settings && 'form' in settings.nette && settings.nette.form) {
				this.formSubmitAfterHandler.call(this, settings.nette.form);
			}
		}
	}, {
		timeout: 60000,
		buttonClassDisabled: null,
		isExtensionOff: function(form) {
			var button = form['nette-submittedBy'];

			return (button && this.isOffByDataAttribute(button)) || this.isOffByDataAttribute(form);
		},
		isOffByDataAttribute: function(el) {
			return (el.getAttribute('data-ajax-off') && (' ' + el.getAttribute('data-ajax-off') + ' ').indexOf(' uniqueForm ') > -1);
		},
		formSubmitHandler: function () {
			return false;
		},
		formSubmitBeforeHandler: function (form) {
			var uniqueForm = this;
			var $form = $(form);
			clearTimeout($form.data('uniqueFormTimeout'));
			$form.removeData('uniqueFormTimeout')
				.bind('submit', uniqueForm.formSubmitHandler)
			;
			setTimeout(function () {
				// disabled je třeba nastavit opožděně, aby formulář odeslal v POST requestu i submit button
				$form.find(uniqueForm.inputSubmitSelector).each(function () {
					uniqueForm.inputSubmitBeforeHandler.call(uniqueForm, this);
				});
			}, 0); // setTimeout() re-queues the new JavaScript at the end of the execution queue
		},
		formSubmitAfterHandler: function (form) {
			var uniqueForm = this;
			var $form = $(form);
			clearTimeout($form.data('uniqueFormTimeout'));
			$form.removeData('uniqueFormTimeout')
				.unbind('submit', uniqueForm.formSubmitHandler)
			;

			setTimeout(function () {
				// protože disabled je přidáváno zpožděně, je potřeba jej zpožděně i odebírat, např. z důvodu možného abort requestu dříve, než byl disabled nastaven (pak by se inputSubmitAfterHandler proběhl dříve, než inputSubmitBeforeHandler)
				$form.find(uniqueForm.inputSubmitSelector).each(function () {
					uniqueForm.inputSubmitAfterHandler.call(uniqueForm, this);
				});
			}, 0); // setTimeout() re-queues the new JavaScript at the end of the execution queue
		},
		inputSubmitSelector: 'input[type=submit], button[type=submit], input[type=image]',
		inputSubmitBeforeHandler: function (el) {
			var $el = $(el);
			if (!$el.prop('disabled')) {
				//disable not disabled inputs
				$el.data('uniqueFormDisabled', true);
				$el.prop('disabled', true);
				if (this.buttonClassDisabled) {
					$el.addClass(this.buttonClassDisabled);
				}
			}
		},
		inputSubmitAfterHandler: function (el) {
			var $el = $(el);
			if ($el.data('uniqueFormDisabled')) {
				//enable inputs disabled by this extension
				if (this.buttonClassDisabled) {
					$el.removeClass(this.buttonClassDisabled);
				}
				$el.prop('disabled', false);
				$el.removeData('uniqueFormDisabled');
			}
		}
	});
})(window.jQuery, window.document);
