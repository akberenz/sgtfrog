/*!
// ==UserScript==
// @name         SteamGifts Tinkerer, Featuring Refined Ostensible Gain
// @namespace    https://github.com/bberenz/sgtfrog
// @description  SteamGifts.com user controlled enchancements
// @icon         https://raw.githubusercontent.com/bberenz/sgtfrog/master/keroro.gif
// @include      *://*.steamgifts.com/*
// @version      1.0.0-alpha.23
// @downloadURL  https://raw.githubusercontent.com/bberenz/sgtfrog/master/sgtfrog.user.js
// @updateURL    https://raw.githubusercontent.com/bberenz/sgtfrog/master/sgtfrog.meta.js
// @require      https://code.jquery.com/jquery-1.12.3.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/showdown/1.7.6/showdown.min.js
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
var frogVars = {
  //Site related
  general: {
    fixedElms: {
      key: "fixedElms", value: GM_getValue("fixedElms", 6), query: "Set fixed elements:",
      set: { type: "square", options: ["Header", "Sidebar", "Footer"] }
    },
    loadLists: {
      key: "loadLists", value: GM_getValue("loadLists", 15), query: "Continuously load:",
      set: { type: "square", options: ["Giveaways", "Discussions", "Comments", "General Content"] }
    },
    searchNav: {
      key: "searchNav", value: GM_getValue("searchNav", 0), query: "Show the giveaway search bar in the top navigation?",
      set: { type: "circle", options: ["Yes", "No"] }
    },
    pointInvl: {
      key: "pointInvl", value: GM_getValue("pointInvl", 0), query: "Regularly update header values (points, messages, etc.)?",
      set: { type: "number", options: ["Seconds"], about: "Value in seconds, enter 0 to disable. (Minimum 15 seconds)" }
    }
  },
  //Giveaway lists related
  lists: {
    _name: "Giveaway Listings",
    gridView: {
      key: "gridView", value: GM_getValue("gridView", 0), query: "Show giveaways in a grid view?",
      set: { type: "circle", options: ["Yes", "No"] }
    },
    featuredGA: {
      key: "featuredGA", value: GM_getValue("featuredGA", 2), query: "Show featured giveaways section?",
      set: { type: "circle", options: ["Yes", "Expanded", "No"] }
    },
    hideEntry: {
      key: "hideEntry", value: GM_getValue("hideEntry", 1), query: "Hide entered giveaways?",
      set: { type: "circle", options: ["Yes", "No"] }
    },
    oneHide: {
      key: "oneHide", value: GM_getValue("oneHide", 0), query: "Skip confirmation when hiding games?",
      set: { type: "circle", options: ["Yes", "No"] }
    },
    winPercent: {
      key: "winPercent", value: GM_getValue("winPercent", 1), query: "Show giveaway win percentage?",
      set: { type: "circle", options: ["Yes", "No"] }
    },
    moreFilters: {
      key: "moreFilters", value: GM_getValue("moreFilters", 1), query: "Show giveaway filtering?",
      set: { type: "circle", options: ["Yes", "No"] }
    },
    moreCopies: {
      key: "moreCopies", value: GM_getValue("moreCopies", 1), query: "Make multiple copy giveaways stand out?",
      set: { type: "circle", options: ["Yes", "No"] },
      sub: {
        moreCopyBold: {
          key: "moreCopyBold", value: GM_getValue("moreCopyBold", 1), query: "Bold text:",
          set: { type: "circle", options: ["Yes", "No"] }
        },
        moreCopyLabel: {
          key: "moreCopyLabel", value: JSON.parse(GM_getValue("moreCopyLabel", '{"Foreground": "", "Background": ""}')), query: "Text color:",
          set: { type: "text", options: ["Foreground", "Background"], about: 'Enter value as hexadecimal color, leave blank for defaults.' }
        }
      }
    },
    newBadges: {
      key: "newBadges", value: GM_getValue("newBadges", 1), query: "Show additional giveaway badges?",
      set: { type: "circle", options: ["Yes", "No"] }
    },
    colorBadge: {
      key: "colorBadge", value: GM_getValue("colorBadge", 1), query: "Recolor standard giveaway badges?",
      set: { type: "circle", options: ["Yes", "No"] }
    },
    sideMine: {
      key: "sideMine", value: GM_getValue("sideMine", 0), query: "Hide 'My Giveaways' in the sidebar? (Still available under nav dropdown)",
      set: { type: "circle", options: ["Yes", "No"] }
    },
    activeTalk: {
      key: "activeTalk", value: GM_getValue("activeTalk", 2), query: "Show the 'Active Discussions' section?",
      set: { type: "circle", options: ["Yes", "Sidebar", "No"] },
      sub: {
        activeTalkSide: {
          key: "activeTalkSide", value: GM_getValue("activeTalkSide", 2), query: "Sections shown in sidebar:",
          set: { type: "square", options: ["Discussions", "Deals"], about: "Only applies if 'Sidebar' option is selected" }
        }
      }
    }
  },
  //Giveaway page related
  detail: {
    _name: "Giveaway Pages",
    searchSame: {
      key: "searchSame", value: GM_getValue("searchSame", 1), query: "Show buttons to quickly search for similar giveaways?",
      set: { type: "circle", options: ["Yes", "No"] }
    },
    realEnd: {
      key: "realEnd", value: GM_getValue("realEnd", 0), query: "Show actual end time on giveaway page?",
      set: { type: "circle", options: ["Yes", "No"] }
    },
    allGroup: {
      key: "allGroup", value: GM_getValue("allGroup", 0), query: "Show all groups on giveaway pages?",
      set: { type: "circle", options: ["Yes", "No"] }
    }
  },
  //Comment thread related
  threads: {
    _name: "Comment Threads",
    collapsed: {
      key: "collapsed", value: GM_getValue("collapsed", 1), query: "After first page, collapse original discussion post?",
      set: { type: "circle", options: ["Yes", "No"] }
    },
    reversed: {
      key: "reversed", value: GM_getValue("reversed", 0), query: "Reverse comment threads (newest first)?",
      set: { type: "circle", options: ["Yes", "No"] }
    },
    commentTop: {
      key: "commentTop", value: GM_getValue("commentTop", 0), query: "Show comment box at the top of threads?",
      set: { type: "circle", options: ["Yes", "No"] }
    },
    onDemand: {
      key: "onDemand", value: GM_getValue("onDemand", 0), query: "Only load attached images on demand?",
      set: { type: "circle", options: ["Yes", "No"] }
    },
    tracking: {
      key: "tracking", value: GM_getValue("tracking", 0), query: "Track read comments and topics on discussions?",
      set: { type: "circle", options: ["Yes", "No"] }
    },
    pinning: {
      key: "pinning", value: GM_getValue("pinning", 1), query: "Allow discussions to be pinned?",
      set: { type: "circle", options: ["Yes", "No"] }
    },
    formatting: {
      key: "formatting", value: GM_getValue("formatting", 1), query: "Show quick format buttons on comment box?",
      set: { type: "circle", options: ["Yes", "No"] }
    },
    preview: {
      key: "preview", value: GM_getValue("preview", 1), query: "Allow preview of posts before submitting?",
      set: { type: "circle", options: ["Yes", "No"] }
    }
  },
  //User and group related
  social: {
    _name: "Users and Groups",
    hoverInfo: {
      key: "hoverInfo", value: GM_getValue("hoverInfo", 1), query: "Show profile details on avatar hover?",
      set: { type: "circle", options: ["Yes", "No"] }
    },
    customTags: {
      key: "customTags", value: GM_getValue("customTags", 1), query: "Allow tagging of users and groups?",
      set: { type: "circle", options: ["Yes", "No"] }
    },
    userLists: {
      key: "userLists", value: GM_getValue("userLists", 1), query: "Label black-/white- listed users?",
      set: { type: "circle", options: ["Yes", "No"] },
      sub: {
        userColor: {
          key: "userColor", value: GM_getValue("userColor", 1), query: "Apply colors to usernames?",
          set: { type: "circle", options: ["Yes", "No"] }
        },
        userWhite: {
          key: "userWhite", value: JSON.parse(GM_getValue("userWhite", '{"Foreground": "", "Background": ""}')), query: "Whitelisted label colors:",
          set: { type: "text", options: ["Foreground", "Background"], about: "Enter value as hexadecimal color, leave blank for defaults." }
        },
        userBlack: {
          key: "userBlack", value: JSON.parse(GM_getValue("userBlack", '{"Foreground": "", "Background": ""}')), query: "Blacklisted label colors:",
          set: { type: "text", options: ["Foreground", "Background"], about: "Enter value as hexadecimal color, leave blank for defaults." }
        }
      }
    },
    userStats: {
      key: "userStats", value: GM_getValue("userStats", 1), query: "Provide more visibility on user stats?",
      set: { type: "circle", options: ["Yes", "No"] }
    },
    userTools: {
      key: "userTools", value: GM_getValue("userTools", 1), query: "Show SGTools links on user and winner pages?",
      set: { type: "circle", options: ["Yes", "No"] },
      sub: {
        toolsOrdering: {
          key: "toolsOrdering", value: GM_getValue("toolsOrdering", 1), query: "Result ordering:",
          set: { type: "circle", options: ["Ascending", "Descending"] }
        }
      }
    }
  },
  //Script related
  script: {
    _name: "Script",
    debugging: {
      key: "debugging", value: null, query: "Debug options", set: { type: "none", options: [] },
      sub: {
        dbgConsole: {
          key: "dbgConsole", value: GM_getValue("dbgConsole",  2), query: "Console output level:",
          set: { type: "circle", options: ["None", "Basic", "Detailed"] }
        }
      }
    }
  }
};

var frogTags = {
  users: JSON.parse(GM_getValue("userTags", '{}')),
  groups: JSON.parse(GM_getValue("groupTags", '{}'))
};
var frogTracks = {
  discuss: JSON.parse(GM_getValue("tracks[discuss]", '{}')),
  pins: JSON.parse(GM_getValue("tracks[pins]", '{}'))
};
var frogStatic = {
  filters: [
    [
      {
        name: "Level", type: "number", min: 0, max: 10,
        inputs: [ { query: "level_min", label: "Min" }, { query: "level_max", label: "Max" } ]
      },
      {
        name: "Copies", type: "number", min: 1,
        inputs: [ { query: "copy_min", label: "Min" }, { query: "copy_max", label: "Max" } ]
      },
      {
        name: "DLC", type: "circle", group: "dlc",
        inputs: [ { value: "", label: "Included" }, { value: "false", label: "Excluded" }, { value: "true", label: "Only" } ]
      }
    ],
    [
      {
        name: "Entries", type: "number", min: 0,
        inputs: [ { query: "entry_min", label: "Min" }, { query: "entry_max", label: "Max" } ]
      },
      {
        name: "Metascore", type: "number", min: 0, max: 100,
        inputs: [ { query: "metascore_min", label: "Min" }, { query: "metascore_max", label: "Max" } ]
      },
      {
        name: "Region Restricted", type: "circle", group: "region_restricted",
        inputs: [ { value: "", label: "Included" }, { value: "false", label: "Excluded" }, { value: "true", label: "Only" } ]
      }
    ],
    [
      {
        name: "Release Date", type: "date",
        inputs: [ { query: "release_date_min" }, { query: "release_date_max" } ]
      }
    ]
  ]
};

// Functions //
var  dbgLevel = frogVars.script.debugging.sub.dbgConsole.value,
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
        && !~path.indexOf("/giveaways/new")
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
    makeHeader: function($content, title) {
      if (!title) { return; }

      var $headerText = $("<div/>").addClass("page__heading__breadcrumbs")
        .html($("<a/>").html(title));
      $content.append($("<div/>").addClass("page__heading").html($headerText));
    },
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
        $field.find(".form__row__indent").children("div").last()
              .append($("<div/>").addClass("form__checkbox is-selected").append($("<a/>").html("Configure"))
                                 .on("click", function(ev) { $("#sub_"+ setting).toggle(); ev.stopImmediatePropagation(); }));

        var set = "abcdef";
        var $subform = $("<div/>").attr("id", "sub_"+ setting).css("display", "none").appendTo($form);

        var subkeys = Object.keys(details.sub);
        for(var i=0; i<subkeys.length; i++) {
          var keyName = subkeys[i];
          if (details.sub.hasOwnProperty(keyName)) {
            helpers.settings.makeRow($subform, number + set.substring(i,i+1), true, keyName, details.sub[keyName]);
          }
        }
      }
    },
    makeLabel: function(number, name, isSub) {
      var $row = $("<div/>").addClass("form__row" + (isSub? " form__row__sub":""));
      $("<div/>").addClass("form__heading")
        .append($("<div/>").addClass("form__heading__number").html(number +"."))
        .append($("<div/>").addClass("form__heading__text").html(name))
        .appendTo($row);
      return $row;
    },
    makeRadio: function(number, isSub, setting, details) {
      var $input = $("<div/>").append($("<input/>").attr("type", "hidden").attr("name", setting).val(details.value));

      for(var i=0; i<details.set.options.length; i++) {
        var val = details.set.options.length - 1 - i; //reverse index so we can check falsey values
        var $radio = $("<div/>").addClass("form__checkbox").attr("data-checkbox-value", val)
          .append("<i class='form__checkbox__default fa fa-circle-o'></i>")
          .append("<i class='form__checkbox__hover fa fa-circle'></i>")
          .append("<i class='form__checkbox__selected fa fa-check-circle'></i>")
          .append(details.set.options[i]);

        if (details.value == val) {
          $radio.addClass("is-selected");
        } else {
          $radio.addClass("is-disabled");
        }
        $input.append($radio);
      }

      var $desc = details.set.about? $("<div/>").addClass("form__input-description").css('margin', '0 0 10px 0').html(details.set.about) : null;
      return helpers.settings.makeLabel(number, details.query, isSub).append($("<div/>").addClass("form__row__indent").prepend($desc).append($input));
    },
    makeCheck: function(number, isSub, setting, details) {
      var $input = $("<div/>").append($("<input/>").attr("type", "hidden").attr("name", setting).val(details.value));

      for(var i=0; i<details.set.options.length; i++) {
        var val = Math.pow(2, details.set.options.length - 1 - i); //values bitwise OR'd together
        var $check = $("<div/>").addClass("form__checkbox").attr("data-checkbox-value", val)
          .append("<i class='form__checkbox__default fa fa-square-o'></i>")
          .append("<i class='form__checkbox__hover fa fa-square'></i>")
          .append("<i class='form__checkbox__selected fa fa-check-square'></i>")
          .append(details.set.options[i])
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

      var $desc = details.set.about? $("<div/>").addClass("form__input-description").css('margin', '0 0 10px 0').html(details.set.about) : null;
      return helpers.settings.makeLabel(number, details.query, isSub).append($("<div/>").addClass("form__row__indent").prepend($desc).append($input));
    },
    makeText: function(number, isSub, setting, details) {
      var $indent = $("<div/>").addClass("form__row__indent");

      $.each(details.set.options, function(i, opt) {
        var val = details.value,
            leg = "";

        if (details.set.options.length > 1) {
          val = details.value[opt];
          leg = "_"+i;
        }

        $indent.append($("<input/>").attr("type", details.set.type).attr("name", setting+leg).attr("placeholder", opt)
                        .addClass("form__input-small").val(val));
      });

      var $desc = $("<div/>").addClass("form__input-description").html(details.set.about);
      return helpers.settings.makeLabel(number, details.query, isSub).append($indent.append($desc));
    },
    makeEmpty: function(number, isSub, setting, details) {
      return helpers.settings.makeLabel(number, details.query, isSub).append($("<div/>").addClass("form__row__indent").append($("<div/>")));
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
            return text.replace(/(?:~){2}([\s\S]+?)(?:~){2}/g, "<del>$1</del>") //strikethrough
                       .replace(/(?:~)([\s\S]+?[^\\])(?:~)/g, "<span class='spoiler'>$1</span>"); //spoiler
          }
        },
        {
          // Images as toggle
          type: "lang",
          regex: /!\[(.*)?]\((.+)\)/g,
          replace:  "<div><div>" +
                    " <div class='comment__toggle-attached'>View attached image.</div>" +
                    " <a href='$2' rel='nofollow noreferrer' target='_blank'>" +
                    "  <img class='is-hidden' alt='$1' title='$1' src='$2'>" +
                    " </a>" +
                    "</div></div>"
        },
        {
          // Images to bottom
          type: "output",
          filter: function(html) {
            var $whole = $("<div/>").append($(html));

            $whole.append($whole.find(".comment__toggle-attached").parent());

            return $whole.html();
          }
        },
        {
          // Fix line breaks
          type: "output",
          filter: function(html) {
            return html.replace(/(<p><br\/?><\/p>|^\n$)/gm, "").replace(/(^(?!.*p>$).+)(<\/(a|span|del|em|code)>|[^>])\n/gm, "$1$2<br/>");
          }
        },
        {
          // showdown does some extra bullshit on code+&lt; tags, revert it here
          type: "output",
          filter: function(html) {
            return html.replace(/&amp;lt;/gm, "&lt;");
          }
        }
      ];

      showdown.extension("SGMD", function() { return subExts; });
    },
    parse: function(raw) {
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

      return helpers.markdown.converter.makeHtml(raw);
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
  },
  style: {
    apply: function() {
      var sSheet = "" +

      /* Statics (no effect on layout if feature disabled) */

      //stickies
      "header.fixed{ position: fixed; top: 0; width: 100%; z-index: 100; } " +
      ".left-above{ margin-top: 39px !important; }" + // !important on margin for compatibility with dark theme
      ".sidebar .fixed{ position: fixed; }" +
      ".footer__outer-wrap.fixed{ position: fixed; bottom: 0; width: 100%; background-color: #95a4c0; z-index: 100; } " +
      ".left-below{ margin-bottom: 45px; }" +

      //Continuous load spinner
      ".pagination__loader{ text-align: center; margin-top: 1em; } " +
      ".pagination__loader .fa{ font-size: 2em; } " +

      //GA 'find similar'
      ".sidebar__shortcut-inner-wrap div{ padding: 0; } " +
      ".sidebar__shortcut-inner-wrap .sidebar__error{ border-color: #f0d1dc #e5bccc #d9a7ba #ebbecf; }" +

      //Feature GA collapse - removes expanded bottom margin for use on collapse button
      ".pinned-giveaways__button{ clear: both; } " +
      ".pinned-giveaways__inner-wrap:not(.pinned-giveaways__inner-wrap--minimized){ border-radius: 4px 4px 0 0; margin-bottom: 0; }" +

      //User tags
      ".user__tagged{ text-decoration: none; border-radius: 4px; padding: 2px 4px; margin-left: .5em; background-color: rgba(0,0,0,.01);" +
      "  text-shadow: none; box-shadow: 1px 1px 1px rgba(0,0,0,0.5) inset, -1px -1px 1px rgba(255,255,255,0.5) inset; } " +
      ".comment__username--op .user__tagged{ color: #fff; } " +

      //Group tags
      ".group__tagged{ text-decoration: none; border-radius: 4px; padding: 2px 4px; margin-left: .5em; background-color: rgba(0,0,0,.01);" +
      "  text-shadow: none; box-shadow: 1px 1px 1px rgba(0,0,0,0.5) inset, -1px -1px 1px rgba(255,255,255,0.5) inset; } " +

      //Comment format buttons
      ".button-container{ display: flex; } " +
      ".align-button-container-top{ margin-bottom: 5px; }" +

      //Various form elements (filters / settings)
      ".form__row__sub{ margin-left: 2.5em; } " +
      ".form__input-small-date{ width: 132px !important; display: inline-block; } " + // !important to override default input size
      ".form__input-tiny{ width: 80px !important; display: inline-block; } " + // !important to override default input size
      ".form__row__sub .form__checkbox{ display: inline-block; margin-right: 10px; color: inherit; border-bottom: none; } ";


      /* Conditionals (would affect layout if feature disabled) */

      //settings page
      if (location.pathname === "/accoumt/settings/ribbit") {
        sSheet += "body{ background-image: none; background-color: #95A4C0; } " +
                  ".form__row__sub .form__heading__text{ color: #5A89FF; }";
      }

      //badges
      if (frogVars.lists.newBadges.value) {
        sSheet += ".giveaway__column--wish{ background-image: linear-gradient(#FFFACF 0%, #FFF176 100%); " +
                  "  background-image: -moz-linear-gradient(#FFFACF 0%, #FFF176 100%); " +
                  "  background-image: -webkit-linear-gradient(#FFFACF 0%, #FFF176 100%); " +
                  "  border-color: #EDCCBE #F0C2AF #DEAB95 #F2C4B1 !important; color: #F57F17; " +
                  "  box-shadow: none !important; }" +

                  ".giveaway__column--new{ " +
                  "  background-image: linear-gradient(#FFE0B2 0%, #FFB74D 100%); " +
                  "  background-image: -moz-linear-gradient(#FFE0B2 0%, #FFB74D 100%); " +
                  "  background-image: -webkit-linear-gradient(#FFE0B2 0%, #FFB74D 100%); " +
                  "  border-color: #FFCCBC #FFAB91 #FF8A65 #FFAB91 !important; color: #BF360C; " +
                  "  box-shadow: none !important; }";
      }
      if (frogVars.lists.colorBadge.value) {
        sSheet += ".giveaway__column--invite-only, .featured__column--invite-only{ " +
                  "  background-image: linear-gradient(#FFCDD2 0%, #F49B95 100%); " +
                  "  background-image: -moz-linear-gradient(#FFCDD2 0%, #F49B95 100%); " +
                  "  background-image: -webkit-linear-gradient(#FFCDD2 0%, #F49B95 100%); " +
                  "  border-color: #ef9a9a #e57373 #ef5350 #e57373 !important; color: #950000; }" +

                  ".giveaway__column--region-restricted, .featured__column--region-restricted{ " +
                  "  background-image: linear-gradient(#D7CCC8 0%, #A18F89 100%); " +
                  "  background-image: -moz-linear-gradient(#D7CCC8 0%, #A18F89 100%); " +
                  "  background-image: -webkit-linear-gradient(#D7CCC8 0%, #A18F89 100%); " +
                  "  border-color: #BDBDBD #9E9E9E #757575 #9E9E9E !important; color: #5D4037; }" +

                  ".giveaway__column--whitelist, .featured__column--whitelist{ " +
                  "  background-image: linear-gradient(#FFFFFF 0%, #E0E0E0 100%); " +
                  "  background-image: -moz-linear-gradient(#FFFFFF 0%, #E0E0E0 100%); " +
                  "  background-image: -webkit-linear-gradient(#FFFFFF 0%, #E0E0E0 100%); " +
                  "  color: #D81B60 !important; }" +

                  ".giveaway__column--group, .featured__column--group{ " +
                  "  background-image: linear-gradient(#DCEDC8 0%, #AED581 100%); " +
                  "  background-image: -moz-linear-gradient(#DCEDC8 0%, #AED581 100%); " +
                  "  background-image: -webkit-linear-gradient(#DCEDC8 0%, #AED581 100%); }";
      }

      //grid
      if (frogVars.lists.gridView.value) {
        sSheet += ".pagination{ clear: both; } " +
                  ".giveaway__row-outer-wrap{ width: 19%; margin-right: 1%; float: left; } " +
                  ".giveaway__row-inner-wrap{ display: block; } " +
                  ".giveaway_image_thumbnail,.giveaway_image_thumbnail_missing{ width: initial; margin: 0 auto !important; } " + //important to override margins on :not(last)
                  ".giveaway__heading{ display: block; text-align: center; } " +
                  ".giveaway__heading:first-of-type{ height: auto; text-overflow: ellipsis; overflow: hidden; } " +
                  ".giveaway__columns-full{ display: block; } " +
                  ".giveaway__columns-full > :not(:last-child){ margin: 0 0 5px 0; } " +
                  ".giveaway__columns--badges{ margin-bottom: 5px; } " +
                  ".giveaway__columns--badges > .giveaway__column--contributor-level:not(.giveaway__column--empty){" +
                  "  -webkit-box-flex: 1; -moz-box-flex: 1; -webkit-flex: 1; -ms-flex: 1; flex: 1; } " +
                  ".giveaway__column--empty{ height: 26px; width: 0; padding: 0; margin: 0 !important; visibility: hidden; } " + //important to force no widths
                  ".giveaway__links{ display: block; margin-top: 5px; } " +
                  ".giveaway__links a{ margin-right: 5px; } " +
                  ".pinned-giveaways__inner-wrap--minimized .giveaway__row-outer-wrap:nth-child(-n+5){ display: initial; } " +
                  ".giveaway__row--empty{ clear: both; } ";
      }

      //copy count colors
      if (frogVars.lists.moreCopies.value) {
        var cpyFore = frogVars.lists.moreCopies.sub.moreCopyLabel.value.Foreground || "#F0F2F5",
            cpyBack = frogVars.lists.moreCopies.sub.moreCopyLabel.value.Background || "#6B7A8C"

        if (!~cpyFore.indexOf("#")) { cpyFore = "#"+cpyFore; }
        if (!~cpyBack.indexOf("#")) { cpyBack = "#"+cpyBack; }

        sSheet += ".copies__tagged{ text-shadow: none; border-radius: 2px; padding: 1px 2px; " +
                  "  color: "+ cpyFore +"; background-color: "+ cpyBack +"; " +
                  "  font-weight: "+ (frogVars.lists.moreCopies.sub.moreCopyBold.value? 'bold':'inherit') +"; }";
      }

      //user list colors
      if (frogVars.social.userLists.value) {
        var wlFore = frogVars.social.userLists.sub.userWhite.value.Foreground || "#2A2",
            wlBack = frogVars.social.userLists.sub.userWhite.value.Background || "#FFF",
            blFore = frogVars.social.userLists.sub.userBlack.value.Foreground || "#C55",
            blBack = frogVars.social.userLists.sub.userBlack.value.Background || "#000";

        if (!~wlFore.indexOf("#")) { wlFore = "#"+wlFore; }
        if (!~wlBack.indexOf("#")) { wlBack = "#"+wlBack; }
        if (!~blFore.indexOf("#")) { blFore = "#"+blFore; }
        if (!~blBack.indexOf("#")) { blBack = "#"+blBack; }

        //using !important selector on 'color' to override the :not(.comment__username--op) selector color
        sSheet += "a.user__whitened{ background-color: "+ wlBack +"; color: "+ wlFore +" !important; border-radius: 4px; padding: 3px 5px; text-shadow: none; } " +
                  "a.user__blackened{ background-color: "+ blBack +"; color: "+ blFore +" !important; border-radius: 4px; padding: 3px 5px; text-shadow: none; } " +
                  "a.user__whitened i{ color: "+ wlFore +" } " +
                  "a.user__blackened i{ color: "+ blFore +" } ";
      }

      //profile hover
      if (frogVars.social.hoverInfo.value) {
        var img = 64, pad = 5,
            width = 360, height = 160;

        sSheet += ".hover-panel__outer-wrap{ position: absolute; width: "+ width +"px; height: "+ height +"px; color: #21262f; } " +
                  ".hover-panel__inner-wrap{ position: relative; width: 100%; height: 100%; } " +
                  ".hover-panel__image{ position: absolute; top: 0; left: 0; width: "+ img +"px; height: "+ img +"px; border-radius: 5px; } " +
                  ".hover-reversed .hover-panel__image{ left: initial; right: 0; } " +
                  ".hover-panel__corner{ position: absolute; top: "+ (img+pad) +"px; bottom: 0; left: 0; right: "+ (width-(img+pad)) +"px;" +
                  "  padding: 5px; background-color: #465670; border-radius: 3px 0 0 3px; } " +
                  ".hover-reversed .hover-panel__corner{ left: "+ (width-(img+pad)) +"px; right: 0; border-radius: 0 3px 3px 0; } " +
                  ".hover-panel__corner .hover-panel__icon-load{ font-size: 5em; color: rgba(255,255,255,0.6); } " +
                  ".hover-panel__corner .sidebar__shortcut-inner-wrap{ display: block; } " +
                  ".hover-panel__corner .sidebar__shortcut__whitelist{ margin: 0 0 5px 0; } " +
                  ".hover-panel__stats{ position: absolute; top: 0; bottom: 0; left: "+ (img+pad) +"px; right: 0;" +
                  "  padding: 5px; background-color: #465670; border-radius: 3px 3px 3px 0; } " +
                  ".hover-reversed .hover-panel__stats{ left: 0; right:"+ (img+pad) +"px; border-radius: 3px 3px 0 3px; } " +
                  ".hover-panel__stats .featured__heading__medium{ font-size: 16px; } " +
                  ".hover-panel__stats .featured__heading{ margin-bottom: 0; } " +
                  ".hover-panel__stats .featured__table__column{ margin: 0; } ";
      }


      /* Application */
      GM_addStyle(sSheet);
    }
  }
},

settings = {
  invalidateOnSync: function() {
    if (!~location.href.indexOf("/account/settings/profile")) { return; }

    $(".form__sync-default").on("click", function() {
      logging.info("Initiated resync, invalidating lists");
      helpers.listingPit.invalidateList("wishes");
      helpers.listingPit.invalidateList("white");
      helpers.listingPit.invalidateList("black");
    });
  },
  injectMenu: function(isActive) {
    logging.debug("Adding custom navigation");

    //inject button in nav
    var $menu = $("<div/>").addClass("nav__button-container");
    if (isActive) {
      $(".nav__button-container.is-selected").removeClass("is-selected");
      $menu.addClass("is-selected");
    }

    $("<a/>").addClass("nav__button nav__button--is-dropdown").attr("href", "/accoumt/settings/ribbit")
      .html("SGT frog").appendTo($menu);
    $("<div/>").addClass("nav__button nav__button--is-dropdown-arrow").html("<i class='fa fa-angle-down'></i>").appendTo($menu)
      .on("click", function(ev) {
          //chrome has problems applying sg's event handlers, so we explicitly copy them
        var t = $(this).hasClass("is-selected");
        $("nav .nav__button").removeClass("is-selected"), $("nav .nav__relative-dropdown").addClass("is-hidden"), t || $(this).addClass("is-selected").siblings(".nav__relative-dropdown").removeClass("is-hidden"), ev.stopImmediatePropagation()
      });

    var $drop = $("<div/>").addClass("nav__relative-dropdown is-hidden").appendTo($menu);
    $("<div/>").addClass("nav__absolute-dropdown")
      .append(helpers.makeTopLink("/accoumt/settings/ribbit", "Settings", "Adjust tool functionality.", "gears", "grey"))
      .append(helpers.makeTopLink("https://github.com/bberenz/sgtfrog/issues", "Feedback", "Report an issue or request a feature.", "github", "green"))
      .append(helpers.makeTopLink("https://www.steamgifts.com/discussion/4C3Cl/userscript-steamgifts-tinkerer-featuring-refined-ostensible-gain", "Discussion", "View the SteamGifts discussion thread.", "square-o", "blue"))
      .appendTo($drop);

    $(".nav__right-container").find(".nav__button-container:not(.nav__button-container--notification)").last().before($menu);

    //inject link on account settings
    var $link = helpers.makeSideLink("/accoumt/settings/ribbit", "SGT frog");
    $(".sidebar__navigation").find("a[href='/account/settings/giveaways']").parent().after($link);
    if (isActive) {
      $link.addClass("is-selected");
      $link.find(".sidebar__navigation__item__name").before("<i class='fa fa-caret-right'></i>");
    }
  },
  injectPage: function() {
    //SG redirects invalid "/account/" links, so we fake it to blend in
    if (location.pathname === "/accoumt/settings/ribbit") {
      logging.info("Creating custom settings page");

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
        $("<body/>").appendTo("html").append(data.substring(data.indexOf("<body>")+6, data.indexOf("</body>")));
        $dark.appendTo("html");

        //pull latest site js
        var jsIndex = data.indexOf("<script src=\"'https://cdn.steamgifts.com/js/minified");
        $("head").append($(data.substring(jsIndex, data.indexOf("</script>", jsIndex))));

        //re-skin
        $(".page__heading__breadcrumbs").first().children("a").last()
          .html("Sgt Frog").attr("href", "/accoumt/settings/ribbit");
        $(".sidebar__navigation").find("a[href='" + usePage + "']").parent()
          .removeClass("is-selected").find("i").remove();
        $("title").html("Account - Settings - Ribbit");

        var $content = $("form").parent();
        $content.find("form").remove();

        for(var section in frogVars) {
          if (frogVars.hasOwnProperty(section)) {
            var kSection = frogVars[section];
            helpers.settings.makeHeader($content, kSection._name);

            var $form = $("<form/>"),
                keys = Object.keys(kSection), idx = 1;
            for(var i=0; i<keys.length; i++) {
              var keyName = keys[i];
              if (kSection.hasOwnProperty(keyName) && !~keyName.indexOf("_")) {
                helpers.settings.makeRow($form, idx++, false, keyName, kSection[keyName]);
              }
            }

            $content.append($form);
          }
        }

        $("<div/>").addClass("form__submit-button")
          .html("<i class='fa fa-arrow-circle-right'></i> Save Changes")
          .on("click", function() {
            for(var section in frogVars) {
              if (frogVars.hasOwnProperty(section)) {
                settings.save(frogVars[section]);
              }
            }

            logging.info("Saved new settings");
            //reload page to apply settings
            window.scrollTo(0,0);
            location.reload();
          })
          .appendTo($content);

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
  save: function(section) {
    var setVal = function(name, val) {
      if (val === undefined) { return; }

      logging.debug("Setting "+ name +" to "+ val);
      GM_setValue(name, val);
    };

    for(var setting in section) {
      if (section.hasOwnProperty(setting) && !~setting.indexOf("_")) {
        var ss = section[setting];

        if (ss.set.type === 'text' && ss.set.options.length > 1) {
          //treat as JSON
          var compose = {};
          for(var i=0; i<ss.set.options.length; i++) {
            var $subinput = $("input[name='"+ ss.key +"_"+ i +"']");
            compose[ss.set.options[i]] = $subinput.val();
          }

          setVal(ss.key, JSON.stringify(compose));
        } else {
          var $input = $("input[name='"+ ss.key +"']");
          var inputNum = +$input.val();

          if (isNaN(inputNum)) {
            setVal(ss.key, $input.val());
          } else {
            setVal(ss.key, +inputNum);
          }
        }

        if (ss.sub) {
          settings.save(ss.sub);
        }
      }
    }
  }
},
fixedElements = {
  header: function() {
    if (!(frogVars.general.fixedElms.value & 4)) { return; }

    $("header").addClass("fixed");

    var $feature = $(".featured__container");
    if ($feature.length > 0) {
      $feature.addClass("left-above");
    } else {
      $(".page__outer-wrap").addClass("left-above");
    }
  },
  sidebar: function() {
    if (!(frogVars.general.fixedElms.value & 2)) { return; }

    var offset = frogVars.general.fixedElms.value&4 ? 64 : 25,
        $sidebar = $(".sidebar"),
        $sidewrap = $("<div/>").addClass("sidebar__outer-wrap"),
        $sidead = $(".sidebar__mpu"); //hide the advertisement on scroll

    //create a wrap to avoid loss of panel dimensions
    $sidebar.children().appendTo($sidewrap);
    $sidewrap.appendTo($sidebar);
    $sidebar.on('adjusted', function() { $sidebar.css({"min-height": $sidewrap.height()}); });
    $sidebar.trigger("adjusted");

    $document.on("scroll", function() {
      var scrollAt = $document.scrollTop(),
          selfHeight = $sidewrap.height(),
          pickup = $(".featured__container").height() + 64,
          footerStart = $(".footer__outer-wrap").offset().top;

      if (((frogVars.general.fixedElms.value&1) == 0) && (offset + scrollAt + selfHeight) > footerStart) {
        //stop following at footer (unless both are floating)
        $sidebar.children().css({"top": -(offset + scrollAt + selfHeight - footerStart)});
      } else if (scrollAt > (pickup - offset)) {
        $sidebar.children().addClass("fixed").css({"top": offset});
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
    if (!(frogVars.general.fixedElms.value & 1)) { return; }

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
      giveaways.injectFlags.wishlist($doc);
      giveaways.injectFlags.recent($doc);
      giveaways.injectChance($doc);
      giveaways.injectWins($doc);
      giveaways.highlightCopies($doc);
      giveaways.injectSearch($doc);
      giveaways.hideEntered($doc);
      giveaways.easyHide($doc);
      giveaways.gridForm($doc);
      users.profileHover($doc);
      users.tagging.show($doc);
      users.listIndication($doc);
    },
    commentPage: function($doc) {
      users.profileHover($doc);
      users.tagging.show($doc);
      users.listIndication($doc);
      threads.injectTimes($doc);
      threads.tracking.all($doc);
      threads.commentBox.injectEdit($doc);
      loading.imgDemand($doc);
    },
    generalPage: function($doc) {
      users.profileHover($doc);
      users.tagging.show($doc);
      users.listIndication($doc);
      threads.tracking.all($doc);
    }
  },
  giveaways: function() {
    //avoid stepping on other loading pages
    if (!(frogVars.general.loadLists.value & 8) || !helpers.pageSet.GAList()) { return; }

    var page = helpers.fromQuery("page");
    if (page == undefined) { page = 1; }
    $(".widget-container").find(".page__heading").first().after($(".pagination"));

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
          var $nextGiveaways = $data.find(".giveaway__row-outer-wrap");

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
    if (!(frogVars.general.loadLists.value & 4) || !~location.href.indexOf("/discussion/")) { return; }
    loading.comments();
  },
  thanks: function() {
    if (!(frogVars.general.loadLists.value & 2) || !~location.href.indexOf("/giveaway/")) { return; }
    loading.comments();
  },
  comments: function() {
    var page = helpers.fromQuery("page"),
        lastPage = Math.ceil(+$(".pagination__results").find("strong").last().text().replace(/\D+/g, "") / 25);

    if (page == undefined) { page = 1; }
    $(".page__heading").last().after($(".pagination"));

    //flip values if reversed
    if (frogVars.threads.reversed.value) {
      page = lastPage - (page - 1);
    }

    //prevent multiple occurences from cancelling a reply
    $(".js__comment-reply-cancel").on("click", function(e) {
      //SG calls
      $(".comment--submit input[name=parent_id]").val("");
      $(".comment--submit .comment__child").attr("class", "comment__parent");

      //alternate movement calls
      var $box = $(".comment--submit");
      if (frogVars.threads.commentTop.value) {
        $box.insertBefore($(".comments").last());
      } else {
        $box.insertAfter($(".comments").last());
      }

      e.stopImmediatePropagation();
    });

    var inload = false;
    $document.on("scroll", function() {
      var nearEdge = ($document.scrollTop() + $(window).height()) / $document.height();
      if (nearEdge >= 0.90 && !inload) {
        inload = true;

        if ((frogVars.threads.reversed.value && page-- > 1)
            || (!frogVars.threads.reversed.value && page++ < lastPage)) {
          var loc = location.href;
          if (~loc.indexOf("#")) {
            loc = loc.replace(/#\w+$/, ""); //anchor tags cause appending problems
          }

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

            var $paging = $data.find(".pagination"),
                $rootComments = $(".comments").last(),
                $newComments = $data.find(".comments").last().children();

            $paging.find(".pagination__navigation").html("Page " + page);
            $rootComments.append($paging);

            if (frogVars.threads.reversed.value) {
              $newComments = $newComments.get().reverse();
            }

            $rootComments.append($newComments);

            inload = false;
            loading.removeSpinner();
          });
        }
      }
    });
  },
  tables: function() {
    if (!(frogVars.general.loadLists.value & 1) || !helpers.pageSet.TableList()) { return; }

    var page = helpers.fromQuery("page");
    if (page == undefined) { page = 1; }
    $(".widget-container").find(".page__heading").first().after($(".pagination"));

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
          loading.everyNew.generalPage($data);

          var $paging = $data.find(".pagination");
          var $nav = $paging.find(".pagination__navigation");

          var $nextContent = $data.find(".table__row-outer-wrap");

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
        }).fail(function() {
          loading.removeSpinner();
        });
      }
    });
  },
  points: function() {
    if (frogVars.general.pointInvl.value < 1 || isNaN(frogVars.general.pointInvl.value)) { return; }
    if (frogVars.general.pointInvl.value < 15) {
      //minimum 15 sec interval is to protect yourself from too many frequent requests
      logging.alert("Failed to apply defined points interval, using 15 seconds instead");
      frogVars.general.pointInvl.value = 15;
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
    }, frogVars.general.pointInvl.value * 1000);
  },
  imgDemand: function($doc) {
    if (!frogVars.threads.onDemand.value) { return; }

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
    if (!frogVars.lists.sideMine.value) { return; }

    $.each($(".sidebar__heading"), function(i, heading) {
      var $heading = $(heading);

      if ($heading.html() === "My Giveaways") {
        $heading.next().remove(); //remove navigation elements
        $heading.remove(); //remove actual header
      }
    });
  },
  injectSGTools: function() {
    if (!frogVars.social.userTools.value || !~location.pathname.indexOf("/user/")) { return; }

    var userViewed = location.href.split("/")[4],
        ordering = frogVars.social.userTools.sub.toolsOrdering.value? "/oldestfirst":"/newestfirst";
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
  },
  activeThreads: {
    find: function() {
      switch(frogVars.lists.activeTalk.value) {
        case 0: sidebar.activeThreads.hidden(); break;
        case 1: sidebar.activeThreads.sidebar(); break;
        default: sidebar.activeThreads.shown(); break;
      }
    },
    shown: function() {
      //special handling if grid view
      if (frogVars.lists.gridView.value) {
        $(".widget-container.widget-container--margin-top").siblings().addBack().css('clear', 'both');
      }
    },
    hidden: function() {
      $(".widget-container.widget-container--margin-top").children().remove();
    },
    sidebar: function() {
      //no 'Active Discussions' section on page
      if ($(".widget-container.widget-container--margin-top").length === 0) { return; }

      var formatForSidebar = function($table, sideTitle) {
        var $list = $("<ul/>").addClass("sidebar__navigation");

        $.each($table.find(".table__row-inner-wrap"), function(i, thread) {
          var $thread = $(thread),
              $origin = $thread.find(".table__column--width-fill").first(),
              $topic = $origin.find("h3").find("a");

          $list.append(helpers.makeSideLink($topic.attr("href"), $topic.html(),
                                                 $origin.find("a.table__column__secondary-link").first().html().replace(/ comments/i, ""),
                                                 "by "+ $thread.find(".table_image_avatar").attr("href").replace("/user/", "")));
        });

        $("<h3/>").addClass("sidebar__heading").html(sideTitle).insertAfter($(".sidebar__navigation").last()).after($list);
      };

      if ((frogVars.lists.activeTalk.sub.activeTalkSide.value & 2)) {
        formatForSidebar($(".homepage_heading[href='/discussions']").siblings(".table"), "Active Discussions");
      }
      if ((frogVars.lists.activeTalk.sub.activeTalkSide.value & 1)) {
        formatForSidebar($(".homepage_heading[href='/discussions/deals']").siblings(".table"), "Recent Deal Discussions");
      }

      $(".sidebar").trigger("adjusted");
      sidebar.activeThreads.hidden(); //now hide main discussion section
    }
  }
},
giveaways = {
  injectFlags: {
    all: function($doc) {
      if (!helpers.pageSet.GAList() && !~location.pathname.indexOf("/giveaway/")) { return; }

      if (frogVars.lists.newBadges.value) {
        giveaways.injectFlags.wishlist($doc);
        giveaways.injectFlags.recent($doc);
      }
    },
    wishlist: function($doc) {
      var $badge = $("<div/>").addClass("giveaway__column--wish").attr("title", "Wishlist")
                    .html("<i class='fa fa-fw fa-star'></i>");

      //refresh wishlist daily
      if (Date.now() - GM_getValue("cache-wish-time", 0) > (24*60*60*1000)) {
        helpers.listingPit.invalidateList("wishes");
      }

      //load wishlist to know what gets badged
      helpers.listingPit.getList("wishes", function(wishes) {
        logging.info("Applying badges for "+ wishes.length +" wishes");

        $.each(wishes, function(i, wish) {
          var $gaLink = $doc.find("a[href='"+ wish +"']");
          if (!$gaLink.length) { return; }

          var $gaRow = $gaLink.parents(".giveaway__summary").find(".giveaway__column--width-fill");
          if (!$gaRow.length) {
            $gaRow = $doc.find(".featured__column--width-fill");
            $badge.addClass("featured__column");
          }

          $gaRow.after($badge.clone());
        });
      });
    },
    recent: function($doc) {
      var $badge = $("<div/>").addClass("giveaway__column--new").attr("title", "New")
                    .html("<i class='fa fa-fw fa-fire'></i>");

      $.each($doc.find(".giveaway__column--width-fill,.featured__column--width-fill").find("[data-timestamp]"), function(i, created) {
        var $created = $(created);
        var timing = $created.html();
        if (~timing.indexOf("second") || ~timing.indexOf("minute")) {
          var $gaRow = $created.parents(".giveaway__summary").find(".giveaway__column--width-fill")
          if (!$gaRow.length) {
            $gaRow = $doc.find(".featured__column--width-fill");
            $badge.addClass("featured__column");
          }

          $gaRow.after($badge.clone());
        }
      });
    }
  },
  injectChance: function($doc) {
    if (!frogVars.lists.winPercent.value) { return; }

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
  injectWins: function($doc) {
    if (!helpers.pageSet.GAList()) { return; }

    $.each($doc.find(".giveaway__row-outer-wrap"), function(i, ga) {
      var $ga = $(ga);

      //only affect completed GA's
      if ($ga.find(".giveaway__column--positive,.giveaway__column--negative").length) {
        var wins = 1,
            copies = $ga.find('.giveaway__heading__thin').first().html(),
            entries = $ga.find(".giveaway__links").find("span").first().html().replace(/\D+/g, '');

        if (!~copies.indexOf("P")) { wins = copies.replace(/\D+/g, ''); }
        if (+wins > +entries) { wins = entries; }

        var $winLink = $("<a/>").attr("href", $ga.find(".giveaway__heading__name").attr("href") +"/winners")
                        .html("<i class='fa fa-trophy'></i> <span>" + Intl.NumberFormat().format(wins) +" winner"+ (+wins>1? "s":"") +"</span>");
        $ga.find(".giveaway__links").append($winLink);
      }
    });
  },
  highlightCopies: function($doc) {
    if (!frogVars.lists.moreCopies.value) { return; }

    $.each($doc.find('.giveaway__heading__thin'), function(i, elm) {
      var $elm = $(elm);

      if (~$elm.html().indexOf('Copies')) {
        $elm.addClass("copies__tagged");
      }
    });
  },
  injectEndDate: function() {
    if (!frogVars.detail.realEnd.value || !~location.href.indexOf("/giveaway/")) { return; }

    var $clock = $(".featured__summary").find("span[data-timestamp]").first();
    $clock.parent().append($("<em/>").html(" ("+ helpers.time.sgString(+$clock.attr("data-timestamp")) +")"));
  },
  expandedGroups: function() {
    if (!frogVars.detail.allGroup.value || !~location.href.indexOf("/giveaway/")) { return; }

    //remove group indicator if present, quit if not
    var $group = $(".featured__column--group");
    if ($group.length === 0) {
      logging.debug("No groups to expand");
      return;
    }

    var groupPage = location.pathname.split("/", 4),
        $groupRow = $("<div/>").addClass("featured__columns featured__columns--groups")
                      .append($group.html('<i class="fa fa-fw fa-user"></i>'));

    groupPage.length = 4; //drop any extra after giveaway name to cleanly hit groups page

    $.ajax({
      method: "GET",
      url: groupPage.join("/") + "/groups"
    }).done(function(data) {
      var $data = $(data);

      $.each($data.find(".table__rows").find(".table_image_avatar"), function(i, grp) {
        $groupRow.append($(grp).css({"width": "28px", "height": "28px", "padding": "0", "margin-left": "0"}));
      });

      groups.profileHover($groupRow); //apply hover on groups

      $(".featured__summary").append($groupRow);
    });
  },
  continueHiding: function(force) {
    if (!~location.href.indexOf("/giveaway/")) { return; }

    if (!force && $(".featured__giveaway__hide").length > 0) {
      //immediately apply when hiding from page
      $(".js__submit-hide-games").on('click', function() {
        giveaways.continueHiding(true);
      });

      return; //game is unhidden at this point - do nothing else
    }

    logging.info("Giveaway is suppose to be hidden");
    $(".featured__inner-wrap, .sidebar__shortcut-outer-wrap").addClass("is-faded");

    var gameName = $(".featured__heading__medium").first().text();
    $(".featured__heading").append($("<a/>").attr('href', '/account/settings/giveaways/filters/search?q=' + gameName).html("<i class='fa fa-eye'></i>"));
  },
  injectSearch: function($doc) {
    if (!frogVars.detail.searchSame.value || !~location.href.indexOf("/giveaway/")) { return; }

    var $side = $(".sidebar__navigation").parent();
    var $entry = $side.children("form");
    if ($entry) {
      if (!$entry.hasClass("sidebar__error")) {
        $entry.css("background-image", "none").css("border", "none");
      } else {
        helpers.applyGradients($entry, "#f7edf1 0%, #e6d9de 100%");
      }
    }

    $("<div/>").addClass("sidebar__shortcut-inner-wrap")
      .append($("<a/>").addClass("sidebar__entry-loading").css("max-width", ($entry.length>0? "33%":"100%")).html("<i class='fa fa-search'></i> Find Similar")
             .attr("href", "/giveaways/search?q=" + $(".featured__heading__medium").html()))
      .append($entry)
      .appendTo($("<div/>").addClass("sidebar__shortcut-outer-wrap").prependTo($side))
  },
  injectNavSearch: function() {
    if (!frogVars.general.searchNav.value) { return; }

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
    if (!frogVars.social.userTools.value || !~location.pathname.indexOf("/winners")) { return; } //controlled by SGTools sidepanel option
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
    if (!frogVars.lists.hideEntry.value || ~location.href.indexOf("/user/") || ~location.href.indexOf("/group/")) { return; } //exclude hiding anything on user or group pages
    $doc.find(".is-faded").parent(".giveaway__row-outer-wrap").remove();
  },
  easyHide: function($doc) {
    if (!frogVars.lists.oneHide.value) { return; }

    $doc.find("[data-popup='popup--hide-games']").on("click", function(ev) {
      window.setTimeout(function() {
        $(".js__submit-hide-games").click();
      }, 100);
    });
  },
  gridForm: function($doc) {
    if (!frogVars.lists.gridView.value || !helpers.pageSet.GAList()) { return; }

    $doc.find(".giveaway__columns").addClass("giveaway__columns-full");
    $.each($doc.find(".giveaway__row-outer-wrap"), function(i,wrap) {
      var $wrap = $(wrap);
      $wrap.find(".giveaway_image_avatar").remove();

      //move the game image to the top
      $wrap.find(".giveaway__row-inner-wrap").prepend($wrap.find(".giveaway_image_thumbnail,.giveaway_image_thumbnail_missing"));

      //split name from fee/actions
      var feeActions = $wrap.find(".giveaway__heading").children().not(".giveaway__heading__name").detach();
      if (!feeActions.length) {
        //ensure proper height for invite only GA's
        feeActions = "<span class='giveaway__heading__thin'>(??P)</span>" +
                    "<a class='giveaway__icon'><i class='fa fa-question-circle'></i></a>" +
                    "<a class='giveaway__icon'><i class='fa fa-question-circle-o'></i></a>";
      }

      $wrap.find(".giveaway__summary h2").append($("<h3/>").addClass("giveaway__heading").html(feeActions));

      //badges in a single row
      $wrap.find(".giveaway__columns").before($("<div/>").addClass("giveaway__columns giveaway__columns--badges")
                                             .html($wrap.find(".giveaway__column--width-fill").nextAll())
                                             .prepend($("<div/>").addClass("giveaway__column--empty")));

      //condense links
      var $link = $wrap.find(".fa-tag").next();
      $link.html($link.text().replace(/([\d,]+) \w+/, "$1"));
      $link = $wrap.find(".fa-comment").next();
      $link.html($link.text().replace(/([\d,]+) \w+/, "$1"));
      $link = $wrap.find(".fa-trophy").next();
      $link.html($link.text().replace(/([\d,]+) \w+/, "$1"));
    });

    //clear float from all post content
    $(".giveaway__row-outer-wrap").last().parent().next().css("clear", "both");

    //fix featured background to fill area
    $doc.find(".pinned-giveaways__inner-wrap").append($("<div/>").addClass("giveaway__row--empty"));
  },
  bulkFeatured: {
    find: function() {
      switch(frogVars.lists.featuredGA.value) {
        case 0: giveaways.bulkFeatured.hidden(); break;
        case 1: giveaways.bulkFeatured.expanded(); break;
        default: giveaways.bulkFeatured.injectCollapsable(); break;
      }
    },
    //NOTE: needs delayed from page load
    injectCollapsable: function() {
      //two or less giveaways is already expanded
      if ($(".pinned-giveaways__inner-wrap").children().length < 3) { return; }

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
  filters: {
    inject: function() {
      if (!frogVars.lists.moreFilters.value || (location.pathname !== '/' && !~location.href.indexOf("/giveaways/"))) { return; }

      var $filters = $("<div/>").addClass("notification notification--warning notification--margin-top is-hidden").css("padding-bottom", "10px"),
          $toggle = $("<a/>").addClass("is-clickable").html("<i class='fa fa-filter'></i>"),
          $submit = $("<div/>").addClass("form__submit-button").css("float", "right").html("<i class='fa fa-arrow-circle-right'></i> Filter"),
          columnSets = 100 / frogStatic.filters.length;

      //filter box description
      $filters.append("<div><em>Filter out shown giveaways based on desired criteria. Leave blanks to keep restriction unbounded.</em></div>");

      $.each(frogStatic.filters, function(i, colSet) {
        var $column = $("<div/>").css({ "width": columnSets +"%", "float": "left" }).appendTo($filters);

        $.each(frogStatic.filters[i], function(j, filter) {
          var $filterInput;

          switch(filter.type) {
            case "number":case "date": $filterInput = giveaways.filters.makeText(filter.type, filter.inputs, filter.min, filter.max); break;
            case "circle": $filterInput = giveaways.filters.makeRadio(filter.inputs, filter.group); break;
          }

          $column.append("<strong>"+ filter.name +"</strong>").append($filterInput);
        });
      });

      $filters.append($("<div/>").css("clear", "both").append($submit));

      $(".page__heading").after($filters).find(".page__heading__breadcrumbs").after($toggle);

      $toggle.on("click", function(evt) {
        if ($filters.hasClass("is-hidden")) {
          $filters.removeClass("is-hidden");
        } else {
          $filters.addClass("is-hidden");
        }
      });

      $submit.on("click", function(evt) {
        var query = helpers.fromQuery("type");
        if (!query) {
          query = "";
        } else {
          query = "type="+ query;
        }

        $.each($filters.find("input"), function(i, inp) {
          var $inp = $(inp);

          if ($inp.val()) {
            query += "&"+ $inp.attr("data-query") +"="+ $inp.val();
          }
        });

        location.href = "/giveaways/search?" + query;
      });
    },
    makeText: function(type, inputs, mins, maxes) {
      var $block = $("<div/>").addClass("form__row__sub");

      $.each(inputs, function(i, inp) {
        var $in = $("<input/>").attr("placeholder", inp.label).attr("type", type).attr("data-query", inp.query);

        if (type === "date") {
          $in.addClass("form__input-small-date");
          //fill-in for no date type support
          if ($in.get()[0].type !== "date") {
            $in.attr("placeholder", "YYYY-MM-DD");
          }
        } else {
          $in.addClass("form__input-tiny");
        }

        if (mins !== undefined) { $in.attr("min", mins); }
        if (maxes !== undefined) { $in.attr("max", maxes); }

        var val = helpers.fromQuery(inp.query);
        if (val === undefined) { val = ""; }

        $in.val(val);

        if (i > 0) { $block.append(" - "); }
        $block.append($in);
      });

      return $block;
    },
    makeRadio: function(inputs, group) {
      var $block = $("<div/>").addClass("form__row__sub").css("line-height", "normal"),
          $input = $("<input/>").attr("type", "hidden").attr("data-query", group);

      $block.append($input);

      $.each(inputs, function(i, inp) {
        var $in = $("<span/>").addClass("form__checkbox").attr("data-checkbox-value", inp.value);

        $in.html("<i class='form__checkbox__default fa fa-circle-o'></i>" +
                 "<i class='form__checkbox__hover fa fa-circle'></i>" +
                 "<i class='form__checkbox__selected fa fa-check-circle'></i>" +
                 inp.label);

        $block.append($in);
      });

      var val = helpers.fromQuery(group);
      if (val === undefined) { val = ""; }

      $block.find("[data-checkbox-value='"+ val +"']").addClass("is-selected");
      $input.val(val);

      return $block;
    }
  }
},
threads = {
  commentBox: {
    moveToTop: function() {
      if (!frogVars.threads.commentTop.value || (!~location.href.indexOf("/discussion") && !~location.href.indexOf("/giveaway/"))) { return; }

      $(".comments").last().prepend($(".comment--submit"));
    },
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
      if (!frogVars.threads.formatting.value || (!~location.href.indexOf("/discussion") && !~location.href.indexOf("/giveaway/"))) { return; }

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
        $("<div/>").addClass("align-button-container").append($(".form__submit-button")).append($previewBtn).insertAfter($(".form__row").last());
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
      if (!frogVars.threads.preview.value || (!~location.href.indexOf("/discussion") && !~location.href.indexOf("/giveaway/"))) { return; }

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

          if (frogVars.threads.formatting.value) {
            threads.commentBox.injectHelpers($editor);
          }
          if (frogVars.threads.preview.value) {
            threads.commentBox.injectPreview($editor);
          }

          $this.off("click.initial"); //stays on the page after clicking edit, no need to continuously add
        });
      });
    }
  },
  //NOTE: needs delayed from page load
  collapseDiscussion: function() {
    if (!frogVars.threads.collapsed.value || !~location.href.indexOf("/discussion/")) { return; }

    var page = helpers.fromQuery("page");
    if (page && page > 1) {
      $(".comment__collapse-button").first().trigger("click");
    }
  },
  reverse: function() {
    if (!frogVars.threads.reversed.value || (!~location.href.indexOf("/discussion/") && !~location.href.indexOf("/giveaway/"))) { return; }

    //find last page of thread
    var $totalCount = $(".pagination__results").find("strong").last(),
        lastPage = Math.ceil(+$totalCount.text().replace(/\D+/g, "") / 25);

    logging.debug("Thread has "+ lastPage +" pages");

    //find current page of thread
    var onPage = 1,
        loadPage = lastPage;

    if (~location.search.indexOf("page=")) {
      onPage = +($(".pagination__navigation").find(".is-selected").text());
      if (onPage < 1) { onPage = 1; } //cases where no pages are present

      loadPage = lastPage - (onPage - 1);
    } // else first page, so load the very last page, ig. keep defaults

    logging.info("Page "+ onPage +" will now be page "+ loadPage);

    var $comments = $(".comments").last();

    if (onPage == loadPage) {
      //skip loading if in the exact middle of the thread pages
      $comments.append($comments.children().get().reverse());
    } else {
      $comments.empty();

      var loc = location.href;
      if (~loc.indexOf("?")) {
        loc = loc.replace(/page=\d+?&?/, ""); //keep other params
      } else {
        loc += "/search?";
      }

      $.ajax({
        method: "GET",
        url: loc + "&page=" + loadPage
      }).done(function(data) {
        var $data = $(data);

        $comments.append($data.find(".comments").last().children().get().reverse());
        $(".pagination__results").html($data.find(".pagination__results").html());
      });
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
      if (frogVars.threads.tracking.value && ~location.pathname.indexOf("/discussions")) { threads.tracking.lists("discuss", $doc); }
      if (frogVars.threads.tracking.value && ~location.pathname.indexOf("/discussion/")) { threads.tracking.posts("discuss", $doc); }
    },
    lists: function(set, $doc) {
      var $rows = $doc.find(".table__row-inner-wrap");
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
        var $summary = $(comment).find(".comment__summary").first(),
            id = $summary.attr("id");

        if (id && !~frogTracks[set][tag].indexOf(id)) {
          frogTracks[set][tag].push(id);
          var $when = $summary.find(".comment__actions").find("span");
          $when.parent().addClass("icon-green").attr("title", 'New');
          findings++;
        }
      });

      logging.info("Found "+ findings +" unread posts");
      GM_setValue("tracks["+ set +"]", JSON.stringify(frogTracks[set]));
    }
  },
  pins: {
    _found: [],
    injectButton: function() {
      if (!frogVars.threads.pinning.value || !~location.pathname.indexOf("/discussion/")) { return; }

      var tag = location.href.split("/")[4],
          activeClass = "fa-rotate-90 icon-green is-pinned",
          $tack = $("<i/>").addClass("fa fa-thumb-tack"),
          $pin = $("<div/>").addClass("is-clickable").html($tack)
                  .on('click', function(evt) {
                    if (frogTracks.pins[tag]) {
                      $tack.removeClass(activeClass);
                      delete frogTracks.pins[tag];
                      logging.info("Removed "+ tag +" from pins");
                    } else {
                      $tack.addClass(activeClass);
                      frogTracks.pins[tag] = location.href.split("/")[5]; //include last known name in tracking
                      logging.info("Added "+ tag +" to pins");
                    }

                    //save tracks
                    GM_setValue("tracks[pins]", JSON.stringify(frogTracks.pins));
                  });

      //switch to a removal pin if already set
      if (frogTracks.pins[tag]) { $tack.addClass(activeClass); }

      $(".page__heading__breadcrumbs").first().after($pin);
    },
    findPinned: function() {
      if (!frogVars.threads.pinning.value || !~location.pathname.indexOf("/discussions") || ~location.pathname.indexOf("/discussions/search")) { return; }

      var havePins = Object.keys(frogTracks.pins).length;
      logging.info("Adding "+ havePins +" pins above discussions");

      //add the pinned divider if needed
      if (havePins) {
        if (!$(".row-spacer").length) {
          $(".table__rows").prepend($("<div/>").addClass("row-spacer"));
        }
      }

      //add the actual pins
      for(var pinId in frogTracks.pins) {
        //if pin is not on current page (best case), then try pulling from search on last known title
        if (!threads.pins.pullFromPage($document, pinId, true)) {
          threads.pins.loadFromSearch(pinId, frogTracks.pins[pinId]);
        }
      };
    },
    pullFromPage: function($doc, pinId, local) {
      var $onPage = $doc.find("[href^='/discussion/"+ pinId +"/']").first().parents(".table__row-outer-wrap");
      if ($onPage.length) {
        if (local) { $onPage.addClass("is-local"); }

        threads.pins._found.push($onPage);
        threads.pins.attemptInjection();

        return $onPage;
      }

      return null;
    },
    loadFromSearch: function(pinId, pinTitle, failIfMissing) {
      $.ajax({
        method: "GET",
        url: "/discussions/search?q="+ pinTitle
      }).done(function(data) {
        if (!threads.pins.pullFromPage($(data), pinId) && !failIfMissing) {
          //thread has changed names - load discussion to pull new title, then pull from page (worst case)
          $.ajax({
            method: "GET",
            url: "/discussion/"+ pinId +"/"
          }).done(function(data) {
            var newTitle = $(data).find(".page__heading__breadcrumbs").first().children("a").last().text();

            //update saved information on pin
            frogTracks.pins[pinId] = newTitle;
            GM_setValue("tracks[pins]", JSON.stringify(frogTracks.pins));

            threads.pins.loadFromSearch(pinId, newTitle, true);
          });
        }
      });
    },
    attemptInjection: function() {
      if (threads.pins._found.length == Object.keys(frogTracks.pins).length) {
        threads.pins._found.sort(function(a,b) {
          //newest at the top
          return (+a.find("[data-timestamp]").attr("data-timestamp")) - (+b.find("[data-timestamp]").attr("data-timestamp"));
        });

        $.each(threads.pins._found, function(i, elm) {
          $(".table__rows").prepend(elm.addClass("is-pinned"));
        });

        loading.everyNew.generalPage($(".is-pinned").not(".is-local"));
      }
    }
  }
},
users = {
  profileHover: function($doc) {
    profiles.hover(true, $doc);
  },
  tagging: {
    show: function($doc) {
      if (!frogVars.social.customTags.value || ~location.pathname.indexOf('/user/')) { return; }

      $.each(Object.keys(frogTags.users), function(i, taglet) {
        $doc.find("a[href='/user/"+ taglet +"']").not(".global__image-outer-wrap,[class$='_image_avatar']").after(
          $("<span/>").addClass("user__tagged").html("<i class='fa fa-tag fa-flip-horizontal'></i> "+ frogTags.users[taglet])
        );
      });
    },
    injectEditor: function(user, isHover) {
      if (!frogVars.social.customTags.value || (!~location.pathname.indexOf('/user/') && !isHover)) { return; }
      if (~user.indexOf("/user/")) { user = user.substring(6); }
      if (user == $(".nav__avatar-outer-wrap").attr("href").substring(6)) { return; } //don't tag self

      profiles.editor(isHover, "user", "users", user);
    }
  },
  listIndication: function($doc) {
    if (!frogVars.social.userLists.value || ~location.pathname.indexOf('/user/')) {
      return; //not active on user pages for obvious reasons
    }

    helpers.listingPit.getList("white", function(whitened) {
      logging.info("Applying white to "+ whitened.length +" users");

      $.each(whitened, function(i, white) {
        $doc.find("a[href='"+ white +"']").not(".global__image-outer-wrap,[class$='_image_avatar']")
      .addClass("user__whitened").attr("title", "Whitelisted user").prepend("<i class='fa fa-star-o'></i> ");
      });
    });

    helpers.listingPit.getList("black", function(blackened) {
      logging.info("Applying black to "+ blackened.length +" users");

      $.each(blackened, function(i, black) {
        $doc.find("a[href='"+ black +"']").not(".global__image-outer-wrap,[class$='_image_avatar']")
      .addClass("user__blackened").attr("title", "Blacklisted user").prepend("<i class='fa fa-ban'></i> ");
      });
    });
  },
  injectListRefresh: function() {
    if (!frogVars.social.userLists.value || !~location.pathname.indexOf('/manage/')) { return; }

    var type = location.pathname.substring(location.pathname.lastIndexOf('/')+1, location.pathname.indexOf('list'));

    var reset = $("<a/>").attr('href', '#').attr('title', 'Resync SGT Frog')
        .html("<em class='fa fa-refresh'></em>").on('click', function() {
      helpers.listingPit.invalidateList(type);
      window.location.reload(false);
    });

    $(".page__heading").append($("<div/>").html(reset));
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
            $name = $(href).not(".global__image-outer-wrap,[class$='_image_avatar']").not($(".hover-panel__outer-wrap").find(href));

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
        var $name = $(href).not(".global__image-outer-wrap,[class$='_image_avatar']").not($(".hover-panel__outer-wrap").find(href));

        $name.attr("title", "").removeClass("user__whitened").toggleClass("user__blackened").find("i").not(".fa-tag").remove();
        if ($name.hasClass("user__blackened")) {
          $name.attr("title", "Blacklisted user").prepend("<i class='fa fa-ban'></i> ");
        }
      }
    });
  },
  moreStats: function($doc, isHover) {
    if (!frogVars.social.userStats.value || (!isHover && !~location.pathname.indexOf('/user/'))) { return; }

    var statElms = $doc.find(".featured__table__row__right");

    //real won
    var wonValElm = $(statElms[5]).find("[data-ui-tooltip]").last(),
        wonJSON = JSON.parse(wonValElm.attr('data-ui-tooltip')),
        won = wonJSON.rows[0].columns[1].name;
    wonJSON.rows.push({"icon": [{"class": "fa-eye", "color": "#ec8583"}], "columns": [{"name": "Display Value"}, {"name": wonValElm.html(), "color": "#8f96a6"}]});
    wonValElm.html(won +' / '+ wonValElm.html()).attr('data-ui-tooltip', JSON.stringify(wonJSON));

    //real sent
    var sentValElm = $(statElms[6]).find("[data-ui-tooltip]").last(),
        sentJSON = JSON.parse(sentValElm.attr('data-ui-tooltip')),
        sent = sentJSON.rows[0].columns[1].name;
    sentJSON.rows.push({"icon": [{"class": "fa-eye", "color": "#ec8583"}], "columns": [{"name": "Display Value"}, {"name": sentValElm.html(), "color": "#8f96a6"}]});
    sentValElm.html(sent +' / '+ sentValElm.html()).attr('data-ui-tooltip', JSON.stringify(sentJSON));

    //ratio
    var levelValElms = $(statElms[7]).find('[data-ui-tooltip]'),
        levelJSON = JSON.parse(levelValElms.first().attr('data-ui-tooltip')),
        ratio = +(sent.replace(/[^\d\.]/g, '')) / +(won.replace(/[^\d\.]/g, ''));
    levelJSON.rows.push({"icon": [{"class": "fa-percent", "color": "#8f96a6"}], "columns": [{"name": "Contributor Ratio"}, {"name": ratio.toFixed(2), "color": "#8f96a6"}]});
    levelValElms.attr('data-ui-tooltip', JSON.stringify(levelJSON));
  }
},
groups = {
  profileHover: function($doc) {
    profiles.hover(false, $doc);
  },
  tagging: {
    show: function() {
      if (!frogVars.social.customTags.value || ~location.pathname.indexOf('/group/')) { return; }

      $.each(Object.keys(frogTags.groups), function(i, taglet) {
        $document.find("a[href='/group/"+ taglet +"']").not(".global__image-outer-wrap,[class$='_image_avatar']").after(
          $("<span/>").addClass("group__tagged").html("<i class='fa fa-tag fa-flip-horizontal'></i> "+ frogTags.groups[taglet])
        );
      });
    },
    injectEditor: function(group, isHover) {
      if (!frogVars.social.customTags.value || (!~location.pathname.indexOf('/group/') && !isHover)) { return; }
      if (~group.indexOf("/group/")) { group = group.substring(6); }

      profiles.editor(isHover, "group", "groups", group);
    }
  }
},
profiles = {
  _frame: null,
  hover: function(isUser, $doc) {
    if (!frogVars.social.hoverInfo.value) { return; }

    var $box = profiles._frame;
    if ($box == null) {
      var $box = $("<div/>").addClass("global__image-outer-wrap hover-panel__outer-wrap").appendTo($("body")).hide();
      profiles._frame = $box;

      var $hoverbox = $("<div/>").addClass("hover-panel__inner-wrap").appendTo($box);
      $("<a/>").addClass("hover-panel__link").append($("<div/>").addClass("hover-panel__image")).appendTo($hoverbox);
      $("<div/>").addClass("hover-panel__corner").appendTo($hoverbox);
      $("<div/>").addClass("hover-panel__stats").appendTo($hoverbox);
    }

    var hoverTime, lastLoad = null,
        $userAvs = $doc.find(".global__image-inner-wrap,[class$='_image_avatar']")
                        .not(".global__image-outer-wrap--missing-image");

    $.each($userAvs, function(i, av) {
      var $av = $(av),
          link = $av.attr("href") || $av.parent().attr("href"); //account for image-wrap usages

      if (!link
          || (isUser && !~link.indexOf("/user/"))
          || (!isUser && !~link.indexOf("/group/"))) { return; }

      $av.hover(function(ev) {
        var $this = $(this);

        if (hoverTime) {
          window.clearTimeout(hoverTime);
          hoverTime = null;
        }
        hoverTime = window.setTimeout(function() {
          //reset box for new load (unless same profile)
          if (link != lastLoad) {
            var $userimage = $box.find(".hover-panel__link"),
                $userstats = $box.find(".hover-panel__stats"),
                $usercorner = $box.find(".hover-panel__corner");

            $userimage.attr("href", link);
            $userimage.find("div").css("background-image", $this.css("background-image"));
            helpers.applyGradients($userstats.html(""), "#515763 0%, #2f3540 100%");
            helpers.applyGradients($usercorner.html($("<i/>").addClass("hover-panel__icon-load fa fa-spin fa-circle-o-notch")), "#424751 0%, #2f3540 100%");

            $.ajax({
              method: "GET",
              url: link
            }).done(function(data) {
              var $data = $(data);
              lastLoad = link;

              if (isUser) {
                //pre-apply stats if needed
                users.moreStats($data, true);
              }

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
                var user = link;
                users.listenForLists(user, true);
                users.tagging.injectEditor(user, true);
              } else {
                var group = link.substring(7);
                groups.tagging.injectEditor(group, true);
              }
            });
          } else {
            users.listenForLists(lastLoad, true); //removed when hidden, so re-add on showing same profile
          }

          //detect if image is on the right side of the window
          var $target = $(ev.target), edge = 0;
          if (($target.offset().left + $box.width()) > window.innerWidth) {
            edge = ev.target.offsetWidth - $box.width();
            $box.addClass("hover-reversed");
          } else {
            $box.removeClass("hover-reversed");
          }

          $box.show()
              .css("left", $target.offset().left - 1 - parseInt($this.parent().css("padding-left")) + edge)
              .css("top", $target.offset().top - 1 - parseInt($this.parent().css("padding-top")));
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

        $div.html("<input type='text' placeholder='Custom Tag' value='"+ (frogTags[tagKey][tagTarget] || "") +"' maxlength='64' />")
            .on("keypress", function(ev) {

          var $this = $(this),
              code = ev.which || ev.keyCode;

          if (code == 13) {
            var val = $(this).children("input").val();
            $div.html("<a>"+ ielm + (val || "Add Tag") +"</a>");
            $("a[href='/"+ setName +"/"+ tagTarget +"']").siblings("."+ setName +"__tagged").remove();

            logging.debug("Changing " + setName + " value to " + val);

            //reload frogTags in case it changed on another tab
            frogTags[tagKey] = JSON.parse(GM_getValue(setName +"Tags", '{}'));

            if (val) {
              frogTags[tagKey][tagTarget] = val;

              if (isHover) {
                $("a[href='/"+ setName +"/"+ tagTarget +"']").not(".global__image-outer-wrap,[class$='_image_avatar']").after(
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
    helpers.style.apply();

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
    giveaways.injectWins($document);
    giveaways.highlightCopies($document);
    giveaways.filters.inject();

    giveaways.injectSearch($document);
    giveaways.injectNavSearch();
    giveaways.hideEntered($document);
    giveaways.easyHide($document);
    giveaways.gridForm($document);
    giveaways.injectWinnerTools();
    giveaways.injectEndDate();
    giveaways.expandedGroups();
    giveaways.continueHiding();

    sidebar.removeMyGA();
    sidebar.injectSGTools();
    sidebar.activeThreads.find();

    threads.reverse($document);
    threads.injectTimes($document);
    threads.tracking.all($document);
    threads.commentBox.moveToTop();
    threads.commentBox.injectPageHelpers();
    threads.commentBox.injectPagePreview();
    threads.commentBox.injectEdit($document);
    threads.pins.injectButton();
    threads.pins.findPinned();

    users.profileHover($document);
    users.tagging.show($document);
    users.tagging.injectEditor($(".featured__heading__medium").text());
    users.listIndication($document);
    users.listenForLists($(".featured__heading__medium").text());
    users.injectListRefresh();
    users.moreStats($document);

    groups.profileHover($document);
    groups.tagging.show();
    groups.tagging.injectEditor(location.pathname.substring(location.pathname.indexOf("/group/")+7));
  }
  catch(err) {
    logging.alert(err);
  }

  //these need delayed to function properly
  $(window).load(function() {
    $document.scroll();

    try {
      giveaways.bulkFeatured.find();
      threads.collapseDiscussion();
    }
    catch(err) {
      logging.alert(err);
    }
  });
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
