;(function($, window, document, undefined) {'use strict';

	/**
	 * Required elements
	 *
	 * $input - the query container
	 *
	 * $results - where the results go
	 *
	 * $pagination - where to put the pagination
	 */

	// history.js
	var History = window.History;
	if (!History.enabled) {
		return false;
	}

	var defaults = {
		$form : $(document),
		$input : undefined,
		$results : undefined,
		$pagination : undefined,
		$loader : undefined,
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

		// form submit
		self.options.$form.submit(function(e) {
			e.preventDefault();

			if (self.options.$input.val().length) {
				History.pushState({
					query : encodeURIComponent(self.options.$input.val()),
					page : 1
				}, null, null);
			}
		});

		// pagination click
		self.options.$pagination.on('click', 'a', function(e) {
			e.preventDefault();

			History.pushState({
				query : encodeURIComponent($(e.target).data('query')),
				page : $(e.target).data('page')
			}, null, null);
		});

		// monitor state changes
		History.Adapter.bind(window, 'statechange', function() {
			var State = History.getState();
			ajaxSearch(State.data.query, State.data.page);
		});

		function ajaxSearch(query, startIndex) {
			// validation
			if (!query.length || isNaN(startIndex)) {
				console.log('nope');
				return false;
			}
			startIndex = startIndex < 1 ? 0 : Math.floor(startIndex) - 1;

			// make sure the last item has at most 100 results
			var num = ((startIndex + self.options.numResults >= 100) ? (100 - startIndex) : self.options.numResults);

			self.options.$loader.show();

			$.ajax({
				url : 'https://www.googleapis.com/customsearch/v1element',
				data : {
					key : self.options.params.key,
					cx : self.options.params.cx,
					q : query,
					num : num,
					start : (startIndex * self.options.numResults)
				},
				dataType : 'jsonp',
				success : function(response) {
					self.options.$loader.hide();
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
							if (i === startIndex) {
								var mid = $("<a/>").addClass("page active").html(i + 1).data({
									'query' : query,
									'page' : i + 1
								});
								mid.appendTo(self.options.$pagination);
							} else {
								$("<a/>").addClass("page").html(i + 1).data({
									'query' : query,
									'page' : i + 1
								}).appendTo(self.options.$pagination);
							}

						}

						// Add active page
						// google sometimes decides to return a different amount of results than first shown
						if (!($(".page.active").length)) {
							var mid = $(".page:last").addClass("active").index();
						}

						// Show only numPages number of page links
						$(".page").each(function(index, value) {
							if (mid - self.options.numPages / 2 < index && index < mid + self.options.numPages / 2 || index + self.options.numPages >= max && index < mid + self.options.numPages / 2 || index - self.options.numPages < 0 && mid - self.options.numPages / 2 < index) {
								$(this).remove();
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
				},
				error : function(xhr, status, errorThrown) {
					self.options.$results.html("<p>" + errorThrown + "<br/>" + status + "<br/>" + xhr.statusText + "</p>");
				}
			});
		}

	};

	$.googleCSE = function(options) {
		// Return the instance
		return new Plugin(options);
	};

})(jQuery, window, document);
