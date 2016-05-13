/*!
// ==UserScript==
// @name         SteamGifts Tinkerer, Featuring Refined Ostensible Gain
// @namespace    https://github.com/bberenz/sgtfrog
// @description  SteamGifts.com user controlled enchancements
// @include      *://*.steamgifts.com/*
// @version      0.1.0
// @downloadURL  https://raw.githubusercontent.com/bberenz/sgtfrog/master/sgtfrog.user.js
// @updateURL    https://raw.githubusercontent.com/bberenz/sgtfrog/master/sgtfrog.meta.js
// @require      https://code.jquery.com/jquery-1.12.3.min.js
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==
*/

(function() {

var $document = $(document);
if ($(".nav__sits").length) {
  console.warn("[RIBBIT] User is not logged in, cannot run script.");
  throw new Error("No lilypad.");
}


// Variables //
var croak = {
  stickHead:      { value: GM_getValue("stickHead", 1),      query: "Enable sticky header?", opt: ["Yes", "No"] },
  stickSide:      { value: GM_getValue("stickSide", 1),      query: "Enable sticky sidebar?", opt: ["Yes", "No"] },
  stickFoot:      { value: GM_getValue("stickFoot", 0),      query: "Enable sticky footer?", opt: ["Yes", "No"] },
  loadGA:         { value: GM_getValue("loadGA", 1),         query: "Continuously load giveaways?", opt: ["Yes", "No"] },
  loadThread:     { value: GM_getValue("loadThread", 0),     query: "Continuously load discussion threads?", opt: ["Yes", "No"] },
  loadTrade:      { value: GM_getValue("loadTrade", 0),      query: "Continuously load trade threads?", opt: ["Yes", "No"] },
  loadComment:    { value: GM_getValue("loadComment", 0),    query: "Continuously load giveaway comments?", opt: ["Yes", "No"] },
  points:         { value: GM_getValue("points", 0),         query: "Regularly update points value?", opt: ["Frequently", "Infrequently", "No"] },
  featuredGA:     { value: GM_getValue("featuredGA", 2),     query: "Show featured giveaways section?", opt: ["Yes", "Expanded", "No"] },
  hideEntry:      { value: GM_getValue("hideEntry", 1),      query: "Hide entered giveaways?", opt: ["Yes", "No"] },
  oneHide:        { value: GM_getValue("oneHide", 0),        query: "Skip confirmation when adding games to hidden filter?", opt: ["Yes", "No"] },
  winPercent:     { value: GM_getValue("winPercent", 1),     query: "Show giveaway win percentage?", opt: ["Yes", "No"] },
  newBadges:      { value: GM_getValue("newBadges", 1),      query: "Show additional giveaway badges?", opt: ["Yes", "No"] },
  colorBadges:    { value: GM_getValue("colorBadges", 1),    query: "Recolor standard giveaway badges?", opt: ["Yes", "No"] },
//   gridView:       { value: GM_getValue("gridView", 0),       query: "Show giveaways in a grid view?", opt: ["Yes", "No"] },
  sideMine:       { value: GM_getValue("sideMine", 0),       query: "Hide 'My Giveaways' in the sidebar? (Still available under navigation dropdown)", opt: ["Yes", "No"] },
  activeThread:   { value: GM_getValue("activeThread", 2),   query: "Show the 'Active Discussions' section?", opt: ["Yes", "Sidebar", "No"] },
  collapseThread: { value: GM_getValue("collapseThread", 1), query: "Collapse original discussion post after first page?", opt: ["Yes", "No"] },
  collapseTrade:  { value: GM_getValue("collapseTrade", 1),  query: "Collapse original trade post after first page?", opt: ["Yes", "No"] },
  userTools:      { value: GM_getValue("userTools", 1),      query: "Show SGTools links on user pages?", opt: ["Yes", "No"] },
  userDetails:    { value: GM_getValue("userDetails", 1),    query: "Show user details on avatar hover?", opt: ["Yes", "No"] },
  userLists:      { value: GM_getValue("userLists", 1),      query: "Apply label to usernames to indicate white/black list status?", opt: ["Yes", "No"] }
};

// Calls //
var frog = {
  debug: 0, //0 - off
  /************************************************************************LOGGING****/
  logging: {
    debug: function(message) {
      if (frog.debug < -1) {
        console.debug('[SGT DEBUG] ', message);
      }
    },
    info: function(message) {
      if (frog.debug < 0) {
        console.log('[SGT INFO] ', message);
      }
    },
    warn: function(message) {
      if (frog.debug < 0) {
        console.warn('[SGT WARN] ', message);
      }
    }
  },
  /************************************************************************HELPERS****/
  helpers: {
    fromQuery: function(name) {
      var match, urlParams = {},
          params = /([^&=]+)=?([^&]*)/g,
          decode = function(s) { return decodeURIComponent(s.replace(/\+/g, " ")); };

      //bit of hackery using js return value on assignment
      while(match = params.exec(location.search.substring(1))) {
        urlParams[decode(match[1])] = decode(match[2]);
      }
      return urlParams[name];
    },
    //TODO - this can be combined into a single list loader
    wishingWell: {
      cache: null, //avoid reloading list when continuously loading giveaways
      getWishes: function(onComplete) {
        if (frog.helpers.wishingWell.cache === null) {
          frog.helpers.callbackHell("/account/steam/wishlist/search?page=", 1, ".table__column__secondary-link",
                                    function(result) {
            frog.helpers.wishingWell.cache = result;
            onComplete(result);
          });
        } else {
          onComplete(frog.helpers.wishingWell.cache);
        }
      }
    },
    colorLists: {
      cache: {}, //avoid reloading list on continuous load, one entry per color
      getList: function(color, onComplete) {
        if (frog.helpers.colorLists.cache[color] === undefined) {
          frog.helpers.callbackHell("/account/manage/"+ color +"/search?page=", 1, ".table__column__heading",
                                    function(result) {
            frog.helpers.colorLists.cache[color] = result;
            onComplete(result);
          });
        } else {
          onComplete(frog.helpers.colorLists.cache[color]);
        }
      }
    },
    callbackHell: function(url, page, elms, done) {
      $.ajax({
        method: "GET",
        url: url + page
      }).done(function(data) {
        var $data = $(data),
            last = $data.find(".pagination__navigation").children().last().attr('data-page-number');

        var arr = [];
        $.each($data.find(elms), function(i, e) {
          arr.push($(e).attr("href"));
        });

        if (page < last) {
          frog.helpers.callbackHell(url, ++page, elms, function(result) {
            done($.merge(arr, result));
          });
        } else {
          done(arr);
        }
      });
    },
    makeSideLink: function(url, name, count, subtext) {
      var $li = $("<li/>").addClass("sidebar__navigation__item");
      var $a = $("<a/>").addClass("sidebar__navigation__item__link")
        .attr("href", url).appendTo($li);
      
      var $name = $("<div/>").addClass("sidebar__navigation__item__name").html(name).appendTo($a);
      if (subtext !== undefined) {
        $("<div/>").addClass("sidebar__navigation__item__count").html(subtext).appendTo($name);
      }
      $("<div/>").addClass("sidebar__navigation__item__underline").appendTo($a);
      if (count !== undefined) {
        $("<div/>").addClass("sidebar__navigation__item__count").html(count).appendTo($a);
      }

      return $li;
    },
    makeTopLink: function(url, name, desc, icon, color) {
      var $a = $("<a/>").addClass("nav__row").attr("href", url);
      $("<i/>").addClass("icon-"+ color).addClass("fa fa-fw fa-"+ icon).appendTo($a);
      var $summary = $("<div/>").addClass("nav__row__summary").appendTo($a);
      $("<p/>").addClass("nav__row__summary__name").html(name).appendTo($summary);
      $("<p/>").addClass("nav__row__summary__description").html(desc).appendTo($summary);
      
      return $a;
    },
    makeSettingRow: function(number, title, options, sName, curValue) {
      var $row = $("<div/>").addClass("form__row");
      $("<div/>").addClass("form__heading")
        .append($("<div/>").addClass("form__heading__number").html(number +"."))
        .append($("<div/>").addClass("form__heading__text").html(title))
        .appendTo($row);
      
      var $input = $("<div/>").append($("<input/>").attr("type", "hidden")
                                      .attr("name", sName).val(curValue));
      for(var i=0; i<options.length; i++) {
        var val = options.length - 1 - i; //reverse index so we can check falsey values
        var $check = $("<div/>").addClass("form__checkbox").attr("data-checkbox-value", val)
          .append("<i class='form__checkbox__default fa fa-circle-o'></i>")
          .append("<i class='form__checkbox__hover fa fa-circle'></i>")
          .append("<i class='form__checkbox__selected fa fa-check-circle'></i>")
          .append(options[i]);
        
        if (val == curValue) {
          $check.addClass("is-selected");
        } else {
          $check.addClass("is-disabled");
        }
        $input.append($check);
      }
      $("<div/>").addClass("form__row__indent").append($input).appendTo($row);
      
      return $row;
    },
    applyGradients: function(elm, range) {
      elm.css("background-image", "linear-gradient(" + range +")")
        .css("background-image", "-moz-linear-gradient(" + range +")")
        .css("background-image", "-webkit-linear-gradient(" + range +")");
    }
  },
  /************************************************************************SETTINGS***/
  settings: {
    injectMenu: function(isActive) {
      frog.logging.debug("Adding custom navigation");
      
      //inject button in nav
      var $menu = $("<div/>").addClass("nav__button-container");
      $("<a/>").addClass("nav__button nav__buton--is-dropdown").attr("href", "/ąccount/settings/ribbit")
        .html("Sgt Frog").appendTo($menu);
      $("<div/>").addClass("nav__button nav__button--is-dropdown-arrow")
        .html("<i class='fa fa-angle-down'></i>").appendTo($menu);
      var $drop = $("<div/>").addClass("nav__relative-dropdown is-hidden").appendTo($menu);
      $("<div/>").addClass("nav__absolute-dropdown")
        .append(frog.helpers.makeTopLink("/ąccount/settings/ribbit", "Settings", "Adjust tool functionality.", "gears", "grey"))
        .append(frog.helpers.makeTopLink("https://github.com/bberenz/sgtfrog/issues", "Feedback", "Report an issue or request a feature.", "github", "green"))
        .append(frog.helpers.makeTopLink("https://en.wikipedia.org/wiki/Chicken_or_the_egg", "Discussion", "View the SteamGifts discussion thread.", "square-o", "blue"))
        .appendTo($drop);
      
      $(".nav__right-container").find(".nav__button-container:not(.nav__button-container--notification)").last().before($menu);
      
      //inject link on account settings
      var $link = frog.helpers.makeSideLink("/ąccount/settings/ribbit", "Sgt Frog");
      $(".sidebar__navigation").find("a[href='/account/settings/sales']").parent().after($link);
      if (isActive) {
        $link.addClass("is-selected");
        $link.find(".sidebar__navigation__item__name").before("<i class='fa fa-caret-right'></i>");
      }
    },
    injectPage: function() {
      //SG redirects invalid "/account/" links, so we fake the 'a' to blend in
      if (location.pathname === "/%C4%85ccount/settings/ribbit") {
        frog.logging.info("Creating custom settings page");
        
        GM_addStyle("body{ background-image: none; background-color: #95A4C0; }");
        $("html").empty();
        
        //copy an existing page to match layout
        $.ajax({
          method: "GET",
          url: "/account/settings/sales"
        }).done(function(data) {
          //clear copied page out
          var head = data.substring(data.indexOf("<head>")+6, data.indexOf("</head>"))
            .replace(/<script [\s\S]+?<\/script>/g, ""); //remove problematic scripts
          $("<head/>").appendTo("html").append(head)
            .append("<script src='https://cdn.steamgifts.com/js/minified.js'></script>");
          $("<body/>").appendTo("html")
            .append(data.substring(data.indexOf("<body>")+6, data.indexOf("</body>")));
          
          //re-skin
          $(".page__heading__breadcrumbs").children("a").last()
            .html("Sgt Frog").attr("href", "/ąccount/settings/ribbit");
          $(".sidebar__navigation").find("a[href='/account/settings/sales']").parent()
            .removeClass("is-selected").find("i").remove();
          $("title").html("Account - Settings - Ribbit");
          
          //start building our page
          var $form = $(".form__rows");
          $form.empty();
          
          var keys = Object.keys(croak);
          for(var i=0; i<keys.length; i++) {
            var k = keys[i];
            if (croak.hasOwnProperty(k)) {
              $form.append(frog.helpers.makeSettingRow(i+1, croak[k].query, croak[k].opt, k, croak[k].value));
            }
          }
          
          $("<div/>").addClass("form__submit-button")
            .html("<i class='fa fa-arrow-circle-right'></i> Save Changes")
            .on("click", frog.settings.save)
            .appendTo($form);
          
          frog.logging.debug("Creation complete");
          
          //after wiping the page we need to reapply relevant custom settings
          frog.settings.injectMenu(true);
          
          //css hasn't caught up yet
          window.setTimeout(function() {
            frog.fixedElements.header();
            frog.fixedElements.sidebar();
            frog.fixedElements.footer();
            $document.scroll();
          }, 250);
        });
      }
    },
    save: function() {
      var keys = Object.keys(croak);
      for(var i=0; i<keys.length; i++) {
        var k = keys[i];
        if (croak.hasOwnProperty(k)) {
          var $input = $("input[name='"+ k +"']");
          frog.logging.debug("Setting "+ k +" to "+ $input.val());
          GM_setValue(k, +$input.val());
        }
      }
      
      frog.logging.info("Saved new settings");
      //reload page to apply settings
      window.scrollTo(0,0);
      location.reload();
    }
  },
  /***************************************************************************FIXED***/
  fixedElements: {
    header: function() {
      if (!croak.stickHead.value) { return; }
      
      GM_addStyle("header.fixed{ position: fixed; top: 0; width: 100%; z-index: 100; } " +
                  ".left-above{ margin-top: 39px; }");

      $("header").addClass("fixed");

      var $feature = $(".featured__container");
      if ($feature.length > 0) {
        $feature.addClass("left-above");
      } else {
        $(".page__outer-wrap").addClass("left-above");
      }
    },
    sidebar: function() {
      if (!croak.stickSide.value) { return; }
      
      var offset = croak.stickHead.value ? 64 : 25;
      GM_addStyle(".sidebar .fixed{ position: fixed; top: " + offset + "px; }");

      var $sidebar = $(".sidebar"),
          $sidewrap = $("<div/>").addClass("sidebar__outer-wrap"),
          $sidead = $(".sidebar__mpu"); //hide the advertisement on scroll

      //create a wrap to avoid loss of panel width
      $sidebar.children().detach().appendTo($sidewrap);
      $sidewrap.appendTo($sidebar);

      $document.on("scroll", function() {
        var pickup = $(".featured__container").height() + 64;
        if ($document.scrollTop() > (pickup - offset)) {
          $sidebar.children().addClass("fixed");
          $sidead.hide();
        } else {
          $sidebar.children().removeClass("fixed");
          $sidead.show();
        }
      });

      //adjust width to fill
      $sidewrap.css("width", $sidebar.css("min-width"))
        .css("min-width", $sidebar.css("min-width"))
        .css("max-width", $sidebar.css("max-width"));
    },
    footer: function() {
      if (!croak.stickFoot.value) { return; }
      
      GM_addStyle(".footer__outer-wrap.fixed{ position: fixed; bottom: 0; width: 100%; " +
                  "  background-color: #95a4c0; z-index: 100; } " +
                  ".left-below{ margin-bottom: 45px; }");

      $(".footer__outer-wrap").addClass("fixed");
      $(".page__outer-wrap").addClass("left-below");
    }
  },
  /*************************************************************************SIDEBAR***/
  sidebar: {
    removeMyGA: function() {
      if (!croak.sideMine.value) { return; }
      
      var $sidebar = $(".sidebar");
      var $heading = $sidebar.find(".sidebar__heading").last();
      if ($heading.html() === "My Giveaways") {
        $heading.remove();
        $sidebar.find(".sidebar__navigation").last().remove();
      }
    },
    injectSGTools: function() {
      if (!croak.userTools.value || !~location.href.indexOf("/user/")) { return; }

      var userViewed = location.href.split("/")[4];
      frog.logging.debug("Found user: " + userViewed);
      
      var $sideentry = $(".sidebar__navigation").last(),
          $tools = $("<ul/>").append(
          frog.helpers.makeSideLink("https://www.sgtools.info/sent/" + userViewed, "Real Value Sent").find("a").attr("target", "_check"),
          frog.helpers.makeSideLink("https://www.sgtools.info/won/" + userViewed, "Real Value Won").find("a").attr("target", "_check"),
          frog.helpers.makeSideLink("https://www.sgtools.info/nonactivated/" + userViewed, "Non-Activated").find("a").attr("target", "_check"),
          frog.helpers.makeSideLink("https://www.sgtools.info/multiple/" + userViewed, "Multi Wins").find("a").attr("target", "_check")
      );

      $("<h3/>").html("SG Tools").addClass("sidebar__heading").insertAfter($sideentry)
        .after($tools.addClass("sidebar__navigation"));
    }
  },
  /***********************************************************************GIVEAWAYS***/
  giveaways: {
    injectFlags: {
      all: function($doc) {
        if (croak.newBadges.value) {
          frog.giveaways.injectFlags.wishlist($doc);
          frog.giveaways.injectFlags.recent($doc);
        }
        if (croak.colorBadges.value) {
          frog.giveaways.injectFlags.invite();
          frog.giveaways.injectFlags.region();
          frog.giveaways.injectFlags.whitelist();
          frog.giveaways.injectFlags.group();
        }
      },
      wishlist: function($doc) {
        var $gives = $(".giveaway__row-outer-wrap");
        
        if ($gives.length > 0) {
          GM_addStyle(".giveaway__column--wish{ background-image: linear-gradient(#FFFACF 0%, #FFF176 100%); " +
                    "  background-image: -moz-linear-gradient(#FFFACF 0%, #FFF176 100%); " +
                    "  background-image: -webkit-linear-gradient(#FFFACF 0%, #FFF176 100%); " +
                    "  border-color: #EDCCBE #F0C2AF #DEAB95 #F2C4B1 !important; color: #F57F17; " +
                    "  box-shadow: none !important; }");
          

          var $badge = $("<div/>").addClass("giveaway__column--wish").attr("title", "Wishlist");
          $("<i/>").addClass("fa fa-fw fa-star").appendTo($badge);
          
          //load wishlist to know what gets badged
          frog.helpers.wishingWell.getWishes(function(wishes) {
            frog.logging.debug("Applying badges for "+ wishes.length +" wishes");
            
            $.each(wishes, function(i, wish) {
              $doc.find("a[href='"+ wish +"']").parent().parent()
                .find(".giveaway__column--width-fill").after($badge.clone());
            });
          });
        }
      },
      recent: function($doc) {
        GM_addStyle(".giveaway__column--new{ " +
                      "  background-image: linear-gradient(#FFE0B2 0%, #FFB74D 100%); " +
                      "  background-image: -moz-linear-gradient(#FFE0B2 0%, #FFB74D 100%); " +
                      "  background-image: -webkit-linear-gradient(#FFE0B2 0%, #FFB74D 100%); " +
                      "  border-color: #FFCCBC #FFAB91 #FF8A65 #FFAB91 !important; color: #BF360C; " +
                      "  box-shadow: none !important; }");

        var $badge = $("<div/>").addClass("giveaway__column--new").attr("title", "New");
          $("<i/>").addClass("fa fa-fw fa-fire").appendTo($badge);
        
        $.each($doc.find(".giveaway__column--width-fill").find("span"), function(i, created) {
          var $created = $(created);
          var timing = $created.html();
          if (~timing.indexOf("second") || ~timing.indexOf("minute")) {
           $created.parent().parent().find(".giveaway__column--width-fill").after($badge.clone());
          }
        });
      },
      invite: function() {
        GM_addStyle(".giveaway__column--invite-only{ background-image: linear-gradient(#FFCDD2 0%, #F49B95 100%); " +
                      "  background-image: -moz-linear-gradient(#FFCDD2 0%, #F49B95 100%); " +
                      "  background-image: -webkit-linear-gradient(#FFCDD2 0%, #F49B95 100%); " +
                      "  border-color: #ef9a9a #e57373 #ef5350 #e57373 !important; color: #950000; }");
      },
      region: function() {
        GM_addStyle(".giveaway__column--region-restricted{ background-image: linear-gradient(#D7CCC8 0%, #A18F89 100%); " +
                      "  background-image: -moz-linear-gradient(#D7CCC8 0%, #A18F89 100%); " +
                      "  background-image: -webkit-linear-gradient(#D7CCC8 0%, #A18F89 100%); " +
                      "  border-color: #BDBDBD #9E9E9E #757575 #9E9E9E !important; color: #5D4037; }");
      },
      whitelist: function() {
        GM_addStyle(".giveaway__column--whitelist{ background-image: linear-gradient(#FFFFFF 0%, #E0E0E0 100%); " +
                    "  background-image: -moz-linear-gradient(#FFFFFF 0%, #E0E0E0 100%); " +
                    "  background-image: -webkit-linear-gradient(#FFFFFF 0%, #E0E0E0 100%); " +
                    "  color: #D81B60; }");
      },
      group: function() {
        GM_addStyle(".giveaway__column--group{ background-image: linear-gradient(#DCEDC8 0%, #AED581 100%); " +
                    "  background-image: -moz-linear-gradient(#DCEDC8 0%, #AED581 100%); " +
                    "  background-image: -webkit-linear-gradient(#DCEDC8 0%, #AED581 100%); ");
      }
    },
    injectChance: function($doc) {
      if (!croak.winPercent.value) { return; }
      
      var chtml = function(entries, copies) {
        return "<i class='fa fa-bar-chart'></i> <span>" +
            ((1 / entries) * copies * 100).toFixed(3) + "% chance</span>";
      };

      //inject on listing pages
      $.each($doc.find(".giveaway__row-outer-wrap"), function(i, ga) {
        var $ga = $(ga);
        var entries = $ga.find(".fa-tag").next().html().split(/\s/)[0].replace(/,/g, '');
        var state = $ga.find(".giveaway__columns").children().first().find("span").html().substr(0, 5);
        if (state !== 'Ended' && !$ga.find(".giveaway__row-inner-wrap").hasClass("is-faded")) {
          entries++;
        }

        var copies = 1;
        var copyHTML = $ga.find(".giveaway__heading__thin").first().html();
        if (copyHTML && ~copyHTML.indexOf("Copies")) {
          copies = +(copyHTML.replace(/([\(\),\s]|Copies)/g, ""));
        }

        var $chance = $("<div/>").html(chtml(entries, copies));
        $ga.find(".giveaway__columns").children().first().after($chance);
      });

      //inject on GA page
      $.each($doc.find(".featured__columns"), function(i, fga) {
        var $count = $doc.find(".live__entry-count");
        if (!$count || $count.length === 0) {
          return; //we won't give stats for main page featured
        }
        var entries = $count.html().replace(/,/g, '');
        var $entry = $doc.find(".sidebar__entry-insert");
        if ($entry && $entry.length > 0 && !$entry.hasClass("is-hidden")) {
          entries++;
        }

        var copies = 1;
        var copyHTML = $doc.find(".featured__heading__small").first().html();
        if (~copyHTML.indexOf("Copies")) {
          copies = +(copyHTML.replace(/([\(\),\s]|Copies)/g, ""));
        }

        var $chance = $("<div/>").addClass("featured__column").html(chtml(entries, copies));
        $(fga).children().first().after($chance);
      });
    },
    injectSearch: function($doc) {
      $.each($doc.find(".giveaway__heading"), function(i, heading) {
        var $heading = $(heading);
        $("<a/>").addClass("giveaway__icon").html("<i class='fa fa-search-plus'></i>").attr("title", "Search for more like this")
          .attr("href", "/giveaways/search?q=" + $heading.find(".giveaway__heading__name").html()).appendTo($heading);
      });
    },
    hideEntered: function($doc) {
      if (!croak.hideEntry.value || ~location.href.indexOf("/giveaways/won")) { return; } //exclude own won list
      $doc.find(".is-faded").parent(".giveaway__row-outer-wrap").remove();
    },
    easyHide: function($doc) {
      if (!croak.oneHide.value) { return; }
      
      $doc.find("[data-popup='popup--hide-games']").on("click", function(ev) {
        window.setTimeout(function() {
          $(".js__submit-hide-games").click();
        }, 100);
      });
    },
    gridForm: function($doc) {
//       if (!croak.gridView.value) { return; }
      
      //TODO
    },
    bulkFeatured: {
      find: function() {
        switch(croak.featuredGA.value) {
          case 0: frog.giveaways.bulkFeatured.hidden(); break;
          case 1: frog.giveaways.bulkFeatured.expanded(); break;
          default: frog.giveaways.bulkFeatured.injectCollapsable(); break;
        }
      },
      //NOTE: needs delayed from page load
      injectCollapsable: function() {
        //two or less giveaways is already expanded
        if ($(".pinned-giveaways__inner-wrap").children().length < 3) { return; }
        
        //remove expanded bottom margin for use on our collapse button
        GM_addStyle(".pinned-giveaways__inner-wrap:not(.pinned-giveaways__inner-wrap--minimized){ " +
                    "  border-radius: 4px 4px 0 0; margin-bottom: 0; }");
        
        //remove their click event in favor of our own
        $(".pinned-giveaways__button").off("click");
        
        $(".pinned-giveaways__button").addClass("pinned-giveaways__button-expand");
        var $collapse = $("<div/>").hide()
          .addClass("pinned-giveaways__button").addClass("pinned-giveaways__button-collapse")
          .html("<i class='fa fa-angle-up'></i>").appendTo(".pinned-giveaways__outer-wrap");
        
        $collapse.on("click", function(ev) {
          $(".pinned-giveaways__inner-wrap").addClass("pinned-giveaways__inner-wrap--minimized");
          $(".pinned-giveaways__button-expand").show();
          $(".pinned-giveaways__button-collapse").hide();
          ev.preventDefault();
        });
        $(".pinned-giveaways__button-expand").on("click", function() {
          $(".pinned-giveaways__inner-wrap").removeClass("pinned-giveaways__inner-wrap--minimized");
          $(".pinned-giveaways__button-expand").hide();
          $(".pinned-giveaways__button-collapse").show();
        });
      },
      hidden: function() {
        $(".pinned-giveaways__outer-wrap").remove();
      },
      expanded: function() {
        frog.giveaways.bulkFeatured.injectCollapsable();
        $(".pinned-giveaways__inner-wrap").removeClass("pinned-giveaways__inner-wrap--minimized");
        $(".pinned-giveaways__button-expand").hide();
        $(".pinned-giveaways__button-collapse").show();
      }
    },
    activeThreads: {
      find: function() {
        switch(croak.activeThread.value) {
          case 0: frog.giveaways.activeThreads.hidden(); break;
          case 1: frog.giveaways.activeThreads.sidebar(); break;
          default: break;
        }
      },
      hidden: function() {
        $(".widget-container.widget-container--margin-top").children().remove();
      },
      sidebar: function() {
        var $sideentry = $(".sidebar__navigation").last();
        
        //no 'Active Discussions' section on page
        if ($(".widget-container.widget-container--margin-top").length === 0) { return; }
        
        var $list = $("<ul/>").addClass("sidebar__navigation");
        $.each($(".table__row-inner-wrap"), function(i, thread) {
          var $thread = $(thread);
          var $origin = $thread.find(".table__column--width-fill").first();
          var $topic = $origin.find("h3").find("a");
          
          $list.append(frog.helpers.makeSideLink($topic.attr("href"), $topic.html(),
                                                 $thread.find(".table__column--width-small").find("a").html(),
                                                 "by "+ $origin.find("a").last().html()));
        });
        
        $("<h3/>").addClass("sidebar__heading").html("Active Discussions")
          .insertAfter($sideentry).after($list);
        
        frog.giveaways.activeThreads.hidden();
      }
    }
  },
  /*************************************************************************THREADS***/
  threads: {
    //NOTE: needs delayed from page load
    collapseDiscussion: function() {
      if (!croak.collapseThread.value || !~location.href.indexOf("/discussion/")) { return; }

      var page = frog.helpers.fromQuery("page");
      if (page && page > 1) {
        $(".comment__collapse-button").first().trigger("click");
      }
    },
    collapseTrade: function() {
      if (!croak.collapseTrade.value || !~location.href.indexOf("/trade/")) { return; }

      var page = frog.helpers.fromQuery("page");
      if (page && page > 1) {
        $(".comment__collapse-button").first().trigger("click");
      }
    }
  },
  /*************************************************************************LOADING***/
  loading: {
    everyNew: function($doc) {
      frog.giveaways.injectFlags.wishlist($doc);
      frog.giveaways.injectFlags.recent($doc);
      frog.giveaways.injectChance($doc);
      frog.giveaways.injectSearch($doc);
      frog.giveaways.hideEntered($doc);
      frog.giveaways.easyHide($doc);
      frog.giveaways.gridForm($doc);
      frog.users.profileHover($doc);
      frog.users.listIndication($doc);
    },
    giveaways: function() {
      //avoid stepping on other loading pages
      if (!croak.loadGA.value
          || ~location.href.indexOf("/trade")
          || ~location.href.indexOf("/discussion")
          || ~location.href.indexOf("/giveaway/")
          || ~location.href.indexOf("/account/")
          || ~location.href.indexOf("/settings/ribbit")) {
        return;
      }
      
      //FIXME - hide giveaway broken on appended pages
      
      var page = frog.helpers.fromQuery("page");
      if (page == undefined) { page = 1; }
      frog.loading.addSpinner($(".pagination"));
      $(".widget-container").find(".page__heading").first().after($(".pagination").detach());

      var loading = false;
      $document.on("scroll", function() {
        var nearEdge = ($document.scrollTop() + $(window).height()) / $document.height();
        if (nearEdge >= .90 && !loading) {
          loading = true;
          page++;

          var loc = location.href;
          if (~loc.indexOf("?")) {
            loc = loc.replace(/page=\d+?&?/, ""); //keep other params
          } else {
            if (location.pathname.length == 1) { loc += "/giveaways"; }
            loc += "/search?";
          }

          frog.logging.info("Loading next page: "+ page);
          frog.logging.debug(loc +"&page="+ page);

          $.ajax({
            method: 'GET',
            url: loc + "&page=" + page
          }).done(function(data) {
            var $data = $(data);
            frog.loading.everyNew($data);

            $data.find(".pinned-giveaways__outer-wrap").remove(); //avoid appending pinned every load
            var $nextGiveaways = $data.find(".giveaway__row-outer-wrap").detach();

            if ($nextGiveaways.length === 0) {
              frog.logging.info("No more giveaways");
              frog.loading.removeSpinner();
              return;
            }
            
            var $paging = $data.find(".pagination");
            $paging.find(".pagination__navigation").html("Page " + page);
            
            $(".giveaway__row-outer-wrap").last().parent()
              .append($paging).append($nextGiveaways);
            
            loading = false;
          });
        }
      });
    },
    trade: function() {
      if (!croak.loadTrade.value || !~location.href.indexOf("/trade/")) { return; }
      frog.loading.comments();
    },
    threads: function() {
      if (!croak.loadThread.value || !~location.href.indexOf("/discussion/")) { return; }
      frog.loading.comments();
    },
    thanks: function() {
      if (!croak.loadComment.value || !~location.href.indexOf("/giveaway/")) { return; }
      frog.loading.comments();
    },
    comments: function() {
      var page = frog.helpers.fromQuery("page");
      if (page == undefined) { page = 1; }
      var lastPage = $(".pagination__navigation").children().last().attr('data-page-number');
      frog.loading.addSpinner($(".pagination"));
      $(".page__heading").last().after($(".pagination").detach());

      var loading = false;
      $document.on("scroll", function() {
        var nearEdge = ($document.scrollTop() + $(window).height()) / $document.height();
        if (nearEdge >= 0.90 && !loading) {
          loading = true;

          if (page++ < lastPage) {
            var loc = location.href;
            if (~loc.indexOf("?")) {
              loc = loc.replace(/page=\d+?&?/, ""); //keep other params
            } else {
              loc += "/search?";
            }
            
            frog.logging.info("Loading next page: "+ page +"/"+ lastPage);
            frog.logging.debug(loc +"&page="+ page);
            
            $.ajax({
              method: 'GET',
              url: loc +"&page="+ page
            }).done(function(data) {
              var $data = $(data);
              frog.users.profileHover($data);
              frog.users.listIndication($data);
              
              var $paging = $data.find(".pagination");
              $paging.find(".pagination__navigation").html("Page " + page);
              
              $(".comments").last().append($paging)
                .append($data.find(".comments").last().children().detach());
              
              loading = false;
            });
          } else {
            frog.loading.removeSpinner();
          }
        }
      });
    },
    addSpinner: function($afterElm) {
      GM_addStyle(".pagination__loader{ text-align: center; } " +
                  ".pagination__loader .fa{ font-size: 2em; } ");
      
      $afterElm.after($("<div/>").addClass("pagination__loader").html("<i class='fa fa-spin fa-circle-o-notch'></i>"));
    },
    removeSpinner: function() {
      $(".pagination__loader").remove();
    },
    points: function() {
      if (!croak.points.value) { return; }
      var freq = (30 / (croak.points.value)) * 1000;
      
      window.setInterval(function() {
        frog.logging.debug("Pulling new point value");
        
        //load a small page to pull current points from
        $.ajax({
          method: "GET",
          url: "/about/brand-assets"
        }).done(function(data) {
          $(".nav__points").html($(data).find(".nav__points").html());
        });
      }, freq);
    }
  },
  /***************************************************************************USERS***/
  users: {
    profileHover: function($doc) {
      if (!croak.userDetails.value) { return; }
      
      var img = 64, pad = 5;
      var width = 360, height = 160;
      GM_addStyle(".user-panel__outer-wrap{ position: absolute; width: "+ width +"px; height: "+ height +"px; color: #21262f; } " +
                  ".user-panel__inner-wrap{ position: relative; width:100%; height: 100%; } " +
                  ".user-panel__image{ position: absolute; top: 0; left: 0; width: "+ img +"px; height: "+ img +"px; " +
                  "  border-radius: 5px; } " +
                  ".user-panel__corner{ position: absolute; top: "+ (img+pad) +"px; bottom: 0; left: 0; right: "+ (width-(img+pad)) +"px; " +
                  "  padding: 5px; background-color: #465670; border-radius: 3px 0 0 3px; } " +
                  ".user-panel__corner .user-panel__icon-load{ font-size: 5em; color: rgba(255,255,255,0.6); } " +
                  ".user-panel__corner .sidebar__shortcut-inner-wrap{ display: block; } " +
                  ".user-panel__corner .sidebar__shortcut__whitelist{ margin: 0 0 5px 0; }" +
                  ".user-panel__stats{ position: absolute; top: 0; bottom: 0; left: "+ (img+pad) +"px; right: 0; " +
                  "  padding: 5px; background-color: #465670; border-radius: 3px 3px 3px 0; } " +
                  ".user-panel__stats .featured__heading__medium{ font-size: 16px; } " +
                  ".user-panel__stats .featured__heading{ margin-bottom: 0; } " +
                  ".user-panel__stats .featured__table__column{ margin: 0; } ");
      
      var $box = $("<div/>").addClass("global__image-outer-wrap user-panel__outer-wrap").appendTo($("body")).hide();
      var $userbox = $("<div/>").addClass("user-panel__inner-wrap").appendTo($box);
      
      var $userimage = $("<a/>").append($("<div/>").addClass("user-panel__image")).appendTo($userbox),
          $loader = $("<i/>").addClass("user-panel__icon-load fa fa-spin fa-circle-o-notch"),
          $usercorner = $("<div/>").addClass("user-panel__corner").appendTo($userbox),
          $userstats = $("<div/>").addClass("user-panel__stats").appendTo($userbox);
      
      var hoverTime, lastLoad = null;
      $doc.find(".global__image-outer-wrap--avatar-small").not(".global__image-outer-wrap--missing-image").children()
        .hover(function(ev) {
        var $this = $(this);
        
        if (hoverTime) {
          window.clearTimeout(hoverTime);
          hoverTime = null;
        }
        hoverTime = window.setTimeout(function() {
          var $parent = $this.parent();
          
          //reset box for new load (unless same user)
          if ($parent.attr("href") != lastLoad) {
            $userimage.attr("href", $parent.attr("href"));
            $userimage.find("div").css("background-image", $this.css("background-image"));
            frog.helpers.applyGradients($userstats.html(""), "#515763 0%, #2f3540 100%");
            frog.helpers.applyGradients($usercorner.html($loader), "#424751 0%, #2f3540 100%");
          
            $.ajax({
              method: "GET",
              url: $parent.attr("href")
            }).done(function(data) {
              var $data = $(data);
              lastLoad = $parent.attr("href");

              var $suspend = $data.find(".sidebar__suspension-time"),
                  $username = $("<div/>").addClass("featured__table__row__left").html($data.find(".featured__heading"));
              if ($suspend.length) {
                $username.find(".featured__heading__medium").css("color", "#000").attr("title", "Suspension length: "+ $suspend.html());
              }

              var base = $data.find(".featured__outer-wrap--user").css("background-color"),
                  accent = $data.find(".featured__table__row__right").find("a").css("color"),
                  $buttons = $data.find(".sidebar__shortcut-inner-wrap");
              
              $buttons.find(".js__submit-form-inner").remove();
              $buttons.find("a").remove();
              $usercorner.html($buttons);
              frog.helpers.applyGradients($usercorner, accent +" -120%, "+ base +" 65%");

              $userstats.append($data.find(".featured__table__column").last()
                                .prepend($("<div/>").addClass("featured__table__row").css("padding-top", "0").append($username)
                                         .append($data.find(".featured__table__column").first().find(".featured__table__row__right")[2])));
              frog.helpers.applyGradients($userstats, accent +" -20%, "+ base +" 80%");
            });
          }

          var edge = 0;
          if ((ev.target.offsetLeft + width) > window.innerWidth) {
            edge = ev.target.offsetWidth - width;
          }

          $box.show()
            .css("left", ev.target.offsetLeft - 1 - parseInt($parent.css("padding-left")) + edge)
            .css("top", ev.target.offsetTop - 1 - parseInt($parent.css("padding-top")));
        }, 250);
      }, function() {
        window.clearTimeout(hoverTime);
      });
      $(".user-panel__outer-wrap").on("mouseleave", function() {
        $box.hide();
      });
    },
    listIndication: function($doc) {
      if (!croak.userLists.value || ~location.pathname.indexOf('/user/')) {
        return; //not active on user pages for obvious reasons
      }
      
      //using !important selector on 'color' to override the :not(.comment__username--op) selector color
      GM_addStyle("a.user__whitened{ background-color: #FFF; color: #2A2 !important; border-radius: 4px; padding: 2px 4px; text-shadow: none; } " +
                  "a.user__blackened{ background-color: #000; color: #C55 !important; border-radius: 4px; padding: 2px 4px; text-shadow: none; } ");
      
      frog.helpers.colorLists.getList("whitelist", function(whitened) {
        frog.logging.debug("Applying white to "+ whitened.length +" users");
        
        $.each(whitened, function(i, white) {
          $doc.find("a[href='"+ white +"']").not(".global__image-outer-wrap").addClass("user__whitened")
            .attr("title", "Whitelisted user").prepend("<i class='fa fa-star-o'></i> ");
        });
      });
      
      frog.helpers.colorLists.getList("blacklist", function(blackened) {
        frog.logging.debug("Applying black to "+ blackened.length +" users");
        
        $.each(blackened, function(i, black) {
          $doc.find("a[href='"+ black +"']").not(".global__image-outer-wrap").addClass("user__blackened")
            .attr("title", "Blacklisted user").prepend("<i class='fa fa-ban'></i> ");
        });
      });
    }
  },
  /***********************************************************************POINTLESS***/
  pointless: {
    kacode: function() {
      GM_addStyle("*{ direction: rtl; } ");
      $(".fa").addClass("fa-spin");
    }
  }
};


// SETUP //
frog.settings.injectPage();
frog.settings.injectMenu();

frog.fixedElements.header();
frog.fixedElements.sidebar();
frog.fixedElements.footer();

frog.loading.trade();
frog.loading.threads();
frog.loading.thanks();
frog.loading.giveaways();
frog.loading.points();

frog.giveaways.injectFlags.all($document);
frog.giveaways.injectChance($document);
frog.giveaways.injectSearch($document);
frog.giveaways.hideEntered($document);
frog.giveaways.easyHide($document);
frog.giveaways.gridForm();
frog.sidebar.removeMyGA();

frog.giveaways.activeThreads.find();

frog.sidebar.injectSGTools();
frog.users.profileHover($document);
frog.users.listIndication($document);


window.setTimeout(function() {
  $document.scroll();

  frog.giveaways.bulkFeatured.find();
  frog.threads.collapseDiscussion();
  frog.threads.collapseTrade();
}, 100);


var kc = [38, 38, 40, 40, 37, 39, 37, 39, 98, 97], kcAt = 0;
$document.on("keypress", function(event) {
  if (event.keyCode == kc[kcAt] || event.which == kc[kcAt]) {
    if (++kcAt == kc.length) {
      console.log('[RIBBIT] - Command received - Iniitiating sequence..');
      frog.pointless.kacode();
    }
  } else {
    kcAt = 0;
  }
});

console.log("[RIBBIT] - SGT Mode Activated!");

})();
