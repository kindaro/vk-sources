// (c) Eugene Z.
// vk.com/ez

Array.prototype.min = function() {
  var min = this[0];
  var len = this.length;
  for (var i = 1; i < len; i++)
    if (this[i] < min) min = this[i];
  return min;
};

if (!Array.prototype.forEach) {
  Array.prototype.forEach = function(fn, scope) {
    for (var i = 0, len = this.length; i < len; ++i) {
      fn.call(scope, this[i], i, this);
    }
  }
}
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function (searchElement, fromIndex) {
    if ( this === undefined || this === null ) {
      throw new TypeError( '"this" is null or not defined' );
    }

    var length = this.length >>> 0; // Hack to convert object.length to a UInt32

    fromIndex = +fromIndex || 0;

    if (Math.abs(fromIndex) === Infinity) {
      fromIndex = 0;
    }

    if (fromIndex < 0) {
      fromIndex += length;
      if (fromIndex < 0) {
        fromIndex = 0;
      }
    }

    for (;fromIndex < length; fromIndex++) {
      if (this[fromIndex] === searchElement) {
        return fromIndex;
      }
    }

    return -1;
  };
}

var browser = (function() {
  var _ua = navigator.userAgent.toLowerCase();
  var browser = {
    version: (_ua.match(/.+(?:me|ox|on|rv|it|ra|ie)[\/: ]([\d.]+)/) || [0,'0'])[1],
    opera: /opera/i.test(_ua),
    msie: (/msie/i.test(_ua) && !/opera/i.test(_ua)),
    msie6: (/msie 6/i.test(_ua) && !/opera/i.test(_ua)),
    msie7: (/msie 7/i.test(_ua) && !/opera/i.test(_ua)),
    msie8: (/msie 8/i.test(_ua) && !/opera/i.test(_ua)),
    msie9: (/msie 9/i.test(_ua) && !/opera/i.test(_ua)),
    mozilla: /firefox|iceweasel/i.test(_ua),
    chrome: /chrome/i.test(_ua),
    safari: (!(/chrome/i.test(_ua)) && /webkit|safari|khtml/i.test(_ua)),
    mac: /mac/i.test(_ua),
    opera_mobile: /opera mini|opera mobi/i.test(_ua),
    opera_mini: /opera mini/i.test(_ua),
    iphone: /iphone/i.test(_ua),
    ipod: /ipod/i.test(_ua),
    iphone4: /iphone.*OS 4/i.test(_ua),
    ipod4: /ipod.*OS 4/i.test(_ua),
    ipad: /ipad/i.test(_ua),
    android: /android/i.test(_ua),
    bada: /bada/i.test(_ua),
    mobile: /iphone|ipod|ipad|opera mini|opera mobi|iemobile/i.test(_ua),
    msie_mobile: /iemobile/i.test(_ua)
  };
  return browser;
})();

/* var FakeVK = {
  data: null,
  offset: 0,
  init: function(f) {
    var self = this;
    VK.api("photos.get", {
      owner_id: 1752880,
      album_id: 135896403,
      rev: 1,
      extended: 0
    }, function(response, error) {
      self.data = response;
      if (f) f();
    });
  },
  api: function(method, params, callback) {
    if (method != "photos.get") return;

    var limit = params.count || -1;
    var items;
    if (limit == -1) items = this.data.items.slice(this.offset);
    else items = this.data.items.slice(this.offset, this.offset + limit);

    var response = {
      count: this.data.items.length,
      items: items
    };

    this.offset += random(0, 100);
    callback(response, null);
  }
}; */

var VK = {
  callbackId: 0,
  callbacks: {},
  v: "5.5",
  // token: "",

  api: function(method, params, callback) {
    var self = this;
    var script = document.createElement("script");
    var callbackId = ++this.callbackId;
    this.callbacks[callbackId] = function(data) {
      try {
        if (data.response) callback(data.response, null);
        else callback(null, data.error);
      } catch (e) {}

      delete self.callbacks[callbackId];
      remove(script);
    };

    extend(params, {
      callback: "VK.callbacks["+callbackId+"]",
      // access_token: this.token,
      v: this.v
    });

    script.src = "https://api.vk.com/method/"+method+"?"+buildQueryString(params);
    document.getElementsByTagName("head")[0].appendChild(script);
  }
};

function createCookie(name, value, days, domain) {
  var expires = '';
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days*24*60*60*1000));
    expires = '; expires=' + date.toGMTString();
  }
  document.cookie = name + '=' + value + expires + '; path=/; domain='+( domain || "." + window.location.host );
}
function getCookie(name) {
  var cookieCrumbs = document.cookie.split(';');
  var nameToFind = name + '=';
  for (var i = 0; i < cookieCrumbs.length; i++) {
    var crumb = cookieCrumbs[i];
    while (crumb.charAt(0) == ' ') {
      crumb = crumb.substring(1, crumb.length);
    }
    if (crumb.indexOf(nameToFind) == 0) {
      return crumb.substring(nameToFind.length, crumb.length);
    }
  }
  return null;
}

function getURIParams() {
  var query = location.search.substr(1).replace(/\&amp;/g, '&'), data = query.split("&"), result = {};

  for (var i = 0; i < data.length; i++) {
    var item = data[i].split("=");
    result[item[0]] = item[1];
  }

  return result;
}
function normalFloat(f) {
  return parseFloat( parseFloat(f).toFixed(3) );
}
function random(m, n) {
  m = parseInt(m);
  n = parseInt(n);
  return Math.floor( Math.random() * (n - m + 1) ) + m;
}
function avg(a, b) {
  return (a + b) / 2;
}
function getRatio(w, h) {
  return w / h;
}
function isSquare(ratio) {
  return ratio >= 0.98 && ratio <= 1.02;
}
function abs(a) {
  return Math.abs(a);
}
function isFunction(obj) {
  return Object.prototype.toString.call(obj) === "[object Function]";
}
function isArray(obj) {
  return Object.prototype.toString.call(obj) === "[object Array]";
}
function isObject(obj) {
  return Object.prototype.toString.call(obj) === "[object Object]";
}
function clone(obj, copy_objects) {
  if (typeof obj != 'object') return obj;

  copy_objects = copy_objects !== undefined ? copy_objects : true;
  var copy = obj.constructor();
  for (var attr in obj) {
    if (obj.hasOwnProperty(attr)) {
      if (isObject(obj[attr]) && copy_objects) copy[attr] = clone(obj[attr]);
      else copy[attr] = obj[attr];
    }
  }

  return copy;
}
function shuffle(o) {
  for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
};
function arrayEquals(arr1, arr2) {
  if (!isArray(arr1) || !isArray(arr2) || arr1.length != arr2.length) return false;
  var i;
  for (i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
}
function getStackTrace(split) {
  split = split === undefined ? true : split;
  try {
    o.lo.lo += 0;
  } catch(e) {
    if (e.stack) {
      return split ? e.stack.split('\n') : e.stack;
    }
  }
  return null;
}
function getTimestamp(ms) {
  if (ms === undefined) ms = false;
  return !ms ? Math.round((new Date()).getTime() / 1000) : (new Date()).getTime();
}
function intval(n) {
  return parseInt(n, 10) || 0;
}
function remove(el) {
  el.parentNode.removeChild(el);
}
function extend(dest, source) {
  for (var i in source) {
    dest[i] = source[i];
  }
}
function buildQueryString(obj) {
  var list = [], i;
  for (i in obj) list.push(encodeURIComponent(i)+'='+encodeURIComponent(obj[i]));

  return list.join('&');
}
function addEvent(element, eventType, f, useCapture) {
  if (eventType.indexOf(' ') != -1) {
    var events = eventType.split(' ');
    for (var i = 0; i < events.length; i++) if (events[i] != '') {
      addEvent(element, events[i], f, useCapture);
    }
    return;
  }

  useCapture = useCapture || false;
  if (element.addEventListener) {
    element.addEventListener(eventType, f, useCapture);
    return true;
  } else if (element.attachEvent) {
    return element.attachEvent('on' + eventType, f);
  }

  return false;
}
function removeEvent(element, eventType, f, useCapture) {
  if (eventType.indexOf(' ') != -1) {
    var events = eventType.split(' ');
    for (var i = 0; i < events.length; i++) {
      if (events[i] != '') {
        removeEvent(element, events[i], f, useCapture);
      }
    }
    return;
  }

  useCapture = useCapture || false;
  if (element.removeEventListener) {
    element.removeEventListener(eventType, f, useCapture);
  } else if (element.detachEvent) {
    return element.detachEvent('on' + eventType, f);
  }

  return false;
}
function cancelEvent(e) {
  e = e || window.event;
  if (!e) return false;

  e = e.originalEvent || e;
  if (e.preventDefault) e.preventDefault();
  if (e.stopPropagation) e.stopPropagation();

  e.cancelBubble = true;
  e.returnValue = false;

  return false;
}
function print() {
  if (window.console) {
    try {
      console.log.apply(console, arguments);
    } catch (e) {
      try {
        for (var i = 0; i < arguments.length; i++) {
          var arg = arguments[i];
          if (browser.msie8) arg = JSON.stringify(arg);
          console.log(arg);
        };
      } catch(e) {}
    }
  }
}

function ge(id) {
  return document.getElementById(id);
}
function gb() { return document.getElementsByTagName('body')[0]; }
function createFromHTML(html) {
  var e = document.createElement('div');
  e.innerHTML = html;

  var i;
  for (i in e.childNodes) {
    if ((browser.msie8 && e.childNodes[i].nodeType == 1) || (!browser.msie8 && e.childNodes[i] instanceof HTMLElement)) return e.childNodes[i];
  }

  return e.firstChild;
}
function getStyle(element, _css) {
  try {
    if (window.getComputedStyle) {
      var compStyle = window.getComputedStyle(element, '');
      return compStyle.getPropertyValue(_css);
    } else if (element.currentStyle) {
      return element.currentStyle[toCamelCase(_css)];
    } else {
      return undefined;
    }
  } catch(e) {
    print('[getElementStyle]', element, e);
    return undefined;
  }
}
function setStyle(el, name, value) {
  if (!el) return false;

  if (typeof name == 'object') {
    for (var key in name) {
      setStyle(el, key, name[key]);
    }
    return;
  }

  el.style[toCamelCase(name)] = value;

  if (name.toLowerCase() == 'opacity' && browser.msie && parseFloat(browser.version) < 9.0) {
    if ((value + '').length) {
      if (value !== 1) {
        el.style.filter = 'alpha(opacity=' + (value * 100) + ')';
      } else {
        el.style.filter = '';
      }
    } else {
      el.style.cssText = el.style.cssText.replace(/filter\s*:[^;]*/gi, '');
    }
  }
}
function toCamelCase(_css) {
  var stringArray = _css.toLowerCase().split('-');
  if (stringArray.length == 1) {
    return stringArray[0];
  }

  var ret = (_css.indexOf("-") == 0) ? stringArray[0].charAt(0).toUpperCase() + stringArray[0].substring(1) : stringArray[0];
  for (var i = 1; i < stringArray.length; i++) {
    var s = stringArray[i];
    ret += s.charAt(0).toUpperCase() + s.substring(1);
  }

  return ret;
}
function addClass(element, _class) {
  if (element.className === undefined) element.className = '';

  var spl = element.className.split(' '), found = false;
  for (var i = 0; i < spl.length; i++) {
    if (spl[i] == '') continue;
    if (spl[i] == _class) {
      found = true;
      break;
    }
  }

  if (!found) {
    element.className += " " + _class;
  }
}
function removeClass(element, _class) {
  if (element.className === undefined) {
    element.className = '';
    return;
  }

  var re = new RegExp(' ?'+_class, 'g');
  element.className = element.className.replace(re, '');
}
function getPaddings(el) {
  var params = {padding: {}, margin: {}};
  var types = ["padding", "margin"], subtypes = ["top", "bottom", "left", "right"];
  var type, subtype, i, j;

  for (i = 0; i < types.length; i++) {
    type = types[i];
    for (j = 0; j < subtypes.length; j++) {
      subtype = subtypes[j];
      params[type][subtype] = intval(getStyle(el, type+"-"+subtype));
    }
  }

  return params;
}
function getDocumentSize() {
  return {
    x: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
    y: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
  };
}
function hide(el) {
  setStyle(el, "display", "none");
}
function show(el, dsp) {
  dsp = dsp || "block";
  setStyle(el, "display", dsp);
}

var Fx = {
  processes: {},
  nextIndex: 0,

  // change opacity
  // alias for Fx.style with opacity param
  opacity: function(el, opts) {
    this.style(el, "opacity", opts);
  },

  style: function(el, style, g_opts) {
    if (!el && !isFunction(g_opts.el)) {
      print("[Fx.style] el is undefined");
      return false;
    }

    if (isFunction(g_opts.el) && typeof g_opts.el() != "object") {
      print("[Fx.style] g_opts.el() returned something, but not object");
      return false;
    }

    var getel = function() {
      return el ? el : g_opts.el();
    };
    var opts = {
      finishValue: 0,
      f: function(x) {
        return x;
      },
      dur: 1000,
      kill: true,
      rtCallback: [],
      callback: function() {},
      freq: 15
    };
    extend(opts, g_opts);

    var isColor = ['color', 'background-color', 'border-top-color', 'border-bottom-color'].indexOf(style) != -1;
    var changeColor = isColor ||
      ( style == 'background-image' && opts.linearGradient );
    var i, currentRGB, tmp, gradcolors = [];

    // Convert values
    if (style == 'background-image' && opts.linearGradient) {
      // if gradients options does not exists, we can not continue
      if (!opts.gradientOptions) {
        print('[fx.style] missing gradient options');
        return false;
      }

      for (i = 0; i < opts.startValue.length; i++)
        if (typeof opts.startValue[i] == 'string') opts.startValue[i] = parseHTMLColor(opts.startValue[i]);
      for (i = 0; i < opts.finishValue.length; i++)
        if (typeof opts.finishValue[i] == 'string') opts.finishValue[i] = parseHTMLColor(opts.finishValue[i]);
    }

    if (isColor) {
      if (typeof opts.startValue == 'string') opts.startValue = parseHTMLColor(opts.startValue);
      if (typeof opts.finishValue == 'string') opts.finishValue = parseHTMLColor(opts.finishValue);
    }

    var already = this.checkProcess(getel(), style);
    if (already !== false && opts && opts.kill) {
      this.killProcess(already);
    }

    // Get start colors
    if (changeColor) {
      var fromColor, currentValue = getStyle(getel(), style) || opts.currentValue;
      var isTransparent;
      if (currentValue == 'transparent') isTransparent = true;
      else {
        var _m = currentValue.toLowerCase().match(/rgba\(([\d]+),\s+([\d]+),\s+([\d])+,\s+([\d]+)\)/);
        if (_m && !intval(_m[4])) isTransparent = true;
      }

      if (opts.currentValue && isTransparent) currentValue = opts.currentValue;

      if (isColor) {
        if (typeof currentValue == 'string') fromColor = parseHTMLColor(currentValue);
      }

      if (style == "background-image" && opts.linearGradient) {
        if (currentValue.match(/linear-gradient\(/g)) {
          var regexps = [
            /(rgb\([\d]+\,[\s]+[\d]+,[\s]+[\d]+\))/g, // for rgb()
            /\#[\d\w]+/g // for html color
          ];
          var match = null, matched = 0;
          for (i = 0; i < regexps.length; i++) {
            match = currentValue.match(regexps[i]);
            if (match !== null) {
              matched = i;
              break;
            }
          }

          if (match !== null) {
            fromColor = [];
            if (matched == 0) { // rgb(r, g, b)
              for (i = 0; i < match.length; i++) fromColor.push(match[i].match(/[0-9]+/g));
              for (i = 0; i < fromColor.length; i++)
                for (var j = 0; j < fromColor[i].length; j++)
                  fromColor[i][j] = intval(fromColor[i][j]);
            } else { // #rrggbb
              for (i = 0; i < match.length; i++) fromColor.push(parseHTMLColor(match));
            }
          }
        }
      }
    }

    // Fix duration
    if (opts.startValue) {
      if (changeColor) {
        // for "color"
        if (isColor) {
          currentValue = fromColor;

          // match current val with finish
          if (arrayEquals(currentValue, opts.finishValue)) return true;

          // match current val with start
          if (!arrayEquals(currentValue, opts.startValue)) {
            var startRGB = opts.startValue,
              currentRGB = currentValue,
              finishRGB = opts.finishValue;

            var startmid = (startRGB[0] + startRGB[1] + startRGB[2]) / 3,
              currentmid = (currentRGB[0] + currentRGB[1] + currentRGB[2]) / 3,
              finishmid = (finishRGB[0] + finishRGB[1] + finishRGB[2]) / 3;

            if (( startmid <= currentmid && currentmid <= finishmid ) ||
              ( startmid >= currentmid && currentmid >= finishmid )) {
              var x1 = startmid, x2 = finishmid;
              var per = ((currentmid - x1) * 100) / (x2 - x1);
              opts.dur = opts.dur - intval(per * opts.dur / 100);
              print('[fx.style] fixed color dur, dur='+opts.dur);
            }
          }
        }

        // for linear gradients
        else if (style == "background-image" && opts.linearGradient) {
          var same = true;

          // match current value with finish value
          if (fromColor.length == opts.finishValue.length) {
            for (i = 0; i < fromColor.length; i++) {
              if (!arrayEquals(fromColor[i], opts.finishValue[i])) {
                same = false;
                break;
              }
            }
            if (same) return true;
          }

          // match current value with start value
          var same = true;
          for (i = 0; i < fromColor.length; i++) {
            if (!arrayEquals(fromColor[i], opts.startValue[i])) {
              same = false;
              break;
            }
          }

          if (!same) { // if current val != start val
            var startRGB = opts.startValue[0],
              currentRGB = fromColor[0],
              finishRGB = opts.finishValue[0];

            var startmid = (startRGB[0] + startRGB[1] + startRGB[2]) / 3,
              currentmid = (currentRGB[0] + currentRGB[1] + currentRGB[2]) / 3,
              finishmid = (finishRGB[0] + finishRGB[1] + finishRGB[2]) / 3;

            if (( startmid <= currentmid && currentmid <= finishmid ) ||
              ( startmid >= currentmid && currentmid >= finishmid )) {
              var x1 = startmid, x2 = finishmid;
              var per = ((currentmid - x1) * 100) / (x2 - x1);
              opts.dur = opts.dur - intval(per * opts.dur / 100);
              print('[fx.style] fixed linear-gradient dur, dur='+opts.dur);
            }
          }
        }
      } else {
        if (currentValue == opts.finishValue) return true;

        if (parseFloat(opts.startValue) != parseFloat(opts.currentValue)) {
          if ((opts.startValue <= currentValue && currentValue <= opts.finishValue) ||
            (opts.startValue >= currentValue && currentValue >= opts.finishValue)) {
            // correct time
            var x1 = opts.startValue,
              x2 = opts.finishValue;

            var per = ((currentValue - x1) * 100) / (x2 - x1);
            opts.dur = opts.dur - intval(per * opts.dur / 100);
          }
        }
      }
    }

    // run it
    var activeindex = this.getNextIndex();
    this.processes[activeindex] = {
      type: style,
      element: getel()
    };

    var self = this;
    var rtCallbackStatus = [], rt;
    for (i = 0; i < opts.rtCallback.length; i++) {
      rt = opts.rtCallback[i];
      rtCallbackStatus[i] = rt[0];
    }

    this.processes[activeindex].index = setTimeout(function() {
      if (!getel()) {
        print("[Fx.style] getel() returned something empty", getStackTrace());
        return;
      }

      var from = !changeColor ? (opts.currentValue || self.getCSSValue(getel(), style)) : fromColor;
      var to = opts.finishValue;
      var dur = opts.dur;
      var start = new Date().getTime();
      var direction = null;
      if (!changeColor) direction = ( to > from ? 'right' : 'left' );

      // Calc delta for colors
      if (isColor) {
        var colorDelta = [
          opts.finishValue[0] - fromColor[0],
          opts.finishValue[1] - fromColor[1],
          opts.finishValue[2] - fromColor[2]
        ];
      }
      if (style == 'background-image' && opts.linearGradient) {
        var colorDeltas = [];
        for (i = 0; i < fromColor.length; i++) {
          colorDeltas[i] = [
            opts.finishValue[i][0] - fromColor[i][0],
            opts.finishValue[i][1] - fromColor[i][1],
            opts.finishValue[i][2] - fromColor[i][2]
          ];
        }
      }

      setTimeout(function() {
        if (self.processes[activeindex] === undefined || self.processes[activeindex].stop)  {
          // print("get killed process");
          return;
        }

        if (!getel()) {
          print("[Fx.style] getel() returned something empty");
          return;
        }
        // print(getel());

        var now = (new Date().getTime()) - start;
        var progress = now / dur;

        if (!changeColor) {
          var result = ((to - from) * opts.f(progress));
          result = parseFloat(result) + parseFloat(from);

          if ((direction == 'left' && result < to) ||
            (direction == 'right' && result > to)) {
            result = to;
            progress = 1;
          }

          self.setCSSValue(getel(), style, result);
        } else {
          // change color
          if (isColor) {
            currentRGB = [
              intval(fromColor[0] + (colorDelta[0] * progress)),
              intval(fromColor[1] + (colorDelta[1] * progress)),
              intval(fromColor[2] + (colorDelta[2] * progress))
            ];
            self.setCSSValue(getel(), style, currentRGB);
          }

          // change linear-gradient
          if (style == 'background-image' && opts.linearGradient) {
            currentRGB = [];
            for (i = 0; i < fromColor.length; i++) {
              currentRGB[i] = [
                intval(fromColor[i][0] + (colorDeltas[i][0] * progress)),
                intval(fromColor[i][1] + (colorDeltas[i][1] * progress)),
                intval(fromColor[i][2] + (colorDeltas[i][2] * progress))
              ];
            }

            self.setCSSValue(getel(), style, currentRGB, {
              linearGradient: true,
              gradientOptions: opts.gradientOptions
            });
          }
        }

        for (i = 0; i < opts.rtCallback.length; i++) {
          rt = opts.rtCallback[i];
          if (now >= rtCallbackStatus[i]) {
            rtCallbackStatus[i] += rt[0];
            setTimeout(rt[1], 0);
          }
        }

        if (progress < 1) {
          self.processes[activeindex].index = setTimeout(arguments.callee, opts.freq);
        } else {
          self.killProcess(activeindex);

          var styleopts = {};
          if (style == 'background-image' && opts.linearGradient) {
            styleopts = {
              linearGradient: true,
              gradientOptions: opts.gradientOptions
            };
          }
          self.setCSSValue(getel(), style, opts.finishValue, styleopts);
          opts.callback();
        }
      }, 0);
    }, 0);

    return activeindex;
  },

  getCSSValue: function(el, attr) {
    var val = getStyle(el, attr);
    switch (attr) {
      case 'top':
      case 'bottom':
      case 'left':
      case 'right':
        if (val == 'auto') val = 0;
        break;
    }
    return parseFloat(parseFloat(val).toFixed(4));
  },

  setCSSValue: function(el, attr, value, opts) {
    opts = opts || {};
    var val = value + "";

    if (!el._lastStyle) el._lastStyle = {};

    switch (attr) {
      case 'color':
      case 'background-color':
      case 'border-bottom-color':
      case 'border-top-color':
        val = 'rgb('+value[0]+', '+value[1]+', '+value[2]+')';
        break;

      case 'background-image':
        if (opts.linearGradient) {
          var gradcolors = [];
          for (i = 0; i < value.length; i++) {
            gradcolors.push('rgb('+value[i][0]+', '+value[i][1]+', '+value[i][2]+') '+opts.gradientOptions[i+1]);
          }
          val = this.__getLinearGradientPrefix()+'linear-gradient('+opts.gradientOptions[0]+', '+gradcolors.join(',')+')';
        }
        break;

      case "opacity":
        val = parseFloat(val).toFixed(2);
        if (el._lastStyle[attr] !== undefined && el._lastStyle[attr] == val) return;
        break;

      default:
        val = intval(val) + "px";
        if (el._lastStyle[attr] !== undefined && el._lastStyle[attr] == val) return;
        break;
    }

    el._lastStyle[attr] = val;
    setStyle(el, attr, val);
  },

  __linearGradientPrefix: null,
  __getLinearGradientPrefix: function() {
    if (this.__linearGradientPrefix == null) {
      var tmp = "";
      if (browser.safari || browser.chrome) tmp = "-webkit-";
      if (browser.msie) tmp = "-ms-";
      if (browser.opera && parseFloat(browser.version) < 12.1) tmp = "-o-";
      if (browser.mozilla && parseFloat(browser.version) < 16) tmp = "-moz-";

      this.__linearGradientPrefix = tmp;
    }

    return this.__linearGradientPrefix;
  },

  // TODO needed?
  number: function(opts) {
    var from = opts.startValue, to = opts.finishValue;
    var fx = opts.f || function(x) { return x; };
    var fc = opts.onChange || function() {};
    var ff = opts.onFinish || function() {};
    var start = new Date().getTime();
    var direction = to > from ? 0 : 1;
    var f = function() {
      var now = (new Date().getTime()) - start;
      var progress = now / opts.dur;
      var result = ((to - from) * fx(progress));
      result = intval(result, 10) + intval(from);

      if ((direction == 1 && result <= to) || (direction == 0 && result >= to)) {
        result = to;
        progress = 1;
      }

      fc(result);

      if (progress < 1) timeout = setTimeout(f, 25);
      else ff();
    };

    timeout = setTimeout(f, 0);
  },
  checkProcess: function(el, type) {
    for (var i in this.processes) {
      if (this.processes[i].type == type && this.processes[i].element == el) {
        return i;
      }
    }
    return false;
  },
  getNextIndex: function() {
    return this.nextIndex++;
  },
  killProcess: function(index) {
    if (this.processes[index] === undefined) return;

    // print("Fx.killProcess", index);

    // this.processes[index].stop = true;
    clearTimeout(this.processes[index].index);
    delete this.processes[index];
  }
};

function parseHTMLColor(col) {
  var rgb;
  if (col.startsWith('#')) {
    if (col.length == 3) col += col;
    rgb = col.substring(1).match(/.{2}/g);
    for (var i = 0; i < rgb.length; i++) rgb[i] = parseInt(rgb[i], 16);
  }
  if (col.toLowerCase().startsWith('rgb')) {
    var m = col.toLowerCase().match(/rgba?\(([\d]+),\s+([\d]+),\s+([\d]+(,\s+[\d]+)?)\)/);
    rgb = [intval(m[1]), intval(m[2]), intval(m[3])];
  }
  return rgb;
}

function htmlEscape(string, quote_style, charset, double_encode) {
  var optTemp = 0,
  i = 0,
  noquotes = false;
  if (typeof quote_style === "undefined" || quote_style === null) {
    quote_style = 2;
  }
  string = string.toString();
  if (double_encode !== false) { // Put this first to avoid double-encoding
    string = string.replace(/&/g, "&amp;");
  }
  string = string.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  var OPTS = {
    "ENT_NOQUOTES": 0,
    "ENT_HTML_QUOTE_SINGLE": 1,
    "ENT_HTML_QUOTE_DOUBLE": 2,
    "ENT_COMPAT": 2,
    "ENT_QUOTES": 3,
    "ENT_IGNORE": 4
  };
  if (quote_style === 0) {
    noquotes = true;
  }
  if (typeof quote_style !== "number") { // Allow for a single string or an array of string flags
    quote_style = [].concat(quote_style);
    for (i = 0; i < quote_style.length; i++) {
      // Resolve string input to bitwise e.g. 'ENT_IGNORE' becomes 4
      if (OPTS[quote_style[i]] === 0) {
        noquotes = true;
      }
      else if (OPTS[quote_style[i]]) {
        optTemp = optTemp | OPTS[quote_style[i]];
      }
    }
    quote_style = optTemp;
  }
  if (quote_style & OPTS.ENT_HTML_QUOTE_SINGLE) {
    string = string.replace(/'/g, "&#039;");
  }
  if (!noquotes) {
    string = string.replace(/"/g, "&quot;");
  }

  return string;
}
function centerText(str) {
  ge("loading").innerHTML = htmlEscape(str);
}

function SlideshowQueue() {
  this.list = [];
  this.MAX_QUEUE_LENGTH = 1000;
}
extend(SlideshowQueue.prototype, {
  push: function(item) {
    var ind = this.list.indexOf(item);
    if (ind != -1) this.list.splice(ind, 1);
    this.list.push(item);

    if (this.list.length == this.MAX_QUEUE_LENGTH) {
      this.list.shift();
    }

    // print("[queue] + push(), length = " + this.list.length);
  },
  unshift: function(item) {
    var ind = this.list.indexOf(item);
    if (ind != -1) this.list.splice(ind, 1);
    if (this.list.length == this.MAX_QUEUE_LENGTH) this.list.pop();
    this.list.unshift(item);
    // print("[queue] + unshift(), length = " + this.list.length);
  },
  shift: function() {
    if (!this.list.length) return false;
    var item = this.list.shift();
    item.used++;
    // this.list.push(item);
    // print("[queue] - shift(), length = " + this.list.length);
    return item;
  },
  length: function(item) {
    return this.list.length;
  },
  shuffle: function() {
    shuffle(this.list);
  },
  itemAt: function(i) {
    return this.list[i];
  },
  sort: function(f) {
    this.list.sort(f);
  },
  indexOf: function(item) {
    return this.list.indexOf(item);
  },
  getURLs: function() {
    var list = [];
    for (var i = 0; i < this.list.length; i++) {
      list.push(this.list[i].url);
    }
    return list;
  }
});

var Music = {
  audios: [
    "John_Brodeur_and_The_Suggestions-Security__Instrumental_-33882.mp3",
    "Tim_Besamusca-Celebrate_Life-60594.mp3",
    "Liberator by Aaron Willis, Brian Mathews, Scott Edwards.mp3",
    "Tim_Besamusca-Happy_Endings-76666.mp3",
    "Matt_Harvey-Happy_Now__TV_Mix_-83196.mp3",
    "Tim_Besamusca-Let_s_Go-54130.mp3",
    "Orange_Factory_Music-125_Pop_Radio_Uptempo-60070.mp3",
    "Tim_Besamusca-Rock_The_House-76665.mp3",
    "Orange_Factory_Music-Epic_Radio_Dance-78045.mp3",
    "Toby_Madigan-Arrested__Instrumental_-53048.mp3",
    "Orange_Factory_Music-lightsaber_atlantis-73151.mp3"
  ],
  sound: null,
  muted: false,
  cookie_name: "olympic_slideshow_muted",
  init: function(random_music) {
    if (random_music) shuffle(this.audios);

    var self = this, muted = getCookie("olympic_slideshow_muted");
    soundManager.setup({
      url: "olympic_slideshow/",
      flashVersion: 9,
      preferFlash: true,
      onready: function() {
        self.start();
      }
    });

    if (intval(muted) == 1) {
      this.mute();
    }
  },
  start: function() {
    var url = this.next(), self = this;
    var s = soundManager.createSound({
      id: "sound",
      url: url,
      autoLoad: true,
      autoPlay: false,
      onload: function() {
        print("audio loaded " + url);
      }
    });
    s.play({
      volume: 100,
      onfinish: function() {
        s.destruct();
        self.start();
      }
    });
    this.sound = s;
  },
  next: function() {
    var link = this.audios.shift();
    this.audios.push(link);
    return "https://ch1p.com/vk_slideshow/music/" + link;
  },
  mute: function() {
    var btn = ge("mute_btn");
    if (this.muted) {
      soundManager.unmute();
      removeClass(btn, "muted");
      createCookie(this.cookie_name, 0, 30);
      this.muted = false;
    } else {
      soundManager.mute();
      addClass(btn, "muted");
      createCookie(this.cookie_name, 1, 30);
      this.muted = true;
    }
  }
};

var Slideshow = {
  rootEl: null,
  rootElDims: null,
  width: null,
  height: null,
  spacing: 6,
  ratio: 0.66,

  rows: [],
  photos: null,
  lastUpdated: [],
  step: 0,
  delay: 2000,
  checkPeriod: 60000, // FIXME
  checkTimeout: null,
  fadingDuration: 900,
  failedTimeout: 15000,
  failedTimeoutObject: null,
  needResize: false,
  needResizeTimeout: null,
  getPhotosSmartCheckCount: 25,
  params: {},

  init: function(arg_opts) {
    var self = this;
    var cities = {
      /* "sochi": ["-65270669", "186576696"],
      "krasnodar": ["-65270669", "186576771"],
      "yekaterinburg": ["-65270669", "186672692"],
      "omsk": ["-65270669", "186672736"],
      "krasnoyarsk": ["-65270669", "186672748"],
      "tyumen": ["-65270669", "186672756"],
      "khabarovsk": ["-65270669", "186672766"],
      "khantymansiysk": ["-65270669", "186672781"],
      "common": ["-65270669", "186568993"], */
      "ng": ["-24565142", "129032915"],
      "general": ["-65270669", "186568993"],
      "athletes": ["-65270669", "187054721"],
      "mp": ["-65270669", "186857969"],
      "eztest": ["-65270669", "187797269"]
    }, defaultSource = cities.general;

    var opts = {
      rows: 2,
      bg: "black",
      show_controls: false
    };

    extend(opts, arg_opts);

    this.photos = new SlideshowQueue();
    this.rootEl = ge("slideshow");

    addClass(gb(), "bg_"+opts.bg);

    // create rows
    var i, b;
    for (i = 0; i < opts.rows; i++) {
      b = createFromHTML('<div class="row'+( i == opts.rows ? " last" : "" )+'" id="row'+i+'"></div>');
      this.rootEl.appendChild(b);

      this.rows.push({
        el: b,
        photos: []
      });
    }

    if (opts.city !== undefined && cities[opts.city] === undefined) {
      centerText("city not found");
      return;
    }

    this.params.source = opts.city ? cities[opts.city] : defaultSource;
    this.params.show_controls = opts.show_controls;
    this.params.city = opts.city;

    this.check(true, function(err) {
      if (err) {
        centerText("api error");
        return;
      }

      if (self.photos.length() < 15) {
        centerText("album must contain at least 15 photos");
        return;
      }

      self.setEvents();
      self.recalc();
      self.initStep();
    });
  },
  isCityMP: function() {
    return this.params.city == "mp" || this.params.city == "eztest";
  },
  check: function(loadAll, callback) {
    var loadFirst = 500;

    if (!callback) callback = function() {};
    var source = this.params.source, self = this;

    if (this.isCityMP() && this.params.pcount > 0 && this.photos.length() >= ( this.params.pcount - 125 ) && this.photos.length() >= 10) {
      /* print("NOT LOAD UPDATE");
      print("diff = " + ( this.params.pcount - 125 )); */

      this.checkTimeout = setTimeout(function() {
        self.check(false);
      }, this.checkPeriod);
      return;
    }

    var fetch = function() {
      VK.api("photos.get", {
        owner_id: source[0],
        album_id: source[1],
        rev: 1,
        extended: 0,
        // not documented yet:
        offset: 0,
        count: loadFirst
      }, function(response, error) {
        try {
          if (!error) {
            print(">>> check() loaded! now photos.length = " + self.photos.length());

            var urls = self.photos.getURLs();
            var items = response.items;
            if (!loadAll) {
              items = items.slice(0, loadFirst);
            }

            var ok = [], stillInQueueCount = 0;

            for (var i = 0; i < items.length; i++) {
              var p = items[i], url = p.photo_604 || p.photo_807 || p.photo_1280 || p.photo_130 || p.photo_75;
              if (!p.width || !p.height || urls.indexOf(url) != -1) {
                stillInQueueCount++;
                continue;
              }

              // temp fix API bug
              if (url == "http://cs424426.vk.me/v424426516/846c/DVdmV-6_Uto.jpg") {
                var t = p.width;
                p.width = p.height;
                p.height = t;
              }

              ok.push({
                url: url,
                width: p.width,
                height: p.height,
                used: 0
              });
            }

            print(">>> check(): skip " + stillInQueueCount + " photos (still there); ok count = " + ok.length);

            /* ok.sort(function(a, b) {
              var a_ratio = getRatio(a.width, a.height), b_ratio = getRatio(b.width, b.height);
              if (isSquare(a_ratio) && !isSquare(b_ratio)) return 1;
              else if (!isSquare(a_ratio) && isSquare(b_ratio)) return -1;
              else return 0;
            }); */

            if (loadAll) {
              for (var i = 0; i < ok.length; i++) self.photos.push(ok[i]);
              if (self.params.city != "mp") self.photos.shuffle();
            } else {
              ok.reverse();
              for (var i = 0; i < ok.length; i++) self.photos.unshift(ok[i]);
            }

            print(">>> check(): done, current length: " + self.photos.length());
            self.params.pcount = self.photos.length();
          } else {
            print(">>> check(): API ERROR!", error);
          }
        } catch(e) {
          print(e);
        }

        callback(error);
        self.checkTimeout = setTimeout(function() {
          self.check(false);
        }, self.checkPeriod);
      });
    };

    clearTimeout(this.checkTimeout);
    // clearTimeout(this.checkTimeout);
    // this.checkTimeout = setTimeout(fetch, 0);
    fetch();
  },
  setEvents: function() {
    var self = this;
    addEvent(window, "resize", function() {
      self.onResize();
    });
  },
  onResize: function() {
    print("window.onResize()");
    var self = this;
    clearTimeout(this.needResizeTimeout);
    this.needResizeTimeout = setTimeout(function() {
      self.needResize = true;
    }, 500);
  },
  doResize: function() {
    print("doResize()");
    this.needResize = false;
    this.recalc();
    this.initStep();
  },
  preloadImages: function(list, f) {
    var fs = [];
    for (var i = 0; i < list.length; i++) {
      (function(img) {
        fs.push(function(callback) {
          img.preload(function() {
            callback(null, true);
          });
        });
      })(list[i]);
    }

    async.parallel(fs, function(err, vals) {
      f();
    });
  },
  initStep: function() {
    print("initStep()");
    this.step = 0;

    var self = this;
    var width = this.width, height = this.getRowHeight();

    var blockHeight = this.getRowHeight(), blockWidth = this.getRowWidth();
    var maxRatioSum = normalFloat(this.getMaxRatioSum(blockWidth, blockHeight));

    // some random magic
    var maxRatioSums = [];
    for (var i = 0; i < this.rows.length; i++) {
      maxRatioSums.push(maxRatioSum + maxRatioSum * random(1, 9) / 100);
      if (i % 2 == 0) maxRatioSums[i] += 0.3 * this.rows.length;
    }
    shuffle(maxRatioSums);

    var currentPhotos = [];
    for (var i = 0; i < this.rows.length; i++) {
      currentPhotos[i] = [];
      for (var j = 0; j < this.rows[i].photos.length; j++) currentPhotos[i].push(this.rows[i].photos[j]);
    }

    var newPhotos = [];
    var allEmpty = currentPhotos[0].length == 0 && currentPhotos[1].length == 0;

    var toLoad = [];
    for (var i = 0; i < this.rows.length; i++) {
      var images =  [];
      var ratioSum = 0,
          maxPhotoRatio = 1.35,
          minPhotoRatio = 0.65;

      // Set view ratios
      var prevRatio = null, ratiosEqual = true;
      while (ratioSum < maxRatioSums[i] - maxRatioSums[i] * 0.25) {
        var img = clone(this.getNextPhoto()), ratio = img.ratio;
        var slImg = new SlideshowImage();
        slImg.setURL(img.url);
        slImg.setParams(img.width, img.height);

        var ratio = slImg.ratio;
        if (ratio < minPhotoRatio) ratio = minPhotoRatio;
        if (ratio > maxPhotoRatio) ratio = maxPhotoRatio;

        if (prevRatio === null) prevRatio = ratio;
        else if (ratiosEqual) {
          if (abs(prevRatio - ratio) > 0.03) ratiosEqual = false;
        }

        slImg.viewRatio = ratio;
        ratioSum += ratio;
        images.push(slImg);
      }

      // add some random to square photos' ratios
      if (ratiosEqual && images.length > 1) {
        print("initStep(): try to fake ratios");
        ratioSum = 0;
        for (var j = 0; j < images.length; j++) {
          var img = images[j];
          var vr = img.viewRatio;
          vr += vr * random(5, 30) / 100 * ( random(0, 1) ? -1 : 1 );
          img.viewRatio = vr;
          ratioSum += vr;
        }
      }

      if (ratioSum <= maxRatioSums[i] * 2) {
        this.algo_prepareOneFloor(images, blockWidth, blockHeight, ratioSum);
      } else {
        this.algo_prepareCottages(images, blockWidth, blockHeight, maxRatioSums[i], ratioSum, { min: minPhotoRatio, max: maxPhotoRatio });
      }

      var nImages = this.algo_buildingsFromImages(images, 0, i);
      newPhotos.push(nImages);
      this.rows[i].photos = nImages;

      toLoad.push.apply(toLoad, images);
    }

    this.preloadImages(toLoad, function() {
      for (var i = 0; i < self.rows.length; i++) {
        self.insertImages(self.rows[i].photos, i, 0, 1);
        // self.lastUpdated.push.apply(self.lastUpdated, self.rows[i].photos);
      }

      if (allEmpty) {
        self.fadeAll(function() {
          self.step++;
          self.nextStep();
        });
      } else {
        async.parallel([
          function(f) {
            var called = false;
            for (var i = 0; i < newPhotos.length; i++) {
              self.fadeShowImages(newPhotos[i], i, function() {
                if (!called) {
                  called = true;
                  f(null, true);
                }
              })
            }
          },
          function(f) {
            var called = false;
            for (var i = 0; i < currentPhotos.length; i++) {
              self.fadeRemoveImages(currentPhotos[i], i, function() {
                if (!called) {
                  called = true;
                  f(null, true);
                }
              });
            }
          }
        ], function() {
          if (self.needResize) {
            self.doResize();
          } else {
            self.nextStep();
          }
        });
      }
    });
  },
  nextStep: function() {
    print("nextStep()");
    var self = this, _step = self.step;

    this.setFailHandler(function() {
      print("nextStep(): now call nextStep from setFailHandler");
      self.step++;
      self.nextStep();
    });

    if (this.photos.length() < 15) {
      print("nextStep(): this.photos.length = " + this.photos.length() + ", now load from api");
      var do_return = this.photos.length() < 2;

      self.check(false, function(error) {
        if (error) {
          print("nextStep(): api error:", error);
          print("nextStep(): retry in 2 seconds");

          setTimeout(function() {
            self.nextStep();
          }, 2000);
        } else {
          print("nextStep(): check done, do_return:", do_return);
          if (do_return) self.nextStep();
        }
      });

      if (do_return) return;
    }

    var _preloadedImages;
    var sel, rowIndex, startIndex, totalX, selBlock,
        blockWidth, selWidthPercent, normalPercent, isSingle,
        replaceWithCount, toReplace;

    async.parallel([
      function(f) {
        setTimeout(function() {
          f(null, true);
        }, self.delay);
      },
      function(f) {
        // Select a place in mosaic where to replace photos
        var photos = [],
            // index = random(0, 1);
            tryIndex = random(0, 2),
            tryCount = 0;

        for (var i = 0; i < self.rows.length; i++)
          photos.push.apply(photos, self.rows[i].photos);

        if (self.step > 0) {
          photos.sort(function(a, b) {
            if (a[0].ts > b[0].ts) return 1;
            else if (a[0].ts < b[0].ts) return -1;
            else return 0;
          });
        } else {
          shuffle(photos);
        }

        if (tryIndex >= photos.length) tryIndex = photos.length-1;

        normalPercent = getRatio(self.getRowHeight(), self.getRowWidth()) * 1.25;

        var pickedOk = false;
        while (!pickedOk && tryCount < photos.length) {
          if (tryIndex == photos.length) tryIndex = 0;
          if (tryCount > 0) {
            print("nextStep(): tryCount = " + tryIndex);
          }

          sel = photos[tryIndex];
          rowIndex = sel[0].row;
          selBlock = self.rows[rowIndex].photos;
          startIndex = 0;
          totalX = 0;
          blockWidth = self.getRowWidth();
          selWidthPercent = sel[0].viewWidth / blockWidth;
          isSingle = selWidthPercent >= normalPercent;
          replaceWithCount = 1;
          toReplace = [];

          if (isSingle && !sel[0].isCottageMember()) {
            //replaceWithCount = random(0, 2) ? random(2, 3) : random(1, 2);
            replaceWithCount = random(1, 3);
            toReplace.push(photos[tryIndex]);
            startIndex = sel[0].building;
          } else {
            var limit = getRatio(self.getRowHeight(), self.getRowWidth()) * 2;
            // print("limit = " + limit);
            var candidates = {
              left: {
                indexes: [],
                sum: 0,
                exists: false,
                tsMax: 0
              },
              right: {
                indexes: [],
                sum: 0,
                exists: false,
                tsMax: 0
              }
            };

            // left
            if (sel[0].building > 0) {
              candidates.left.exists = true;
              for (var i = sel[0].building, j = 0;
                  i >= 0 && candidates.left.indexes.length <= 3 && ( j == 0 || candidates.left.sum + (selBlock[i][0].viewWidth / blockWidth) <= limit );
                  i--, j++) {
                candidates.left.indexes.push(i);
                candidates.left.sum += selBlock[i][0].viewWidth / blockWidth;
                if (selBlock[i][0].ts > candidates.left.tsMax) candidates.left.tsMax = selBlock[i][0].ts;
              }
            }

            // right
            if (sel[0].building < selBlock.length - 1) {
              candidates.right.exists = true;
              for (var i = sel[0].building, j = 0;
                  i < selBlock.length && candidates.right.indexes.length <= 3 && ( j == 0 || candidates.right.sum + (selBlock[i][0].viewWidth / blockWidth) <= limit );
                  i++, j++) {
                candidates.right.indexes.push(i);
                candidates.right.sum += selBlock[i][0].viewWidth / blockWidth;
                if (selBlock[i][0].ts > candidates.right.tsMax) candidates.right.tsMax = selBlock[i][0].ts;
              }
            }

            // choose path
            var selectedPath = null;
            if (candidates.left.exists && candidates.right.exists) {
              selectedPath = ["left", "right"][random(0, 1)];
              //if (candidates.left.maxTs < candidates.right.maxTs) selectedPath = "left";
              //if (candidates.left.sum < candidates.right.sum) selectedPath = "left";
              //else selectedPath = "right";
            } else if (candidates.left.exists) selectedPath = "left";
              else if (candidates.right.exists) selectedPath = "right";


            startIndex = candidates[selectedPath].indexes.min();
            for (var i = 0; i < candidates[selectedPath].indexes.length; i++) {
              toReplace.push(selBlock[candidates[selectedPath].indexes[i]]);
            }
          }

          pickedOk = true;
          for (var i = 0; i < toReplace.length; i++) {
            if (self.lastUpdated.indexOf(toReplace[i]) != -1) {
              pickedOk = false;
              break;
            }
          }

          tryIndex++;
          tryCount++;
        }

        totalX = startIndex > 0 ? selBlock[startIndex][0].x : 0;

        // Select images
        var replaceWidth = 0, replaceHeight = self.getRowHeight(), replaceRatio;
        for (var i = 0; i < toReplace.length; i++) {
          replaceWidth += toReplace[i][0].viewWidth;
        }
        replaceRatio = normalFloat(self.getMaxRatioSum(replaceWidth, replaceHeight));
        replaceRatio += replaceRatio * random(1, 9) / 100; // some random magic
        var ratioSum = 0,
            maxPhotoRatio = 1.3,
            minPhotoRatio = 0.65;

        var nextImages = self.getNextPhotosSmart(replaceWithCount, replaceRatio, true /* Allow to reduce count of images */),
            images = [];

        if (!nextImages) {
          self.removeFailHandler();
          setTimeout(function() {
            self.nextStep();
          }, 1000);
          return;
        }

        // Set to actual value
        replaceWithCount = nextImages.length;

        // Set ratios
        var prevRatio = null, ratiosEqual = true;
        for (var i = 0; i < nextImages.length; i++) {
          var slImg = new SlideshowImage();
          slImg.setURL(nextImages[i].url);
          slImg.setParams(nextImages[i].width, nextImages[i].height);

          var ratio = slImg.ratio;
          if (ratio < minPhotoRatio) ratio = minPhotoRatio;
          if (ratio > maxPhotoRatio) ratio = maxPhotoRatio;

          if (prevRatio === null) prevRatio = ratio;
          else if (ratiosEqual) {
            if (abs(prevRatio - ratio) > 0.03) ratiosEqual = false;
          }

          slImg.viewRatio = ratio;
          ratioSum += ratio;
          images.push(slImg);
        }

        // add some random to square photos' ratios
        if (ratiosEqual && images.length > 1) {
          print("nextStep(): try to fake ratios");
          ratioSum = 0;
          for (var i = 0; i < images.length; i++) {
            var img = images[i];
            var vr = img.viewRatio;
            vr += vr * random(5, 30) / 100 * ( random(0, 1) ? -1 : 1 );
            img.viewRatio = vr;
            ratioSum += vr;
          }
        }

        if (/* true ||  */( ratioSum <= replaceRatio * 2 || images.length == 1 )) {
          self.algo_prepareOneFloor(images, replaceWidth, replaceHeight, ratioSum);
        } else {
          self.algo_prepareCottages(images, replaceWidth, replaceHeight, replaceRatio, ratioSum, { min: minPhotoRatio, max: maxPhotoRatio });
        }

        self.preloadImages(images, function() {
          _preloadedImages = images;
          f(null, true);
        });
      }
    ], function(err, vals) {
      self.removeFailHandler();

      if (self.needResize) {
        self.doResize();
        return;
      }

      if (self.step != _step) {
        print("nextStep(): Killed step = " + _step);
        return;
      }

      var nImages = self.algo_buildingsFromImages(_preloadedImages, startIndex, rowIndex);

      selBlock.splice(startIndex, toReplace.length);

      var args = [startIndex, 0];
      args.push.apply(args, nImages);
      selBlock.splice.apply(selBlock, args);

      self.algo_fixBuildingIndexesForRow(selBlock);
      self.insertImages(nImages, rowIndex, totalX, 0);

      self.lastUpdated = nImages;

      async.parallel([
        function(f) {
          self.fadeShowImages(nImages, rowIndex, function() {
            f(null, true);
          });
        },
        function(f) {
          self.fadeRemoveImages(toReplace, rowIndex, function() {
            f(null, true);
          });
        }
      ], function() {
        self.step++;
        self.nextStep();
      });
    });
  },
  insertImages: function(images, block, totalX, opacity) {
    if (totalX === undefined) totalX = 0;
    if (opacity === undefined) opacity = 0;

    for (var i = 0; i < images.length; i++) {
      var imgs = images[i];
      var isCottage = imgs.length > 1, imgWidth = 0;

      for (var j = 0; j < imgs.length; j++) {
        var img = imgs[j];

        var el = img.getElement();
        this.rows[block].el.appendChild(el);

        var x = totalX, y = (img.floor ? img.floor * img.viewHeight : 0);
        setStyle(el, {
          "top": y + "px",
          "left": x + "px",
          "opacity": normalFloat(opacity)
        });
        imgWidth = img.viewWidth;

        img.x = x;
        img.y = y;
      }

      totalX += imgWidth;
    }
  },
  fadeShowImages: function(images, block, callback) {
    var wrap = document.createElement("div"), blockEl = this.rows[block].el, imagesEl = [];
    setStyle(wrap, "opacity", 0);

    images.forEach(function(item) {
      item.forEach(function(item) {
        wrap.appendChild(item.photoEl);
        setStyle(item.photoEl, "opacity", 1);
        imagesEl.push(item.photoEl);
      });
    });
    blockEl.appendChild(wrap);

    Fx.opacity(wrap, {
      startValue: 0,
      finishValue: 1,
      dur: this.fadingDuration,
      freq: 20,
      callback: function() {
        imagesEl.forEach(function(el) {
          blockEl.appendChild(el);
        });
        remove(wrap);
        if (callback) callback();
      }
    });
  },
  fadeRemoveImages: function(images, block, callback) {
    var wrap = document.createElement("div"), blockEl = this.rows[block].el;
    images.forEach(function(item) {
      item.forEach(function(item) {
        wrap.appendChild(item.photoEl);
      });
    });
    blockEl.appendChild(wrap);

    setStyle(wrap, "opacity", 1);
    Fx.opacity(wrap, {
      startValue: 1,
      finishValue: 0,
      freq: 20,
      dur: this.fadingDuration,
      callback: function() {
        remove(wrap);
        if (callback) callback();
      }
    });
  },
  fadeAll: function(callback) {
    var textEl = ge("loading");
    setStyle(textEl, "opacity", 1);
    setStyle(this.rootEl, "opacity", 0);

    Fx.opacity(textEl, {
      dur: 250,
      startValue: 1,
      finishValue: 0,
      callback: callback
    })

    Fx.opacity(this.rootEl, {
      dur: 500,
      startValue: 0,
      finishValue: 1,
      callback: function() {
        hide(textEl);
      }
    });

    if (this.params.show_controls) {
      var controlsEl = ge("controls");
      show(controlsEl);
      Fx.opacity(controlsEl, { dur: 500, startValue: 0, finishValue: 1 });
    }
  },

  setFailHandler: function(f) {
    this.removeFailHandler();
    this.failedTimeoutObject = setTimeout(function() {
      f();
    }, this.failedTimeout);
  },
  removeFailHandler: function() {
    clearTimeout(this.failedTimeoutObject);
  },

  getRootElDims: function() {
    if (!this.rootElDims) this.rootElDims = getPaddings(this.rootEl);
    return this.rootElDims;
  },
  recalc: function() {
    var dims = this.getRootElDims(), doc = getDocumentSize();

    this.width = this.rootEl.offsetWidth;
    this.height = doc.y - dims.margin["top"] - dims.margin["bottom"];

    this.updateSize();
  },
  updateSize: function() {
    for (var i = 0; i < this.rows.length; i++) {
      setStyle(this.rows[i].el, {
        "height": (intval(this.height / this.rows.length) - intval(this.spacing / 2)) + "px",
        "width": this.width + "px"
      });
    }
  },
  getNextPhotos: function(count) {
    var list = [];
    /* this.photos.sort(function(a, b) {
      if (a.used < b.used) return -1;
      else if (a.used > b.used) return 1;
      else return 0;
    }); */

    var currentURLs = [];
    for (var i = 0; i < this.rows.length; i++) {
      for (var j = 0; j < this.rows[i].photos.length; j++) {
        currentURLs.push(this.rows[i].photos[j][0].url);
      }
    }

    for (var i = 0, got = 0; i < this.photos.length() && got < count; i++) {
      var p = this.photos.shift();
      if (currentURLs.indexOf(p.url) != -1) {
        print("already used picture detected");
        continue;
      }
      got++;
      list.push(p);
    }

    /* if (got < count) {
      print("got < count; to get more");
      for (var i = 0; i < count - got && got < count; i++, got++) {
        list.push(this.photos.shift());
      }

      print("ok, got it; count = " + count + ", list.length = " + list.length);
    } */

    return list;
  },
  getNextPhoto: function() {
    var photo = this.photos.shift();
    //photo.used++;
    return photo;
  },
  getNextPhotosSmart: function(count, ratio, allowLessCount) {
    var self = this;
    var checkCount = this.getPhotosSmartCheckCount;
    if (this.isCityMP()) checkCount = random(10, this.getPhotosSmartCheckCount);
    if (checkCount > this.photos.length()) checkCount = this.photos.length();

    // print("getNextPhotosSmart; count="+count+", ratio="+ratio+", checkCount="+checkCount);

    var photos = this.getNextPhotos(checkCount);
    if (photos.length < checkCount) checkCount = photos.length;
    var variants = this.getNextPhotosSmart_getCombinations(photos, count);

    var fGetCount = function(a) {
      try {
        var r = 0;
        for (var i = 0; i < a.length; i++) {
          r += getRatio(a[i].width, a[i].height);
        }
        return r;
      } catch (e) {
        return 0;
      }
    }, fBackPhotos = function(list) {
      for (var i = 0; i < list.length; i++) {
        self.photos.unshift(list[i]);
      }
    };

    variants.sort(function(a, b) {
      var sums = [], arrs = [a, b];

      for (var i = 0; i < arrs.length; i++) {
        sums[i] = fGetCount(arrs[i]);
      }

      if (abs(sums[0] - ratio) < abs(sums[1] - ratio)) return -1;
      else if (abs(sums[0] - ratio) > abs(sums[1] - ratio)) return 1;
      else return 0;
    });

    var selected = variants[0];
    var resultRatio = fGetCount(selected);

    if (count == 1 && allowLessCount && (resultRatio / ratio <= ( isSquare(resultRatio) ? 0.55 : 0.55 ))) {
      // print("[getSmart] now count+1");
      fBackPhotos(photos);
      return this.getNextPhotosSmart(count + 1, ratio, false);
    }

    if (resultRatio >= ratio * 1.15 && allowLessCount && count > 1) {
      fBackPhotos(photos);
      return this.getNextPhotosSmart(count - 1, ratio, false);
    }

    /* if (!selected) {
      print(variants, ratio, count, allowLessCount);
    } */

    try {
      for (var i = 0; i < photos.length; i++) {
        if (selected.indexOf(photos[i]) == -1) {
          // print("back photo to queue");
          this.photos.unshift(photos[i]);
        } else {
          photos[i].used++;
        }
      }
    } catch (e) {
      return null;
    }

    return selected;
  },
  getNextPhotosSmart_getCombinations: function(photos, count, pos, output, all) {
    // default params values
    all = all || [];
    output = output || new Array(count);
    if (pos === undefined) pos = 0;

    // new combination
    if (count == 0) {
      all.push(clone(output, false));
      return;
    }

    // let's go
    for (var i = pos; i <= photos.length - count; i++) {
      output[output.length - count] = photos[i];
      this.getNextPhotosSmart_getCombinations(photos, count - 1, i + 1, output, all);
    }

    return all;
  },
  getRowHeight: function() {
    return intval(this.height / this.rows.length) - intval(this.spacing / 2);
  },
  getRowWidth: function() {
    return this.width;
  },

  getMaxRatioSum: function(w, h) {
    return getRatio(w, h);
  },
  algo_buildingsFromImages: function(images, startIndex, row) {
    var nImages = [], buildingIndex = 0;

    for (var j = 0; j < images.length; j++) {
      images[j].row = row;
      if (!images[j].isCottageMember() || images[j].floor == 0) {
        images[j].building = buildingIndex++;
        nImages.push([images[j]]);
      } else {
        images[j].building = images[j].neighbour.building;
        nImages[images[j].neighbour.building].push(images[j]);
      }
    }

    shuffle(nImages);
    buildingIndex = startIndex;

    for (var j = 0; j < nImages.length; j++) {
      for (var k = 0; k < nImages[j].length; k++) {
        if (!nImages[j][k].isCottageMember() || nImages[j][k].floor == 0) {
          nImages[j][k].building = buildingIndex++;
        } else {
          nImages[j][k].building = nImages[j][k].neighbour.building;
        }
      }
    }

    return nImages;
  },
  algo_prepareOneFloor: function(images, width, height, ratioSum) {
    var widthSum = 0;
    for (var i = 0; i < images.length; i++) {
      var img = images[i];
      img.viewHeight = height;

      if (i < images.length - 1) {
        img.viewWidth = intval(width * (img.viewRatio / ratioSum));
        widthSum += img.viewWidth;
      } else
        img.viewWidth = width - widthSum;
    }
  },
  algo_prepareCottages: function(images, width, height, totalRatio, imagesRatio, ratioLimits) {
    var maxPhotoRatio = ratioLimits.max;
    var minPhotoRatio = ratioLimits.min;

    var overflow = imagesRatio - totalRatio,
        cottages = Math.ceil(overflow / maxPhotoRatio),
        cottages = cottages < 1 ? 1 : cottages,
        buildings = images.length - cottages,
        midRatio = normalFloat(totalRatio / buildings),
        cottagesRatio = 0;

    for (var j = images.length - 1, cottage = 0; j >= 1 && cottage < cottages; j-=2, cottage++) {
      var ratio = normalFloat((images[j-1].ratio + images[j].ratio) / 4);
      if (ratio > midRatio) ratio = midRatio;

      images[j-1].viewRatio = ratio;
      images[j].viewRatio = ratio;

      images[j].floor = 1;
      images[j-1].neighbour = images[j];
      images[j].neighbour = images[j-1];

      images[j-1].viewHeight = intval(height / 2);
      images[j].viewHeight = height - images[j-1].viewHeight;

      cottagesRatio += ratio;
    }

    var ratioSum = 0, widthSum = 0;
    for (var j = 0; j < images.length; j++) {
      if (images[j].floor > 0) continue;
      ratioSum += images[j].viewRatio;
    }

    for (var j = 0; j < images.length; j++) {
      var img = images[j];

      if (!img.floor && !img.neighbour) {
        img.viewHeight = height;
      }

      if ( j == images.length - 1 || ( j == images.length-2 && ( img.floor || img.neighbour ) ) ) {
        img.viewWidth = width - widthSum;
      } else {
        img.viewWidth = intval(width * (img.viewRatio / ratioSum));
        if (!img.floor) widthSum += img.viewWidth;
      }
    }
  },
  algo_fixBuildingIndexesForRow: function(row) {
    for (var i = 0; i < row.length; i++) {
      for (var j = 0; j < row[i].length; j++) {
        row[i][j].building = i;
      }
    }
  },
  _showUsages: function() {
    for (var i = 0; i < this.photos.length(); i++) {
      print("url: " + this.photos.itemAt(i).url + "; used " + this.photos.itemAt(i).used + " times; index: " + i);
    }
  },
  _printURLs: function() {
    for (var i = 0; i < this.photos.length(); i++) {
      var p = this.photos.itemAt(i);
      print(p.url + " : " + p.width + "x" + p.height);
    }
  }
};

function SlideshowImage(x, y) {
  this.width = null;
  this.height = null;
  this.ratio = null;
  this.url = null;
  this.image = null; // for Image object
  this.photoEl = null;
  this.preloaded = false;
  this.afterPreloadCallback = null;
  this.fxId = null;
  this.viewWidth = null;
  this.viewHeight = null;
  this.viewRatio = null;
  this.floor = 0;
  this.neighbour = null;
  this.x = null;
  this.y = null;
  this.building = 0;
  this.ts = 0;
  this.row = 0;
}
extend(SlideshowImage.prototype, {
  setURL: function(url, callback) {
    this.url = url;
  },
  setParams: function(w, h) {
    this.width = w;
    this.height = h;
    this.ratio = w / h;
  },
  preload: function(callback) {
    var img = new Image(), self = this;
    this.image = img;
    this.preloaded = false;
    this.afterPreloadCallback = null;

    img.onload = function() {
      self.updateSize(img);
      self.preloaded = true;

      if (callback) callback.apply(self);
      else if (self.afterPreloadCallback) self.afterPreloadCallback();
    };

    img.src = this.url;
  },
  updateSize: function(img) {
    this.width = img.width;
    this.height = img.height;
    this.ratio = parseFloat(parseFloat(this.width / this.height).toFixed(3));
  },
  isCottageMember: function() {
    return this.neighbour || this.floor;
  },
  setPosition: function(x, y) {
    this.x = x;
    this.y = y;
  },
  afterPreload: function(f) {
    if (this.preloaded) f();
    else this.afterPreloadCallback = f;
  },
  setImageSize: function(img) {
    var iw = img.viewWidth, ih = img.viewHeight;

    var h = Math.ceil(this.height * (this.viewWidth / this.width)),
        w = Math.ceil(this.width * (this.viewHeight / this.height));
    if (h + 1 > this.viewHeight) {
      var margin = Math.ceil((h - this.viewHeight) * 0.5);
      setStyle(img, {
        "width": this.viewWidth + "px",
        "margin-top": (-margin) + "px"
      });
    } else {
      var margin = Math.ceil((w - this.viewWidth) * 0.5);
      setStyle(img, {
        "height": this.viewHeight + "px",
        "margin-left": (-margin) + "px"
      });
    }
  },
  getElement: function(isLast) {
    if (this.photoEl) return this.photoEl;

    var img = this.image;
    var html = '<div class="photo"></div>';

    var el = createFromHTML(html);
    el.appendChild(img);

    var width = this.viewWidth, height = this.viewHeight;
    if (!isLast) width -= Slideshow.spacing;
    if (this.isCottageMember() && this.floor == 0) height -= Slideshow.spacing;

    setStyle(el, {
      width: width + "px",
      height: height + "px"
    });

    this.setImageSize(img);

    this.photoEl = el;
    this.ts = getTimestamp();
    if (Slideshow.step == 0) {
      this.ts += random(-3, 3);
    }

    return el;
  }
});

function init() {
  var args = getURIParams();
  print("init(): args:", args);

  Slideshow.init({
    bg: args.bg || "black",
    rows: args.rows && args.rows >= 2 ? args.rows : 2,
    city: args.city,
    show_controls: args.show_controls == 1 && args.no_sound === undefined
  });

  if (!args.no_sound) {
    Music.init(args.random_music == 1);
  }
}
