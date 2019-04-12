(function($, undefined) {

	/**
	 * @author Radek Šerý
	 * Force reload
	 * Extension, které reloadne stránku, pokud v odpovědi je "forceReload". V případě, že v JSONu je i _fid, přidá jej
	 * do URL pro reload.
	 */
	$.nette.ext('forceReload', {
		success: function(payload, status, xhr, settings) {
			if (payload.forceReload) {
				var href = window.location.href;

				href = this.removeFid(href);

				if (payload._fid) {
					href = this.addFid(href, payload._fid)
				}

				window.location.href = href;
			}
		}
	}, {
		addFid: function(href, _fid) {
			var s = '?';

			if ((i = href.search(/\?/)) !== -1) {
				s = '&';
			}

			href += s + '_fid=' + _fid;

			return href;
		},
		removeFid: function(href) {
			// je v URL _fid?
			var fidStart = href.indexOf('_fid=');

			if (fidStart > -1) {
				// Odstranění _fid parametru
				var fidEnd = href.indexOf('&', fidStart);

				if (fidEnd === -1) {
					href = href.substring(0, fidStart);
				} else {
					href = href.substring(0, fidStart) + href.substring(fidEnd + 1);
				}

				// Ořízneme koncové '?' nebo '&'
				if (href[href.length - 1] === '?' || href[href.length - 1] === '&') {
					href = href.slice(0, -1);
				}

			}

			return href;
		}
	});


})(jQuery);
