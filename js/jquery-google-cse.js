$(window).load(function () {
	// generic google cse key
	var key = "AIzaSyCVAXiUzRYsML1Pv6RwSG1gunmMikTzQqY";
	var cx = "017262666028140812660:hb_khvgblte";
	var startIndex = 0;
	// Number of results per page
	// max is 20
	var numResults = 10;
	// Number of page links to show
	var numPages = 5;
	
	// binds plugin hashchange to window
	$(this).hashchange(hashLoad);
	
	// first page load may already have a hash value
	hashLoad();
	
	$("#searchform").submit(function (e) {
		e.preventDefault();
		if($("#query").val().length) {
			location.hash = encodeURIComponent($("#query").val()) + "#1";
		}
	});
	
	// runs on hash changes
	function hashLoad() {
		if (location.hash) {
			var hashArr = split(location.hash, /[#]/);
			if (hashArr.length > 2) {
				ajaxSearch(hashArr[1], hashArr[2]);
			}
		}
		else
		$("#content, #paginate").html("");
	}
	
	// runs search and parses results
	function ajaxSearch(query, startIndex) {
		// validation
		if (!query.length || isNaN(startIndex)) {
			return false;
		}
		startIndex = startIndex < 1 ? 0 : Math.floor(startIndex) - 1;
		
		// make sure the last item has at most 100 results
		var num = startIndex + numResults >= 100 ? 100 - startIndex : numResults;
		
		$(".loaderImg").show();
		
		// form request and send
		$.getJSON("https://www.googleapis.com/customsearch/v1element?key=" + key + "&cx=" + cx + "&num=" + num + "&start=" + (startIndex*numResults) + "&q=" + query + "&callback=?", 
		function success(response) {
			$(".loaderImg").hide();
			$("#content, #paginate").html("");

			// Search time and results found
			// using in is the correct method for feature detection
			if ("cursor" in response) {
				$("#content").append("<p>Search time: " + response.cursor.searchResultTime + " seconds.<br/>" + "Results found: " + response.cursor.resultCount + "</p>");
			}
			
			// Spelling suggestions
			if ("spelling" in response) {
				$("#content").append("<p>Did you mean <i><a href='#" + response.spelling.correctedQuery + "#1'>" + response.spelling.correctedQuery + "</a></i>?</p>");
			}
			
			// The results
			if ("results" in response) {
				for (var i = 0; i < response.results.length; i++) {
					var item = response.results[i];
					$("#content").append("<div class='result'><div class='container'><a class='resultLink' href='" + item.unescapedUrl + "'>" + item.title + "</a><p class='desc'>" + item.content + "</p><p class='textLink'>" + item.formattedUrl + "</p></div></div>");
					
					// This property is a more common location for finding an image
					// Binding load before setting attrib seems to correctly fire load
					// fadeto does not remove the image unlike hide 
					if ("richSnippet" in item && "cseThumbnail" in item.richSnippet) {
						$(".result").eq(i).prepend($("<img/>").fadeTo(0,0).load(function() {
							$(this).fadeTo("med", 1);
						}).attr("src", item.richSnippet.cseThumbnail.src));
					}
				}
			}
			
			// Paginate if more than numResults
			// Google doesnt allow more than 100 results
			if ("cursor" in response && response.cursor.estimatedResultCount > numResults) {
				var max = response.cursor.estimatedResultCount > 100 ? 100 / numResults : response.cursor.estimatedResultCount / numResults;
				
				for (var i = 0; i < max; i++) {
					$("<a/>").addClass("page").html(i+1).attr("href", "#"+query+"#"+(i+1)).appendTo($("#paginate"));
				}
				
				// Add active page
				// google sometimes decides to return a different amount of results than first shown
				// this behaves the same way as google's cse
				if ($(".page[href='" + location.hash + "']").length)
				var mid = $(".page[href='" + location.hash + "']").addClass("active").index();
				else
				var mid = $(".page:last").addClass("active").index();

				// Show only numPages number of page links
				$(".page").each(function (index, value) {
					if (!(mid - numPages/2 < index && index < mid + numPages/2 || 
								index + numPages >= max && index < mid + numPages/2 ||
								index - numPages < 0 && mid - numPages/2 < index)) {
						$(this).remove();
					}
				});
			}
			
			// Add prev / next / first / last links
			if ("cursor" in response && response.cursor.estimatedResultCount > numResults * $(".page").length && numResults * $(".page").length < 100 && response.cursor.estimatedResultCount > numResults) {
				mid++;
				$("<a/>").addClass("navLink").html("&lt;").attr("href", "#"+query+"#"+((mid-1 < 1) ? 1 : mid-1)).prependTo($("#paginate"));
				$("<a/>").addClass("navLink").html("&gt;").attr("href", "#"+query+"#"+((mid+1 > max) ? max : mid+1)).appendTo($("#paginate"));
				$("<a/>").addClass("navLink").html("&lt;&lt;").attr("href", "#"+query+"#1").prependTo($("#paginate"));
				$("<a/>").addClass("navLink").html("&gt;&gt;").attr("href", "#"+query+"#"+max).appendTo($("#paginate"));
			}
			
			// "valid" errors
			if ("error" in response) {
				$("#content").html("<p>Error Code: "+response.error.code+"<br/>"+response.error.message+"</p>");
			}
		})
		.error(function(xhr, status, errorThrown) {
			$("#content").html("<p>"+errorThrown+"<br/>"+status+"<br/>"+xhr.statusText+"</p>");
		});
	}
});