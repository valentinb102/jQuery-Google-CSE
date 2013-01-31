/*
 * Cross-Browser Split 1.1.1
 * Copyright 2007-2012 Steven Levithan <stevenlevithan.com>
 * Available under the MIT License
 * ECMAScript compliant, uniform cross-browser split method
 */
var split;split=split||function(a){var b=String.prototype.split,c=/()??/.exec("")[1]===a,d;d=function(d,e,f){if(Object.prototype.toString.call(e)!=="[object RegExp]"){return b.call(d,e,f)}var g=[],h=(e.ignoreCase?"i":"")+(e.multiline?"m":"")+(e.extended?"x":"")+(e.sticky?"y":""),i=0,e=new RegExp(e.source,h+"g"),j,k,l,m;d+="";if(!c){j=new RegExp("^"+e.source+"$(?!\\s)",h)}f=f===a?-1>>>0:f>>>0;while(k=e.exec(d)){l=k.index+k[0].length;if(l>i){g.push(d.slice(i,k.index));if(!c&&k.length>1){k[0].replace(j,function(){for(var b=1;b<arguments.length-2;b++){if(arguments[b]===a){k[b]=a}}})}if(k.length>1&&k.index<d.length){Array.prototype.push.apply(g,k.slice(1))}m=k[0].length;i=l;if(g.length>=f){break}}if(e.lastIndex===k.index){e.lastIndex++}}if(i===d.length){if(m||!e.test("")){g.push("")}}else{g.push(d.slice(i))}return g.length>f?g.slice(0,f):g};String.prototype.split=function(a,b){return d(this,a,b)};return d}();

/*
 * jQuery hashchange event - v1.3 - 7/21/2010
 * http://benalman.com/projects/jquery-hashchange-plugin/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
(function($,e,b){var c="hashchange",h=document,f,g=$.event.special,i=h.documentMode,d="on"+c in e&&(i===b||i>7);function a(j){j=j||location.href;return"#"+j.replace(/^[^#]*#?(.*)$/,"$1")}$.fn[c]=function(j){return j?this.bind(c,j):this.trigger(c)};$.fn[c].delay=50;g[c]=$.extend(g[c],{setup:function(){if(d){return false}$(f.start)},teardown:function(){if(d){return false}$(f.stop)}});f=(function(){var j={},p,m=a(),k=function(q){return q},l=k,o=k;j.start=function(){p||n()};j.stop=function(){p&&clearTimeout(p);p=b};function n(){var r=a(),q=o(m);if(r!==m){l(m=r,q);$(e).trigger(c)}else{if(q!==m){location.href=location.href.replace(/#.*/,"")+q}}p=setTimeout(n,$.fn[c].delay)}$.browser.msie&&!d&&(function(){var q,r;j.start=function(){if(!q){r=$.fn[c].src;r=r&&r+a();q=$('<iframe tabindex="-1" title="empty"/>').hide().one("load",function(){r||l(a());n()}).attr("src",r||"javascript:0").insertAfter("body")[0].contentWindow;h.onpropertychange=function(){try{if(event.propertyName==="title"){q.document.title=h.title}}catch(s){}}}};j.stop=k;o=function(){return a(q.location.href)};l=function(v,s){var u=q.document,t=$.fn[c].domain;if(v!==s){u.title=h.title;u.open();t&&u.write('<script>document.domain="'+t+'"<\/script>');u.close();q.location.hash=v}}})();return j})()})(jQuery,this);