(function($, undefined) {

	/**
	 * @author Jiří Pudil
	 *
	 */
	$.nette.ext('googleRemarketing', {
		complete: function () {
			if ((typeof google_tag_params !== "undefined" && google_tag_params !== null)
				&& (typeof google_conversion_id_internal !== "undefined" && google_conversion_id_internal !== null)
			) {
				if (google_tag_params.ecomm_pagetype === 'category') {
					var parameters = 'ecomm_prodid=' + google_tag_params.ecomm_prodid.join(',')
						+ ';ecomm_pagetype=category' + ';ecomm_totalvalue=' + google_tag_params.ecomm_totalvalue;

					var url = '//googleads.g.doubleclick.net/pagead/viewthroughconversion/' + google_conversion_id_internal + '/?value=0&guid=ON&script=0&data='
						+ encodeURIComponent(parameters);

					var $remarketingCodeAjax = $('#remarketing-code-ajax');

					var img = document.createElement("img");
					img.id = 'remarketing-code-ajax';
					img.onload = function() { return; };
					img.src = url;

					// The code has already been inserted
					if ($remarketingCodeAjax.length) {
						$remarketingCodeAjax.remove();
					}

					// Insert the new code to the page
					$('body').append(img);
				}
			}
		}
	});

});
