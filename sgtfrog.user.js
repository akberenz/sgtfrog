/*!
// ==UserScript==
// @name         SteamGifts Tinkerer, Featuring Refined Ostensible Gain
// @namespace    https://github.com/bberenz/sgtfrog
// @description  SteamGifts.com user controlled enchancements
// @icon         https://raw.githubusercontent.com/bberenz/sgtfrog/master/keroro.gif
// @include      *://*.steamgifts.com/*
// @version      0.1.1
// @downloadURL  https://raw.githubusercontent.com/bberenz/sgtfrog/master/sgtfrog.user.js
// @updateURL    https://raw.githubusercontent.com/bberenz/sgtfrog/master/sgtfrog.meta.js
// @require      https://code.jquery.com/jquery-1.12.3.min.js
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==
*/
(function(){var e=$(document);if($(".nav__sits").length){console.warn("[RIBBIT] User is not logged in, cannot run script.");throw new Error("No lilypad.")}var c={stickHead:{value:GM_getValue("stickHead",1),query:"Enable sticky header?",opt:["Yes","No"]},stickSide:{value:GM_getValue("stickSide",1),query:"Enable sticky sidebar?",opt:["Yes","No"]},stickFoot:{value:GM_getValue("stickFoot",0),query:"Enable sticky footer?",opt:["Yes","No"]},loadGA:{value:GM_getValue("loadGA",1),query:"Continuously load giveaways?",opt:["Yes","No"]},loadThread:{value:GM_getValue("loadThread",0),query:"Continuously load discussion threads?",opt:["Yes","No"]},loadTrade:{value:GM_getValue("loadTrade",0),query:"Continuously load trade threads?",opt:["Yes","No"]},loadComment:{value:GM_getValue("loadComment",0),query:"Continuously load giveaway comments?",opt:["Yes","No"]},points:{value:GM_getValue("points",0),query:"Regularly update points value?",opt:["Frequently","Infrequently","No"]},featuredGA:{value:GM_getValue("featuredGA",2),query:"Show featured giveaways section?",opt:["Yes","Expanded","No"]},hideEntry:{value:GM_getValue("hideEntry",1),query:"Hide entered giveaways?",opt:["Yes","No"]},oneHide:{value:GM_getValue("oneHide",0),query:"Skip confirmation when adding games to hidden filter?",opt:["Yes","No"]},winPercent:{value:GM_getValue("winPercent",1),query:"Show giveaway win percentage?",opt:["Yes","No"]},newBadges:{value:GM_getValue("newBadges",1),query:"Show additional giveaway badges?",opt:["Yes","No"]},colorBadges:{value:GM_getValue("colorBadges",1),query:"Recolor standard giveaway badges?",opt:["Yes","No"]},sideMine:{value:GM_getValue("sideMine",0),query:"Hide 'My Giveaways' in the sidebar? (Still available under navigation dropdown)",opt:["Yes","No"]},activeThread:{value:GM_getValue("activeThread",2),query:"Show the 'Active Discussions' section?",opt:["Yes","Sidebar","No"]},collapseThread:{value:GM_getValue("collapseThread",1),query:"Collapse original discussion post after first page?",opt:["Yes","No"]},collapseTrade:{value:GM_getValue("collapseTrade",1),query:"Collapse original trade post after first page?",opt:["Yes","No"]},userTools:{value:GM_getValue("userTools",1),query:"Show SGTools links on user pages?",opt:["Yes","No"]},userDetails:{value:GM_getValue("userDetails",1),query:"Show user details on avatar hover?",opt:["Yes","No"]},userLists:{value:GM_getValue("userLists",1),query:"Apply label to usernames to indicate white/black list status?",opt:["Yes","No"]}};
var d={debug:0,logging:{debug:function(f){if(d.debug<-1){console.debug("[SGT DEBUG] ",f)}},info:function(f){if(d.debug<0){console.log("[SGT INFO] ",f)}},warn:function(f){if(d.debug<0){console.warn("[SGT WARN] ",f)}}},helpers:{fromQuery:function(h){var g,f={},j=/([^&=]+)=?([^&]*)/g,i=function(k){return decodeURIComponent(k.replace(/\+/g," "))};while(g=j.exec(location.search.substring(1))){f[i(g[1])]=i(g[2])}return f[h]},wishingWell:{cache:null,getWishes:function(f){if(d.helpers.wishingWell.cache===null){d.helpers.callbackHell("/account/steam/wishlist/search?page=",1,".table__column__secondary-link",function(g){d.helpers.wishingWell.cache=g;f(g)})}else{f(d.helpers.wishingWell.cache)}}},colorLists:{cache:{},getList:function(f,g){if(d.helpers.colorLists.cache[f]===undefined){d.helpers.callbackHell("/account/manage/"+f+"/search?page=",1,".table__column__heading",function(h){d.helpers.colorLists.cache[f]=h;g(h)})}else{g(d.helpers.colorLists.cache[f])}}},callbackHell:function(g,i,h,f){$.ajax({method:"GET",url:g+i}).done(function(m){var k=$(m),l=k.find(".pagination__navigation").children().last().attr("data-page-number");var j=[];$.each(k.find(h),function(n,o){j.push($(o).attr("href"))});if(i<l){d.helpers.callbackHell(g,++i,h,function(n){f($.merge(j,n))})}else{f(j)}})},makeSideLink:function(g,f,i,h){var l=$("<li/>").addClass("sidebar__navigation__item");var j=$("<a/>").addClass("sidebar__navigation__item__link").attr("href",g).appendTo(l);var k=$("<div/>").addClass("sidebar__navigation__item__name").html(f).appendTo(j);if(h!==undefined){$("<div/>").addClass("sidebar__navigation__item__count").html(h).appendTo(k)}$("<div/>").addClass("sidebar__navigation__item__underline").appendTo(j);if(i!==undefined){$("<div/>").addClass("sidebar__navigation__item__count").html(i).appendTo(j)}return l},makeTopLink:function(i,h,l,j,g){var k=$("<a/>").addClass("nav__row").attr("href",i);$("<i/>").addClass("icon-"+g).addClass("fa fa-fw fa-"+j).appendTo(k);var f=$("<div/>").addClass("nav__row__summary").appendTo(k);$("<p/>").addClass("nav__row__summary__name").html(h).appendTo(f);$("<p/>").addClass("nav__row__summary__description").html(l).appendTo(f);return k},makeSettingRow:function(j,o,p,k,h){var m=$("<div/>").addClass("form__row");$("<div/>").addClass("form__heading").append($("<div/>").addClass("form__heading__number").html(j+".")).append($("<div/>").addClass("form__heading__text").html(o)).appendTo(m);var n=$("<div/>").append($("<input/>").attr("type","hidden").attr("name",k).val(h));for(var l=0;l<p.length;l++){var g=p.length-1-l;var f=$("<div/>").addClass("form__checkbox").attr("data-checkbox-value",g).append("<i class='form__checkbox__default fa fa-circle-o'></i>").append("<i class='form__checkbox__hover fa fa-circle'></i>").append("<i class='form__checkbox__selected fa fa-check-circle'></i>").append(p[l]);if(g==h){f.addClass("is-selected")}else{f.addClass("is-disabled")}n.append(f)}$("<div/>").addClass("form__row__indent").append(n).appendTo(m);return m},applyGradients:function(g,f){g.css("background-image","linear-gradient("+f+")").css("background-image","-moz-linear-gradient("+f+")").css("background-image","-webkit-linear-gradient("+f+")")
}},settings:{injectMenu:function(h){d.logging.debug("Adding custom navigation");var g=$("<div/>").addClass("nav__button-container");$("<a/>").addClass("nav__button nav__buton--is-dropdown").attr("href","/ąccount/settings/ribbit").html("Sgt Frog").appendTo(g);$("<div/>").addClass("nav__button nav__button--is-dropdown-arrow").html("<i class='fa fa-angle-down'></i>").appendTo(g);var i=$("<div/>").addClass("nav__relative-dropdown is-hidden").appendTo(g);$("<div/>").addClass("nav__absolute-dropdown").append(d.helpers.makeTopLink("/ąccount/settings/ribbit","Settings","Adjust tool functionality.","gears","grey")).append(d.helpers.makeTopLink("https://github.com/bberenz/sgtfrog/issues","Feedback","Report an issue or request a feature.","github","green")).append(d.helpers.makeTopLink("https://en.wikipedia.org/wiki/Chicken_or_the_egg","Discussion","View the SteamGifts discussion thread.","square-o","blue")).appendTo(i);$(".nav__right-container").find(".nav__button-container:not(.nav__button-container--notification)").last().before(g);var f=d.helpers.makeSideLink("/ąccount/settings/ribbit","Sgt Frog");$(".sidebar__navigation").find("a[href='/account/settings/sales']").parent().after(f);if(h){f.addClass("is-selected");f.find(".sidebar__navigation__item__name").before("<i class='fa fa-caret-right'></i>")}},injectPage:function(){if(location.pathname==="/%C4%85ccount/settings/ribbit"){d.logging.info("Creating custom settings page");GM_addStyle("body{ background-image: none; background-color: #95A4C0; }");$("html").empty();$.ajax({method:"GET",url:"/account/settings/sales"}).done(function(m){var j=m.substring(m.indexOf("<head>")+6,m.indexOf("</head>")).replace(/<script [\s\S]+?<\/script>/g,"");$("<head/>").appendTo("html").append(j).append("<script src='https://cdn.steamgifts.com/js/minified.js'><\/script>");$("<body/>").appendTo("html").append(m.substring(m.indexOf("<body>")+6,m.indexOf("</body>")));$(".page__heading__breadcrumbs").children("a").last().html("Sgt Frog").attr("href","/ąccount/settings/ribbit");$(".sidebar__navigation").find("a[href='/account/settings/sales']").parent().removeClass("is-selected").find("i").remove();$("title").html("Account - Settings - Ribbit");var g=$(".form__rows");g.empty();var l=Object.keys(c);for(var h=0;h<l.length;h++){var f=l[h];if(c.hasOwnProperty(f)){g.append(d.helpers.makeSettingRow(h+1,c[f].query,c[f].opt,f,c[f].value))}}$("<div/>").addClass("form__submit-button").html("<i class='fa fa-arrow-circle-right'></i> Save Changes").on("click",d.settings.save).appendTo(g);d.logging.debug("Creation complete");d.settings.injectMenu(true);window.setTimeout(function(){d.fixedElements.header();d.fixedElements.sidebar();d.fixedElements.footer();e.scroll()},250)})}},save:function(){var h=Object.keys(c);for(var g=0;g<h.length;g++){var f=h[g];if(c.hasOwnProperty(f)){var j=$("input[name='"+f+"']");d.logging.debug("Setting "+f+" to "+j.val());GM_setValue(f,+j.val())}}d.logging.info("Saved new settings");window.scrollTo(0,0);location.reload()
}},fixedElements:{header:function(){if(!c.stickHead.value){return}GM_addStyle("header.fixed{ position: fixed; top: 0; width: 100%; z-index: 100; } .left-above{ margin-top: 39px; }");$("header").addClass("fixed");var f=$(".featured__container");if(f.length>0){f.addClass("left-above")}else{$(".page__outer-wrap").addClass("left-above")}},sidebar:function(){if(!c.stickSide.value){return}var i=c.stickHead.value?64:25;GM_addStyle(".sidebar .fixed{ position: fixed; top: "+i+"px; }");var g=$(".sidebar"),f=$("<div/>").addClass("sidebar__outer-wrap"),h=$(".sidebar__mpu");g.children().detach().appendTo(f);f.appendTo(g);e.on("scroll",function(){var j=$(".featured__container").height()+64;if(e.scrollTop()>(j-i)){g.children().addClass("fixed");h.hide()}else{g.children().removeClass("fixed");h.show()}});f.css("width",g.css("min-width")).css("min-width",g.css("min-width")).css("max-width",g.css("max-width"))},footer:function(){if(!c.stickFoot.value){return}GM_addStyle(".footer__outer-wrap.fixed{ position: fixed; bottom: 0; width: 100%;   background-color: #95a4c0; z-index: 100; } .left-below{ margin-bottom: 45px; }");$(".footer__outer-wrap").addClass("fixed");$(".page__outer-wrap").addClass("left-below")}},sidebar:{removeMyGA:function(){if(!c.sideMine.value){return}var g=$(".sidebar");var f=g.find(".sidebar__heading").last();if(f.html()==="My Giveaways"){f.remove();g.find(".sidebar__navigation").last().remove()}},injectSGTools:function(){if(!c.userTools.value||!~location.href.indexOf("/user/")){return}var g=location.href.split("/")[4];d.logging.debug("Found user: "+g);var f=$(".sidebar__navigation").last(),h=$("<ul/>").append(d.helpers.makeSideLink("https://www.sgtools.info/sent/"+g,"Real Value Sent").find("a").attr("target","_check"),d.helpers.makeSideLink("https://www.sgtools.info/won/"+g,"Real Value Won").find("a").attr("target","_check"),d.helpers.makeSideLink("https://www.sgtools.info/nonactivated/"+g,"Non-Activated").find("a").attr("target","_check"),d.helpers.makeSideLink("https://www.sgtools.info/multiple/"+g,"Multi Wins").find("a").attr("target","_check"));$("<h3/>").html("SG Tools").addClass("sidebar__heading").insertAfter(f).after(h.addClass("sidebar__navigation"))}},giveaways:{injectFlags:{all:function(f){if(c.newBadges.value){d.giveaways.injectFlags.wishlist(f);d.giveaways.injectFlags.recent(f)}if(c.colorBadges.value){d.giveaways.injectFlags.invite();d.giveaways.injectFlags.region();d.giveaways.injectFlags.whitelist();d.giveaways.injectFlags.group()}},wishlist:function(h){var f=$(".giveaway__row-outer-wrap");if(f.length>0){GM_addStyle(".giveaway__column--wish{ background-image: linear-gradient(#FFFACF 0%, #FFF176 100%);   background-image: -moz-linear-gradient(#FFFACF 0%, #FFF176 100%);   background-image: -webkit-linear-gradient(#FFFACF 0%, #FFF176 100%);   border-color: #EDCCBE #F0C2AF #DEAB95 #F2C4B1 !important; color: #F57F17;   box-shadow: none !important; }");var g=$("<div/>").addClass("giveaway__column--wish").attr("title","Wishlist");$("<i/>").addClass("fa fa-fw fa-star").appendTo(g);
d.helpers.wishingWell.getWishes(function(i){d.logging.debug("Applying badges for "+i.length+" wishes");$.each(i,function(j,k){h.find("a[href='"+k+"']").parent().parent().find(".giveaway__column--width-fill").after(g.clone())})})}},recent:function(g){GM_addStyle(".giveaway__column--new{   background-image: linear-gradient(#FFE0B2 0%, #FFB74D 100%);   background-image: -moz-linear-gradient(#FFE0B2 0%, #FFB74D 100%);   background-image: -webkit-linear-gradient(#FFE0B2 0%, #FFB74D 100%);   border-color: #FFCCBC #FFAB91 #FF8A65 #FFAB91 !important; color: #BF360C;   box-shadow: none !important; }");var f=$("<div/>").addClass("giveaway__column--new").attr("title","New");$("<i/>").addClass("fa fa-fw fa-fire").appendTo(f);$.each(g.find(".giveaway__column--width-fill").find("span"),function(h,l){var k=$(l);var j=k.html();if(~j.indexOf("second")||~j.indexOf("minute")){k.parent().parent().find(".giveaway__column--width-fill").after(f.clone())}})},invite:function(){GM_addStyle(".giveaway__column--invite-only{ background-image: linear-gradient(#FFCDD2 0%, #F49B95 100%);   background-image: -moz-linear-gradient(#FFCDD2 0%, #F49B95 100%);   background-image: -webkit-linear-gradient(#FFCDD2 0%, #F49B95 100%);   border-color: #ef9a9a #e57373 #ef5350 #e57373 !important; color: #950000; }")},region:function(){GM_addStyle(".giveaway__column--region-restricted{ background-image: linear-gradient(#D7CCC8 0%, #A18F89 100%);   background-image: -moz-linear-gradient(#D7CCC8 0%, #A18F89 100%);   background-image: -webkit-linear-gradient(#D7CCC8 0%, #A18F89 100%);   border-color: #BDBDBD #9E9E9E #757575 #9E9E9E !important; color: #5D4037; }")},whitelist:function(){GM_addStyle(".giveaway__column--whitelist{ background-image: linear-gradient(#FFFFFF 0%, #E0E0E0 100%);   background-image: -moz-linear-gradient(#FFFFFF 0%, #E0E0E0 100%);   background-image: -webkit-linear-gradient(#FFFFFF 0%, #E0E0E0 100%);   color: #D81B60; }")},group:function(){GM_addStyle(".giveaway__column--group{ background-image: linear-gradient(#DCEDC8 0%, #AED581 100%);   background-image: -moz-linear-gradient(#DCEDC8 0%, #AED581 100%);   background-image: -webkit-linear-gradient(#DCEDC8 0%, #AED581 100%); ")}},injectChance:function(g){if(!c.winPercent.value){return}var f=function(h,i){return"<i class='fa fa-bar-chart'></i> <span>"+((1/h)*i*100).toFixed(3)+"% chance</span>"};$.each(g.find(".giveaway__row-outer-wrap"),function(j,o){var m=$(o);var h=m.find(".fa-tag").next().html().split(/\s/)[0].replace(/,/g,"");var l=m.find(".giveaway__columns").children().first().find("span").html().substr(0,5);if(l!=="Ended"&&!m.find(".giveaway__row-inner-wrap").hasClass("is-faded")){h++}var n=1;var p=m.find(".giveaway__heading__thin").first().html();if(p&&~p.indexOf("Copies")){n=+(p.replace(/([\(\),\s]|Copies)/g,""))}var k=$("<div/>").html(f(h,n));m.find(".giveaway__columns").children().first().after(k)});$.each(g.find(".featured__columns"),function(l,n){var k=g.find(".live__entry-count");if(!k||k.length===0){return}var h=k.html().replace(/,/g,"");
var j=g.find(".sidebar__entry-insert");if(j&&j.length>0&&!j.hasClass("is-hidden")){h++}var o=1;var p=g.find(".featured__heading__small").first().html();if(~p.indexOf("Copies")){o=+(p.replace(/([\(\),\s]|Copies)/g,""))}var m=$("<div/>").addClass("featured__column").html(f(h,o));$(n).children().first().after(m)})},injectSearch:function(f){$.each(f.find(".giveaway__heading"),function(g,j){var h=$(j);$("<a/>").addClass("giveaway__icon").html("<i class='fa fa-search-plus'></i>").attr("title","Search for more like this").attr("href","/giveaways/search?q="+h.find(".giveaway__heading__name").html()).appendTo(h)})},hideEntered:function(f){if(!c.hideEntry.value||~location.href.indexOf("/giveaways/won")){return}f.find(".is-faded").parent(".giveaway__row-outer-wrap").remove()},easyHide:function(f){if(!c.oneHide.value){return}f.find("[data-popup='popup--hide-games']").on("click",function(g){window.setTimeout(function(){$(".js__submit-hide-games").click()},100)})},gridForm:function(f){},bulkFeatured:{find:function(){switch(c.featuredGA.value){case 0:d.giveaways.bulkFeatured.hidden();break;case 1:d.giveaways.bulkFeatured.expanded();break;default:d.giveaways.bulkFeatured.injectCollapsable();break}},injectCollapsable:function(){if($(".pinned-giveaways__inner-wrap").children().length<3){return}GM_addStyle(".pinned-giveaways__inner-wrap:not(.pinned-giveaways__inner-wrap--minimized){   border-radius: 4px 4px 0 0; margin-bottom: 0; }");$(".pinned-giveaways__button").off("click");$(".pinned-giveaways__button").addClass("pinned-giveaways__button-expand");var f=$("<div/>").hide().addClass("pinned-giveaways__button").addClass("pinned-giveaways__button-collapse").html("<i class='fa fa-angle-up'></i>").appendTo(".pinned-giveaways__outer-wrap");f.on("click",function(g){$(".pinned-giveaways__inner-wrap").addClass("pinned-giveaways__inner-wrap--minimized");$(".pinned-giveaways__button-expand").show();$(".pinned-giveaways__button-collapse").hide();g.preventDefault()});$(".pinned-giveaways__button-expand").on("click",function(){$(".pinned-giveaways__inner-wrap").removeClass("pinned-giveaways__inner-wrap--minimized");$(".pinned-giveaways__button-expand").hide();$(".pinned-giveaways__button-collapse").show()})},hidden:function(){$(".pinned-giveaways__outer-wrap").remove()},expanded:function(){d.giveaways.bulkFeatured.injectCollapsable();$(".pinned-giveaways__inner-wrap").removeClass("pinned-giveaways__inner-wrap--minimized");$(".pinned-giveaways__button-expand").hide();$(".pinned-giveaways__button-collapse").show()}},activeThreads:{find:function(){switch(c.activeThread.value){case 0:d.giveaways.activeThreads.hidden();break;case 1:d.giveaways.activeThreads.sidebar();break;default:break}},hidden:function(){$(".widget-container.widget-container--margin-top").children().remove()},sidebar:function(){var f=$(".sidebar__navigation").last();if($(".widget-container.widget-container--margin-top").length===0){return}var g=$("<ul/>").addClass("sidebar__navigation");$.each($(".table__row-inner-wrap"),function(l,j){var k=$(j);
var m=k.find(".table__column--width-fill").first();var h=m.find("h3").find("a");g.append(d.helpers.makeSideLink(h.attr("href"),h.html(),k.find(".table__column--width-small").find("a").html(),"by "+m.find("a").last().html()))});$("<h3/>").addClass("sidebar__heading").html("Active Discussions").insertAfter(f).after(g);d.giveaways.activeThreads.hidden()}}},threads:{collapseDiscussion:function(){if(!c.collapseThread.value||!~location.href.indexOf("/discussion/")){return}var f=d.helpers.fromQuery("page");if(f&&f>1){$(".comment__collapse-button").first().trigger("click")}},collapseTrade:function(){if(!c.collapseTrade.value||!~location.href.indexOf("/trade/")){return}var f=d.helpers.fromQuery("page");if(f&&f>1){$(".comment__collapse-button").first().trigger("click")}}},loading:{everyNew:function(f){d.giveaways.injectFlags.wishlist(f);d.giveaways.injectFlags.recent(f);d.giveaways.injectChance(f);d.giveaways.injectSearch(f);d.giveaways.hideEntered(f);d.giveaways.easyHide(f);d.giveaways.gridForm(f);d.users.profileHover(f);d.users.listIndication(f)},giveaways:function(){if(!c.loadGA.value||~location.href.indexOf("/trade")||~location.href.indexOf("/discussion")||~location.href.indexOf("/giveaway/")||~location.href.indexOf("/account/")||~location.href.indexOf("/settings/ribbit")){return}var f=d.helpers.fromQuery("page");if(f==undefined){f=1}d.loading.addSpinner($(".pagination"));$(".widget-container").find(".page__heading").first().after($(".pagination").detach());var g=false;e.on("scroll",function(){var h=(e.scrollTop()+$(window).height())/e.height();if(h>=0.9&&!g){g=true;f++;var i=location.href;if(~i.indexOf("?")){i=i.replace(/page=\d+?&?/,"")}else{if(location.pathname.length==1){i+="/giveaways"}i+="/search?"}d.logging.info("Loading next page: "+f);d.logging.debug(i+"&page="+f);$.ajax({method:"GET",url:i+"&page="+f}).done(function(m){var j=$(m);d.loading.everyNew(j);j.find(".pinned-giveaways__outer-wrap").remove();var l=j.find(".giveaway__row-outer-wrap").detach();if(l.length===0){d.logging.info("No more giveaways");d.loading.removeSpinner();return}var k=j.find(".pagination");k.find(".pagination__navigation").html("Page "+f);$(".giveaway__row-outer-wrap").last().parent().append(k).append(l);g=false})}})},trade:function(){if(!c.loadTrade.value||!~location.href.indexOf("/trade/")){return}d.loading.comments()},threads:function(){if(!c.loadThread.value||!~location.href.indexOf("/discussion/")){return}d.loading.comments()},thanks:function(){if(!c.loadComment.value||!~location.href.indexOf("/giveaway/")){return}d.loading.comments()},comments:function(){var g=d.helpers.fromQuery("page");if(g==undefined){g=1}var f=$(".pagination__navigation").children().last().attr("data-page-number");d.loading.addSpinner($(".pagination"));$(".page__heading").last().after($(".pagination").detach());var h=false;e.on("scroll",function(){var i=(e.scrollTop()+$(window).height())/e.height();if(i>=0.9&&!h){h=true;if(g++<f){var j=location.href;if(~j.indexOf("?")){j=j.replace(/page=\d+?&?/,"")
}else{j+="/search?"}d.logging.info("Loading next page: "+g+"/"+f);d.logging.debug(j+"&page="+g);$.ajax({method:"GET",url:j+"&page="+g}).done(function(m){var k=$(m);d.users.profileHover(k);d.users.listIndication(k);var l=k.find(".pagination");l.find(".pagination__navigation").html("Page "+g);$(".comments").last().append(l).append(k.find(".comments").last().children().detach());h=false})}else{d.loading.removeSpinner()}}})},addSpinner:function(f){GM_addStyle(".pagination__loader{ text-align: center; } .pagination__loader .fa{ font-size: 2em; } ");f.after($("<div/>").addClass("pagination__loader").html("<i class='fa fa-spin fa-circle-o-notch'></i>"))},removeSpinner:function(){$(".pagination__loader").remove()},points:function(){if(!c.points.value){return}var f=(30/(c.points.value))*1000;window.setInterval(function(){d.logging.debug("Pulling new point value");$.ajax({method:"GET",url:"/about/brand-assets"}).done(function(g){$(".nav__points").html($(g).find(".nav__points").html())})},f)}},users:{profileHover:function(k){if(!c.userDetails.value){return}var l=64,h=5;var g=360,r=160;GM_addStyle(".user-panel__outer-wrap{ position: absolute; width: "+g+"px; height: "+r+"px; color: #21262f; } .user-panel__inner-wrap{ position: relative; width:100%; height: 100%; } .user-panel__image{ position: absolute; top: 0; left: 0; width: "+l+"px; height: "+l+"px;   border-radius: 5px; } .user-panel__corner{ position: absolute; top: "+(l+h)+"px; bottom: 0; left: 0; right: "+(g-(l+h))+"px;   padding: 5px; background-color: #465670; border-radius: 3px 0 0 3px; } .user-panel__corner .user-panel__icon-load{ font-size: 5em; color: rgba(255,255,255,0.6); } .user-panel__corner .sidebar__shortcut-inner-wrap{ display: block; } .user-panel__corner .sidebar__shortcut__whitelist{ margin: 0 0 5px 0; }.user-panel__stats{ position: absolute; top: 0; bottom: 0; left: "+(l+h)+"px; right: 0;   padding: 5px; background-color: #465670; border-radius: 3px 3px 3px 0; } .user-panel__stats .featured__heading__medium{ font-size: 16px; } .user-panel__stats .featured__heading{ margin-bottom: 0; } .user-panel__stats .featured__table__column{ margin: 0; } ");var f=$("<div/>").addClass("global__image-outer-wrap user-panel__outer-wrap").appendTo($("body")).hide();var i=$("<div/>").addClass("user-panel__inner-wrap").appendTo(f);var o=$("<a/>").append($("<div/>").addClass("user-panel__image")).appendTo(i),j=$("<i/>").addClass("user-panel__icon-load fa fa-spin fa-circle-o-notch"),p=$("<div/>").addClass("user-panel__corner").appendTo(i),q=$("<div/>").addClass("user-panel__stats").appendTo(i);var n,m=null;k.find(".global__image-outer-wrap--avatar-small").not(".global__image-outer-wrap--missing-image").children().hover(function(s){var t=$(this);if(n){window.clearTimeout(n);n=null}n=window.setTimeout(function(){var v=t.parent();if(v.attr("href")!=m){o.attr("href",v.attr("href"));o.find("div").css("background-image",t.css("background-image"));d.helpers.applyGradients(q.html(""),"#515763 0%, #2f3540 100%");d.helpers.applyGradients(p.html(j),"#424751 0%, #2f3540 100%");
$.ajax({method:"GET",url:v.attr("href")}).done(function(B){var z=$(B);m=v.attr("href");var x=z.find(".sidebar__suspension-time"),C=$("<div/>").addClass("featured__table__row__left").html(z.find(".featured__heading"));if(x.length){C.find(".featured__heading__medium").css("color","#000").attr("title","Suspension length: "+x.html())}var A=z.find(".featured__outer-wrap--user").css("background-color"),w=z.find(".featured__table__row__right").find("a").css("color"),y=z.find(".sidebar__shortcut-inner-wrap");y.find(".js__submit-form-inner").remove();y.find("a").remove();p.html(y);d.helpers.applyGradients(p,w+" -120%, "+A+" 65%");q.append(z.find(".featured__table__column").last().prepend($("<div/>").addClass("featured__table__row").css("padding-top","0").append(C).append(z.find(".featured__table__column").first().find(".featured__table__row__right")[2])));d.helpers.applyGradients(q,w+" -20%, "+A+" 80%")})}var u=0;if((s.target.offsetLeft+g)>window.innerWidth){u=s.target.offsetWidth-g}f.show().css("left",s.target.offsetLeft-1-parseInt(v.css("padding-left"))+u).css("top",s.target.offsetTop-1-parseInt(v.css("padding-top")))},250)},function(){window.clearTimeout(n)});$(".user-panel__outer-wrap").on("mouseleave",function(){f.hide()})},listIndication:function(f){if(!c.userLists.value||~location.pathname.indexOf("/user/")){return}GM_addStyle("a.user__whitened{ background-color: #FFF; color: #2A2 !important; border-radius: 4px; padding: 2px 4px; text-shadow: none; } a.user__blackened{ background-color: #000; color: #C55 !important; border-radius: 4px; padding: 2px 4px; text-shadow: none; } ");d.helpers.colorLists.getList("whitelist",function(g){d.logging.debug("Applying white to "+g.length+" users");$.each(g,function(j,h){f.find("a[href='"+h+"']").not(".global__image-outer-wrap").addClass("user__whitened").attr("title","Whitelisted user").prepend("<i class='fa fa-star-o'></i> ")})});d.helpers.colorLists.getList("blacklist",function(g){d.logging.debug("Applying black to "+g.length+" users");$.each(g,function(h,j){f.find("a[href='"+j+"']").not(".global__image-outer-wrap").addClass("user__blackened").attr("title","Blacklisted user").prepend("<i class='fa fa-ban'></i> ")})})}},pointless:{kacode:function(){GM_addStyle("*{ direction: rtl; } ");$(".fa").addClass("fa-spin")}}};d.settings.injectPage();d.settings.injectMenu();d.fixedElements.header();d.fixedElements.sidebar();d.fixedElements.footer();d.loading.trade();d.loading.threads();d.loading.thanks();d.loading.giveaways();d.loading.points();d.giveaways.injectFlags.all(e);d.giveaways.injectChance(e);d.giveaways.injectSearch(e);d.giveaways.hideEntered(e);d.giveaways.easyHide(e);d.giveaways.gridForm();d.sidebar.removeMyGA();d.giveaways.activeThreads.find();d.sidebar.injectSGTools();d.users.profileHover(e);d.users.listIndication(e);window.setTimeout(function(){e.scroll();d.giveaways.bulkFeatured.find();d.threads.collapseDiscussion();d.threads.collapseTrade()},100);var b=[38,38,40,40,37,39,37,39,98,97],a=0;e.on("keypress",function(f){if(f.keyCode==b[a]||f.which==b[a]){if(++a==b.length){console.log("[RIBBIT] - Command received - Iniitiating sequence..");
d.pointless.kacode()}}else{a=0}});console.log("[RIBBIT] - SGT Mode Activated!")})();