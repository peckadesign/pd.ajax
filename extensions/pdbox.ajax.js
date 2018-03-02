(function($, undefined) {

	/**
	 * @author Radek Šerý
	 * @author Jiří Pudil
	 *
	 * Extension pro ajaxový pdbox, včetně historie (volitelně). Pro použití stačí pro ovládací element (tj. ten
	 * s class js-pdbox např.) přidat class ajax, pak např. data-no-spinner atd., další extension jsou kompatibilní.
	 *
	 * @todo Pokud otevřu pdbox, zavřu pdbox, zafiltruji, otevřu nový pdbox a pak v historii přejdu přímo na ten 1. otevřený (tj. přeskočím několik mezikroků), pak po zavření pdbox budu mít URL nekonzistentní vůči obsahu. Nevím, zda je to vůbec řešitelné, respektive jak snadno/těžko.
	 * @todo Nemělo by v lastState a original být též uloženo ui?
	 */

		// init a snippets jsou definovány v nette.ajax.js a history v history.nette.ajax.js, tj. vždy jsou v tuto chvíli dostupné (soubory musí být před pd.ajax soubory)
	var snippetsExt = $.nette.ext('snippets');
	var historyExt = $.nette.ext('history');
	var initExt = $.nette.ext('init');

	$.nette.ext('pdbox', {
		init: function () {
			this.historySupported = !! historyExt;

			this.ajaxified = initExt.linkSelector + ', ' + initExt.buttonSelector;

			if (this.historySupported) {
				if (this.box) {
					this.box.addEventListener('beforeOpen', $.proxy(function () {
						// při otevření pdbox vždy uložíme kontext, který je pod pdbox, aby bylo možné po zavření vše vrátit zpět
						if (this.popstate) {
							this.original.push(this.lastState);
						}
						else {
							var state = {
								location: location.href,
								state: history.state,
								title: document.title
							};
							this.original.push(state);
						}

						// navážeme událost po zavření
						// aby nebyla duplicitní, odstraníme ji v případě, že byla dříve napojena
						if (this.pushOriginalApplied) {
							this.box.removeEventListener('afterClose', this.pushOriginalApplied);
						}

						this.pushOriginalApplied = $.proxy(this.pushOriginal, this);
						this.box.addEventListener('afterClose', this.pushOriginalApplied);
					}, this));

					this.box.addEventListener('afterClose', $.proxy(function () {
						if (this.xhr) {
							this.xhr.abort();
						}
					}, this));
				}
			}
		},
		before: function (xhr, settings) {
			xhr.setRequestHeader('Pd-Box-Opened', Number(this.box && this.box.isOpen));
		},
		start: function (xhr) {
			if (this.xhr) {
				this.xhr.abort();
			}
			this.xhr = xhr;
		},
		success: function (payload, status, xhr, settings) {
			this.popstate = false;
			this.lastState = {
				location: location.href,
				state: history.state,
				title: document.title
			};

			// pokud success nastal po kliknutí na elementu s class this.pdboxSelector, vyvoláme load událost, nastavíme vlastnosti pdbox a pokud je povolená historie, nahradíme stávající stav naším, kde přidáváme do state vlastnost pdbox
			if (('nette' in settings && 'el' in settings.nette && settings.nette.el.is(this.pdboxSelector)) || settings.pdbox) {
				// zpracování vráceného redirectu v rámci pdbox
				if (payload.redirect) {
					var options = {
						url: payload.redirect,
						pdbox: true
					};

					if ($.inArray('history', settings.off) !== -1 || !this.historySupported) {
						options.off = ['history'];
					}
					if ('spinnerQueue' in settings) {
						options.spinnerQueue = settings.spinnerQueue.slice(0);
						settings.spinnerQueue = [];
					}
					if ($.inArray('history', settings.off) === -1 && this.historySupported) {
						this.historyEnabled = true;
					}

					$.nette.ajax(options);

					return;
				}

				var $opener = ('nette' in settings && 'el' in settings.nette && settings.nette.el) ? settings.nette.el : null;

				this.box.window.content.find(this.ajaxified).addClass(this.pdboxAutoClass); // .slice(1) odstraní z názvu class
				this.box.dispatchEvent('load', {element: $opener, content: payload});

				if ($.inArray('history', settings.off) === -1 && this.historySupported) {
					this.historyEnabled = true;

					// element, který otevřel pdbox; aby bylo možné serializovat, tak jako string a ne jako DOM element
					var pdbox = {
						opener: $opener ? $opener[0].outerHTML : null,
						content: this.box.content(),
						options: this.box.options
					};

					history.replaceState($.extend(history.state || {}, {
						title: document.title,
						pdbox: pdbox,
						ui: (historyExt && historyExt.cache && snippetsExt) ? snippetsExt.findSnippets() : null
					}), document.title, location.href);
				}
			}
		},
		complete: function () {
			this.xhr = null;
		}
	}, {
		pdboxSelector: '.js-pdbox',
		pdboxAutoClass: 'js-pdbox',  // jde o název class, ne selector! automaticky nastavovaná třída ajax odkazům uvnitř otevřeného pdboxu; na tuto třídu by měl být pdbox též inicializován
		historySupported: false, // nastavujeme v init
		historyEnabled: false, // zabrání/povolí pushState po zavření okna pdbox; jdeme-li zpět (popstate), tak při zavření pdbox nechceme vkládat nový stav do historie, dále brání vložení stavu pro pdbox bez historie (např. obrázkový pdbox)
		popstate: false,
		pushOriginal: function () {
			// fce pro vložení stavu do historie, volá se po zavření pdbox; nový stav vkládá pouze pokud má co vložit (tj. víme co je pod pdbox) a pokud nezavíráme pdbox tlačítkem zpět
			// pop stavu se vyvolá vždy při zavření pdbox, pushState ale chceme jen pokud není zavření vyvoláno popstatem
			if (this.historyEnabled) {
				var state = this.original.pop();
				if (state) {
					if (history.state === undefined || (history.state.href !== state.location)) { // zavření pdbox tlačítkem zpět pop je stejný stav, jako aktuální a nechceme jej zduplikovat
						history.pushState(state.state, state.title, state.location);
						document.title = state.title;

						this.popstate = false;
						this.lastState = {
							location: state.location,
							state: state.state,
							title: state.title
						};
					}
				}

				this.historyEnabled = false;
			}
		},
		ajaxified: '', // selector všeho, co by mělo být odesíláno ajaxem
		original: [], // zásobník stavů "pod pdbox" - po zavření pdbox musíme nastavit URL, title a stav do historie přes pushState
		lastState: null,
		box: null,
		xhr: null
	});


	// "náš" popstate potřebujeme navázat před popstate.nette z history.nette.ajax.js, aby bylo možno v before callbacku
	// správně detekovat, zda je pdbox otevřený, proto je inicializace mimo init callback rovnou po definici extension
	if (historyExt) {
		var ext = $.nette.ext('pdbox');
		var popstateHandler = $.proxy(function (e) {
			var state = e.originalEvent.state || historyExt.initialState;
			this.popstate = true;

			// při popstate kontrolujeme, zda nový stav má nastavenou vlastnost pdbox, pokud ano, otevřeme jej (metoda open kontroluje, zda již otevřený není), vložíme obsah a spustíme událost load
			if ('pdbox' in state && state.pdbox) {
				this.historyEnabled = true; // protože jde o popstate, jde o pdbox s historií (pokud je to pdbox, není třeba řešit tady), tj. nastavíme historyEnabled na true, aby po zavření křížkem došlo k pushState

				// předáváme virtuální DOM element, který není skutečným zdrojem otevření, ale má totožné data atributy, o které nám jde
				var $opener = $(state.pdbox.opener);

				this.box.open($opener);
				this.box.content(state.pdbox.content);
				this.box.setOptions(state.pdbox.options, true);
				this.box.dispatchEvent('load', {element: $opener, content: state.pdbox.content});
			} else {
				this.historyEnabled = false; // zavíráme pomocí tlačítka zpět/vpřed, tj. nechceme zapisovat do historie

				// pokud pdbox není, zavřeme jej (metoda close opět kontroluje, zda je pdbox otevřený)
				this.box.close();
			}

			// udržujeme si aktuální stav, díky němu víme, kam se vracet (viz metoda open a push do original) i v případě popstate
			// upravit až po otevření pdbox (pokud se otevíral, není třeba kontrolovat)
			this.lastState = {
				location: location.href,
				state: state,
				title: document.title
			};
		}, ext);

		$(window).on('popstate.pdbox', popstateHandler);
	}

})(jQuery);
