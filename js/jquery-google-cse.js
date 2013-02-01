;(function($, window, document, undefined) {'use strict';

	/**
	 * Required elements
	 *
	 * $form - the form to check for a value, could be input or form
	 *
	 * $results - where the results go
	 *
	 * $pagination - where to put the pagination
	 */

	var defaults = {
		params : {
			key : "AIzaSyCVAXiUzRYsML1Pv6RwSG1gunmMikTzQqY",
			cx : "017262666028140812660:hb_khvgblte",
		},
		numResults : 10,
		numPages : 5
	};

	function Plugin(options) {
		this.options = $.extend({}, defaults, options);
		this._defaults = defaults;
		this.init();
	}


	Plugin.prototype.init = function() {
		var self = this;

		// initial bind and check for hash changes
		$(window).hashchange(hashLoad);
		hashLoad();

		// attach listener to form
		self.options.$form.submit(function(e) {
			e.preventDefault();

			if (self.options.$form.val().length) {
				location.hash = encodeURIComponent(self.options.$form.val()) + "#1";
			}
		});

		function hashLoad() {
			if (location.hash) {
				var hashArr = split(location.hash, /[#]/);
				if (hashArr.length > 2) {
					ajaxSearch(hashArr[1], hashArr[2]);
				}
			} else {
				self.options.$results.html("");
				self.options.$pagination.html("");
			}
		}

		function ajaxSearch(query, startIndex) {
			// validation
			if (!query.length || isNaN(startIndex)) {
				return false;
			}
			startIndex = startIndex < 1 ? 0 : Math.floor(startIndex) - 1;

			// make sure the last item has at most 100 results
			var num = startIndex + self.options.numResults >= 100 ? 100 - startIndex : self.options.numResults;

			$("#loader").show();

			// form request and send
			$.getJSON("https://www.googleapis.com/customsearch/v1element?key=" + self.options.params.key + "&cx=" + self.options.params.cx + "&num=" + num + "&start=" + (startIndex * self.options.numResults) + "&q=" + query + "&callback=?", function success(response) {
				$("#loader").hide();
				self.options.$results.html("");
				self.options.$pagination.html("");

				// Search time and results found
				// using in is the correct method for feature detection
				if ("cursor" in response) {
					self.options.$results.append("<p>Search time: " + response.cursor.searchResultTime + " seconds.<br/>" + "Results found: " + response.cursor.resultCount + "</p>");
				}

				// Spelling suggestions
				if ("spelling" in response) {
					self.options.$results.append("<p>Did you mean <i><a href='#" + response.spelling.correctedQuery + "#1'>" + response.spelling.correctedQuery + "</a></i>?</p>");
				}

				// The results
				if ("results" in response) {
					for (var i = 0; i < response.results.length; i++) {
						var item = response.results[i];
						self.options.$results.append("<div class='result'><div class='container'><a class='resultLink' href='" + item.unescapedUrl + "'>" + item.title + "</a><p class='desc'>" + item.content + "</p><p class='textLink'>" + item.formattedUrl + "</p></div></div>");

						// self property is a more common location for finding an image
						// Binding load before setting attrib seems to correctly fire load
						// fadeto does not remove the image unlike hide
						if ("richSnippet" in item && "cseThumbnail" in item.richSnippet) {
							$(".result").eq(i).prepend($("<img/>").fadeTo(0, 0).load(function() {
								$(this).fadeTo("med", 1);
							}).attr("src", item.richSnippet.cseThumbnail.src));
						}
					}
				}

				// Paginate if more than numResults
				// Google doesnt allow more than 100 results
				if ("cursor" in response && response.cursor.estimatedResultCount > self.options.numResults) {
					var max = response.cursor.estimatedResultCount > 100 ? 100 / self.options.numResults : response.cursor.estimatedResultCount / self.options.numResults;

					for (var i = 0; i < max; i++) {
						$("<a/>").addClass("page").html(i + 1).attr("href", "#" + query + "#" + (i + 1)).appendTo(self.options.$pagination);
					}

					// Add active page
					// google sometimes decides to return a different amount of results than first shown
					// self behaves the same way as google search
					if ($(".page[href='" + location.hash + "']").length)
						var mid = $(".page[href='" + location.hash + "']").addClass("active").index();
					else
						var mid = $(".page:last").addClass("active").index();

					// Show only numPages number of page links
					$(".page").each(function(index, value) {
						if (!(mid - self.options.numPages / 2 < index && index < mid + self.options.numPages / 2 || index + self.options.numPages >= max && index < mid + self.options.numPages / 2 || index - self.options.numPages < 0 && mid - self.options.numPages / 2 < index)) {
							$(self).remove();
						}
					});
				}

				// Add prev / next / first / last links
				if ("cursor" in response && response.cursor.estimatedResultCount > self.options.numResults * $(".page").length && self.options.numResults * $(".page").length < 100 && response.cursor.estimatedResultCount > self.options.numResults) {
					mid++;
					$("<a/>").addClass("navLink").html("&lt;").attr("href", "#" + query + "#" + ((mid - 1 < 1) ? 1 : mid - 1)).prependTo(self.options.$pagination);
					$("<a/>").addClass("navLink").html("&gt;").attr("href", "#" + query + "#" + ((mid + 1 > max) ? max : mid + 1)).appendTo(self.options.$pagination);
					$("<a/>").addClass("navLink").html("&lt;&lt;").attr("href", "#" + query + "#1").prependTo(self.options.$pagination);
					$("<a/>").addClass("navLink").html("&gt;&gt;").attr("href", "#" + query + "#" + max).appendTo(self.options.$pagination);
				}

				// "valid" errors
				if ("error" in response) {
					self.options.$results.html("<p>Error Code: " + response.error.code + "<br/>" + response.error.message + "</p>");
				}
			}).error(function(xhr, status, errorThrown) {
				self.options.$results.html("<p>" + errorThrown + "<br/>" + status + "<br/>" + xhr.statusText + "</p>");
			});
		}

	};

	$.googleCSE = function(options) {
		// Return the instance
		return new Plugin(options);
	};

})(jQuery, window, document);
