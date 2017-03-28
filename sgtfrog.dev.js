/*!
// ==UserScript==
// @name         SteamGifts Tinkerer, Featuring Refined Ostensible Gain
// @namespace    https://github.com/bberenz/sgtfrog
// @description  SteamGifts.com user controlled enchancements
// @icon         https://raw.githubusercontent.com/bberenz/sgtfrog/master/keroro.gif
// @include      *://*.steamgifts.com/*
// @version      0.8.8
// @downloadURL  https://raw.githubusercontent.com/bberenz/sgtfrog/master/sgtfrog.user.js
// @updateURL    https://raw.githubusercontent.com/bberenz/sgtfrog/master/sgtfrog.meta.js
// @require      https://code.jquery.com/jquery-1.12.3.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/showdown/1.5.4/showdown.min.js
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


//// TODO - remove in later release ////
if (GM_getValue("reconfigure", 1)) {
  var ll = GM_getValue("loadLists", -1);
  if (ll > 0) {
    ll <<= 1;
    if (ll === 14) { ll++; } //enable new feature too for those with all loaders enabled

    GM_setValue("loadLists", ll);
  }
  GM_setValue("reconfigure", 0);
}
//// END BLOCK ////


// Variables //
var frogVars = {
  fixedElms:  { value: GM_getValue("fixedElms",  6), set: { type: "square", opt: ["Header", "Sidebar", "Footer"] }, query: "Set fixed elements:" },
  loadLists:  { value: GM_getValue("loadLists", 15), set: { type: "square", opt: ["Giveaways", "Discussions", "Comments", "General Content"] }, query: "Continuously load:" },
  gridView:   { value: GM_getValue("gridView",   0), set: { type: "circle", opt: ["Yes", "No"] }, query: "Show giveaways in a grid view?" },
  featuredGA: { value: GM_getValue("featuredGA", 2), set: { type: "circle", opt: ["Yes", "Expanded", "No"] }, query: "Show featured giveaways section?" },
  hideEntry:  { value: GM_getValue("hideEntry",  1), set: { type: "circle", opt: ["Yes", "No"] }, query: "Hide entered giveaways?" },
  oneHide:    { value: GM_getValue("oneHide",    0), set: { type: "circle", opt: ["Yes", "No"] }, query: "Skip confirmation when hiding games?" },
  winPercent: { value: GM_getValue("winPercent", 1), set: { type: "circle", opt: ["Yes", "No"] }, query: "Show giveaway win percentage?" },
  searchSame: { value: GM_getValue("searchSame", 1), set: { type: "circle", opt: ["Yes", "No"] }, query: "Show buttons to quickly search for similar giveaways?" },
  realEnd:    { value: GM_getValue("realEnd",    0), set: { type: "circle", opt: ["Yes", "No"] }, query: "Show actual end time on giveaway page?" },
  moreCopies: { value: GM_getValue("moreCopies", 1), set: { type: "circle", opt: ["Yes", "No"] }, query: "Make multiple copy giveaways stand out?",
                sub: { name: "Configure", settings: {
                  moreCopyBold: { value: GM_getValue("moreCopyBold", 1), set: { type: "circle", opt: ["Yes", "No"] }, query: "Bold text:" },
                  moreCopyLabel: { value: JSON.parse(GM_getValue("moreCopyLabel", '{"Foreground": "", "Background": ""}')), set: { type: "text", opt: ["Foreground", "Background"], about: 'Enter value as hexadecimal color, leave blank for defaults.' }, query: "Text color:" }
                } }
              },
  newBadges:  { value: GM_getValue("newBadges",  1), set: { type: "circle", opt: ["Yes", "No"] }, query: "Show additional giveaway badges?" },
  colorBadge: { value: GM_getValue("colorBadge", 1), set: { type: "circle", opt: ["Yes", "No"] }, query: "Recolor standard giveaway badges?" },
  searchNav:  { value: GM_getValue("searchNav",  0), set: { type: "circle", opt: ["Yes", "No"] }, query: "Show the giveaway search bar in the top navigation?" },
  pointInvl:  { value: GM_getValue("pointInvl",  0), set: { type: "number", opt: ["Seconds"], about: "Value in seconds, enter 0 to disable." }, query: "Regularly update header values (points, messages, etc.)?" },
  sideMine:   { value: GM_getValue("sideMine",   0), set: { type: "circle", opt: ["Yes", "No"] }, query: "Hide 'My Giveaways' in the sidebar? (Still available under nav dropdown)" },
  activeTalk: { value: GM_getValue("activeTalk", 2), set: { type: "circle", opt: ["Yes", "Sidebar", "No"] }, query: "Show the 'Active Discussions' section?" },
  collapsed:  { value: GM_getValue("collapsed",  1), set: { type: "circle", opt: ["Yes", "No"] }, query: "After first page, collapse original discussion post:" },
  onDemand:   { value: GM_getValue("onDemand",   0), set: { type: "circle", opt: ["Yes", "No"] }, query: "Only load attached images on demand?" },
  tracking:   { value: GM_getValue("tracking",   0), set: { type: "circle", opt: ["Yes", "No"] }, query: "Track read comments and topics on discussions:" },
  formatting: { value: GM_getValue("formatting", 1), set: { type: "circle", opt: ["Yes", "No"] }, query: "Show quick format buttons on comment box?" },
  preview:    { value: GM_getValue("preview",    1), set: { type: "circle", opt: ["Yes", "No"] }, query: "Allow preview of posts before submitting?" },
  userTools:  { value: GM_getValue("userTools",  1), set: { type: "circle", opt: ["Yes", "No"] }, query: "Show SGTools links on user and winner pages?",
                sub: { name: "Configure", settings: {
                  toolsOrdering: { value: GM_getValue("toolsOrdering", 1), set: { type: "circle", opt: ["Ascending", "Descending"] }, query: "Result ordering:" }
                } }
              },
  hoverInfo:  { value: GM_getValue("hoverInfo",  1), set: { type: "circle", opt: ["Yes", "No"] }, query: "Show profile details on avatar hover?" },
  customTags: { value: GM_getValue("customTags", 1), set: { type: "circle", opt: ["Yes", "No"] }, query: "Allow tagging of users and groups?" },
  userLists:  { value: GM_getValue("userLists",  1), set: { type: "circle", opt: ["Yes", "No"] }, query: "Label black-/white- listed users?",
                sub: { name: "Configure", settings: {
                  userWhite: { value: JSON.parse(GM_getValue("userWhite", '{"Foreground": "", "Background": ""}')), set: { type: "text", opt: ["Foreground", "Background"], about: "Enter value as hexadecimal color, leave blank for defaults." }, query: "Whitelisted label colors:" },
                  userBlack: { value: JSON.parse(GM_getValue("userBlack", '{"Foreground": "", "Background": ""}')), set: { type: "text", opt: ["Foreground", "Background"], about: "Enter value as hexadecimal color, leave blank for defaults." }, query: "Blacklisted label colors:" }
                } }
              },
  debugging:  { value: 0, set: { type: "none", opt: [] }, query: "Debug options",
                sub: { name: "View", settings: {
                  dbgConsole: { value: GM_getValue("dbgConsole", 2), set: { type: "circle", opt: ["None", "Basic", "Detailed"] }, query: "Console output level:" }
                } }
              }
};

var frogTags = {
  users: JSON.parse(GM_getValue("userTags", '{}')),
  groups: JSON.parse(GM_getValue("groupTags", '{}'))
};
var frogTracks = {
  discuss: JSON.parse(GM_getValue("tracks[discuss]", '{}'))
};

var frogShared = {};



// Functions //
var  dbgLevel = frogVars.debugging.sub.settings.dbgConsole.value,
logging = {
  debug: function(message) {
    if (dbgLevel < 1) {
      console.debug("[SGT DEBUG] ", message);
    }
  },
  info: function(message) {
    if (dbgLevel < 2) {
      console.log("[SGT INFO] ", message);
    }
  },
  warn: function(message) {
    if (dbgLevel < 2) {
      console.warn("[SGT WARN] ", message);
    }
  },
  alert: function(message) {
    console.log("[SGT ALERT] ", message);
  }
},
helpers = {
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
  pageSet: {
    GAList: function() {
      var path = location.pathname;
      return (path === "/"
        || ~path.indexOf("/giveaways/search")
        || ~path.indexOf("/user/")
        || (~path.indexOf("/group/") && !~path.indexOf("/users") && !~path.indexOf("/stats") && !~path.indexOf("/wishlist")));
    },
    CommentList: function() {
      return (~location.pathname.indexOf("/discussion/")
        || ~location.pathname.indexOf("/messages"));
    },
    TableList: function() {
      var path = location.pathname;
      return (!~path.indexOf("/settings/")
        && !~path.indexOf("/about/")
        && !~path.indexOf("/legal/")
        && !~path.indexOf("/stats/")
        && !(~path.indexOf("/giveaway/") && !~path.indexOf("/entries"))
        && !helpers.pageSet.GAList()
        && !helpers.pageSet.CommentList());
    }
  },
  listingPit: {
    cache: {
      wishes: { name: "cache-wish", page: "/account/steam/wishlist/search?page=", touches: ".table__column__secondary-link", list: null },
      white: { name: "cache-white", page: "/account/manage/whitelist/search?page=", touches: ".table__column__heading", list: null },
      black: { name: "cache-black", page: "/account/manage/blacklist/search?page=", touches: ".table__column__heading", list: null }
    },
    getList: function(type, onComplete) {
      logging.debug("Pulling list for " + type);
      var cached = helpers.listingPit.cache[type];

      if (!cached.list) {
        var saved = JSON.parse(GM_getValue(cached.name, null));
        if (saved == null) {
          logging.debug("Entering hell..");
          helpers.listingPit.callbackHell(cached.page, 1, cached.touches, function(result) {
            GM_setValue(cached.name, JSON.stringify(result));
            GM_setValue(cached.name + "-time", Date.now());
            cached.list = result;
            onComplete(result);
          });
        } else {
          logging.debug("Had it saved..");
          cached.list = saved;
          onComplete(saved);
        }
      } else {
        logging.debug("Already loaded..");
        onComplete(cached.list);
      }
    },
    invalidateList: function(type) {
      logging.debug("Invalidating "+ type);
      GM_setValue(helpers.listingPit.cache[type].name, null);
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
          logging.debug('Going deeper..');
          helpers.listingPit.callbackHell(url, ++page, elms, function(result) {
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
    makeRow: function($form, number, isSub, setting, details) {
      var $field;
      switch(details.set.type) {
        case "circle":
          $field = helpers.settings.makeRadio(number, isSub, setting, details);
          break;
        case "square":
          $field = helpers.settings.makeCheck(number, isSub, setting, details);
          break;
        case "number": case "text":
          $field = helpers.settings.makeText(number, isSub, setting, details);
          break;
        case "none":
          $field = helpers.settings.makeEmpty(number, isSub, setting, details);
          break;
        default:
          logging.warn("Cannot determine options type: " + details.set.type);
          return;
      }
      $form.append($field);

      if (details.sub) {
        $field.find(".form__row__indent").children("div").first()
              .append($("<div/>").addClass("form__checkbox is-selected").append($("<a/>").html(details.sub.name))
                                 .on("click", function(ev) { $("#sub_"+setting).toggle(); ev.stopImmediatePropagation(); }));

        var set = "abcde";
        var $subform = $("<div/>").attr("id", "sub_"+setting).css("display", "none").appendTo($form);

        var subkeys = Object.keys(details.sub.settings);
        for(var i=0; i<subkeys.length; i++) {
          var k = subkeys[i];
          if (details.sub.settings.hasOwnProperty(k)) {
            helpers.settings.makeRow($subform, number + set.substring(i,i+1), true, k, details.sub.settings[k]);
          }
        }
      }
    },
    makeHeading: function(number, name, isSub) {
      var $row = $("<div/>").addClass("form__row" + (isSub? " form__row__sub":""));
      $("<div/>").addClass("form__heading")
        .append($("<div/>").addClass("form__heading__number").html(number +"."))
        .append($("<div/>").addClass("form__heading__text").html(name))
        .appendTo($row);
      return $row;
    },
    makeRadio: function(number, isSub, setting, details) {
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

      return helpers.settings.makeHeading(number, details.query, isSub).append($("<div/>").addClass("form__row__indent").append($input));
    },
    makeCheck: function(number, isSub, setting, details) {
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

      return helpers.settings.makeHeading(number, details.query, isSub).append($("<div/>").addClass("form__row__indent").append($input));
    },
    makeText: function(number, isSub, setting, details) {
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

      return helpers.settings.makeHeading(number, details.query, isSub).append($indent.append($desc));
    },
    makeEmpty: function(number, isSub, setting, details) {
      $.each(details.set.opt, function(i, opt) {});

      return helpers.settings.makeHeading(number, details.query, isSub).append($("<div/>").addClass("form__row__indent").append($("<div/>")));
    }
  },
  applyGradients: function(elm, range) {
    elm.css("background-image", "linear-gradient(" + range +")")
      .css("background-image", "-moz-linear-gradient(" + range +")")
      .css("background-image", "-webkit-linear-gradient(" + range +")");
  },
  time: {
    sgString: function(epoch) {
      var end = new Date(epoch * 1000),
          date = end.getDate(),
          month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][end.getMonth()],
          year = end.getFullYear(),
          hour = end.getHours() % 12 || 12,
          minutes = end.getMinutes(),
          meridiem = end.getHours() >= 12 ? "pm" : "am",
          today = new Date(), tomorrow = new Date(), yesterday = new Date();

      today.setHours(0,0,0,0); tomorrow.setHours(0,0,0,0); yesterday.setHours(0,0,0,0);
      tomorrow.setDate(today.getDate()+1); yesterday.setDate(today.getDate()-1);
      end.setHours(0,0,0);

      var etime = end.getTime(),
          close = etime==today.getTime()? "Today":
                  (etime==tomorrow.getTime()? "Tomorrow":
                  (etime==yesterday.getTime()? "Yesterday":null)),
          day = close || (month +" "+ date +", " + year),
          time = ", "+ hour +":"+ ("0"+minutes).slice(-2) + meridiem;

      return day + time;
    },
    relative: function(epoch) {
      var show, interval,
            seconds = Math.floor((new Date() - new Date(epoch*1000)) / 1000);

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

        return show + (interval==1? "":"s");
    }
  },
  markdown: {
    setupShowdown: function() {
      var subExts = [
        {
          // Strip HTML
          type: "lang",
          filter: function(text) {
            return text.replace(/</g, "&lt;");
          }
        },
        {
          // HTTP as link
          type: "lang",
          regex: /(^|\s)(http.*?)(\s|$)/gi,
          replace: "$1[$2]($2)$3"
        },
        {
          // Site-less links as invalid
          type: "lang",
          regex: /(\[.*?])\(\)/g,
          replace: "$1\\(\\)"
        },
        {
          // Strikeout or Spoiler
          type: "lang",
          filter: function(text) {
            return text.replace(/(?:~T){2}([\s\S]+?)(?:~T){2}/g, "<del>$1</del>") //strikethrough
                       .replace(/(?:~T)([\s\S]+?)(?:~T)/g, "<span class='spoiler'>$1</span>"); //spoiler
          }
        },
        {
          // Images as toggle
          type: "lang",
          regex: /!\[(.*)?]\((.+)\)/g,
          replace: "<div>\n<div class='comment__toggle-attached'>View attached image.</div>" +
                    "<a href='$2' rel='nofollow noreferrer' target='_blank'>" +
                    "<img class='is-hidden' alt='$1' title='$1' src='$2'>" +
                    "</a></div>\n<br/>"
        },
        {
          // Images to bottom
          type: "output",
          filter: function(html) {
            var $whole = $("<div/>").append($(html)),
                $images = $whole.find(".comment__toggle-attached").parent().detach();

            $whole.append($images);

            return $whole.html();
          }
        },
        {
          // Fix line breaks
          type: "output",
          filter: function(html) {
            return html.replace(/(<p><br\/?><\/p>|^\n$)/gm, "").replace(/(^(?!.*p>$).+)(<\/(a|span|del|em|code)>|[^>])\n/gm, "$1$2<br/>");
          }
        }
      ];

      showdown.extension("SGMD", function() { return subExts; });
    },
    getConverter: function() {
      if (helpers.markdown.converter == null) {
        helpers.markdown.setupShowdown();
        helpers.markdown.converter = new showdown.Converter({
          tables: true,
          noHeaderId: true,
          simpleLineBreaks: true,
          excludeTrailingPunctuationFromURLs: true,
          extensions: ["SGMD"]
        });
      }

      return helpers.markdown.converter;
    },
    parse: function(raw) {
      return helpers.markdown.getConverter().makeHtml(raw);
    },
    inject: function(selStart, selEnd, raw, pre, post) {
      if (selStart === 0 || raw.charAt(selStart-1) === '\n') { pre = pre.replace(/^\n+/, ''); }

      return raw.slice(0, selStart) + pre + raw.slice(selStart, selEnd) + (post || '') + raw.slice(selEnd);
    },
    button: function(title, icon, pre, post, text) {
      return $("<div/>").addClass("form__add-answer-button").attr('title', title).html("<i class='fa "+ icon +"'></i>" + (text||''))
             .on('click', function(evt) {
               var $text = $(this).parents("form").find("textarea"),
                   selTo = $text.prop("selectionEnd") + pre.length;

               $text.val(helpers.markdown.inject($text.prop("selectionStart"), $text.prop("selectionEnd"), $text.val(), pre, post));

               $text.focus();
               $text.prop("selectionStart", selTo).prop("selectionEnd", selTo);
             });
    }
  }
},

settings = {
  invalidateOnSync: function() {
    if (!frogVars.newBadges.value || !~location.href.indexOf("/profile/sync")) { return; }

    $(".form__sync-default").on("click", function() {
      helpers.listingPit.invalidateList("wishes");
    });
  },
  injectMenu: function(isActive) {
    logging.debug("Adding custom navigation");

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
      .append(helpers.makeTopLink("/ąccount/settings/ribbit", "Settings", "Adjust tool functionality.", "gears", "grey"))
      .append(helpers.makeTopLink("https://github.com/bberenz/sgtfrog/issues", "Feedback", "Report an issue or request a feature.", "github", "green"))
      .append(helpers.makeTopLink("https://www.steamgifts.com/discussion/4C3Cl/userscript-steamgifts-tinkerer-featuring-refined-ostensible-gain", "Discussion", "View the SteamGifts discussion thread.", "square-o", "blue"))
      .appendTo($drop);

    $(".nav__right-container").find(".nav__button-container:not(.nav__button-container--notification)").last().before($menu);

    //inject link on account settings
    var $link = helpers.makeSideLink("/ąccount/settings/ribbit", "SGT frog");
    $(".sidebar__navigation").find("a[href='/account/settings/sales']").parent().after($link);
    if (isActive) {
      $link.addClass("is-selected");
      $link.find(".sidebar__navigation__item__name").before("<i class='fa fa-caret-right'></i>");
    }
  },
  injectPage: function() {
    //SG redirects invalid "/account/" links, so we fake the 'a' to blend in
    if (location.pathname === "/%C4%85ccount/settings/ribbit") {
      logging.info("Creating custom settings page");

      GM_addStyle("body{ background-image: none; background-color: #95A4C0; } " +
                  ".form__row__sub{ margin-left: 2.5em; } " +
                  ".form__row__sub .form__heading__text{ color: #5A89FF; }");

      var $dark = $("style").detach(); //compatibility with dark theme
      $("html").empty();

      //copy an existing page to match layout
      var usePage = "/account/settings/giveaways";

      $.ajax({
        method: "GET",
        url: usePage
      }).done(function(data) {
        //clear copied page out
        var head = data.substring(data.indexOf("<head>")+6, data.indexOf("</head>"))
          .replace(/<script [\s\S]+?<\/script>/g, ""); //remove problematic scripts
        $("<head/>").appendTo("html").append(head);
        $("<body/>").appendTo("html")
          .append(data.substring(data.indexOf("<body>")+6, data.indexOf("</body>")));
        $dark.appendTo("html");

        //pull latest site js
        var jsIndex = data.indexOf("<script src=\"'https://cdn.steamgifts.com/js/minified");
        $("head").append($(data.substring(jsIndex, data.indexOf("</script>", jsIndex))));

        //re-skin
        $(".page__heading__breadcrumbs").children("a").last()
          .html("Sgt Frog").attr("href", "/ąccount/settings/ribbit");
        $(".sidebar__navigation").find("a[href='" + usePage + "']").parent()
          .removeClass("is-selected").find("i").remove();
        $("title").html("Account - Settings - Ribbit");

        //start building our page
        var $form = $(".form__rows");
        $form.empty();

        var keys = Object.keys(frogVars);
        for(var i=0; i<keys.length; i++) {
          var k = keys[i];
          if (frogVars.hasOwnProperty(k)) {
            helpers.settings.makeRow($form, i+1, false, k, frogVars[k]);
          }
        }

        $("<div/>").addClass("form__submit-button")
          .html("<i class='fa fa-arrow-circle-right'></i> Save Changes")
          .on("click", function() { settings.save(frogVars); })
          .appendTo($form);

        logging.debug("Creation complete");

        //after wiping the page we need to reapply relevant custom settings
        window.setTimeout(function() {
          settings.injectMenu(true);
          giveaways.injectNavSearch();

          fixedElements.header();
          fixedElements.sidebar();
          fixedElements.footer();
          $document.scroll();
        }, 500);
      });
    }
  },
  save: function(set) {
    var setVal = function(name, val) {
      logging.debug("Setting "+ name +" to "+ val);
      GM_setValue(name, val);
    };

    var keys = Object.keys(set);
    for(var i=0; i<keys.length; i++) {
      var k = keys[i];
      if (set.hasOwnProperty(k)) {
        if (set[k].set.type === 'text' && set[k].set.opt.length > 1) {
          //treat as JSON
          var compose = {};
          for(var j=0; j<set[k].set.opt.length; j++) {
            var $subinput = $("input[name='"+ k+"_"+j +"']");
            compose[set[k].set.opt[j]] = $subinput.val();
          }

          setVal(k, JSON.stringify(compose));
        } else {
          var $input = $("input[name='"+ k +"']");
          var inputNum = +$input.val();

          if (isNaN(inputNum)) {
            setVal(k, $input.val());
          } else {
            setVal(k, +inputNum);
          }
        }

        if (set[k].sub) {
          settings.save(set[k].sub.settings);
        }
      }
    }

    logging.info("Saved new settings");
    //reload page to apply settings
    window.scrollTo(0,0);
    location.reload();
  }
},
fixedElements = {
  header: function() {
    if (!(frogVars.fixedElms.value & 4)) { return; }

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
    if (!(frogVars.fixedElms.value & 2)) { return; }

    var offset = frogVars.fixedElms.value&4 ? 64 : 25;
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
    if (!(frogVars.fixedElms.value & 1)) { return; }

    GM_addStyle(".footer__outer-wrap.fixed{ position: fixed; bottom: 0; width: 100%; " +
                "  background-color: #95a4c0; z-index: 100; } " +
                ".left-below{ margin-bottom: 45px; }");

    $(".footer__outer-wrap").addClass("fixed");
    $(".page__outer-wrap").addClass("left-below");
  }
},
loading = {
  addSpinner: function($afterElm) {
    $afterElm.after($("<div/>").addClass("pagination__loader").html("<i class='fa fa-spin fa-circle-o-notch'></i>"));
  },
  removeSpinner: function() {
    $(".pagination__loader").remove();
  },
  everyNew: {
    giveawayPage: function($doc) {
      giveaways.injectFlags.wishlist($doc, true);
      giveaways.injectFlags.recent($doc, true);
      giveaways.injectChance($doc);
      giveaways.highlightCopies($doc, true);
      giveaways.injectSearch($doc, true);
      giveaways.hideEntered($doc);
      giveaways.easyHide($doc);
      giveaways.gridForm($doc, true);
      users.profileHover($doc, true);
      users.tagging.show($doc, true);
      users.listIndication($doc, true);
    },
    commentPage: function($doc) {
      users.profileHover($doc, true);
      users.tagging.show($doc, true);
      users.listIndication($doc, true);
      threads.injectTimes($doc);
      threads.tracking.all($doc);
      threads.commentBox.injectEdit($doc);
      loading.imgDemand($doc);
    }
  },
  giveaways: function() {
    //avoid stepping on other loading pages
    if (!(frogVars.loadLists.value & 8) || !helpers.pageSet.GAList()) { return; }

    GM_addStyle(".pagination__loader{ text-align: center; margin-top: 1em; } " +
                ".pagination__loader .fa{ font-size: 2em; } ");

    var page = helpers.fromQuery("page");
    if (page == undefined) { page = 1; }
    $(".widget-container").find(".page__heading").first().after($(".pagination").detach());

    var inload = false;
    $document.on("scroll", function() {
      var nearEdge = ($document.scrollTop() + $(window).height()) / $document.height();
      if (nearEdge >= .90 && !inload) {
        inload = true;
        page++;

        var loc = location.href;
        if (~loc.indexOf("?")) {
          loc = loc.replace(/page=\d+?&?/, ""); //keep other params
        } else {
          if (location.pathname.length == 1) { loc += "/giveaways"; }
          loc += "/search?";
        }

        loading.addSpinner($(".giveaway__row-outer-wrap").last());
        logging.info("Loading next page: "+ page);
        logging.debug("Giveaway: "+ loc +"&page="+ page);

        $.ajax({
          method: 'GET',
          url: loc + "&page=" + page
        }).done(function(data) {
          var $data = $(data);
          loading.everyNew.giveawayPage($data);

          $data.find(".pinned-giveaways__outer-wrap").remove(); //avoid appending pinned every load
          var $nextGiveaways = $data.find(".giveaway__row-outer-wrap").detach();

          var $paging = $data.find(".pagination");
          var $nav = $paging.find(".pagination__navigation");

          if ($nextGiveaways.length === 0 || (~location.href.indexOf("/group/") && $nav.children().last().text().trim() !== 'Last')) {
            logging.info("No more giveaways");
            loading.removeSpinner();

            var lastNum = $nav.children().last().attr("data-page-number");
            if (!lastNum || page-1 == lastNum) {
              return;
            }
          }

          $nav.html("Page " + page);
          $(".giveaway__row-outer-wrap").last().parent()
            .append($paging).append($nextGiveaways);

          inload = false;
          loading.removeSpinner();

          //reapply 'hide giveaway' functionality to newly loaded giveaways
          $.each($nextGiveaways.find(".giveaway__hide"), function(i, elm) {
            $(elm).on('click', function(evt) {
              var $this = $(this);

              $(".popup--hide-games input[name=game_id]").val($this.closest(".giveaway__row-outer-wrap").attr("data-game-id"));
              $(".popup--hide-games .popup__heading__bold").text($this.closest("h2").find(".giveaway__heading__name").text());

              //dirty magic to execute bPopup function on page
              var script = document.createElement('script');
              script.type = "application/javascript";
              script.textContent = '(function(){$(".'+ $this.attr("data-popup") +'").bPopup({opacity:.85,fadeSpeed:200,followSpeed:500,modalColor:"#3c424d",amsl:[0]});})();';

              document.body.appendChild(script).removeChild(script);
            });
          });
        });
      }
    });
  },
  threads: function() {
    if (!(frogVars.loadLists.value & 4) || !~location.href.indexOf("/discussion/")) { return; }
    loading.comments();
  },
  thanks: function() {
    if (!(frogVars.loadLists.value & 2) || !~location.href.indexOf("/giveaway/")) { return; }
    loading.comments();
  },
  comments: function() {
    GM_addStyle(".pagination__loader{ text-align: center; margin-top: 1em; } " +
                ".pagination__loader .fa{ font-size: 2em; } ");

    var page = helpers.fromQuery("page");
    if (page == undefined) { page = 1; }
    var lastPage = $(".pagination__navigation").children().last().attr('data-page-number');
    $(".page__heading").last().after($(".pagination").detach());

    //prevent multiple occurences from cancelling a reply
    $(".js__comment-reply-cancel").on("click", function(e) {
      //SG calls
      $(".comment--submit input[name=parent_id]").val("");
      $(".comment--submit .comment__child").attr("class", "comment__parent");

      //alternate movement calls
      var $box = $(".comment--submit").detach();
      $box.insertAfter($(".comments").last());

      e.stopImmediatePropagation();
    });

    var inload = false;
    $document.on("scroll", function() {
      var nearEdge = ($document.scrollTop() + $(window).height()) / $document.height();
      if (nearEdge >= 0.90 && !inload) {
        inload = true;

        if (page++ < lastPage) {
          var loc = location.href;
          if (~loc.indexOf("?")) {
            loc = loc.replace(/page=\d+?&?/, ""); //keep other params
          } else {
            loc += "/search?";
          }

          loading.addSpinner($(".comments").last());
          logging.info("Loading next page: "+ page +"/"+ lastPage);
          logging.debug("Comment: "+ loc +"&page="+ page);

          $.ajax({
            method: 'GET',
            url: loc +"&page="+ page
          }).done(function(data) {
            var $data = $(data);
            loading.everyNew.commentPage($data);

            var $paging = $data.find(".pagination");
            $paging.find(".pagination__navigation").html("Page " + page);

            $(".comments").last().append($paging)
              .append($data.find(".comments").last().children().detach());

            inload = false;
            loading.removeSpinner();
          });
        }
      }
    });
  },
  tables: function() {
    if (!(frogVars.loadLists.value & 1) || !helpers.pageSet.TableList()) { return; }

    GM_addStyle(".pagination__loader{ text-align: center; margin-top: 1em; } " +
                ".pagination__loader .fa{ font-size: 2em; } ");

    var page = helpers.fromQuery("page");
    if (page == undefined) { page = 1; }
    $(".widget-container").find(".page__heading").first().after($(".pagination").detach());

    var inload = false;
    $document.on("scroll", function() {
      var nearEdge = ($document.scrollTop() + $(window).height()) / $document.height();
      if (nearEdge >= .90 && !inload) {
        inload = true;
        page++;

        var loc = location.href;
        if (~loc.indexOf("?")) {
          loc = loc.replace(/page=\d+?&?/, ""); //keep other params
        } else {
          loc += "/search?";
        }

        loading.addSpinner($(".table__row-outer-wrap").last());
        logging.info("Loading next page: "+ page);
        logging.debug("Table: "+ loc +"&page="+ page);

        $.ajax({
          method: 'GET',
          url: loc +"&page="+ page
        }).done(function(data) {
          var $data = $(data);

          var $paging = $data.find(".pagination");
          var $nav = $paging.find(".pagination__navigation");

          var $nextContent = $data.find(".table__row-outer-wrap").detach();

          if ($nav.children().last().text().trim() !== 'Last') {
            var lastNum = $nav.children().last().attr("data-page-number");
            if (!lastNum || page-1 == lastNum) {
              logging.info("No more content");
              loading.removeSpinner();

              return;
            }
          }

          $nav.html("Page " + page);

          $(".table__row-outer-wrap").last().parent()
            .append($paging).append($nextContent);

          inload = false;
          loading.removeSpinner();
        });
      }
    });
  },
  points: function() {
    if (frogVars.pointInvl.value < 1 || isNaN(frogVars.pointInvl.value)) { return; }
    if (frogVars.pointInvl.value < 15) {
      //minimum 15 sec interval is to protect yourself from too many frequent requests
      logging.alert("Failed to apply defined points interval, using 15 seconds instead");
      frogVars.pointInvl.value = 15;
    }

    window.setInterval(function() {
      logging.debug("Pulling new header values");

      //load a small page to pull current points from
      $.ajax({
        method: "GET",
        url: "/about/brand-assets"
      }).done(function(data) {
        var $data = $(data);

        $(".nav__points").html($data.find(".nav__points").html());
        var $visList = $(".nav__button-container--notification");
        $.each($data.find(".nav__button-container--notification"), function(i, notify) {
          var $currNote = $($visList[i]), $nextNote = $(notify);

          $currNote.html($nextNote.html());
          if ($nextNote.hasClass("nav__button-container--active")) {
            $currNote.removeClass("nav__button-container--inactive").addClass("nav__button-container--active");
          } else {
            $currNote.removeClass("nav__button-container--active").addClass("nav__button-container--inactive");
          }
        });
      });
    }, frogVars.pointInvl.value * 1000);
  },
  imgDemand: function($doc) {
    if (!frogVars.onDemand.value) { return; }

	  $.each($doc.find(".comment__description, .page__description").find("img"), function(i, img) {
      var $this = $(this);

      $this.attr("data-on-demand", $this.attr("src")).attr("src", "");
      $this.parent().siblings(".comment__toggle-attached").on("click", function() {
        $this.attr("src", $this.attr("data-on-demand"));
      });
    });
  }
},
sidebar = {
  removeMyGA: function() {
    if (!frogVars.sideMine.value) { return; }

    var $sidebar = $(".sidebar");
    var $heading = $sidebar.find(".sidebar__heading").last();
    if ($heading.html() === "My Giveaways") {
      $heading.remove();
      $sidebar.find(".sidebar__navigation").last().remove();
    }
  },
  injectSGTools: function() {
    if (!frogVars.userTools.value || !~location.pathname.indexOf("/user/")) { return; }

    var userViewed = location.href.split("/")[4],
        ordering = frogVars.userTools.sub.settings.toolsOrdering.value? "/oldestfirst":"/newestfirst";
    logging.debug("Found user: " + userViewed);

    var $sideentry = $(".sidebar__navigation").last(),
        $tools = $("<ul/>").append(
        helpers.makeSideLink("http://www.sgtools.info/sent/" + userViewed + ordering, "Real Value Sent").find("a").attr("target", "_checkSent"),
        helpers.makeSideLink("http://www.sgtools.info/won/" + userViewed + ordering, "Real Value Won").find("a").attr("target", "_checkWon"),
        helpers.makeSideLink("http://www.sgtools.info/nonactivated/" + userViewed, "Non-Activated").find("a").attr("target", "_checkNon"),
        helpers.makeSideLink("http://www.sgtools.info/multiple/" + userViewed, "Multi Wins").find("a").attr("target", "_checkMulti")
    );

    $("<h3/>").html("SG Tools").addClass("sidebar__heading").insertAfter($sideentry)
      .after($tools.addClass("sidebar__navigation"));
  }
},
giveaways = {
  injectFlags: {
    all: function($doc) {
      if (frogVars.newBadges.value) {
        giveaways.injectFlags.wishlist($doc);
        giveaways.injectFlags.recent($doc);
      }
      if (frogVars.colorBadge.value) {
        giveaways.injectFlags.invite();
        giveaways.injectFlags.region();
        giveaways.injectFlags.whitelist();
        giveaways.injectFlags.group();
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
          helpers.listingPit.invalidateList("wishes");
        }

        //load wishlist to know what gets badged
        helpers.listingPit.getList("wishes", function(wishes) {
          logging.info("Applying badges for "+ wishes.length +" wishes");

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
    if (!frogVars.winPercent.value) { return; }

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
  highlightCopies: function($doc, hasStyle) {
    if (!frogVars.moreCopies.value) { return; }

    if (!hasStyle) {
      var cpyFore = frogVars.moreCopies.sub.settings.moreCopyLabel.value.Foreground || "#F0F2F5",
          cpyBack = frogVars.moreCopies.sub.settings.moreCopyLabel.value.Background || "#6B7A8C"

      if (!~cpyFore.indexOf("#")) { cpyFore = "#"+cpyFore; }
      if (!~cpyBack.indexOf("#")) { cpyBack = "#"+cpyBack; }

      GM_addStyle(".copies__tagged{ text-shadow: none; border-radius: 2px; padding: 1px 2px; " +
                  "  color: "+ cpyFore +"; background-color: "+ cpyBack +"; " +
                  "  font-weight: "+ (frogVars.moreCopies.sub.settings.moreCopyBold.value? 'bold':'inherit') +"; }");
    }

    $.each($doc.find('.giveaway__heading__thin'), function(i, elm) {
      var $elm = $(elm);

      if (~$elm.html().indexOf('Copies')) {
        $elm.addClass("copies__tagged");
      }
    });
  },
  injectEndDate: function() {
    if (!frogVars.realEnd.value || !~location.href.indexOf("/giveaway/")) { return; }

    var $clock = $(".featured__summary").find("span[data-timestamp]").first();
    $clock.parent().append($("<em/>").html(" ("+ helpers.time.sgString(+$clock.attr("data-timestamp")) +")"));
  },
  injectSearch: function($doc, hasStyle) {
    if (!frogVars.searchSame.value || !~location.href.indexOf("/giveaway/")) { return; }

    if (!hasStyle) {
      GM_addStyle(".sidebar__shortcut-inner-wrap div{ padding: 0; } " +
                 ".sidebar__shortcut-inner-wrap .sidebar__error{ border-color: #f0d1dc #e5bccc #d9a7ba #ebbecf; }");
    }

    var $side = $(".sidebar__navigation").parent();
    var $entry = $side.children().first().not(".sidebar__mpu").detach();
    if (!$entry.hasClass("sidebar__error")) {
      $entry.css("background-image", "none").css("border", "none");
    } else {
      helpers.applyGradients($entry, "#f7edf1 0%, #e6d9de 100%");
    }

    $("<div/>").addClass("sidebar__shortcut-inner-wrap")
      .append($("<a/>").addClass("sidebar__entry-loading").css("max-width", ($entry.length>0? "33%":"100%")).html("<i class='fa fa-search'></i> Find Similar")
             .attr("href", "/giveaways/search?q=" + $(".featured__heading__medium").html()))
      .append($entry)
      .appendTo($("<div/>").addClass("sidebar__shortcut-outer-wrap").prependTo($side))
  },
  injectNavSearch: function() {
    if (!frogVars.searchNav.value) { return; }

    var $search = $("<div/>").addClass("sidebar__search-container").css("margin", "0 5px 0 0").css("height", "inherit")
      .append($("<input class='sidebar__search__ga-input' placeholder='Search Giveaways...' value='' type='text' />")
              .css("padding", "0").css("border", "none")
              .on("keypress", function(ev) {
                if (ev.which === 13) {
                  location.href = "/giveaways/search?q="+ $(this).val();
                  ev.stopImmediatePropagation();
                }
              }))
      .append("<i class='fa fa-search'></i>");
    $(".nav__left-container").prepend($search);
  },
  injectWinnerTools: function() {
    if (!frogVars.userTools.value || !~location.pathname.indexOf("/winners")) { return; } //controlled by SGTools sidepanel option
    if ($(".featured__column [href='"+ $(".nav__avatar-outer-wrap").attr("href")+"']").length == 0) { return; } //only inject on your own winner pages

    $.each($(".table__row-outer-wrap"), function(i, row) {
      var $head = $(row).find("p.table__column__heading");
      var user = $head.text();

      $head.css("display", "inline-block")
            .after($("<a/>").addClass("table__column__secondary-link").css("margin-left",".5em").text("(Check multi-wins)")
                            .attr("href", "http://www.sgtools.info/multiple/" + user).attr("target", "_checkMulti"))
            .after($("<a/>").addClass("table__column__secondary-link").css("margin-left", ".5em").text("(Check non-activated)")
                            .attr("href", "http://www.sgtools.info/nonactivated/" + user).attr("target", "_checkNon"));
    });
  },
  hideEntered: function($doc) {
    if (!frogVars.hideEntry.value || ~location.href.indexOf("/user/") || ~location.href.indexOf("/group/")) { return; } //exclude hiding anything on user or group pages
    $doc.find(".is-faded").parent(".giveaway__row-outer-wrap").remove();
  },
  easyHide: function($doc) {
    if (!frogVars.oneHide.value) { return; }

    $doc.find("[data-popup='popup--hide-games']").on("click", function(ev) {
      window.setTimeout(function() {
        $(".js__submit-hide-games").click();
      }, 100);
    });
  },
  gridForm: function($doc, hasStyle) {
    if (!frogVars.gridView.value || !helpers.pageSet.GAList()) { return; }

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
      $wrap.find(".giveaway__summary h2").append($("<h3/>").addClass("giveaway__heading")
                                                 .html($wrap.find(".giveaway__heading").children().not(".giveaway__heading__name").detach()));

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
      switch(frogVars.featuredGA.value) {
        case 0: giveaways.bulkFeatured.hidden(); break;
        case 1: giveaways.bulkFeatured.expanded(); break;
        default: giveaways.bulkFeatured.injectCollapsable(); break;
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
      giveaways.bulkFeatured.injectCollapsable();
      $(".pinned-giveaways__inner-wrap").removeClass("pinned-giveaways__inner-wrap--minimized");
      $(".pinned-giveaways__button-expand").hide();
      $(".pinned-giveaways__button-collapse").show();
    }
  },
  activeThreads: {
    find: function() {
      switch(frogVars.activeTalk.value) {
        case 0: giveaways.activeThreads.hidden(); break;
        case 1: giveaways.activeThreads.sidebar(); break;
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

        $list.append(helpers.makeSideLink($topic.attr("href"), $topic.html(),
                                               $thread.find(".table__column--width-small").find("a").html(),
                                               "by "+ $origin.find("a").last().html()));
      });

      $("<h3/>").addClass("sidebar__heading").html("Active Discussions")
        .insertAfter($sideentry).after($list);

      giveaways.activeThreads.hidden();
    }
  }
},
threads = {
  commentBox: {
    injectHelpers: function($commenter) {
      var $row = $("<div/>").addClass("align-button-container align-button-container-top"),
          containClass = "button-container",
          fnBtn = helpers.markdown.button;

      $row.append($("<div/>").addClass(containClass)
                  .append(fnBtn('Bold', 'fa-bold', '**', '**'))
                  .append(fnBtn('Italic', 'fa-italic', '*', '*'))
                  .append(fnBtn('Strikethrough', 'fa-strikethrough', '~~', '~~')))
          .append($("<div/>").addClass(containClass)
                  .append(fnBtn('Link', 'fa-link', '[', '](URL)'))
                  .append(fnBtn('Image', 'fa-image', '![HOVER](', ')')))
          .append($("<div/>").addClass(containClass)
                  .append(fnBtn('Quote', 'fa-quote-left', '\n> '))
                  .append(fnBtn('Spoiler', 'fa-user-secret', '~', '~'))
                  .append(fnBtn('Code', 'fa-code', '`', '`')))
          .append($("<div/>").addClass(containClass)
                  .append(fnBtn('Bullet List', 'fa-list-ul', '\n* '))
                  .append(fnBtn('Number List', 'fa-list-ol', '\n0. '))
                  .append(fnBtn('Horizontal List', 'fa-ellipsis-h', '\n\n---\n\n')))
          .append($("<div/>").addClass(containClass)
                  .append(fnBtn('Heading One', 'fa-header', '\n# ', null, '1'))
                  .append(fnBtn('Heading Two', 'fa-header', '\n## ', null, '2'))
                  .append(fnBtn('Heading Three', 'fa-header', '\n### ', null, '3')))
          .append($("<div/>").addClass(containClass)
                  .append(fnBtn('Table', 'fa-table', '| Head | Head |\n| -- | -- |\n| ', ' | Cell |')));

      $commenter.find("textarea").before($row);
    },
    injectPageHelpers: function() {
      if (!frogVars.formatting.value || (!~location.href.indexOf("/discussion") && !~location.href.indexOf("/giveaway/"))) { return; }

      GM_addStyle(".button-container{ display: flex; } " +
                  ".align-button-container-top{ margin-bottom: 5px; }");

      $.each($(".comment--submit, .page__description, .form__rows"), function(i, elm) {
        threads.commentBox.injectHelpers($(elm));
      });
    },
    injectPreview: function($commenter) {
      var previewing = false,
          $desc = $commenter.find("textarea[name='description']"),
          $previewBtn = $("<div/>").addClass("comment__submit-button").text("Preview"),
          $preview = $("<div/>").addClass("comment__description markdown markdown--resize-body"),
          $helpers = $(".align-button-container-top");

      //special treatment for new discussion
      if ($commenter.hasClass("form__rows")) {
        $("<div/>").addClass("align-button-container").append($(".form__submit-button").detach()).append($previewBtn).insertAfter($(".form__row").last());
      } else {
        $commenter.find(".comment__submit-button, .page__description__save").last().after($previewBtn);
      }

      $desc.after($preview);

      var toggle = function(show) {
        if (show) {
          $previewBtn.text("Edit");
          $desc.hide();
          $helpers.hide();
          $preview.show();
          $preview.html(helpers.markdown.parse($desc.val()));
        } else {
          $previewBtn.text("Preview");
          $desc.show();
          $helpers.show();
          $preview.hide();
        }
      };

      $previewBtn.on("click", function() {
        toggle(!previewing);
        previewing = !previewing;
      });

      //reset state on description save/cancel
      $commenter.find(".page__description__save, .page__description__cancel, .js__comment-edit-save, .comment__cancel-button").on("click", function() {
        toggle(false);
      });
    },
    injectPagePreview: function() {
      if (!frogVars.preview.value || (!~location.href.indexOf("/discussion") && !~location.href.indexOf("/giveaway/"))) { return; }

      $.each($(".comment--submit, .page__description, .form__rows"), function(i, elm) {
        threads.commentBox.injectPreview($(elm));
      });
    },
    injectEdit: function($doc) {
      if (!~location.href.indexOf("/discussion") && !~location.href.indexOf("/giveaway/")) { return; }

      $.each($doc.find(".js__comment-edit"), function(i, elm) {
        $(elm).on("click.initial", function(e) {
          var $this = $(this),
              $editor = $this.parent().siblings(".comment__edit-state");

          if (frogVars.formatting.value) {
            threads.commentBox.injectHelpers($editor);
          }
          if (frogVars.preview.value) {
            threads.commentBox.injectPreview($editor);
          }

          $this.off("click.initial"); //stays on the page after clicking edit, no need to continuously add
        });
      });
    }
  },
  //NOTE: needs delayed from page load
  collapseDiscussion: function() {
    if (!frogVars.collapsed.value || !~location.href.indexOf("/discussion/")) { return; }

    var page = helpers.fromQuery("page");
    if (page && page > 1) {
      $(".comment__collapse-button").first().trigger("click");
    }
  },
  injectTimes: function($doc) {
    if (!~location.href.indexOf("/discussion/")) { return; }

    $.each($doc.find(".comment__actions"), function(i, elm) {
      var $edit = $($(elm).children().first().children()[1]);

      if ($edit.length) {
        $edit.html(" <strong>*Edited: "+ helpers.time.relative(+$edit.attr("data-timestamp")) +" ago</strong>");
      }
    });
  },
  tracking: {
    all: function($doc) {
      if (frogVars.tracking.value && ~location.pathname.indexOf("/discussions")) { threads.tracking.lists("discuss"); }
      if (frogVars.tracking.value && ~location.pathname.indexOf("/discussion/")) { threads.tracking.posts("discuss", $doc); }
    },
    lists: function(set) {
      var $rows = $(".table__row-outer-wrap");
      logging.debug("Found "+ $rows.length +" rows");
      $.each($rows, function(i, row) {
        var $comment = $(row).find(".table__column--width-small").find("a");
        var at = $comment.attr("href").indexOf("/", 1) + 1;
        var tag = $comment.attr("href").substring(at, at + 5);

        var count = "Unread";
        if (frogTracks[set][tag]) {
          //find and show diffrence in read comments
          count = '+' + (+($comment.text().replace(/,/g, "")) - frogTracks[set][tag].length);
        }

        if (count != '+0') {
          $comment.append(" <span class='icon-green'>("+ count +")</span>");
        }
      });
    },
    posts: function(set, $doc) {
      var tag = location.href.split("/")[4];
      if (!frogTracks[set][tag]) { frogTracks[set][tag] = []; }
      logging.debug("Looking for unread posts in "+ tag);

      var findings = 0;
      var $comments = $doc.find(".comment");
      $.each($comments, function(i, comment) {
        var $summary = $(comment).find(".comment__summary").first();
        var id = $summary.attr("id");

        if (id && !~frogTracks[set][tag].indexOf(id)) {
          frogTracks[set][tag].push(id);
          var $when = $summary.find(".comment__actions").find("span");
          $when.parent().addClass("icon-green").attr("title", 'New ' + $when.attr("title"));
          findings++;
        }
      });

      logging.info("Found "+ findings +" unread posts");
      GM_setValue("tracks["+ set +"]", JSON.stringify(frogTracks[set]));
    }
  }
},
users = {
  profileHover: function($doc, hasStyle) {
    profiles.hover(true, $doc, hasStyle);
  },
  tagging: {
    show: function($doc, hasStyle) {
      if (!frogVars.customTags.value || ~location.pathname.indexOf('/user/')) { return; }

      if (!hasStyle) {
        GM_addStyle(".user__tagged{ text-decoration: none; border-radius: 4px; padding: 2px 4px; margin-left: .5em; background-color: rgba(0,0,0,.01); " +
                    "  text-shadow: none; box-shadow: 1px 1px 1px rgba(0,0,0,0.5) inset, -1px -1px 1px rgba(255,255,255,0.5) inset; } ");
      }

      $.each(Object.keys(frogTags.users), function(i, taglet) {
        $doc.find("a[href='/user/"+ taglet +"']").not(".global__image-outer-wrap").append(
          $("<span/>").addClass("user__tagged").html("<i class='fa fa-tag fa-flip-horizontal'></i> "+ frogTags.users[taglet])
        );
      });
    },
    injectEditor: function(user, isHover) {
      if (!frogVars.customTags.value || (!~location.pathname.indexOf('/user/') && !isHover)) { return; }
      if (~user.indexOf("/user/")) { user = user.substring(6); }
      if (user == $(".nav__avatar-outer-wrap").attr("href").substring(6)) { return; } //don't tag self

      profiles.editor(isHover, "user", "users", user);
    }
  },
  listIndication: function($doc, hasStyle) {
    if (!frogVars.userLists.value || ~location.pathname.indexOf('/user/')) {
      return; //not active on user pages for obvious reasons
    }

    if (!hasStyle) {
      var wlFore = frogVars.userLists.sub.settings.userWhite.value.Foreground || "#2A2",
          wlBack = frogVars.userLists.sub.settings.userWhite.value.Background || "#FFF",
          blFore = frogVars.userLists.sub.settings.userBlack.value.Foreground || "#C55",
          blBack = frogVars.userLists.sub.settings.userBlack.value.Background || "#000";

      if (!~wlFore.indexOf("#")) { wlFore = "#"+wlFore; }
      if (!~wlBack.indexOf("#")) { wlBack = "#"+wlBack; }
      if (!~blFore.indexOf("#")) { blFore = "#"+blFore; }
      if (!~blBack.indexOf("#")) { blBack = "#"+blBack; }

      //using !important selector on 'color' to override the :not(.comment__username--op) selector color
      GM_addStyle("a.user__whitened{ background-color: "+ wlBack +"; color: "+ wlFore +" !important; border-radius: 4px; padding: 3px 5px; text-shadow: none; } " +
                  "a.user__blackened{ background-color: "+ blBack +"; color: "+ blFore +" !important; border-radius: 4px; padding: 3px 5px; text-shadow: none; } ");
    }

    helpers.listingPit.getList("white", function(whitened) {
      logging.info("Applying white to "+ whitened.length +" users");

      $.each(whitened, function(i, white) {
        $doc.find("a[href='"+ white +"']").not(".global__image-outer-wrap").addClass("user__whitened")
          .attr("title", "Whitelisted user").prepend("<i class='fa fa-star-o'></i> ");
      });
    });

    helpers.listingPit.getList("black", function(blackened) {
      logging.info("Applying black to "+ blackened.length +" users");

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
      helpers.listingPit.invalidateList("white");
      helpers.listingPit.getList("black", function(blackened) {
        //check if they also swapped lists
        if (blackened.indexOf(user) > -1) {
          helpers.listingPit.invalidateList("black");
        }
      });

      if (isHover) {
        var href = "a[href='"+ user +"']",
            $name = $(href).not(".global__image-outer-wrap").not($(".hover-panel__outer-wrap").find(href));

        $name.attr("title", "").removeClass("user__blackened").toggleClass("user__whitened").find("i").not(".fa-tag").remove();
        if ($name.hasClass("user__whitened")) {
          $name.attr("title", "Whitelisted user").prepend("<i class='fa fa-star-o'></i> ");
        }
      }
    });

    $(".sidebar__shortcut__blacklist").on("click", function() {
      helpers.listingPit.invalidateList("black");
      helpers.listingPit.getList("white", function(whitened) {
        //check if they also swapped lists
        if (whitened.indexOf(user) > -1) {
          helpers.listingPit.invalidateList("white");
        }
      });

      if (isHover) {
        var href = "a[href='"+ user +"']";
        var $name = $(href).not(".global__image-outer-wrap").not($(".hover-panel__outer-wrap").find(href));

        $name.attr("title", "").removeClass("user__whitened").toggleClass("user__blackened").find("i").not(".fa-tag").remove();
        if ($name.hasClass("user__blackened")) {
          $name.attr("title", "Blacklisted user").prepend("<i class='fa fa-ban'></i> ");
        }
      }
    });
  }
},
groups = {
  profileHover: function($doc, hasStyle) {
    profiles.hover(false, $doc, true); //hasStyle true, as user hover (joint feature) will provide it
  },
  tagging: {
    show: function() {
      if (!frogVars.customTags.value || ~location.pathname.indexOf('/group/')) { return; }

      GM_addStyle(".group__tagged{ text-decoration: none; border-radius: 4px; padding: 2px 4px; margin-left: .5em; background-color: rgba(0,0,0,.01); " +
                  "  text-shadow: none; box-shadow: 1px 1px 1px rgba(0,0,0,0.5) inset, -1px -1px 1px rgba(255,255,255,0.5) inset; } ");

      $.each(Object.keys(frogTags.groups), function(i, taglet) {
        $document.find("a[href='/group/"+ taglet +"']").not(".global__image-outer-wrap").append(
          $("<span/>").addClass("group__tagged").html("<i class='fa fa-tag fa-flip-horizontal'></i> "+ frogTags.groups[taglet])
        );
      });
    },
    injectEditor: function(group, isHover) {
      if (!frogVars.customTags.value || (!~location.pathname.indexOf('/group/') && !isHover)) { return; }
      if (~group.indexOf("/group/")) { group = group.substring(6); }

      profiles.editor(isHover, "group", "groups", group);
    }
  }
},
profiles = {
  hover: function(isUser, $doc, hasStyle) {
    if (!frogVars.hoverInfo.value) { return; }

    var img = 64, pad = 5;
    var width = 360, height = 160;
    if (!hasStyle) {
      GM_addStyle(".hover-panel__outer-wrap{ position: absolute; width: "+ width +"px; height: "+ height +"px; color: #21262f; } " +
                  ".hover-panel__inner-wrap{ position: relative; width:100%; height: 100%; } " +
                  ".hover-panel__image{ position: absolute; top: 0; left: 0; width: "+ img +"px; height: "+ img +"px; " +
                  "  border-radius: 5px; } " +
                  ".hover-panel__corner{ position: absolute; top: "+ (img+pad) +"px; bottom: 0; left: 0; right: "+ (width-(img+pad)) +"px; " +
                  "  padding: 5px; background-color: #465670; border-radius: 3px 0 0 3px; } " +
                  ".hover-panel__corner .hover-panel__icon-load{ font-size: 5em; color: rgba(255,255,255,0.6); } " +
                  ".hover-panel__corner .sidebar__shortcut-inner-wrap{ display: block; } " +
                  ".hover-panel__corner .sidebar__shortcut__whitelist{ margin: 0 0 5px 0; }" +
                  ".hover-panel__stats{ position: absolute; top: 0; bottom: 0; left: "+ (img+pad) +"px; right: 0; " +
                  "  padding: 5px; background-color: #465670; border-radius: 3px 3px 3px 0; } " +
                  ".hover-panel__stats .featured__heading__medium{ font-size: 16px; } " +
                  ".hover-panel__stats .featured__heading{ margin-bottom: 0; } " +
                  ".hover-panel__stats .featured__table__column{ margin: 0; } ");
    }

    var $box = frogShared.hoverOuter;
    if ($box == null) {
      var $box = $("<div/>").addClass("global__image-outer-wrap hover-panel__outer-wrap").appendTo($("body")).hide();
      frogShared.hoverOuter = $box;

      var $hoverbox = $("<div/>").addClass("hover-panel__inner-wrap").appendTo($box);
      $("<a/>").addClass("hover-panel__link").append($("<div/>").addClass("hover-panel__image")).appendTo($hoverbox);
      $("<div/>").addClass("hover-panel__corner").appendTo($hoverbox);
      $("<div/>").addClass("hover-panel__stats").appendTo($hoverbox);
    }

    var hoverTime, lastLoad = null,
        $userAvs = $doc.find(".global__image-outer-wrap--avatar-small").not(".global__image-outer-wrap--missing-image").children();

    $.each($userAvs, function(i, av) {
      var $av = $(av);
      if ((isUser && !~$av.parent().attr("href").indexOf("/user/"))
        || (!isUser && !~$av.parent().attr("href").indexOf("/group/"))) { return; }

      $av.hover(function(ev) {
        var $this = $(this);

        if (hoverTime) {
          window.clearTimeout(hoverTime);
          hoverTime = null;
        }
        hoverTime = window.setTimeout(function() {
          var $parent = $this.parent();

          //reset box for new load (unless same profile)
          if ($parent.attr("href") != lastLoad) {
            var $userimage = $box.find(".hover-panel__link"),
                $userstats = $box.find(".hover-panel__stats"),
                $usercorner = $box.find(".hover-panel__corner");

            $userimage.attr("href", $parent.attr("href"));
            $userimage.find("div").css("background-image", $this.css("background-image"));
            helpers.applyGradients($userstats.html(""), "#515763 0%, #2f3540 100%");
            helpers.applyGradients($usercorner.html($("<i/>").addClass("hover-panel__icon-load fa fa-spin fa-circle-o-notch")), "#424751 0%, #2f3540 100%");

            $.ajax({
              method: "GET",
              url: $parent.attr("href")
            }).done(function(data) {
              var $data = $(data);
              lastLoad = $parent.attr("href");

              //apply role colors
              var $suspension = $data.find(".sidebar__suspension"),
                  $userrole = $data.find("[href^='/roles/']").text(),
                  $username = $("<div/>").addClass("featured__table__row__left").html($data.find(".featured__heading"));

              if ($suspension.length) {
                var $time = $data.find(".sidebar__suspension-time");
                $username.find(".featured__heading__medium").css("color", "#000")
                         .attr("title", $suspension.text() + ($time.length? (": "+ $time.text()):""));
              } else {
                var colorSet = { "Guest": "#777", "Member": "#FFF", "Bundler": "#FBF", "Developer": "#BDF", "Support": "#FF6", "Moderator": "#AF6", "Super Mod": "#6FA", "Admin": "#6FF"};
                $username.find(".featured__heading__medium").css("color", colorSet[$userrole]).attr("title", $userrole);
              }

              var base = $data.find(".featured__outer-wrap--user").css("background-color"),
                  accent = $data.find(".featured__table__row__right").find("a").css("color"),
                  $buttons = $data.find(".sidebar__shortcut-inner-wrap");

              // bit of custom brightening since groups have no accent color
              if (accent == null) {
                var bright = base.substring(4, base.length-1).split(", ");
                for(var i=0; i<bright.length; i++) {
                  bright[i] = (+bright[i] + 30) * 3;
                  if (bright[i] > 255) { bright[i] = 255; }
                }
                accent = "rgb("+ bright.join() +")";
              }

              $buttons.find(".js__submit-form-inner").remove();
              $buttons.find("a").remove();
              $usercorner.html($buttons);
              helpers.applyGradients($usercorner, accent +" -120%, "+ base +" 65%");

              var $columns = $data.find(".featured__table__column");
              $userstats.append((isUser? $columns.last():$columns.first())
                        .prepend($("<div/>").addClass("featured__table__row").css("padding-top", "0").append($username)
                        .append(isUser? $data.find(".featured__table__column").first().find(".featured__table__row__right")[2]:null)));
              helpers.applyGradients($userstats, accent +" -20%, "+ base +" 80%");

              if (isUser) {
                var user = $parent.attr("href");
                users.listenForLists(user, true);
                users.tagging.injectEditor(user, true);
              } else {
                var group = $parent.attr("href").substring(7);
                groups.tagging.injectEditor(group, true);
              }
            });
          } else {
            users.listenForLists(lastLoad, true); //removed when hidden, so re-add on showing same profile
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
    });

    $(".hover-panel__outer-wrap").on("mouseleave", function() {
      $box.hide();

      $(".sidebar__shortcut__whitelist").off("click");
      $(".sidebar__shortcut__blacklist").off("click");
    });
  },
  editor: function(isHover, setName, tagKey, tagTarget) {
    logging.debug("Applying editor for " + setName + " on key " + tagTarget);

    var tag = frogTags[tagKey][tagTarget] || "Add Tag",
        ielm = "<i class='fa fa-tag fa-flip-horizontal' style='font-size: 14px;'></i> ";

    $("<div/>").attr("href", "#").html("<a>"+ ielm + tag +"</a>")
      .css("color", $(".featured__table__row__right").find("a").css("color") || $(".featured__table__row__right").css("color"))
      .on("click", function(ev) {
        var $div = $(this);
        if ($div.children("input").length) { return; } //don't reset input if already set

        $div.html("<input type='text' placeholder='Custom Tag' value='"+ (frogTags[tagKey][tagTarget] || "") +"' maxlength='16' />")
            .on("keypress", function(ev) {

          var $this = $(this),
              code = ev.which || ev.keyCode;

          if (code == 13) {
            var val = $(this).children("input").val();
            $div.html("<a>"+ ielm + (val || "Add Tag") +"</a>");
            $("a[href='/"+ setName +"/"+ tagTarget +"']").find("."+ setName +"__tagged").remove();

            logging.debug("Changing " + setName + " value to " + val);

            //reload frogTags in case it changed on another tab
            frogTags[tagKey] = JSON.parse(GM_getValue(setName +"Tags", '{}'));

            if (val) {
              frogTags[tagKey][tagTarget] = val;

              if (isHover) {
                $("a[href='/"+ setName +"/"+ tagTarget +"']").not(".global__image-outer-wrap").append(
                  $("<span/>").addClass(setName +"__tagged").html("<i class='fa fa-tag fa-flip-horizontal'></i> "+ frogTags[tagKey][tagTarget])
                );
                $(".hover-panel__outer-wrap").find("."+ setName +"__tagged").remove();
              }
            } else {
              delete frogTags[tagKey][tagTarget];
            }

            GM_setValue(setName +"Tags", JSON.stringify(frogTags[tagKey]));

            $this.off("keypress");
          } else if (code == 27) {
            $div.html("<a>"+ ielm + (frogTags[tagKey][tagTarget] || "Add Tag") +"</a>");
            $this.off("keypress");
          }
        });

        //highlight text on focus, reset on blur
        $div.find("input").select().focus().on("blur", function() {
          $(this).parent().off("keypress");
          $div.html("<a>"+ ielm + (frogTags[tagKey][tagTarget] || "Add Tag") +"</a>");
        });
      }).insertAfter((isHover? ".hover-panel__outer-wrap ":"") + ".featured__heading__medium");
  }
};
pointless = {
  kccode: function() {
    GM_addStyle("*{ direction: rtl; } ");
    $(".fa").addClass("fa-spin");
  }
}
;


// SETUP //
(function(){
  try {
    settings.injectPage();
    settings.injectMenu();
    settings.invalidateOnSync();

    fixedElements.header();
    fixedElements.sidebar();
    fixedElements.footer();

    loading.threads();
    loading.thanks();
    loading.giveaways();
    loading.tables();
    loading.points();
    loading.imgDemand($document);

    giveaways.injectFlags.all($document);
    giveaways.injectChance($document);
    giveaways.highlightCopies($document);

    giveaways.injectSearch($document);
    giveaways.injectNavSearch();
    giveaways.hideEntered($document);
    giveaways.easyHide($document);
    giveaways.gridForm($document);
    giveaways.activeThreads.find();
    giveaways.injectWinnerTools();

    sidebar.removeMyGA();
    sidebar.injectSGTools();

    threads.injectTimes($document);
    threads.tracking.all($document);
    threads.commentBox.injectPageHelpers();
    threads.commentBox.injectPagePreview();
    threads.commentBox.injectEdit($document);

    users.profileHover($document);
    users.tagging.show($document);
    users.tagging.injectEditor($(".featured__heading__medium").text());
    users.listIndication($document);
    users.listenForLists($(".featured__heading__medium").text());

    groups.profileHover($document);
    groups.tagging.show();
    groups.tagging.injectEditor(location.pathname.substring(location.pathname.indexOf("/group/")+7));


    window.setTimeout(function() {
      $document.scroll();

      try {
        giveaways.bulkFeatured.find();
        threads.collapseDiscussion();

        giveaways.injectEndDate();
      }
      catch(err) {
        logging.alert(err);
      }
    }, 100);
  }
  catch(err) {
    logging.alert(err);
  }
})();


var kc = [38, 38, 40, 40, 37, 39, 37, 39, 98, 97], kcAt = 0;
$document.on("keypress", function(event) {
  if (event.keyCode == kc[kcAt] || event.which == kc[kcAt]) {
    if (++kcAt == kc.length) {
      console.log('[RIBBIT] - Command received - Iniitiating sequence..');
      pointless.kccode();
    }
  } else {
    kcAt = 0;
  }
});

console.log("[RIBBIT] - SGT Mode Activated!");

})();
