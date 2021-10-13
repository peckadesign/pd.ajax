(function($, undefined) {

	var InpNumber = function(el) {
		var $el = $(el);
		var _this = this;

		this.$input = $el.find('.inp-number__input');

		this.$inc = $('<a href="#" class="inp-number__btn inp-number__btn--inc"><span>+</span></a>');
		this.$dec = $('<a href="#" class="inp-number__btn inp-number__btn--dec"><span>&minus;</span></a>');
		this.$btns = this.$inc.add(this.$dec);

		this.min = parseInt(this.$input.attr('min') || 0);
		this.max = parseInt(this.$input.attr('max') || Number.MAX_SAFE_INTEGER);

		this.timer = null;

		$el.find('.inp-number__btn').remove();
		$el
			.data('initialized', true)
			.prepend(this.$dec)
			.append(this.$inc);

		// inicializace, upravení hodnoty do intervalu <min;max>, vypnutí tlačítek
		this.adjustValue();
		this.setDisabledBtns();

		// bind handlers
		this.$btns
			.on('click', $.proxy(this.handleClick, this))
			.on('contextmenu', function(e) { e.preventDefault(); }) // longtap na Android zařízeních otevírá menu; pro iOS je nutné uvést v css -webkit-touch-callout: none;
			.on('mousedown longtap', $.proxy(this.startRapidChange, this))
			.on('mouseup mouseleave touchend touchcancel', $.proxy(this.stopRapidChange, this));

		this.$input
			.on('change', $.proxy(this.handleChange, this)) // mouseup není vyvoláno, pokud z tlačítka sjedeme, proto mouseleave
			.on('focus', $.proxy(this.handleFocus, this));
	};

	InpNumber.prototype = {
		getValue: function() {
			return parseInt(this.$input.val()) || 0;
		},
		setValue: function(value) {
			this.$input.val(value);
		},
		getOp: function(e) {
			return e.currentTarget === this.$dec[0] ? 'getDecrement' : 'getIncrement';
		},
		isClickedBtnDisabled: function(e) {
			return $(e.currentTarget).data('disabled');
		},

		getIncrement: function(value) {
			value++;

			return value > this.max ? this.max : value;
		},
		getDecrement: function(value) {
			value--;

			return value < this.min ? this.min : value;
		},

		valueChanged: function() {
			this.$input.trigger('change');
		},
		adjustValue: function() {
			var value = this.getValue();
			value = value < this.min ? this.min : (value > this.max ? this.max : value);

			this.setValue(value);
		},
		setDisabledBtns: function() {
			var value = this.getValue();

			this.$btns
				.data('disabled', false)
				.removeClass('inp-number__btn--disabled');

			if (value === this.min || this.$input.is(':disabled')) {
				this.$dec
					.data('disabled', true)
					.addClass('inp-number__btn--disabled');
			}
			if (value === this.max || this.$input.is(':disabled')) {
				this.$inc
					.data('disabled', true)
					.addClass('inp-number__btn--disabled');
			}
		},

		handleClick: function(e) {
			e.preventDefault();

			// rapidChangeFlag flag je nastavován v případě mousedown, tj. pokud měníme hodnotu vícenásobně
			if (! this.rapidChangeFlag && ! this.isClickedBtnDisabled(e)) {
				var value = this.getValue();
				var op = this.getOp(e);

				value = this[op](value);
				this.setValue(value);

				this.valueChanged();
			}

			// musíme nastavit zde, protože click je vyvolán až po mouseup události
			this.rapidChangeFlag = false;
		},
		handleChange: function() {
			this.adjustValue();
			this.setDisabledBtns();
		},
		handleFocus: function() {
			this.$input[0].select();
		},

		startRapidChange: function(e) {
			e.preventDefault();

			// už zpracováváme z click event -> desktop, takže longtap ignorujeme
			// nebo je tlačítko disabled
			if ((e.type === 'longtap' && this.rapidChangeFlag) || this.isClickedBtnDisabled(e)) {
				return;
			}

			var _this = this;
			var value = this.getValue();
			var op = this.getOp(e);
			var counter = 0;

			var rapidChange = function() {
				counter++;
				newValue = _this[op](value);

				_this.rapidChangeFlag = true;

				if (value !== newValue) {
					value = newValue;

					_this.valueChangedFlag = true;
					_this.setValue(value);

					if (counter === 1) {
						_this.setDisabledBtns();
					}
				}
				// hodnota se v této iteraci nezměnila -> narazili jsme na min/max hodnotu, urychlíme vyvolání change eventy
				else {
					if (_this.valueChangedFlag) {
						_this.stopRapidChange();
					}
					return;
				}

				var delay = 150;
				if (counter > 10) {
					delay = Math.max(10, delay - 5 * counter);
				}
				_this.timer = setTimeout(rapidChange, delay);
			};

			this.timer = setTimeout(rapidChange, 300);
		},
		stopRapidChange: function(e) {
			clearTimeout(this.timer);

			if (this.valueChangedFlag) {
				this.valueChanged();
				this.valueChangedFlag = false;
			}
		}
	};


	/**
	 * @author Radek Šerý
	 *
	 * Inicializace .inp-number elementů, dynamicky vytvoří tlačítka a naváže eventy
	 */
	$.nette.ext('inpNumber', {
		init: function() {
			var snippetsExt = this.ext('snippets', true);
			var ext = this;

			snippetsExt.after(function($el) {
				ext.init.call(ext, $el);
			});

			this.init($(document));
		}
	}, {
		selector: '.inp-number',

		init: function($el) {
			var ext = this;

			$el
				.find(this.selector)
				.each(function() {
					var inpNumber = new InpNumber(this);
					$(this).data('inpNumber', inpNumber);
				});
		}
	});

})(jQuery);
