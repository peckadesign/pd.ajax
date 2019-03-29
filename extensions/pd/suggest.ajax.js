(function($, undefined) {

	/* Třída pro našeptávač jako takový */
	var pdSuggest = function(form, options) {
		var inputSelector   = '.js-suggest__input';
		var btnSelector     = '.js-suggest__btn';
		var suggestSelector = '.js-suggest__suggest';

		var _this = this;
		this.$form = $(form);

		this.$input   = this.$form.find(inputSelector);
		this.$btn     = this.$form.find(btnSelector);
		this.$suggest = this.$form.find(suggestSelector);

		this.timer = null;
		this.hideSuggestTimer = null;
		this.lastSearched = '';
		this.minLength = options.minLength || 2;
		this.timeout = options.timeout || 200;

		this.$form
			.on('keydown', inputSelector, $.proxy(this.handleInputKeydown, this))
			.on('keyup', inputSelector, $.proxy(this.handleInputKeyup, this));

		this.$input
			.data('document-tap-blur', false)
			.on('focus', $.proxy(this.showSuggest, this))
			.on('blur', $.proxy(this.hideSuggest, this));

		this.$suggest
			.on('mousedown', $.proxy(this.handleSuggestMousedown, this));

		this.$form.data('pdSuggest', this);
	};
	pdSuggest.prototype.hideSuggest = function() {
		this.isOpen = false;
		this.$suggest.removeClass('js-suggest__suggest--shown');
	};
	pdSuggest.prototype.showSuggest = function() {
		this.isOpen = true;
		this.$suggest.addClass('js-suggest__suggest--shown');
	};
	pdSuggest.prototype.emptySuggest = function() {
		this.$suggest
			.addClass('js-suggest__suggest--empty')
			.empty();
	};

	pdSuggest.prototype.handleInputKeydown = function(e) {
		// zavření na klávesu escape, posun šipkami v našeptávači, odeslání/zavření enterem
		var $a;

		switch (e.keyCode) {
			case 27: // Escape
				e.preventDefault();
				this.$form.collapsable('collapseAll', e);
				break;
			case 40: // Down
			case 38: // Up
				e.preventDefault();

				$a = this.$form.find('.js-suggest__link');
				var $active = $a.filter('.js-suggest__link--active');
				var i = $a.index($active);

				$active.removeClass('js-suggest__link--active');
				if (i === -1) { // není nic active, vybereme první/poslední
					if (e.keyCode === 40)
						$a.first().addClass('js-suggest__link--active');
					else
						$a.last().addClass('js-suggest__link--active');
				}
				else if (i === 0 && e.keyCode === 38) {} // NOP, aktivní je první + šipka nahoru => nic není aktivní
				else {
					if (e.keyCode === 40)
						$a.eq(i+1).addClass('js-suggest__link--active');
					else
						$a.eq(i-1).addClass('js-suggest__link--active');
				}

				break;

			case 13: // Enter
				$a = this.$form.find('.js-suggest__link--active');
				if ($a.length) {
					location.href = $a.attr('href');

					e.preventDefault();
					e.stopPropagation();
				}

				break;

			default:
				break;
		}
	};
	pdSuggest.prototype.handleInputKeyup = function(e) {
		clearTimeout(this.timer);

		var query = $(e.target).val();

		if (query.length < this.minLength) {
			this.hideSuggest();
		}

		if (query.length >= this.minLength) {
			// pokud byl suggest zavřený, tak ho otevřeme
			if (! this.isOpen) {
				// ještě předtím ale vyprázdníme, pokud query neodpovídá poslednímu hledanému
				if (query !== this.lastSearched) {
					this.emptySuggest();
				}

				this.showSuggest();
			}

			if (query !== this.lastSearched) {
				var _this = this;
				this.timer = setTimeout(function() {
					_this.lastSearched = query;

					_this.$btn.click();
				}, this.timeout);
			}
		}
	};

	pdSuggest.prototype.handleSuggestMousedown = function(e) {
		e.preventDefault();
	};


	/**
	 * @author Radek Šerý
	 *
	 * Našeptávač jako součást nette.ajax, obstarává spinner a odeslání requestu
	 */
	$.nette.pd.ext('suggest', {
		init: function() {
			this.attachHandlers();
			this.attachExtension($(this.selector));
		},
		start: function(xhr, settings) {
			if ('nette' in settings && settings.nette.form) {
				var pdSuggest = settings.nette.form.data('pdSuggest');

				if (pdSuggest) {
					pdSuggest.$input.addClass('inp-text--loading');
				}
			}
		},
		complete: function(xhr, status, settings) {
			if ('nette' in settings && settings.nette.form) {
				var pdSuggest = settings.nette.form.data('pdSuggest');

				if (pdSuggest) {
					pdSuggest.$input.removeClass('inp-text--loading');

					if (pdSuggest.$suggest[0].hasChildNodes()) {
						pdSuggest.$suggest.removeClass('js-suggest__suggest--empty');
					} else {
						pdSuggest.$suggest.addClass('js-suggest__suggest--empty');
					}
				}
			}
		}
	}, {
		timeout: 200,
		minLength: 2,
		selector: '.js-suggest',
		attachHandlers: function() {
			var ext = this;

			$(ext.selector).each(function() {
				var suggest = new pdSuggest(this, ext.timeout, ext.minLength);
			});
		},
		attachExtension: function ($el) {
			var ext = this;

			if ($el.closest(ext.selector).length === 0) {
				return;
			}

			$el.find(ext.selector + '__btn').each(function () {
				var pdExtensions = $(this).attr('data-ajax-pd') || '';
				pdExtensions += (pdExtensions ? ' ' : '') + ext.name();

				$(this)
					.addClass('ajax')
					.attr('data-ajax-pd', pdExtensions);
			});
		}
	});

})(jQuery);
