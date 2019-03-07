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


	/**
	 * Načtení vybraných extension, se kterými budeme pracovat. `init` a `snippets` jsou definovány v nette.ajax.js a
	 * `history` v history.nette.ajax.js, tj. vždy jsou v tuto chvíli dostupné (soubory musí být před pd.ajax soubory).
	 */
	var snippetsExt = $.nette.ext('snippets');
	var historyExt = $.nette.ext('history');
	var initExt = $.nette.ext('init');


	/**
	 * Mód fungování historie (pokud je zapnutá) pdboxu
	 * 0    při zavření se vrací v historii zpět do stavu před otevřením (výchozí)
	 * 1    při zavření se vytváří nový stav
	 */
	var mode;
	var PDBOX_HISTORY_BACKWARDS = 0;
	var PDBOX_HISTORY_FORWARDS = 1;


	var closePopstateFlag = false;
	var historySupported = !! historyExt;


	/**
	 * Metoda pro zpracování redirect pole v odpovědi při otevřeném pdboxu.
	 */
	var handleRedirect = function(ext, payload, settings, requestHistory) {
		var options = {
			url: payload.redirect,
			off: settings.off,
			pd: settings.pd,
			pdbox: true
		};

		if (requestHistory) {
			ext.historyEnabled = true;
		}

		if ('spinnerQueue' in settings) {
			options.spinnerQueue = settings.spinnerQueue.slice(0);
			settings.spinnerQueue = [];
		}

		$.nette.ajax(options);
	};


	var isPdboxRequest = function(ext, settings) {
		return ('nette' in settings && 'el' in settings.nette && settings.nette.el.is(ext.pdboxSelector)) || settings.pdbox;
	};


	var isRequestHistory = function(ext, settings) {
		var isHistoryOn = ! settings.off || settings.off.indexOf('history') === -1;
		var isReplaceStateOn = settings.pd && settings.pd.indexOf('replaceState') !== -1;

		return historySupported && (isHistoryOn || isReplaceStateOn);
	};


	$.nette.ext('pdbox', {
		init: function () {
			this.ajaxified = initExt.linkSelector + ', ' + initExt.buttonSelector;

			if (historySupported) {
				if (this.box) {
					this.box.addEventListener('beforeOpen', (function (data) {
						if (data.element && data.element.data('pdbox-history') === 'forwards') {
							mode = PDBOX_HISTORY_FORWARDS;
						} else {
							mode = PDBOX_HISTORY_BACKWARDS;
						}

						// pokud je mód historie dopředný, při otevření pdbox uložíme kontext, který je pod pdbox, aby
						// bylo možné po zavření vše vrátit zpět
						if (mode === PDBOX_HISTORY_FORWARDS) {
							if (this.popstate) {
								this.original.push(this.lastState);
							} else {
								var state = {
									location: location.href,
									state: history.state,
									title: document.title
								};
								this.original.push(state);
							}
						}
					}).bind(this));

					this.box.addEventListener('afterClose', this.afterCloseHandler.bind(this));
					this.box.addEventListener('afterClose', (function () {
						if (this.xhr) {
							this.xhr.abort();
							this.xhr = null;
						}
					}).bind(this));
				}
			}
		},
		before: function (xhr, settings) {
			xhr.setRequestHeader('Pd-Box-Opened', Number(this.box && this.box.isOpen));
		},
		start: function (xhr, settings) {
			// probíhající request rušíme pouze v případě, že nový i probíhající jsou pdbox requesty
			if (isPdboxRequest(this, settings)) {
				if (this.xhr) {
					this.xhr.abort();
				}

				this.xhr = xhr;
			}
		},
		success: function (payload, status, xhr, settings) {
			this.popstate = false;
			this.lastState = {
				location: location.href,
				state: history.state,
				title: document.title
			};

			// pokud success nastal po kliknutí na elementu s class this.pdboxSelector, vyvoláme load událost, nastavíme vlastnosti pdbox a pokud je povolená historie, nahradíme stávající stav naším, kde přidáváme do state vlastnost pdbox
			if (isPdboxRequest(this, settings)) {
				// je pro současný request povolená historie?
				var requestHistory = isRequestHistory(pdboxExt, settings);

				// zpracování vráceného redirectu v rámci pdbox
				if (payload.redirect) {
					handleRedirect(this, payload, settings, requestHistory);

					return;
				}

				var $opener = ('nette' in settings && 'el' in settings.nette && settings.nette.el) ? settings.nette.el : null;

				var $ajaxified = this.box.window.content.find(this.ajaxified);
				$ajaxified.addClass(this.pdboxAutoClass);

				// Pokud není historie při otevírání, vypneme ji i pro automaticky zAJAXované odkazy a formuláře
				if (! requestHistory) {
					$ajaxified.each(function() {
						var off = $(this).attr('data-ajax-off') || '';

						if ((' ' + off + ' ').indexOf(' history ') === -1) {
							off += (off ? ' ' : '') + 'history';

							$(this).attr('data-ajax-off', off);
						}
					});
				}

				// Pokud je historie, upravíme nový stav přidáním 'pdbox' pole
				if (requestHistory) {
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

				this.box.dispatchEvent('load', {element: $opener, content: payload});
			}
		},
		complete: function () {
			this.xhr = null;
		}
	}, {
		pdboxSelector: '.js-pdbox',
		pdboxAutoClass: 'js-pdbox',  // jde o název class, ne selector! automaticky nastavovaná třída ajax odkazům uvnitř otevřeného pdboxu; na tuto třídu by měl být pdbox též inicializován
		historyEnabled: false, // zabrání/povolí pushState po zavření okna pdbox; jdeme-li zpět (popstate), tak při zavření pdbox nechceme vkládat nový stav do historie, dále brání vložení stavu pro pdbox bez historie (např. obrázkový pdbox)
		popstate: false,
		afterCloseHandler: function () {
			// fce pro vložení stavu do historie, volá se po zavření pdbox; nový stav vkládá pouze pokud má co vložit (tj. víme co je pod pdbox) a pokud nezavíráme pdbox tlačítkem zpět
			// pop stavu se vyvolá vždy při zavření pdbox, pushState ale chceme jen pokud není zavření vyvoláno popstatem
			if (this.historyEnabled) {

				if (mode === PDBOX_HISTORY_BACKWARDS) {

					// Protože nevíme, o kolik stavů v historii jít zpět (v průběhu pdboxu mohlo stavů vzniknout více), vracíme se postupně po jednom, viz popsate
					closePopstateFlag = true;
					window.history.back();

				} else if (mode === PDBOX_HISTORY_FORWARDS) {

					var state = this.original.pop();
					this.original = [];
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
	if (historySupported) {
		var pdboxExt = $.nette.ext('pdbox');
		var popstateHandler = function (e) {
			var state = e.originalEvent.state || historyExt.initialState;
			var isPdboxState = 'pdbox' in state && state.pdbox;

			pdboxExt.popstate = true;

			// Nevíme, o kolik stavů jít zpět, proto postupně jdeme po jednom, dokud se nedostaneme ke stavu před
			// pdboxem (tj. isPdboxState bude false).
			if (closePopstateFlag) {
				e.stopImmediatePropagation(); // nemáme zájem o popstate.nette (reálně o žádné další popstate handlery...)

				if (isPdboxState) {
					window.history.back();

					return;
				} else {
					closePopstateFlag = false;
				}
			}

			// při popstate kontrolujeme, zda nový stav má nastavenou vlastnost pdbox, pokud ano, otevřeme jej (metoda open kontroluje, zda již otevřený není), vložíme obsah a spustíme událost load
			if (isPdboxState) {
				pdboxExt.historyEnabled = true; // protože jde o popstate, jde o pdbox s historií (pokud je to pdbox, není třeba řešit tady), tj. nastavíme historyEnabled na true, aby po zavření křížkem došlo k pushState

				// předáváme virtuální DOM element, který není skutečným zdrojem otevření, ale má totožné data atributy, o které nám jde
				var $opener = $(state.pdbox.opener);

				pdboxExt.box.open($opener);
				pdboxExt.box.content(state.pdbox.content);
				pdboxExt.box.setOptions(state.pdbox.options, true);
				pdboxExt.box.dispatchEvent('load', {element: $opener, content: state.pdbox.content});
			} else {
				pdboxExt.historyEnabled = false; // zavíráme pomocí tlačítka zpět/vpřed, tj. nechceme zapisovat do historie

				// pokud pdbox není, zavřeme jej (metoda close opět kontroluje, zda je pdbox otevřený)
				pdboxExt.box.close();
			}

			// udržujeme si aktuální stav, díky němu víme, kam se vracet (viz metoda open a push do original) i v případě popstate
			// upravit až po otevření pdbox (pokud se otevíral, není třeba kontrolovat)
			pdboxExt.lastState = {
				location: location.href,
				state: state,
				title: document.title
			};
		};

		$(window).on('popstate.pdbox', popstateHandler);
	}

})(jQuery);
