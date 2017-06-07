(function($, undefined) {

	/**
	 * @author Radek Šerý
	 * @author Jiří Pudil
	 *
	 * Extension pro ajaxový pdbox, včetně historie (volitelně). Pro použití stačí pro ovládací element (tj. ten
	 * s class thickbox) přidat class ajax, pak např. data-spinner=".pd-box-content" atd., další extension by měla být
	 * kompatibilní :)
	 *
	 * @todo Pokud otevřu TB, zavřu TB, zafiltruji, otevřu nový TB a pak v historii přejdu přímo na ten 1. otevřený (tj. přeskočím několik mezikroků), pak po zavření TB budu mít URL nekonzistentní vůči obsahu. Nevím, zda je to vůbec řešitelné, respektive jak snadno/těžko.
	 *
	 * @todo Nemělo by v lastState a original být též uloženo ui?
	 */

	var snippetsExt;
	var historyExt;

	$.nette.ext('pdbox', {
		init: function () {
			snippetsExt = $.nette.ext('snippets');
			historyExt = $.nette.ext('history');
			initExt = $.nette.ext('init');

			this.historySupported = !! historyExt;

			this.ajaxified = initExt.linkSelector + ', ' + initExt.formSelector + ', ' + initExt.buttonSelector;

			if (this.historySupported) {
				$(window).on('popstate.pdbox', $.proxy(function (e) {
					var state = e.originalEvent.state || historyExt.initialState;
					this.popstate = true;

					// při popstate kontrolujeme, zda nový stav má nastavenou vlastnost pdbox, pokud ano, otevřeme jej (metoda open kontroluje, zda již otevřený není), vložíme obsah a spustíme událost load
					if ('pdbox' in state && state.pdbox) {
						this.historyEnabled = true; // protože jde o popstate, jde o TB s historií (pokud je to TB, není třeba řešit tady), tj. nastavíme historyEnabled na true, aby po zavření křížkem došlo k pushState

						this.box.open();
						this.box.content(state.pdbox.content);
						this.box.setOptions(state.pdbox.options);
						this.box.dispatchEvent('load', {content: state.pdbox.content});
					} else {
						this.historyEnabled = false; // zavíráme pomocí tlačítka zpět/vpřed, tj. nechceme zapisovat do historie

						// pokud pdbox není, zavřeme jej (metoda close opět kontroluje, zda je TB otevřený)
						this.box.close();
					}

					// udržujeme si aktuální stav, díky němu víme, kam se vracet (viz metoda open a push do original) i v případě popstate
					// upravit až po otevření TB (pokud se otevíral, není třeba kontrolovat)
					this.lastState = {
						location: location.href,
						state: state,
						title: document.title
					};
				}, this));

				if (this.box) {
					this.box.addEventListener('open', $.proxy(function () {
						// po otevření TB vždy uložíme kontext, který je pod TB, aby bylo možné po zavření vše vrátit zpět
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

						// navážeme událost po zavření, preventivně ji předtím odstraňujeme, aby nebyla duplicitní
						this.box.removeEventListener('afterClose');
						this.box.addEventListener('afterClose', $.proxy(this.pushOriginal, this));
					}, this));
				}
			}
		},
		before: function (xhr, settings) {
			xhr.setRequestHeader('Pd-Box-Opened', +this.box.isOpen);
			this.box.addEventListener('afterClose', function () {
				xhr.abort();
			});
		},
		success: function (payload, status, xhr, settings) {
			this.popstate = false;
			this.lastState = {
				location: location.href,
				state: history.state,
				title: document.title
			};

			// pokud success nastal po kliknutí na elementu s class thickbox, vyvoláme load událost, nastavíme vlastnosti TB a pokud je povolená historie, nahradíme stávající stav naším, kde přidáváme do state vlastnost pdbox
			if (('nette' in settings && 'el' in settings.nette && settings.nette.el.is('.thickbox')) || settings.pdbox) {
				// zpracování vráceného redirectu v rámci TB
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

				this.box.window.content.find(this.ajaxified).addClass('thickbox');
				this.box.dispatchEvent('load', {content: payload});

				if ($.inArray('history', settings.off) === -1 && this.historySupported) {
					this.historyEnabled = true;

					pdbox = {
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
		}
	}, {
		historySupported: false, // nastavujeme v init
		historyEnabled: false, // zabrání/povolí pushState po zavření okna TB; jdeme-li zpět (popstate), tak při zavření TB nechceme vkládat nový stav do historie, dále brání vložení stavu pro TB bez historie (např. obrázkový TB)
		popstate: false,
		pushOriginal: function () {
			// fce pro vložení stavu do historie, volá se po zavření TB; nový stav vkládá pouze pokud má co vložit (tj. víme co je pod TB) a pokud nezavíráme TB tlačítkem zpět
			// pop stavu se vyvolá vždy při zavření TB, pushState ale chceme jen pokud není zavření vyvoláno popstatem
			if (this.historyEnabled) {
				var state = this.original.pop();
				if (state) {
					if (history.state === undefined || (history.state.href != state.location)) { // zavření TB tlačítkem zpět pop je stejný stav, jako aktuální a nechceme jej zduplikovat
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
		original: [], // zásobník stavů "pod TB" - po zavření TB musíme nastavit URL, title a stav do historie přes pushState
		lastState: null,
		box: null
	});

})(jQuery);
