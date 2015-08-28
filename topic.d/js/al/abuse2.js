var Abuse2 = {
  switchContentTab: function(el, oid, name, event) {
    if (checkEvent(event)) {
      return true;
    }
    ajax.post('/abuse2.php', {act: 'a_get_content', oid: oid, content_tab: name}, {
      onDone: function(html) {
        removeClass(geByClass1('active', el.parentNode, 'a'), 'active');
        addClass(el, 'active');
        val('ab2_content'+oid, html);
      }
    });
    return false;
  },
  switchActivityTab: function(el, oid, name, event) {
    if (checkEvent(event)) {
      return true;
    }
    ajax.post('/abuse2.php', {act: 'a_get_activity', oid: oid, activity_tab: name}, {
      onDone: function(html) {
        removeClass(geByClass1('active', el.parentNode, 'a'), 'active');
        addClass(el, 'active');
        val('ab2_activity'+oid, html);
        cur.checkedActivity = {};
      }
    });
    return false;
  },
  activityRowOver: function(el) {
    hasClass(el, 'ab2_activity_row_expired') ?
      addClass(el, 'ab2_activity_row_expired_over') :
      addClass(el, 'ab2_activity_row_over');
  },
  activityRowOut: function(el) {
    hasClass(el, 'ab2_activity_row_expired') ?
      removeClass(el, 'ab2_activity_row_expired_over') :
      removeClass(el, 'ab2_activity_row_over');
  },
  checkActivity: function (el, oid, ev, event) {
    if (Abuse2.checkActivityClick(el, event)) {
      return;
    }
    var isOn = false, checked = cur.checkedActivity[oid];
    if (checked == undefined) {
      checked = cur.checkedActivity[oid] = {};
    } else if (checked[ev]) {
      isOn = true;
    }
    toggleClass(ge('ab2_activity_row_' + ev), 'ab2_activity_row_on');
    if (isOn) {
      delete checked[ev];
    } else {
      checked[ev] = 1;
    }
    Abuse2.checkBlockingAvailable(oid);
  },
  checkActivityClick: function (el, event) {
    event = event || window.event;
    if (!el && !event) return false;
    var target = event.target || event.srcElement,
      i = 7,
      foundGood = false,
      checkeRE = /ab2_activity_row_info|ab2_activity_user_link_photo|ab2_activity_row/;
    do {
      if (!target ||
        target != el &&
        (target.onclick ||
        target.onmousedown) ||
        target.tagName == 'A' ||
        target.tagName == 'IMG' ||
        target.tagName == 'TEXTAREA' ||
        (foundGood = checkeRE.test(target.className))
      ) {
        break;
      }
    } while (i-- && (target = target.parentNode));
    if (!foundGood) {
      return true;
    }
    var sel = trim((
    window.getSelection && window.getSelection() ||
    document.getSelection && document.getSelection() ||
    document.selection && document.selection.createRange().text || ''
    ).toString());
    if (sel) {
      return true;
    }
    return false;
  },
  checkContent: function(oid, ev, el ,event) {
    cancelEvent(event);
    var isOn = false, checked = cur.checkedActivity[oid];
    if (checked == undefined) {
      checked = cur.checkedActivity[oid] = {};
    } else if (checked[ev]) {
      isOn = true;
    }
    toggleClass(ge('ab2_content_' + ev), 'ab2_content_on');
    if (isOn) {
      delete checked[ev];
    } else {
      checked[ev] = 1;
    }
    Abuse2.checkBlockingAvailable(oid);
    return false;
  },
  checkBlockingAvailable: function(oid) {
    if (!ge('ab2_block_btn'+oid)) return;

    var btn_node = ge('ab2_block_btn'+oid).parentNode;
    if ((!cur.checkedActivity[oid] || Object.keys(cur.checkedActivity[oid]).length == 0) && Abuse2.getCustomReason(oid) == '') {
      !hasClass(btn_node, 'button_disabled') && addClass(btn_node, 'button_disabled')
    } else {
      hasClass(btn_node, 'button_disabled') && removeClass(btn_node, 'button_disabled')
    }
  },
  getCustomReason: function(oid) {
    return val('ab2_custom_reason'+oid).trim();
  },
  changeReason: function(obj, oid, i) {
    ge('top_reason_' + oid).value = i;
    addClass(obj, 'on');
    for (j = 1; j <= 3; j++) {
      if (j != i) removeClass(ge('ab2_reason_' + oid + '_' + j), 'on');
    }
  },
  solve: function(el, oid, status, hash) {
    var evs = [];

    if (hasClass(el.parentNode, 'button_disabled')) {
      return false;
    }

    var solveParams = {act: 'a_solve', oid: oid, status: status, hash: hash, reason: ge('top_reason_'+oid).value};

    if (status == 1) {
      var custom_activity = Abuse2.getCustomReason(oid);
      if (custom_activity) {
        solveParams.custom_activity = custom_activity;
        evs.push(custom_activity)
      } else if (cur.checkedActivity) {
        each(cur.checkedActivity[oid] || {}, function (ev) {evs.push(ev)});
      }
      if (evs.length == 0) {
        addClass(el.parentNode, 'button_disabled')
        return false;
      }
      solveParams.evs = evs.join(',');
    }

    ajax.post('abuse2.php', solveParams, {
    onDone: function (text, lynch_links) {
      val('ab2_actions' + oid, text);
        ge('ab2_lynch_links'+oid).innerHTML = lynch_links;
      }
    });
    val('ab2_actions' + oid, '<div class="progress ab2_solve_progress"></div>');
    hide('ab2_patterns'+oid);
    if (cur.options) {
      cur.pgOffset--;
      cur.pgCount--;
      animate('ab2_feed_row' + oid, {opacity: 0.5}, 200);
    }
    return false;
  },
  solveCancel: function (oid, solved, hash) {
    ajax.post('abuse2.php', {act: 'a_cancel_solve', oid: oid, solved: solved, hash: hash}, {
      onDone: function (text, pattern_links) {
        val('ab2_actions' + oid, text);
        val('ab2_patterns'+oid, pattern_links);
        ge('ab2_lynch_links'+oid).innerHTML = '';
        Abuse2.checkBlockingAvailable(oid);
      }
    });
    val('ab2_actions' + oid, '<div class="progress ab2_solve_progress"></div>');
    if (cur.options) {
      cur.pgOffset++;
      cur.pgCount++;
      animate('ab2_feed_row' + oid, {opacity: 1}, 200);
    }
    return false;
  },
  removeFromSearch: function(el, oid, solved, hash) {
    ajax.post('abuse2.php', {act: 'a_remove_from_search', oid: oid, solved: solved, hash: hash}, {
      onDone: function () {
        hide(el);
      }
    });
    el.innerHTML = '<div class="progress inline ab2_solve_progress"></div>';
    return false;
  },
  init: function(opts) {
    extend(cur, {
      options: opts,
      checkedActivity: {},
      module: 'abuse2',
      _back: {
        text: '������: �����',
        show: [Abuse2.initScroll],
        hide: [function() {
          removeEvent((browser.msie6 ? pageNode : window), 'scroll', Abuse2.scrollCheck);
          removeEvent(window, 'resize', Abuse2.scrollCheck);
        }]
      },
    });
    if (vk.version) {
      addEvent(window, 'load', Abuse2.initScroll);
    } else {
      Abuse2.initScroll();
    }
    Abuse2.contentLoadLazy(cur.options.lazy_owners);
    if (cur.options.show_more) {
      Abuse2.showMore();
    }
  },
  scrollCheck: function() {
    if (browser.mobile) return;
    var el = ge('ab2_more_link');
    if (!isVisible(el)) return;

    var ch = window.innerHeight || document.documentElement.clientHeight || bodyNode.clientHeight,
      st = scrollGetY(), top, ntop = 0, el, nel, bits, posts = [];

    if (st + ch + 2000 > el.offsetTop) {
      Abuse2.showMore();
    }
  },
  showMore: function() {
    show('ab2_more_progress');
    hide('ab2_more_link');

    if (cur.options.offset == 0 || cur.options.show_more == false) {
      hide('ab2_more_progress');
      return;
    }

    var params = cur.options.params;

    params['part'] = 1;
    ajax.post(cur.options.url, params, {
      onDone: function(next_offset, show_more, rows_html, lazy_owners) {
        var au = ce('div'), ab2_rows_cont = ge('ab2_feed_rows');
        au.innerHTML = rows_html;
        while (row = au.firstChild) {
          ab2_rows_cont.appendChild(row);
        }

        Abuse2.contentLoadLazy(lazy_owners);

        cur.options.offset = next_offset;
        cur.options.show_more = show_more;
        if (!show_more) {
          removeEvent((browser.msie6 ? pageNode : window), 'scroll', Abuse2.scrollCheck);
          removeEvent(window, 'resize', Abuse2.scrollCheck);
          hide('ab2_more_progress');
        } else {
          hide('ab2_more_progress');
          show('ab2_more_link');
          setTimeout(Abuse2.scrollCheck, 200);
        }
      }
    });
  },
  initScroll: function() {
    addEvent((browser.msie6 ? pageNode : window), 'scroll', Abuse2.scrollCheck);
    addEvent(window, 'resize', Abuse2.scrollCheck);
  },
  contentLoadLazy: function(owners) {
    each(owners, function(i, oid){
      geByClass1('ab2_content_tab', ge('ab2_feed_row'+oid), 'a').click();
    });
  },
  toLynch: function(el, oid, board, hash) {
    var parent_node = el.parentNode,
      parent_content = parent_node.innerHTML;

    parent_node.innerHTML = '<div class="progress ab2_solve_progress"></div>';
    ajax.post('/abuse2.php', {act: 'a_to_lynch', oid: oid, board: board, hash: hash}, {
      onDone: function (text) {
        parent_node.innerHTML = text;
      },
      onFail: function() {
        parent_node.innerHTML = parent_content;
      }
    });

    return false;
  },
  undoLynch: function(el, oid, board, post_id, hash) {
    var parent_node = el.parentNode,
      parent_content = parent_node.innerHTML;

    parent_node.innerHTML = '<div class="progress ab2_solve_progress"></div>';
    ajax.post('/abuse2.php', {act: 'a_undo_lynch', oid: oid, board: board, post_id: post_id, hash: hash}, {
      onDone: function (text) {
        parent_node.innerHTML = text;
      },
      onFail: function() {
        parent_node.innerHTML = parent_content;
      }
    });

    return false;
  }
};

var AbuseTest = {
  init: function() {
    cur.timer = setInterval(function(){
      var sec_left = parseInt(cur.time_until-Date.now()/1000);
      if (sec_left <= 0) {
        ge('ab_test_timer').innerHTML = '00:00';
        cur.timer && clearInterval(cur.timer);
      } else {
        var min = parseInt(sec_left/60), sec = sec_left%60;
        min = min < 10 ? ('0'+min) : min;
        sec = sec < 10 ? ('0'+sec) : sec;
        ge('ab_test_timer').innerHTML = min+':'+sec;
      }
      if (sec_left < 3) {
        AbuseTest.submit();
      }
    }, 50);
  },
  submit: function() {
    if (cur.processing || cur.time_over) {
      return;
    }
    cur.processing = true;
    var params = {
      act: 'a_submit',
      hash: val('ab_test_hash'),
      answer1_1: val('answer1_1'),
      answer1_2: val('answer1_2'),
      answer1_3: val('answer1_3'),
      answer1_4: val('answer1_4'),
      answer1_5: val('answer1_5'),
      answer1_6: val('answer1_6'),
      answer2: val('answer2'),
    };
    ajax.post('/abuse_test.php', params, {
      onDone: function(is_over, msg) {
        if (is_over == 1) {
          ge('ab_test_timer').innerHTML = '00:00';
          cur.timer && clearInterval(cur.timer);
          ge('ab_test_actions').innerHTML = msg;
          cur.time_over = true;
        } else {
          fadeTo('ab_test_saved', 100, 70, function() {
            fadeTo('ab_test_saved', 2000, 0);
          });
        }
        cur.processing = false;
      },
      onFail: function() {
        cur.processing = false;
      }
    });
  }
};
try{stManager.done('abuse2.js');}catch(e){}
