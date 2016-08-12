/*!
// ==UserScript==
// @name         SteamGifts Tinkerer, Featuring Refined Ostensible Gain
// @namespace    https://github.com/bberenz/sgtfrog
// @description  SteamGifts.com user controlled enchancements
// @icon         https://raw.githubusercontent.com/bberenz/sgtfrog/master/keroro.gif
// @include      *://*.steamgifts.com/*
// @version      0.4.0.2
// @downloadURL  https://raw.githubusercontent.com/bberenz/sgtfrog/master/sgtfrog.user.js
// @updateURL    https://raw.githubusercontent.com/bberenz/sgtfrog/master/sgtfrog.meta.js
// @require      https://code.jquery.com/jquery-1.12.3.min.js
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// ==/UserScript==
*/

(function() {

var $document = $(document);
if ($(".nav__sits").length) {
  console.warn("[RIBBIT] User is not logged in, cannot run script.");
  throw new Error("No lilypad.");
}

//convert previous setting values (remove after a couple version when everyone is likely to have changed over)
(function() {
  if (GM_getValue("stickHead") === undefined) { return; } //aready converted
  console.log("ONE-TIME - converting old settings values");
  
  var fixed = GM_getValue("stickHead", 1)*4 | GM_getValue("stickSide", 1)*2 | GM_getValue("stickFoot", 0)*1;
  GM_setValue("fixedElms", fixed);
  GM_deleteValue("stickHead"); GM_deleteValue("stickSide"); GM_deleteValue("stickFoot");
  
  var load = GM_getValue("loadGA", 1)*8 | GM_getValue("loadThread", 0)*4 | GM_getValue("loadTrade", 0)*2 | GM_getValue("loadComment", 0)*1;
  GM_setValue("loadLists", load);
  GM_deleteValue("loadGA"); GM_deleteValue("loadThread"); GM_deleteValue("loadTrade"); GM_deleteValue("loadComment");
  
  var collapse = GM_getValue("collapseThread", 1)*2 | GM_getValue("collapseTrade", 1)*1;
  GM_setValue("collapsed", collapse);
  GM_deleteValue("collapseThread"); GM_deleteValue("collapseTrade");
  
  var pnt = GM_getValue("points", 0);
  if (pnt) { GM_setValue("pointInvl", (30 / (croak.points.value))); }
  GM_deleteValue("points");
  
  GM_setValue("colorBadge", GM_getValue("colorBadges", 1));
  GM_deleteValue("colorBadges");
  GM_setValue("userDetail", GM_getValue("userDetails", 1));
  GM_deleteValue("userDetails");
  GM_setValue("activeTalk", GM_getValue("activeThread", 2));
  GM_deleteValue("activeThread");
})();


// Variables //
var croak = {
  fixedElms:  { value: GM_getValue("fixedElms",  6), set: { type: "square", opt: ["Header", "Sidebar", "Footer"] }, query: "Set fixed elements:" },
  loadLists:  { value: GM_getValue("loadLists", 15), set: { type: "square", opt: ["Giveaways", "Discussions", "Trades", "Comments"] }, query: "Continuously load:" },
  gridView:   { value: GM_getValue("gridView",   0), set: { type: "circle", opt: ["Yes", "No"] },             query: "Show giveaways in a grid view?" },
  featuredGA: { value: GM_getValue("featuredGA", 2), set: { type: "circle", opt: ["Yes", "Expanded", "No"] }, query: "Show featured giveaways section?" },
  hideEntry:  { value: GM_getValue("hideEntry",  1), set: { type: "circle", opt: ["Yes", "No"] },             query: "Hide entered giveaways?" },
  oneHide:    { value: GM_getValue("oneHide",    0), set: { type: "circle", opt: ["Yes", "No"] },             query: "Skip confirmation when hiding games?" },
  winPercent: { value: GM_getValue("winPercent", 1), set: { type: "circle", opt: ["Yes", "No"] },             query: "Show giveaway win percentage?" },
  searchSame: { value: GM_getValue("searchSame", 1), set: { type: "circle", opt: ["Yes", "No"] },             query: "Show buttons to quickly search for similar giveaways?" },
  newBadges:  { value: GM_getValue("newBadges",  1), set: { type: "circle", opt: ["Yes", "No"] },             query: "Show additional giveaway badges?" },
  colorBadge: { value: GM_getValue("colorBadge", 1), set: { type: "circle", opt: ["Yes", "No"] },             query: "Recolor standard giveaway badges?" },
  searchNav:  { value: GM_getValue("searchNav",  0), set: { type: "circle", opt: ["Yes", "No"] },             query: "Show the giveaway search bar in the top navigation?" },
  pointInvl:  { value: GM_getValue("pointInvl",  0), set: { type: "number", opt: ["Seconds"], about: "Value in seconds, enter 0 to disable." }, query: "Regularly update points value?" },
  sideMine:   { value: GM_getValue("sideMine",   0), set: { type: "circle", opt: ["Yes", "No"] },             query: "Hide 'My Giveaways' in the sidebar? (Still available under nav dropdown)" },
  activeTalk: { value: GM_getValue("activeTalk", 2), set: { type: "circle", opt: ["Yes", "Sidebar", "No"] },  query: "Show the 'Active Discussions' section?" },
  collapsed:  { value: GM_getValue("collapsed",  3), set: { type: "square", opt: ["Discussions", "Trades"] }, query: "After first page, collapse original post:" },
  userTools:  { value: GM_getValue("userTools",  1), set: { type: "circle", opt: ["Yes", "No"] },             query: "Show SGTools links on user pages?" },
  userDetail: { value: GM_getValue("userDetail", 1), set: { type: "circle", opt: ["Yes", "No"] },             query: "Show user details on avatar hover?" },
  userLists:  { value: GM_getValue("userLists",  1), set: { type: "circle", opt: ["Yes", "No"] },             query: "Label black-/white- listed users?",
                sub: { name: "Configure", settings: {
                    userWhite: { value: JSON.parse(GM_getValue("userWhite", '{"Foreground": "", "Background": ""}')), set: { type: "text", opt: ["Foreground", "Background"], about: "Enter value as hexadecimal color, leave blank for defaults." }, query: "Whitelisted label colors:" }, 
                    userBlack: { value: JSON.parse(GM_getValue("userBlack", '{"Foreground": "", "Background": ""}')), set: { type: "text", opt: ["Foreground", "Background"], about: "Enter value as hexadecimal color, leave blank for defaults." }, query: "Blacklisted label colors:" }
                } }
              }
};

var ribbit = JSON.parse(GM_getValue("userTags", '{}'));

// Calls //
var frog = {
  debug: 0, //0 - off
  /************************************************************************LOGGING****/
  logging: {
    debug: function(message) {
      if (frog.debug < -1) {
        console.debug("[SGT DEBUG] ", message);
      }
    },
    info: function(message) {
      if (frog.debug < 0) {
        console.log("[SGT INFO] ", message);
      }
    },
    warn: function(message) {
      if (frog.debug < 0) {
        console.warn("[SGT WARN] ", message);
      }
    },
    alert: function(message) {
      console.log("[SGT ALERT] ", message);
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
    isGAlist: function() {
      return !(~location.href.indexOf("/trade")
        || ~location.href.indexOf("/discussion")
        || ~location.href.indexOf("/giveaway/")
        || ~location.href.indexOf("/account/")
        || ~location.href.indexOf("/archive")
        || ~location.href.indexOf("/settings"));
    },
    listingPit: {
      cache: {
        wishes: { name: "cache-wish", page: "/account/steam/wishlist/search?page=", touches: ".table__column__secondary-link", list: null },
        white: { name: "cache-white", page: "/account/manage/whitelist/search?page=", touches: ".table__column__heading", list: null },
        black: { name: "cache-black", page: "/account/manage/blacklist/search?page=", touches: ".table__column__heading", list: null }
      },
      getList: function(type, onComplete) {
        frog.logging.debug("Pulling list for " + type);
        var cached = frog.helpers.listingPit.cache[type];
        
        if (!cached.list) {
          var saved = JSON.parse(GM_getValue(cached.name, null));
          if (saved == null) {
            frog.logging.debug("Entering hell..");
            frog.helpers.listingPit.callbackHell(cached.page, 1, cached.touches, function(result) {
              GM_setValue(cached.name, JSON.stringify(result));
              GM_setValue(cached.name + "-time", Date.now());
              cached.list = result;
              onComplete(result);
            });
          } else {
            frog.logging.debug("Had it saved..");
            cached.list = saved;
            onComplete(saved);
          }
        } else {
          frog.logging.debug("Already loaded..");
          onComplete(cached.list);
        }
      },
      invalidateList: function(type) {
        frog.logging.debug("Invalidating "+ type);
        GM_setValue(frog.helpers.listingPit.cache[type].name, null);
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
            frog.logging.debug('Going deeper..');
            frog.helpers.listingPit.callbackHell(url, ++page, elms, function(result) {
              done($.merge(arr, result));
            });
          } else {
            done(arr);
          }
        });
      }
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
    settings: {
      makeRow: function($form, number, setting, details) {
        var $field;
        switch(details.set.type) {
          case "circle":
            $field = frog.helpers.settings.makeRadio(number, setting, details);
            break;
          case "square":
            $field = frog.helpers.settings.makeCheck(number, setting, details);
            break;
          case "number": case "text":
            $field = frog.helpers.settings.makeText(number, setting, details);
            break;
          default:
            frog.logging.warn("Cannot determine options type: " + details.set.type);
            return;
        }
        $form.append($field);
        
        if (details.sub) {
          $field.find(".form__checkbox").last().after($("<div/>").addClass("form__checkbox is-selected").append($("<a/>").html(details.sub.name))
                                                        .on("click", function(ev) { $("#sub_"+setting).toggle(); ev.stopImmediatePropagation(); }));
          
          var set = "abcde";
          var $subform = $("<div/>").attr("id", "sub_"+setting).css("display", "none").appendTo($form);
          
          var subkeys = Object.keys(details.sub.settings);
          for(var i=0; i<subkeys.length; i++) {
            var k = subkeys[i];
            if (details.sub.settings.hasOwnProperty(k)) {
              frog.helpers.settings.makeRow($subform, number + set.substring(i,i+1), k, details.sub.settings[k]);
            }
          }
        }
      },
      makeHeading: function(number, name) {
        var $row = $("<div/>").addClass("form__row");
        $("<div/>").addClass("form__heading")
          .append($("<div/>").addClass("form__heading__number").html(number +"."))
          .append($("<div/>").addClass("form__heading__text").html(name))
          .appendTo($row);
        return $row;
      },
      makeRadio: function(number, setting, details) {
        var $input = $("<div/>").append($("<input/>").attr("type", "hidden").attr("name", setting).val(details.value));
        
        for(var i=0; i<details.set.opt.length; i++) {
          var val = details.set.opt.length - 1 - i; //reverse index so we can check falsey values
          var $radio = $("<div/>").addClass("form__checkbox").attr("data-checkbox-value", val)
            .append("<i class='form__checkbox__default fa fa-circle-o'></i>")
            .append("<i class='form__checkbox__hover fa fa-circle'></i>")
            .append("<i class='form__checkbox__selected fa fa-check-circle'></i>")
            .append(details.set.opt[i]);
          
          if (details.value == val) {
            $radio.addClass("is-selected");
          } else {
            $radio.addClass("is-disabled");
          }
          $input.append($radio);
        }
        
        return frog.helpers.settings.makeHeading(number, details.query).append($("<div/>").addClass("form__row__indent").append($input));
      },
      makeCheck: function(number, setting, details) {
        var $input = $("<div/>").append($("<input/>").attr("type", "hidden").attr("name", setting).val(details.value));
        
        for(var i=0; i<details.set.opt.length; i++) {
          var val = Math.pow(2, details.set.opt.length - 1 - i); //values bitwise OR'd together
          var $check = $("<div/>").addClass("form__checkbox").attr("data-checkbox-value", val)
            .append("<i class='form__checkbox__default fa fa-square-o'></i>")
            .append("<i class='form__checkbox__hover fa fa-square'></i>")
            .append("<i class='form__checkbox__selected fa fa-check-square'></i>")
            .append(details.set.opt[i])
            .on("click", function(ev) {
              var $this = $(this),
                  $in   = $this.siblings("input");
              
              $in.val($in.val() ^ $this.attr("data-checkbox-value"));
              if ($in.val() & $this.attr("data-checkbox-value")) {
                $this.removeClass("is-disabled").addClass("is-selected");
              } else {
                $this.addClass("is-disabled").removeClass("is-selected");
              }
              
              ev.stopImmediatePropagation(); //prevent radio-button style event
            });
            
            if (details.value & val) {
              $check.addClass("is-selected");
            } else {
              $check.addClass("is-disabled");
            }
            $input.append($check);
        }
        
        return frog.helpers.settings.makeHeading(number, details.query).append($("<div/>").addClass("form__row__indent").append($input));
      },
      makeText: function(number, setting, details) {
        var $indent = $("<div/>").addClass("form__row__indent");
        
        $.each(details.set.opt, function(i, opt) {
          var val = details.value,
              leg = "";
              
          if (details.set.opt.length > 1) {
            val = details.value[opt];
            leg = "_"+i;
          }
          
          $indent.append($("<input/>").attr("type", details.set.type).attr("name", setting+leg).attr("placeholder", opt)
                          .addClass("form__input-small").val(val));
        });
        
        var $desc = $("<div/>").addClass("form__input-description").html(details.set.about);
        
        return frog.helpers.settings.makeHeading(number, details.query).append($indent.append($desc));
      }
    },
    applyGradients: function(elm, range) {
      elm.css("background-image", "linear-gradient(" + range +")")
        .css("background-image", "-moz-linear-gradient(" + range +")")
        .css("background-image", "-webkit-linear-gradient(" + range +")");
    }
  },
  /************************************************************************SETTINGS***/
  settings: {
    invalidateOnSync: function() {
      if (!croak.newBadges.value || !~location.href.indexOf("/profile/sync")) { return; }
      
      $(".form__sync-default").on("click", function() {
        frog.helpers.listingPit.invalidateList("wishes");
      });
    },
    injectMenu: function(isActive) {
      frog.logging.debug("Adding custom navigation");
      
      //inject button in nav
      var $menu = $("<div/>").addClass("nav__button-container");
      $("<a/>").addClass("nav__button nav__buton--is-dropdown").attr("href", "/ąccount/settings/ribbit")
        .html("SGT frog").appendTo($menu);
      $("<div/>").addClass("nav__button nav__button--is-dropdown-arrow").html("<i class='fa fa-angle-down'></i>").appendTo($menu)
        .on("click", function(ev) {
            //chrome has problems applying sg's event handlers, so we explicitly copy them
          var t = $(this).hasClass("is-selected");
          $("nav .nav__button").removeClass("is-selected"), $("nav .nav__relative-dropdown").addClass("is-hidden"), t || $(this).addClass("is-selected").siblings(".nav__relative-dropdown").removeClass("is-hidden"), ev.stopImmediatePropagation()
        });
      
      var $drop = $("<div/>").addClass("nav__relative-dropdown is-hidden").appendTo($menu);
      $("<div/>").addClass("nav__absolute-dropdown")
        .append(frog.helpers.makeTopLink("/ąccount/settings/ribbit", "Settings", "Adjust tool functionality.", "gears", "grey"))
        .append(frog.helpers.makeTopLink("https://github.com/bberenz/sgtfrog/issues", "Feedback", "Report an issue or request a feature.", "github", "green"))
        .append(frog.helpers.makeTopLink("https://www.steamgifts.com/discussion/4C3Cl/userscript-steamgifts-tinkerer-featuring-refined-ostensible-gain", "Discussion", "View the SteamGifts discussion thread.", "square-o", "blue"))
        .appendTo($drop);
      
      $(".nav__right-container").find(".nav__button-container:not(.nav__button-container--notification)").last().before($menu);
      
      //inject link on account settings
      var $link = frog.helpers.makeSideLink("/ąccount/settings/ribbit", "SGT frog");
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
        
        var $dark = $("style").detach(); //compatibility with dark theme
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
          $dark.appendTo("html");
          
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
              frog.helpers.settings.makeRow($form, i+1, k, croak[k]);
            }
          }
          
          $("<div/>").addClass("form__submit-button")
            .html("<i class='fa fa-arrow-circle-right'></i> Save Changes")
            .on("click", function() { frog.settings.save(croak); })
            .appendTo($form);
          
          frog.logging.debug("Creation complete");
          
          //after wiping the page we need to reapply relevant custom settings
          window.setTimeout(function() {
            frog.settings.injectMenu(true);
            frog.giveaways.injectNavSearch();
            
            frog.fixedElements.header();
            frog.fixedElements.sidebar();
            frog.fixedElements.footer();
            $document.scroll();
          }, 500);
        });
      }
    },
    save: function(set) {
      var setVal = function(name, val) {
        frog.logging.debug("Setting "+ name +" to "+ val);
        GM_setValue(name, val);
      };

      var keys = Object.keys(set);
      for(var i=0; i<keys.length; i++) {
        var k = keys[i];
        if (set.hasOwnProperty(k)) {
          if (set[k].set.type == 'text' && set[k].set.opt.length > 1) {
            var compose = {};
            for(var j=0; j<set[k].set.opt.length; j++) {
              var $subinput = $("input[name='"+ k+"_"+j +"']");
              compose[set[k].set.opt[j]] = $subinput.val();
            }
            setVal(k, JSON.stringify(compose));
          } else {
            var $input = $("input[name='"+ k +"']");
            setVal(k, +$input.val());
          }
          
          if (set[k].sub) {
            frog.settings.save(set[k].sub.settings);
          }
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
      if (!(croak.fixedElms.value & 4)) { return; }
      
      // !important on margin for compatibility with dark theme
      GM_addStyle("header.fixed{ position: fixed; top: 0; width: 100%; z-index: 100; } " +
                  ".left-above{ margin-top: 39px !important; }");

      $("header").addClass("fixed");

      var $feature = $(".featured__container");
      if ($feature.length > 0) {
        $feature.addClass("left-above");
      } else {
        $(".page__outer-wrap").addClass("left-above");
      }
    },
    sidebar: function() {
      if (!(croak.fixedElms.value & 2)) { return; }
      
      var offset = croak.fixedElms.value&4 ? 64 : 25;
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
      if (!(croak.fixedElms.value & 1)) { return; }
      
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
          frog.helpers.makeSideLink("http://www.sgtools.info/sent/" + userViewed, "Real Value Sent").find("a").attr("target", "_check"),
          frog.helpers.makeSideLink("http://www.sgtools.info/won/" + userViewed, "Real Value Won").find("a").attr("target", "_check"),
          frog.helpers.makeSideLink("http://www.sgtools.info/nonactivated/" + userViewed, "Non-Activated").find("a").attr("target", "_check"),
          frog.helpers.makeSideLink("http://www.sgtools.info/multiple/" + userViewed, "Multi Wins").find("a").attr("target", "_check")
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
        if (croak.colorBadge.value) {
          frog.giveaways.injectFlags.invite();
          frog.giveaways.injectFlags.region();
          frog.giveaways.injectFlags.whitelist();
          frog.giveaways.injectFlags.group();
        }
      },
      wishlist: function($doc, hasStyle) {
        var $gives = $(".giveaway__row-outer-wrap");
        
        if ($gives.length > 0) {
          if (!hasStyle) {
            GM_addStyle(".giveaway__column--wish{ background-image: linear-gradient(#FFFACF 0%, #FFF176 100%); " +
                      "  background-image: -moz-linear-gradient(#FFFACF 0%, #FFF176 100%); " +
                      "  background-image: -webkit-linear-gradient(#FFFACF 0%, #FFF176 100%); " +
                      "  border-color: #EDCCBE #F0C2AF #DEAB95 #F2C4B1 !important; color: #F57F17; " +
                      "  box-shadow: none !important; }");
          }

          var $badge = $("<div/>").addClass("giveaway__column--wish").attr("title", "Wishlist");
          $("<i/>").addClass("fa fa-fw fa-star").appendTo($badge);
          
          //refresh wishlist daily
          if (Date.now() - GM_getValue("cache-wish-time", 0) > (24*60*60*1000)) {
            frog.helpers.listingPit.invalidateList("wishes");
          }
          
          //load wishlist to know what gets badged
          frog.helpers.listingPit.getList("wishes", function(wishes) {
            frog.logging.info("Applying badges for "+ wishes.length +" wishes");
            
            $.each(wishes, function(i, wish) {
              var $gaBlock = $doc.find("a[href='"+ wish +"']").parent().parent();
              var $block = $gaBlock.find(".giveaway__columns--badges");
              if ($block.length) {
                  $block.prepend($badge.clone());
              } else {
                $gaBlock.find(".giveaway__column--width-fill").after($badge.clone()); 
              }
            });
          });
        }
      },
      recent: function($doc, hasStyle) {
        if (!hasStyle) {
          GM_addStyle(".giveaway__column--new{ " +
                        "  background-image: linear-gradient(#FFE0B2 0%, #FFB74D 100%); " +
                        "  background-image: -moz-linear-gradient(#FFE0B2 0%, #FFB74D 100%); " +
                        "  background-image: -webkit-linear-gradient(#FFE0B2 0%, #FFB74D 100%); " +
                        "  border-color: #FFCCBC #FFAB91 #FF8A65 #FFAB91 !important; color: #BF360C; " +
                        "  box-shadow: none !important; }");
        }

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
                    "  color: #D81B60 !important; }");
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
            Math.min(100, (1 / entries) * copies * 100).toFixed(3) + "% chance</span>";
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
    injectSearch: function($doc, hasStyle) {
      if (!croak.searchSame.value) { return; }
      
      $.each($doc.find(".giveaway__heading"), function(i, heading) {
        var $heading = $(heading);
        $("<a/>").addClass("giveaway__icon").html("<i class='fa fa-search-plus'></i>").attr("title", "Find similar giveaways")
          .attr("href", "/giveaways/search?q=" + $heading.find(".giveaway__heading__name").html()).appendTo($heading);
      });
      
      if (~location.href.indexOf("/giveaway/")) {
        if (!hasStyle) {
          GM_addStyle(".sidebar__shortcut-inner-wrap div{ padding: 0; } " + 
                     ".sidebar__shortcut-inner-wrap .sidebar__error{ border-color: #f0d1dc #e5bccc #d9a7ba #ebbecf; }");
        }
        
        var $side = $(".sidebar__navigation").parent();
        var $entry = $side.children().first().not(".sidebar__mpu").detach();
        if (!$entry.hasClass("sidebar__error")) {
          $entry.css("background-image", "none").css("border", "none");
        } else {
          frog.helpers.applyGradients($entry, "#f7edf1 0%, #e6d9de 100%");
        }
        
        $("<div/>").addClass("sidebar__shortcut-inner-wrap")
          .append($("<a/>").addClass("sidebar__entry-loading").css("max-width", ($entry.length>0? "33%":"100%")).html("<i class='fa fa-search'></i> Find Similar")
                 .attr("href", "/giveaways/search?q=" + $(".featured__heading__medium").html()))
          .append($entry)
          .appendTo($("<div/>").addClass("sidebar__shortcut-outer-wrap").prependTo($side))
      }
    },
    injectNavSearch: function() {
      if (!croak.searchNav.value) { return; }
      
      var $search = $("<div/>").addClass("sidebar__search-container").css("margin", "0 5px 0 0").css("height", "inherit")
        .append($("<input class='sidebar__search-input' placeholder='Search Giveaways...' value='' type='text' />")
                .on("keypress", function(ev) {
                  if (ev.which === 13) {
                    location.href = "/giveaways/search?q="+ $(this).val();
                    ev.stopImmediatePropagation();
                  }
                }))
        .append("<i class='fa fa-search'></i>");
      $(".nav__left-container").prepend($search);
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
    gridForm: function($doc, hasStyle) {
      if (!croak.gridView.value || !frog.helpers.isGAlist()) { return; }
      
      if (!hasStyle) {
        GM_addStyle(".pagination{ clear: both; } " +
                      ".giveaway__row-outer-wrap{ width: 19%; margin-right: 1%; float: left; } " +
                      ".giveaway__row-inner-wrap{ display: block; } " +
                      ".global__image-outer-wrap--game-medium{ width: initial; margin: 0 auto !important; } " + //important to override margins on :not(last)
                      ".giveaway__heading{ display: block; text-align: center; } " +
                      ".giveaway__heading:first-of-type{ height: auto; text-overflow: ellipsis; overflow: hidden; } " +
                      ".giveaway__columns-full{ display: block; } " + 
                      ".giveaway__columns-full > :not(:last-child){ margin: 0 0 5px 0; } " +
                      ".giveaway__columns--badges{ margin-bottom: 5px; } " +
                      ".giveaway__columns--badges > .giveaway__column--contributor-level:not(.giveaway__column--empty){ -webkit-box-flex: 1; -moz-box-flex: 1; -webkit-flex: 1; -ms-flex: 1; flex: 1; } " +
                      ".giveaway__column--empty{ height: 26px; width: 0; padding: 0; margin: 0 !important; visibility: hidden; } " + //important to force no widths
                      ".giveaway__links{ display: block; margin-top: 5px; } " + 
                      ".giveaway__links a{ margin-right: 5px; } " + 
                      ".pinned-giveaways__inner-wrap--minimized .giveaway__row-outer-wrap:nth-child(-n+5){ display: initial; } " +
                      ".giveaway__row--empty{ clear: both; } ");
      }
      
      $doc.find(".giveaway__columns").addClass("giveaway__columns-full");
      $.each($doc.find(".giveaway__row-outer-wrap"), function(i,wrap) {
        var $wrap = $(wrap);
        $wrap.find(".global__image-outer-wrap--avatar-small").remove();
        
        //move the game image to the top
        $wrap.find(".giveaway__row-inner-wrap").prepend($wrap.find(".global__image-outer-wrap--game-medium").detach());
        
        //split name from fee/actions
        $wrap.find(".giveaway__summary").prepend($("<h2/>").addClass("giveaway__heading")
                                                 .html($wrap.find(".giveaway__heading__name").detach()));
          
        //badges in a single row
        $wrap.find(".giveaway__columns").before($("<div/>").addClass("giveaway__columns giveaway__columns--badges")
                                               .html($wrap.find(".giveaway__column--width-fill").nextAll().detach())
                                               .prepend($("<div/>").addClass("giveaway__column--empty")));
                                               
        //condense links
        var $link = $wrap.find(".fa-tag").next();
        $link.html($link.text().replace(/([\d,]+) \w+/, "$1"));
        $link = $wrap.find(".fa-comment").next();
        $link.html($link.text().replace(/([\d,]+) \w+/, "$1"));
      });
      
      //fix featured background to fill area
      $doc.find(".pinned-giveaways__inner-wrap").append($("<div/>").addClass("giveaway__row--empty"));
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
        GM_addStyle(".pinned-giveaways__button{ clear: both; } " +
                    ".pinned-giveaways__inner-wrap:not(.pinned-giveaways__inner-wrap--minimized){ " +
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
        switch(croak.activeTalk.value) {
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
      if (!(croak.collapsed.value & 2) || !~location.href.indexOf("/discussion/")) { return; }

      var page = frog.helpers.fromQuery("page");
      if (page && page > 1) {
        $(".comment__collapse-button").first().trigger("click");
      }
    },
    collapseTrade: function() {
      if (!(croak.collapsed.value & 1) || !~location.href.indexOf("/trade/")) { return; }

      var page = frog.helpers.fromQuery("page");
      if (page && page > 1) {
        $(".comment__collapse-button").first().trigger("click");
      }
    },
    injectTimes: function($doc) {
      if (!~location.href.indexOf("/discussion/") && !~location.href.indexOf("/trade/")) { return; }
      
      $.each($doc.find(".comment__actions"), function(i, elm) {
        var $edit = $($(elm).children().first().children()[1]);
        
        if ($edit.length) {
          var d,
              pullDate = $edit.attr("title").replace(/Edited:/, ""),
              time = pullDate.match(/(\w+ \d+, \d{4}|Yesterday|Today), (\d+):(\d{2})(am|pm)/i);          
          if (time[1] === "Today" || time[1] === "Yesterday") {
              d = new Date();
              if (time[1] === "Yesterday") {
                  d.setDate(d.getDate()-1);
              }
          } else {
              d = new Date(time[1]);
          }
          d.setHours(+time[2] + ((+time[2] < 12 && time[4] == "pm")? 12:0) - (+time[2] == 12 && time[4] == "am"? 12:0), +time[3], 0, 0);
          
          frog.logging.debug(pullDate +"-->"+ d.toString());
          
          var show, interval, 
              seconds = Math.floor((new Date() - d) / 1000);
              
          var interval = Math.floor(seconds / 31622400);
          if (interval > 1) {
            show = interval + " year";
          } else {
            interval = Math.floor(seconds / 2678400);
            if (interval > 1) {
              show = interval + " month";
            } else {
              interval = Math.floor(seconds / 86400);
              if (interval >= 1) {
                show = interval + " day";
              } else {
                interval = Math.floor(seconds / 3600);
                if (interval >= 1) {
                  show = interval + " hour";
                } else {
                  interval = Math.floor(seconds / 60);
                  if (interval >= 1) {
                    show = interval + " minute";
                  } else {
                    show = seconds + " second";
                  }
                }
              }
            }
          }
          
          $edit.html(" <strong>*Edited: "+ show + (interval==1? "":"s") +" ago</strong>");
        }
      });
    }
  },
  /*************************************************************************LOADING***/
  loading: {
    everyNew: function($doc) {
      frog.giveaways.injectFlags.wishlist($doc, true);
      frog.giveaways.injectFlags.recent($doc, true);
      frog.giveaways.injectChance($doc);
      frog.giveaways.injectSearch($doc, true);
      frog.giveaways.hideEntered($doc);
      frog.giveaways.easyHide($doc);
      frog.giveaways.gridForm($doc, true);
      frog.users.profileHover($doc, true);
      frog.users.tagging.show($doc, true);
      frog.users.listIndication($doc, true);
    },
    giveaways: function() {
      //avoid stepping on other loading pages
      if (!(croak.loadLists.value & 8) || !frog.helpers.isGAlist()) {
        return;
      }
      
      GM_addStyle(".pagination__loader{ text-align: center; margin-top: 1em; } " +
                  ".pagination__loader .fa{ font-size: 2em; } ");
      
      //FIXME - hide giveaway broken on appended pages
      
      var page = frog.helpers.fromQuery("page");
      if (page == undefined) { page = 1; }
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

          frog.loading.addSpinner($(".giveaway__row-outer-wrap").last());
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
            frog.loading.removeSpinner();
          });
        }
      });
    },
    trade: function() {
      if (!(croak.loadLists.value & 2) || !~location.href.indexOf("/trade/")) { return; }
      frog.loading.comments();
    },
    threads: function() {
      if (!(croak.loadLists.value & 4) || !~location.href.indexOf("/discussion/")) { return; }
      frog.loading.comments();
    },
    thanks: function() {
      if (!(croak.loadLists.value & 1) || !~location.href.indexOf("/giveaway/")) { return; }
      frog.loading.comments();
    },
    comments: function() {
      GM_addStyle(".pagination__loader{ text-align: center; margin-top: 1em; } " +
                  ".pagination__loader .fa{ font-size: 2em; } ");
        
      var page = frog.helpers.fromQuery("page");
      if (page == undefined) { page = 1; }
      var lastPage = $(".pagination__navigation").children().last().attr('data-page-number');
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
            
            frog.loading.addSpinner($(".comments").last());
            frog.logging.info("Loading next page: "+ page +"/"+ lastPage);
            frog.logging.debug(loc +"&page="+ page);
            
            $.ajax({
              method: 'GET',
              url: loc +"&page="+ page
            }).done(function(data) {
              var $data = $(data);
              frog.users.profileHover($data, true);
              frog.users.tagging.show($data, true);
              frog.users.listIndication($data, true);
              frog.threads.injectTimes($data);
              
              var $paging = $data.find(".pagination");
              $paging.find(".pagination__navigation").html("Page " + page);
              
              $(".comments").last().append($paging)
                .append($data.find(".comments").last().children().detach());
              
              loading = false;
              frog.loading.removeSpinner();
            });
          }
        }
      });
    },
    addSpinner: function($afterElm) {
      $afterElm.after($("<div/>").addClass("pagination__loader").html("<i class='fa fa-spin fa-circle-o-notch'></i>"));
    },
    removeSpinner: function() {
      $(".pagination__loader").remove();
    },
    points: function() {
      if (croak.pointInvl.value < 1 || isNaN(croak.pointInvl.value)) { return; }
      if (croak.pointInvl.value < 15) {
        frog.logging.alert("Failed to apply defined points interval, using 15 seconds instead");
        croak.pointInvl.value = 15;
      }
      
      window.setInterval(function() {
        frog.logging.debug("Pulling new point value");
        
        //load a small page to pull current points from
        $.ajax({
          method: "GET",
          url: "/about/brand-assets"
        }).done(function(data) {
          $(".nav__points").html($(data).find(".nav__points").html());
        });
      }, croak.pointInvl.value * 1000);
    }
  },
  /***************************************************************************USERS***/
  users: {
    profileHover: function($doc, hasStyle) {
      if (!croak.userDetail.value) { return; }
      
      var img = 64, pad = 5;
      var width = 360, height = 160;
      if (!hasStyle) {
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
      }
      
      var $box = $("<div/>").addClass("global__image-outer-wrap user-panel__outer-wrap").appendTo($("body")).hide();
      var $userbox = $("<div/>").addClass("user-panel__inner-wrap").appendTo($box);
      
      var $userimage = $("<a/>").addClass("user-panel__link").append($("<div/>").addClass("user-panel__image")).appendTo($userbox),
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
                $username.find(".featured__heading__medium").css("color", "#000").attr("title", "Suspension length: "+ $suspend.text());
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
              
              var user = $parent.attr("href");
              frog.users.listenForLists(user, true);
              frog.users.tagging.injectEditor(user, true);
            });
          } else {
            frog.users.listenForLists(lastLoad, true); //removed when hidden, so re-add on showing same user
          }

          var $target = $(ev.target);
          var edge = 0;
          if (($target.offset().left + width) > window.innerWidth) {
            edge = ev.target.offsetWidth - width;
          }

          $box.show()
            .css("left", $target.offset().left - 1 - parseInt($parent.css("padding-left")) + edge)
            .css("top", $target.offset().top - 1 - parseInt($parent.css("padding-top")));
        }, 250);
      }, function() {
        window.clearTimeout(hoverTime);
      });
      $(".user-panel__outer-wrap").on("mouseleave", function() {
        $box.hide();
        
        $(".sidebar__shortcut__whitelist").off("click");
        $(".sidebar__shortcut__blacklist").off("click");
      });
    },
    tagging: {
        show: function($doc, hasStyle) {
          if (~location.pathname.indexOf('/user/')) { return; }
        
          if (!hasStyle) {
            GM_addStyle(".user__tagged{ text-decoration: none; border-radius: 4px; padding: 2px 4px; margin-left: .5em; background-color: rgba(0,0,0,.01); " +
                        "  text-shadow: none; box-shadow: 1px 1px 1px rgba(0,0,0,0.5) inset, -1px -1px 1px rgba(255,255,255,0.5) inset; } ");
          }
          
          $.each(Object.keys(ribbit), function(i, taglet) {
            $doc.find("a[href='/user/"+ taglet +"']").not(".global__image-outer-wrap").append(
              $("<span/>").addClass("user__tagged").html("<i class='fa fa-tag fa-flip-horizontal'></i> "+ ribbit[taglet])
            );
          });
        },
        injectEditor: function(user, isHover) {
          if (!~location.pathname.indexOf('/user/') && !isHover) { return; }
          if (~user.indexOf("/user/")) { user = user.substring(6); }
          if (user == $(".nav__avatar-outer-wrap").attr("href").substring(6)) { return; } //don't tag self
          
          var tag = ribbit[user] || "Add User Tag",
              ielm = "<i class='fa fa-tag fa-flip-horizontal' style='font-size: 14px;'></i> ";
              
          $("<div/>").attr("href", "#").html("<a>"+ ielm + tag +"</a>")
            .css("color", $(".featured__table__row__right").find("a").css("color"))
            .on("click", function(ev) {
              var $div = $(this);
              if ($div.children("input").length) { return; } //don't reset input if already set
              
              $div.html("<input type='text' placeholder='User Tag' value='"+ (ribbit[user] || "") +"' maxlength='16' />"). on("keypress", function(ev) {
                var $this = $(this),
                    code = ev.which || ev.keyCode;
                
                if (code == 13) {
                  var val = $(this).children("input").val();
                  $div.html("<a>"+ ielm + (val || "Add User Tag") +"</a>");
                  $("a[href='/user/"+ user +"']").find(".user__tagged").remove();
                  
                  if (val) {
                    ribbit[user] = val;
                    
                    if (isHover) {
                      $("a[href='/user/"+ user +"']").not(".global__image-outer-wrap").append(
                        $("<span/>").addClass("user__tagged").html("<i class='fa fa-tag fa-flip-horizontal'></i> "+ ribbit[user])
                      );
                      $(".user-panel__outer-wrap").find(".user__tagged").remove();
                    }
                  } else {
                    delete ribbit[user];
                  }
                  GM_setValue("userTags", JSON.stringify(ribbit));
                  
                  $this.off("keypress");
                } else if (code == 27) {
                  $div.html("<a>"+ ielm + (ribbit[user] || "Add User Tag") +"</a>");
                  $this.off("keypress");
                }
              });
              
              //highlight text on focus, reset on blur
              $div.find("input").select().focus().on("blur", function() { $div.html("<a>"+ ielm + tag +"</a>"); $(this).parent().off("keypress"); });
            }).insertAfter((isHover? ".user-panel__outer-wrap ":"") + ".featured__heading__medium");
        }
    },
    listIndication: function($doc, hasStyle) {
      if (!croak.userLists.value || ~location.pathname.indexOf('/user/')) {
        return; //not active on user pages for obvious reasons
      }
      
      if (!hasStyle) {
        var wlFore = croak.userLists.sub.settings.userWhite.value.Foreground || "#2A2",
            wlBack = croak.userLists.sub.settings.userWhite.value.Background || "#FFF",
            blFore = croak.userLists.sub.settings.userBlack.value.Foreground || "#C55",
            blBack = croak.userLists.sub.settings.userBlack.value.Background || "#000";
        
        if (!~wlFore.indexOf("#")) { wlFore = "#"+wlFore; }
        if (!~wlBack.indexOf("#")) { wlBack = "#"+wlBack; }
        if (!~blFore.indexOf("#")) { blFore = "#"+blFore; }
        if (!~blBack.indexOf("#")) { blBack = "#"+blBack; }
        
        //using !important selector on 'color' to override the :not(.comment__username--op) selector color
        GM_addStyle("a.user__whitened{ background-color: "+ wlBack +"; color: "+ wlFore +" !important; border-radius: 4px; padding: 3px 5px; text-shadow: none; } " +
                    "a.user__blackened{ background-color: "+ blBack +"; color: "+ blFore +" !important; border-radius: 4px; padding: 3px 5px; text-shadow: none; } ");
      }
      
      frog.helpers.listingPit.getList("white", function(whitened) {
        frog.logging.info("Applying white to "+ whitened.length +" users");
        
        $.each(whitened, function(i, white) {
          $doc.find("a[href='"+ white +"']").not(".global__image-outer-wrap").addClass("user__whitened")
            .attr("title", "Whitelisted user").prepend("<i class='fa fa-star-o'></i> ");
        });
      });
      
      frog.helpers.listingPit.getList("black", function(blackened) {
        frog.logging.info("Applying black to "+ blackened.length +" users");
        
        $.each(blackened, function(i, black) {
          $doc.find("a[href='"+ black +"']").not(".global__image-outer-wrap").addClass("user__blackened")
            .attr("title", "Blacklisted user").prepend("<i class='fa fa-ban'></i> ");
        });
      });
    },
    listenForLists: function(user, isHover) {
      if (user.indexOf("/user/") !== 0) { user = "/user/"+ user; }
      
      //listeners to ensure cache updates properly
      $(".sidebar__shortcut__whitelist").on("click", function() {
        frog.helpers.listingPit.invalidateList("white");
        frog.helpers.listingPit.getList("black", function(blackened) {
          //check if they also swapped lists
          if (blackened.indexOf(user) > -1) {
            frog.helpers.listingPit.invalidateList("black");
          }
        });
        
        if (isHover) {
          var href = "a[href='"+ user +"']",
              $name = $(href).not(".global__image-outer-wrap").not($(".user-panel__outer-wrap").find(href));
          
          $name.attr("title", "").removeClass("user__blackened").toggleClass("user__whitened").find("i").not(".fa-tag").remove();
          if ($name.hasClass("user__whitened")) {
            $name.attr("title", "Whitelisted user").prepend("<i class='fa fa-star-o'></i> ");
          }
        }
      });
      
      $(".sidebar__shortcut__blacklist").on("click", function() {
        frog.helpers.listingPit.invalidateList("black");
        frog.helpers.listingPit.getList("white", function(whitened) {
          //check if they also swapped lists
          if (whitened.indexOf(user) > -1) {
            frog.helpers.listingPit.invalidateList("white");
          }
        });
        
        if (isHover) {
          var href = "a[href='"+ user +"']";
          var $name = $(href).not(".global__image-outer-wrap").not($(".user-panel__outer-wrap").find(href));
          
          $name.attr("title", "").removeClass("user__whitened").toggleClass("user__blackened").find("i").not(".fa-tag").remove();
          if ($name.hasClass("user__blackened")) {
            $name.attr("title", "Blacklisted user").prepend("<i class='fa fa-ban'></i> ");
          }
        }
      });
    }
  },
  /***********************************************************************POINTLESS***/
  pointless: {
    kccode: function() {
      GM_addStyle("*{ direction: rtl; } ");
      $(".fa").addClass("fa-spin");
    }
  }
};


// SETUP //
frog.settings.injectPage();
frog.settings.injectMenu();
frog.settings.invalidateOnSync();

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
frog.giveaways.injectNavSearch();
frog.giveaways.hideEntered($document);
frog.giveaways.easyHide($document);
frog.giveaways.gridForm($document);
frog.sidebar.removeMyGA();

frog.giveaways.activeThreads.find();

frog.threads.injectTimes($document);

frog.sidebar.injectSGTools();
frog.users.profileHover($document);
frog.users.tagging.show($document);
frog.users.tagging.injectEditor($(".featured__heading__medium").text());
frog.users.listIndication($document);
frog.users.listenForLists($(".featured__heading__medium").text());


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
      frog.pointless.kccode();
    }
  } else {
    kcAt = 0;
  }
});

console.log("[RIBBIT] - SGT Mode Activated!");

})();
