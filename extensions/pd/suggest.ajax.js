(function($, undefined) {
	var CONST_KEY_ESCAPE = 27;
	var CONST_KEY_DOWN = 40;
	var CONST_KEY_UP = 38;
	var CONST_KEY_ENTER = 13;

	var formSelector    = '.js-suggest__form';
	var inputSelector   = '.js-suggest__input';
	var btnSelector     = '.js-suggest__btn';
	var suggestSelector = '.js-suggest__suggest';
	var itemSelector    = '.js-suggest__item';

	/* Třída pro našeptávač jako takový */
	var pdSuggest = function(suggestBox, options) {
		var _this = this;
		this.$suggestBox = $(suggestBox);
		this.$form = suggestBox.tagName.toLowerCase() === 'form' ? this.$suggestBox : this.$suggestBox.find(formSelector);

		this.$input   = this.$form.find(inputSelector);
		this.$btn     = this.$form.find(btnSelector);
		this.$suggest = this.$suggestBox.find(suggestSelector);

		this.ariaActiveId = this.$input.attr('aria-activedescendant');

		this.timer = null;
		this.hideSuggestTimer = null;
		this.lastSearched = '';
		this.minLength = options.minLength || 2;
		this.timeout = options.timeout || 200;

		this.$suggestBox
			.on('keydown', inputSelector, $.proxy(this.handleInputKeydown, this))
			.on('keyup', inputSelector, $.proxy(this.handleInputKeyup, this))
			.on('mouseenter', itemSelector, $.proxy(this.handleItemMouseenter, this));

		this.$input
			.data('document-tap-blur', false)
			.on('focus', $.proxy(this.handleInputFocus, this))
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

	pdSuggest.prototype.changeActiveItem = function($current, $new) {
		$current
			.removeClass('js-suggest__item--active')
			.attr('aria-selected', 'false')
			.removeAttr('id');

		if ($new) {
			$new
				.addClass('js-suggest__item--active')
				.attr('aria-selected', 'true')
				.attr('id', this.ariaActiveId);
		}
	};

	pdSuggest.prototype.handleInputKeydown = function(e) {
		// zavření na klávesu escape, posun šipkami v našeptávači, odeslání/zavření enterem
		var $item;

		switch (e.keyCode) {
			case CONST_KEY_ESCAPE:
				e.preventDefault();
				this.$suggestBox.collapsable('collapseAll', e);
				break;

			case CONST_KEY_DOWN:
			case CONST_KEY_UP:
				e.preventDefault();

				$item = this.$suggestBox.find(itemSelector);
				var $active = $item.filter(itemSelector + '--active');
				var $newActive = $([]);
				var i = $item.index($active);

				if (i === 0 && e.keyCode === CONST_KEY_UP) {} // NOP, aktivní je první + šipka nahoru => nic není aktivní
				else if (i === -1) {
					// není nic active, vybereme první/poslední
					$newActive = (e.keyCode === CONST_KEY_DOWN) ? $item.first() : $item.last();
				}
				else {
					// jinak vybíráme předchozí / následující
					$newActive = (e.keyCode === CONST_KEY_DOWN) ? $item.eq(i + 1) : $item.eq(i - 1);
				}

				this.changeActiveItem($active, $newActive);

				break;

			case CONST_KEY_ENTER:
				$item = this.$suggestBox.find(itemSelector + '--active');
				var $link = $item.find('.js-suggest__link');

				if ($link.length) {
					if ($link.hasClass('js-pdbox')) {
						$link.trigger('click');
					}
					else {
						location.href = $link.attr('href');
					}

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
	pdSuggest.prototype.handleInputFocus = function(e) {
		var query = $(e.target).val();

		if (query.length > this.minLength) {
			this.showSuggest();
		}
	};

	pdSuggest.prototype.handleSuggestMousedown = function(e) {
		if (e.target.tagName.toLowerCase() !== 'input') {
			e.preventDefault();
		}
	};

	pdSuggest.prototype.handleItemMouseenter = function(e) {
		$currentActive = this.$suggestBox.find('.js-suggest__item--active');

		this.changeActiveItem($currentActive, $(e.currentTarget));
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
				var suggest = new pdSuggest(this, {
					timeout: ext.timeout,
					minLength: ext.minLength
				});
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
