var VideoUpload = {
  FILE_TYPES: '*.avi;*.AVI;*.mp4;*.MP4;*.3gp;*.3GP;*.mpeg;*.MPEG;*.mov;*.MOV;*.flv;*.FLV;*.wmv;*.WMV;*.mkv;*.MKV;*.webm;*.WEBM;*.vob;*.VOB;*.rm;*.RM;*.rmvb;*.RMVB;*.m4v;*.M4V;*.mpg;*.MPG;*.ogv;*.OGV',
  showBox: function(params) {
    if (cur.uploadBanned) {
      setTimeout(showFastBox({title: getLang('video_no_upload_title'), dark: 1, bodyStyle: 'padding: 20px; line-height: 160%;'}, getLang('video_claims_no_upload')).hide, 5000);
      return false;
    }

    if (!ge('video_upload_tab') && vk.al == 4) {
      return nav.go('videos' + cur.oid + '?z=upload_video');
    }

    params = params || {};
    params = extend(params, {act: 'upload_box', oid: cur.oid, ocl: cur.ocl ? 1 : 0});

    cur.uploadVideoBox = showBox('al_video.php', params,
      {
        stat: ['video_edit.css', 'privacy.css', 'privacy.js'],
        params: {
          bodyStyle: 'position: relative;',
          dark: 1,
          hideButtons: 1,
          onHide: VideoUpload.onHideUploadPanel,
          onDestroy: VideoUpload.onDestroyUploadBox,
          onShow: VideoUpload.onShowUploadPanel,
          width: 452
        }
      }
    );

    return false;
  },

  init: function() {
    VideoUpload.startEvents();
  },

  startEvents: function() {
    var scrollNode = browser.msie6 ? pageNode : window;
    addEvent(scrollNode, 'scroll', VideoUpload.checkResize);
    addEvent(window, 'resize', VideoUpload.checkResize);
  },

  stopEvents: function() {
    var scrollNode = browser.msie6 ? pageNode : window;
    removeEvent(scrollNode, 'scroll', VideoUpload.checkResize);
    removeEvent(window, 'resize', VideoUpload.checkResize);
  },

  onHideUploadPanel: function() {
    addClass(ge('video_upload_box_wrapper'), 'video_upload_hide');
  },

  onDestroyUploadBox: function() {
    VideoUpload.stopEvents();
    delete cur.uploadVideoResizeTimeout;
    delete window.cur.uploadVideoBox;
  },

  onShowUploadPanel: function() {
    if (ge('video_upload_box_placeholder')) {
      removeClass(ge('video_upload_box_wrapper'), 'video_upload_hide');
    }
  },

  checkResize: function() {
    VideoUpload.doResize();
    if (cur.uploadVideoResizeTimeout) {
      clearTimeout(cur.uploadVideoResizeTimeout);
    }
    cur.uploadVideoResizeTimeout = setTimeout(VideoUpload.doResize, 1);
  },
  destroyTab: function() {
    var tab = ge('video_upload_tab');

    if (!tab) return;

    var items = geByClass('video_upload_item_panel', tab);

    for (var index in items) {
      var item = items[index];
      cleanElems(item);
    }
  },
  doResize: function() {
    if (!isVisible('video_upload_box_wrapper')) return;
    var el = ge('video_upload_box_wrapper');
    var placeholder = ge('video_upload_box_placeholder');
    if (!el || !placeholder) return;
    var xy = getXY(placeholder);
    setStyle(el, 'left', xy[0]);
    setStyle(el, 'top', xy[1]);
  },

  onPrivacyChanged: function(tag) {
    var row = cur.tag2ElMap[tag.substr(5)];
    var checkboxEl = geByClass1('video_upload_status_export', row);
    if (Privacy.getValue(tag) > 0) {
      removeClass(checkboxEl, 'on');
      addClass(checkboxEl, 'disabled');
    } else {
      removeClass(checkboxEl, 'disabled');
    }
  },

  initUpload: function(url, vars, uploadLang, uploadOpts, uiLang, itemTemplate) {
    cur.lang = extend(cur.lang || {}, uiLang);
    var hashs = {};
    hashs[vars['tag']] = uploadOpts['update_db_hash'];
    cur.videoHashs = extend(cur.videoHashs || {}, hashs);
    if (!ge('video_dropbox')) {
      var p = ge('video_upload_box_tab').parentNode.parentNode.parentNode;

      var d = se(
        '<div id="video_dropbox" class="dropbox choose">\
          <div class="dropbox_wrap">\
            <div class="dropbox_area">\
              <div class="dropbox_label">' + uploadLang.drop_files_here + '</div>\
            </div>\
          </div>\
        </div>'
      );
      p.appendChild(d);
    }

    var el;
    if (!(el = ge('video_upload_box_wrapper'))) {
      el = ce('div',
        {
          id: 'video_upload_box_wrapper'
        }
      );
      bodyNode.appendChild(el);
      cur.destroy.push(function() {
        re('video_upload_box_wrapper');
      });

    } else {
      VideoUpload.onShowUploadPanel();
    }
    var children = geByClass('noselect', el, 'div');
    for (var index in children) {
      addClass(children[index], 'video_upload_hide');
    }
    var uploadItem = se('<div id="video_upload_box' + vars.tag + '" class="noselect"></div>');
    el.appendChild(uploadItem);

    var placeholder = ge('video_upload_box_placeholder');

    var initButton = function() {
      var uploadErrorInfo = ge('video_upload_fail_info');
      if (!uploadErrorInfo) return;
      hide(uploadErrorInfo);

      //it has incorrect size before layout
      setTimeout(function() {
        var size = getSize(placeholder);

        setStyle(el, 'width', size[0]);
        setStyle(el, 'height', size[1]);
        setStyle(placeholder, 'width', size[0]);
        setStyle(placeholder, 'height', size[1]);

        VideoUpload.doResize();
        placeholder.removeChild(domFC(placeholder));
      });

      Upload.init('video_upload_box' + vars.tag, url, vars, {
        file_name: 'video_file',

        file_size_limit: 3*1024*1024*1024,
        file_types_description: 'Video files',
        file_types: VideoUpload.FILE_TYPES,
        lang: uploadLang,
        flat_button: 1,
        filesize_hide_last: 1,

        onUploadStart: function(i, res) {
          var ind = i.ind !== undefined ? i.ind : i;
          cur._uploadStart = vkNow();

          delete VideoUpload.videoUploadCallback;

          var showUploadTab = function() {
            if (!cur.ocl) {
              nav.change({section: 'upload'});
            }
            var row = se(rs(itemTemplate, {
              id: ind
            }));

            VideoUpload.initBeforeUnload();

            var tab = ge('video_upload_tab');
            var uploadPanel = geByClass1('video_upload_item_panel', tab);

            if (uploadPanel) {
              addClass(row, 'video_upload_with_divider');
              tab.insertBefore(row, domNS(ge('video_upload_no_video')));
            } else {
              tab.appendChild(row);
              uploadPanel = geByClass1('video_upload_item_panel', tab);
            }

            hide('video_upload_no_video');

            if (cur.ocl && cur.oid > 0) {
              each(geByClass('video_upload_privacy'), hide);
              hide('video_edit_repeat');
              hide(geByClass1('video_upload_status_export'));
              hide(geByClass1('video_upload_publish_later'));

              var saveBtn = geByClass1('video_upload_ready_button');
              saveBtn.parentNode.insertBefore(se('<div><div class="video_ocl_warn">' + getLang('video_ocl_privacy') + '</div></div>'), saveBtn);
            }

            if (vars.oid > 0) {
              if (!cur.privacy['video' + vars.tag]) {
                cur.privacy['video' + vars.tag] = cur.privacy['video'];
                cur.privacy['videocomm' + vars.tag] = cur.privacy['video'];
              }
              Privacy.update('video' + vars.tag);
              Privacy.update('videocomm' + vars.tag);
              cur.tag2ElMap = cur.tag2ElMap || {};
              cur.tag2ElMap[vars.tag] = row;
              cur.onPrivacyChanged = VideoUpload.onPrivacyChanged;
            }

            if (curBox()) {
              curBox().hide();
            }

            if (cur.videoReupload) {
              VideoUpload.deleteItem(cur.videoReupload, false);
              delete cur.videoReupload;
              show(row);
            } else {
              slideDown(row, {duration: 800, transition: Fx.Transitions.swiftOut});
            }

            if (i.fileName) {
              var fileName = i.fileName, extensions = VideoUpload.FILE_TYPES.split(';'), pos;
              each(extensions, function(index, ext) {
                pos = fileName.indexOf(ext.substr(1));
                if (pos == (fileName.length - ext.length + 1)) {
                  fileName = fileName.substr(0, pos);
                  return false;
                }
              });
              var titleInput = geByClass1('video_upload_item_name', tab);
              val(titleInput, fileName);
              titleInput.select();
            }

            if (VideoUpload.videoUploadCallback) {
              VideoUpload.videoUploadCallback();
              delete VideoUpload.videoUploadCallback;
            }

            if (cur.videoThumbUploadOpts && isObject(cur.videoThumbUploadOpts)) {
              VideoUpload.initThumbUpload(cur.videoThumbUploadOpts, row);
            }

            VideoUpload._uploadAlbumChooser = VideoUpload._uploadAlbumChooser || {};
            if (cur.videoPlaylists && cur.videoPlaylists.length) {
              VideoUpload._uploadAlbumChooser[ind] = new Dropdown(geByClass1('video_upload_album_chooser_input', row), [[0, getLang('video_upload_choose_album_placeholder')]].concat(cur.videoPlaylists), {
                autocomplete: true,
                width: 270,
                selectedItems: [0],
                big: true
              });
            } else {
              re(geByClass1('video_upload_album_chooser_wrap', row));
            }
          };

          if (!ge('video_upload_tab')) {
            //save cur state
            var curPrivacy = cur.privacy;
            var hashes = cur.videoHashs;
            nav.go('videos' + vars.oid, false, {onDone: function() {
              setTimeout(function() {
                cur.lang = extend(cur.lang || {}, uiLang);
                cur.privacy = extend(cur.privacy || {}, curPrivacy);
                cur.videoHashs = extend(cur.videoHashs || {}, hashes);
                showUploadTab();
              });
            }, params: { ocl: cur.ocl ? 1 : null }});
          } else {
            showUploadTab();
          }
        },
        onUploadComplete: function(i, res) {
          var obj, ind = i.ind !== undefined ? i.ind : i;
          if (!res) return;
          try {
            obj = eval('(' + res + ')');
          } catch(e) {
            obj = q2ajx(res);
          }

          if (obj.code || obj.error) {
            Upload.onUploadError(i, obj.code ? obj.code : obj.error);
            return;
          }

          var video_id = obj.video_id;
          var video_hash = obj.video_hash;

          var item = ge('video_upload_item_' + ind);

          var callback = function() {
            var item = ge('video_upload_item_' + ind);
            data(item, 'video_id', video_id);

            VideoUpload.setUploadStatus(getLang('video_upload_link_text'), item);
            var link = geByClass1('video_upload_link', item, 'a');
            if (link) {
              link.innerHTML = rs(link.innerHTML, {'video_id': video_id});
              link.href = rs(link.getAttribute('data-href-tpl'), {'video_id': video_id});
              show(link);

              var readyName = geByClass1('video_upload_ready_name', 'div');
              if (readyName) {
                var linkHeader = ce('a',
                  {
                    innerHTML: readyName.innerHTML,
                    className: readyName.className,
                    href: link.href
                  }
                );
                domPN(readyName).insertBefore(linkHeader, readyName);
                re(readyName);
              }
            }

            VideoUpload.setStatusHeader(getLang('video_upload_encode_waiting'), item);
            VideoUpload.setProgressValue(100, getLang('video_upload_waiting'), item);

            VideoUpload.runVideoProgressUpdate(item, vars.oid, video_id, video_hash, 1, -1);
          };

          if (item) {
            callback();
          } else {
            VideoUpload.videoUploadCallback = callback;
          }
        },
        onUploadProgress: function(i, bytesLoaded, bytesTotal) {
          var ind = i.ind !== undefined ? i.ind : i;
          var percent = intval(bytesLoaded / bytesTotal * 100);
          var floatPercent = bytesLoaded / bytesTotal * 100;
          var item = ge('video_upload_item_' + ind);
          if (!item) return;
          if (data(item, 'progress') > percent) {
            data(item, 'max_size_error', true);
          }
          data(item, 'progress', percent);
          var text = getLang('video_upload_uploaded_percent').replace('{percent}', percent);
          VideoUpload.setProgressValue(floatPercent, text, item);
        },
        onUploadError: function(i, err) {
          var logErrorData = {
            oid: vars.oid,
            mid: vars.mid,
            tag: vars.tag,
            srv: uploadOpts.server,
            extra: err
          }
          VideoUpload._logUploadStatus('fail', logErrorData);

          cur.videoLastError = true;
          var ind = i.ind !== undefined ? i.ind : i;

          var item = ge('video_upload_item_' + ind);
          var callback = function() {
            var item = ge('video_upload_item_' + ind);
            if (item) {
              var errorText;
              if (err == -3) { //wrong file
                errorText = getLang('video_upload_error_file');
              } else if (err == -4) {
                errorText = getLang('video_upload_error_audio').replace('{link}', '<a href="/audio">').replace('{/link}', '</a>');
              } else if (err == -5) {
                errorText = getLang('video_claimed_not_uploaded');
              } else if (data(item, 'max_size_error')) {
                errorText = getLang('video_upload_big_file_error');
              } else {
                errorText = getLang('video_upload_error_common');
              }

              VideoUpload.showError(item, errorText);
            }
          };

          if (item) {
            callback();
          } else {
            VideoUpload.videoUploadCallback = callback;
          }

          debugLog(err);
        },
        onDragEnter: function () {
          hide('video_upload_box_wrapper');
        },
        onDragOut: function () {
          show('video_upload_box_wrapper');
        },

        clear: 1,
        type: 'video',
        max_attempts: 3,
        server: uploadOpts.server,
        error: uploadOpts.default_error,
        error_hash: uploadOpts.error_hash,
        dropbox: 'video_dropbox',
        custom_hash: uploadOpts.custom_hash,
        check_hash: uploadOpts.check_hash,
        check_rhash: uploadOpts.check_rhash,
        check_url: uploadOpts.check_url,
        //accept: 'video/*'
      });
    };

    if (cur.videoLastError) {
      cur.videoLastError = false;

      show('video_upload_fail_info');
      var errorEl = ge('video_upload_fail_info');

      var current = 60;
      var lang = getLang('video_upload_timeout_msg');
      var text = lang.replace('{time}', '1:00');
      val(errorEl, text);

      var intervalId = setInterval(function() {
        current--;
        if (current <= 0) {
          clearInterval(intervalId);
          initButton();
        } else {
          var text = lang.replace('{time}', '0:' + (current < 10 ? '0' + current : current));
          val(errorEl, text);
        }
      }, 1000);
    } else {
      initButton();
    }
  },

  _logUploadStatus: function(stage, data) {
    try {
      data.act = 'upload_stats';
      data.stage = stage;
      ajax.post('al_video.php', data);
    }
    catch (ignore) {}
  },

  removeUploadedThumb: function(ref, event) {
    cancelEvent(event);

    // remove image from item
    var imageEl = domPN(ref);
    setStyle(imageEl, { backgroundImage: '' });
    hide(imageEl);

    // get uploaded thumb id
    var itemEl = gpeByClass('video_tc_uploader', ref);
    var thumbId = itemEl.getAttribute('data-thumb-id');

    // get currently selected thumb id
    var parentEl = gpeByClass('video_upload_item_panel', ref);
    var thumbPlaceholderEl = VideoUpload.getPlaceholderEl(ref);
    var selectedThumbId = thumbPlaceholderEl ? thumbPlaceholderEl.getAttribute('data-thumb-id') : 0;
    var selectedThumbUrl = '';

    itemEl.setAttribute('data-thumb-id', '');
    itemEl.setAttribute('data-thumb-url', '');

    if (!thumbPlaceholderEl || selectedThumbId == thumbId) {
      var itemsEl = geByClass('video_tc_item', parentEl);
      if (itemsEl.length > 1) {
        VideoUpload.selectThumb(itemsEl[1 + (itemsEl.length - 2) / 2]);
        return false;
      } else {
        selectedThumbId = '';
        selectedThumbUrl = thumbPlaceholderEl && thumbPlaceholderEl.getAttribute('data-main-thumb');
      }

      if (thumbPlaceholderEl) {
        thumbPlaceholderEl.setAttribute('data-thumb-id', selectedThumbId);
        setStyle(thumbPlaceholderEl, { backgroundImage: selectedThumbUrl ? ('url(' + selectedThumbUrl + ')') : '' });
      }
    }

    return false;
  },

  initThumbUpload: function(opts, parentBody) {
    if (!opts || !isObject(opts)) return;

    var options = {
      file_name: 'photo',

      file_size_limit: 1024*1024*5, // 5Mb
      file_types_description: 'Image files (*.jpg, *.png, *.gif)',
      file_types: '*.jpg;*.JPG;*.png;*.PNG;*.gif;*.GIF;*.bmp;*.BMP',

      onUploadStart: function(i, res) {
        show(thumbProgressEl);
        setStyle(thumbProgressBarEl, 'width', '0%');
      },

      onUploadComplete: function(i, res) {
        hide(thumbProgressEl);
        setStyle(thumbProgressBarEl, 'width', '0%');

        if (!res) {
          topError('Thumb load error');
          return;
        }

        res = parseJSON(res);

        var imageEl = geByClass1('video_tc_upload_image', itemEl);
        show(imageEl);
        setStyle(imageEl, { backgroundImage: 'url(' + res.thumb.l + ')' });

        itemEl.setAttribute('data-thumb-url', res.thumb.l);
        itemEl.setAttribute('data-thumb-id', res.photo_id + '_' + res.photo_owner_id);
        itemEl.setAttribute('data-thumb-hash', res.photo_hash);

        VideoUpload.selectThumb(itemEl);
      },

      onUploadProgress: function(i, bytesLoaded, bytesTotal) {
        var percent = intval(bytesLoaded / bytesTotal * 100);
        percent = Math.min(percent, 100);

        setStyle(thumbProgressBarEl, 'width', percent + '%');
      },

      onUploadError: function(info, res) {
        hide(thumbProgressEl);
        setStyle(thumbProgressBarEl, 'width', '0%');

        topError('Thumb load error');
      },

      clear: 1,
      type: 'photo',
      buttonClass: 'secondary small',
      max_attempts: 3,
      server: opts.server,
      error: opts['default_error'],
      error_hash: opts['error_hash'],
      noCheck: true,
      chooseBox: true,
      label: cur.videoUploadThumbBtnTpl,
      uploadButton: true,
      buttonClass: 'video_tc_upload_btn',
      accept: '.jpg,.jpeg,.png',
      filesize_hide_last: true,

      lang: {
        filesize_error: getLang('video_upload_thumb_size_error')
      }
    };

    var itemEl = geByClass1('video_tc_uploader', parentBody);

    Upload.init(itemEl, opts.url, opts.vars, options);

    // for closure
    var thumbProgressEl = geByClass1('video_tc_upload_progress_wrap', parentBody);
    var thumbProgressBarEl = geByClass1('video_tc_upload_progress_bar', parentBody);
  },

  selectThumb: function(item, url) {
    var thumbUrl = item.getAttribute('data-thumb-url'),
        thumbId = item.getAttribute('data-thumb-id'),
        thumbHash = item.getAttribute('data-thumb-hash');

    if (!thumbId) return;

    var parentEl = domPN(item);
    each(geByClass('video_tc_item', parentEl), function() {
      toggleClass(this, 'video_tc_item_selected', this == item);
    });

    var thumbPlaceholderEl = VideoUpload.getPlaceholderEl(item);
    if (thumbPlaceholderEl) {
      thumbPlaceholderEl.setAttribute('data-thumb-id', thumbId);
      thumbPlaceholderEl.setAttribute('data-thumb-hash', thumbHash || '');
      setStyle(thumbPlaceholderEl, { backgroundImage: 'url(' + thumbUrl + ')' });
    }
  },

  getPlaceholderEl: function(ref) {
    var parentEl = hasClass(ref, 'video_upload_item_panel') ? ref : gpeByClass('video_upload_item_panel', ref);
    return geByClass1('video_upload_thumb_placeholder', parentEl);
  },

  initTC: function(tc, tcMessage, parent) {
    var infoEl = geByClass1('video_upload_tc_info', parent);

    if (tcMessage) {
      infoEl.innerHTML = tcMessage;
      return;
    }

    re(infoEl);

    tc = se(tc);
    var wrapEl = geByClass1('video_upload_tc_wrap', parent);
    wrapEl.appendChild(tc);

    var uploaderEl = geByClass1('video_tc_uploader', parent);
    if (uploaderEl) {
      var sliderEl = geByClass1('video_tc_slider_cont', parent);
      sliderEl.insertBefore(uploaderEl, sliderEl.children[0]);
    }

    var pEl = VideoUpload.getPlaceholderEl(tc);
    var itemsEl = geByClass('video_tc_item', tc);
    if (pEl && !pEl.getAttribute('data-thumb-id') && itemsEl.length > 1) {
      var hasUploader = geByClass1('video_tc_uploader', tc) ? 1 : 0;
      VideoUpload.selectThumb(itemsEl[hasUploader + (itemsEl.length - 1 - hasUploader) / 2]);
    }
  },

  runVideoProgressUpdate: function(item, owner_id, video_id, video_hash, need_thumb, need_tc, prev_progress, error_count) {
    ajax.post('al_video.php', {act: 'encode_progress', oid: owner_id, vid: video_id, hash: video_hash, need_thumb: need_thumb, need_tc: need_tc}, {
      onDone: function(json) {
        if (!domPN(item) || !isVisible('video_upload_tab')) return;
        var needCheck = true;
        var progress = -1;
        if (json) {
          if (json.error) {
            VideoUpload.showError(item, getLang('video_upload_encode_error'));
            return;
          }

          if (need_thumb && json.thumb) {
            var thumbPlaceholderEl = VideoUpload.getPlaceholderEl(item);
            thumbPlaceholderEl.setAttribute('data-main-thumb', json.thumb);
            if (!thumbPlaceholderEl.getAttribute('data-thumb-id')) {
              setStyle(thumbPlaceholderEl, { backgroundImage: 'url(\'' + json.thumb + '\')' });
            }
            need_thumb = '';
          }

          if (need_tc && (json.tc || json.tc_msg)) {
            VideoUpload.initTC(json.tc, json.tc_msg, item);
            need_tc = 0;
          }

          var duration = json.duration;
          progress = json.percents;
          //for case of 0 zero movie
          if (typeof(duration) != "undefined") {
            if (progress >= 100) {
              if (prev_progress < 100) {
                if (json.published) {
                  VideoUpload.setPublished(item);
                } else {
                  var progressItem = geByClass1('video_upload_progress_element', item);
                  var infoItem = geByClass1('video_upload_ready_message', item);
                  slideUp(progressItem, {duration: 150, transition: Fx.Transitions.swiftOut});
                  slideDown(infoItem, {duration: 150, transition: Fx.Transitions.swiftOut});
                  VideoUpload.setStatusHeader(getLang('video_upload_completed_title'), item);
                }

                if (need_thumb || need_tc) {
                  var status = need_thumb ? 2 : 0;
                  status += need_tc ? 1 : 0;
                  VideoUpload._logUploadStatus('no_thumb', { status: status, vid: owner_id + '_' + video_id });
                }
              }
            } else {
              VideoUpload.setStatusHeader(getLang('video_upload_encoding'), item);
              var intPercent = intval(progress);
              var text = getLang('video_upload_encode_percent').replace('{percent}', intPercent);
              VideoUpload.setProgressValue(progress, text, item);
            }
            if (progress >= 100 && !need_thumb && !need_tc) {
              needCheck = false;
            }
          } else {
            progress = -1;
          }
        }
        if (needCheck) {
          setTimeout(VideoUpload.runVideoProgressUpdate.pbind(item, owner_id, video_id, video_hash, need_thumb, need_tc, progress, error_count), 1000);
        }
      },
      onError: function() {
        if (!error_count) {
          error_count = 1;
        }
        setTimeout(VideoUpload.runVideoProgressUpdate.pbind(item, owner_id, video_id, video_hash, need_thumb, need_tc, prev_progress, error_count + 1), error_count * 2000);
      }
    });
  },
  showError: function(item, text) {
    var errorPanel = geByClass1('upload_video_error_panel', item);
    var infoPanel = geByClass1('upload_video_info_panel', item);
    var errorLabel = geByClass1('upload_video_error_label', item);

    if (errorLabel) {
      val(errorLabel, text);
    }

    hide(infoPanel);
    show(errorPanel);
    disableButton(geByClass1('video_upload_ready_button', item), true);
    disableButton(geByClass1('video_upload_back_edit', item), true);

    data(item, 'error', true);
  },
  setPublished: function(item) {
    data(item, 'published', true);
    VideoUpload.setStatusHeader(getLang('video_upload_published_title'), item);
    VideoUpload.setUploadStatus(getLang('video_upload_ready_link_text'), item);
    var progress = geByClass1('video_upload_progress_element', item);
    if (isVisible(progress)) {
      slideUp(progress, {duration: 150, transition: Fx.Transitions.swiftOut});
    }
    var messagePanel = geByClass1('video_upload_ready_message', item);
    if (isVisible(messagePanel)) {
      slideUp(messagePanel, {duration: 150, transition: Fx.Transitions.swiftOut});
    }

    var statusExport = geByClass1('video_upload_status_export', item);
    disable(statusExport);
    var publishLater = geByClass1('video_upload_publish_later', item);
    disable(publishLater);
  },
  setProgressValue: function(percent, text, item, animated) {
    if (!item) return;
    var back_percent = geByClass1('video_upload_progress_back_percent', item);
    var front_percent = geByClass1('video_upload_progress_front_percent', item);
    var front = geByClass1('video_upload_progress_front', item, 'div');
    var progress = geByClass1('video_upload_progress', item, 'div');
    setStyle(front, {width: percent + '%'});
    setStyle(progress, {width: percent + '%'});
    val(back_percent, text);
    val(front_percent, text);
  },
  saveParams: function(button) {
    disableButton(button, true);
    var item = VideoUpload.getUploadItem(button);

    var params = VideoUpload.getParams(item);
    if (data(item, 'video_id')) {
      params['vid'] = data(item, 'video_id');
    }

    var index = item.id.substr('video_upload_item_'.length);
    var vars = Upload.vars[index];

    params['oid'] = vars.oid;
    params['tag'] = vars.tag;

    params['act'] = 'save_video_params';
    params['hash'] = cur.videoHashs[vars.tag];

    params['ocl'] = cur.ocl ? 1 : undefined;

    ajax.post('al_video.php', params, {
      onDone: function(result, name, descr) {
        disableButton(button, false);

        if (result == 'published') {
          VideoUpload.setPublished(item);
        }

        var container = geByClass1('js_video_upload_inputs', item);
        var infoContainer = geByClass1('js_video_upload_ready', item);
        var titleEl = geByClass1('video_upload_ready_name', infoContainer);
        val(titleEl, name || getLang('video_upload_no_name'));
        var descrEl = geByClass1('video_upload_ready_description', infoContainer);
        val(descrEl, descr || '');

        var titleInput = geByClass1('video_upload_item_name', item);
        val(titleInput, (params['title'] || getLang('video_upload_no_name')).substr(0, cur.videoTitleLength));
        var descrInput = geByClass1('video_upload_description', item);
        val(descrInput, (params['desc'] || '').substr(0, cur.videoDescriptionLength));

        data(item, 'saved', true);

        slideUp(container, {duration: 150, transition: Fx.Transitions.swiftOut});
        slideDown(infoContainer, {duration: 150, transition: Fx.Transitions.swiftOut});
      }
    });

  },
  deleteParams: function(button) {
    var item = VideoUpload.getUploadItem(button);

    var showEditPanel = function() {
      var container = geByClass1('js_video_upload_inputs', item);
      var infoContainer = geByClass1('js_video_upload_ready', item);

      slideUp(infoContainer, {duration: 150, transition: Fx.Transitions.swiftOut});
      slideDown(container, {duration: 150, transition: Fx.Transitions.swiftOut});
      data(item, 'saved', false);
    };

    if (data(item, 'published')) {
      showEditPanel();
    } else {
      disableButton(button, true);
      var params = VideoUpload.getParams(item);
      if (data(item, 'video_id')) {
        params['vid'] = data(item, 'video_id');
      }

      var index = item.id.substr('video_upload_item_'.length);
      var vars = Upload.vars[index];

      params['oid'] = vars.oid;
      params['tag'] = vars.tag;

      params['act'] = 'delete_video_params';

      ajax.post('al_video.php', params, {
        onDone: function(result) {
          disableButton(button, false);
          showEditPanel();
        },
        onError: function() {
          disableButton(button, false);
        }
      });
    }
  },
  getParams: function(item) {
    var index = item.id.substr('video_upload_item_'.length);
    var vars = Upload.vars[index];
    var tag = vars.tag;
    var statusExportItem = geByClass1('video_upload_status_export', item);
    var publishLaterItem = geByClass1('video_upload_publish_later', item);
    var noCommentingItem = geByClass1('video_upload_no_comments', item);
    var nameItem = geByClass1('video_upload_item_name', item);
    var descItem = geByClass1('video_upload_description', item);
    var repeatItem = geByClass1('video_edit_repeat', item);

    var selectedAlbumItems = 0;
    if (VideoUpload._uploadAlbumChooser[index]) {
      selectedAlbumItems = VideoUpload._uploadAlbumChooser[index].selectedItems()[0];
    }

    var placeholderEl = VideoUpload.getPlaceholderEl(item);
    var selectedThumbId = placeholderEl.getAttribute('data-thumb-id');
    var selectedThumbHash = placeholderEl.getAttribute('data-thumb-hash');

    var params = {
      status_export: isChecked(statusExportItem),
      publish_later: isChecked(publishLaterItem),
      no_comments: isChecked(noCommentingItem),
      title: val(nameItem),
      desc: val(descItem),
      repeat: isChecked(repeatItem),
      album_id: selectedAlbumItems ? selectedAlbumItems[0] : '',
      thumb_id: selectedThumbId,
      thumb_hash: selectedThumbHash
    };

    if (vars.oid > 0) {
      params['privacy_video'] = Privacy.getValue('video' + tag);
      params['privacy_videocomm'] = Privacy.getValue('videocomm' + tag);
    } else {
      params['privacy_video'] = isChecked('video_upload_group_privacy');
    }

    return params;
  },
  setStatusHeader: function(text, item) {
    if (!item) return;
    var header = geByClass1('video_upload_item_header', item);
    val(header, text);
  },
  setUploadStatus: function(text, item) {
    var span = geByClass1('video_upload_link_header', item);
    val(span, text);
  },
  showReupload: function(button) {
    var item = VideoUpload.getUploadItem(button);
    var params = VideoUpload.getParams(item);
    params['reupload'] = 1;
    VideoUpload.showBox(params);
    cur.videoReupload = item;
  },
  getUploadItem: function(descent) {
    return gpeByClass('video_upload_item_panel', descent);
  },
  noPublish: function(check) {
    var item = VideoUpload.getUploadItem(check);
    var statusExportItem = geByClass1('video_upload_status_export', item);
    if (isChecked(check)) {
      checkbox(statusExportItem, 0);
      disable(statusExportItem, 1);
    } else {
      disable(statusExportItem, 0);
    }
  },
  stopUpload: function(i) {
    var box = showFastBox({
        width: 430,
        title: getLang('video_upload_stop_title'),
        dark: 1,
        bodyStyle: 'padding: 20px;'
      }, getLang('video_upload_stop_text'), getLang('video_upload_stop_button'),
      function() {
        box.hide();
        Upload.terminateUpload(i);
        var item = ge('video_upload_item_' + i);
        var videoId = false;
        if (data(item, 'video_id')) {
          videoId = data(item, 'video_id');
        }
        if (videoId) {
          var vars = Upload.vars[i];
          ajax.post('al_video.php', {
            act: 'delete_video',
            vid: videoId,
            oid: vars.oid,
            sure: 1
          });
        }
        VideoUpload.deleteItem(ge('video_upload_item_' + i), true);
      });
  },
  deleteItem: function(item, animated) {
    var prev = domPS(item);
    var next = domNS(item);
    if (prev && hasClass(prev, 'video_upload_item_panel') && (!next || !hasClass(next, 'video_upload_item_panel'))) {
      removeClass(prev, 'video_upload_with_divider');
    }
    if (animated) {
      slideUp(item, {duration: 150, transition: Fx.Transitions.swiftOut, onComplete: function() {
        re(item);
      }});
    } else {
      re(item);
    }
    if ((!prev || !hasClass(prev, 'video_upload_item_panel')) && (!next || !hasClass(next, 'video_upload_item_panel'))) {
      if (animated) {
        slideDown('video_upload_no_video', {duration: 150, transition: Fx.Transitions.swiftOut});
      } else {
        show('video_upload_no_video')
      }
    }
    cleanElems(item);
  },
  initBeforeUnload: function () {
    if (window.onbeforeunload != VideoUpload.checkChanges) {
      cur.nav.push(function (changed, old, n, opts) {
        if (VideoUpload.checkChanges(1) === false) {
          cur.onContinueCb = nav.go.pbind(n);
          return false;
        }
      });
      cur.prevBefUnload = window.onbeforeunload;
      window.onbeforeunload = VideoUpload.checkChanges;
      cur.destroy.push(function () {
        window.onbeforeunload = cur.prevBefUnload;
        VideoUpload.destroyTab();
      });
    }
  },
  checkChanges: function(showBox) {
    if (cur.leaving) return;
    var message = false;

    var tab = ge('video_upload_tab');

    if (!tab) return false;

    var items = geByClass('video_upload_item_panel', tab);

    for (var index in items) {
      var item = items[index];
      if (!data(item, 'published') && !data(item, 'error')) {//in process && (!data(item, 'video_id') || !data(item, 'saved'))) {
        message = getLang('video_upload_changed');
        break;
      }
    }

    if (showBox === 1) {
      if (!message) return true;
      var box = showFastBox({title: getLang('global_warning'), dark: true}, message, getLang('global_continue'), function () {
        cur.leaving = true;
        box.hide();
        if (cur.onContinueCb) {
          cur.onContinueCb();
        }
      }, getLang('global_cancel'), function () {
        box.hide();
        if (cur.onCancelCb) {
          cur.onCancelCb();
        }
      });
      return false;
    }
    if (message) {
      return winToUtf(message.replace(/<\/?b>/g, '').replace(/<br\s*\/?>/g, '\n'));
    }
  },
  toUploadVideo: function() {
    var box = cur.uploadVideoBox;
    VideoUpload.checkResize();
    VideoUpload.onShowUploadPanel();
    show('video_upload_box_tab');
    hide('video_add_from_youtube_tab');

    box.removeButtons();
    box.setOptions({hideButtons: 1, title: getLang('video_header_new')});
    box.addButton(getLang('global_cancel'), box.hide, 'no');
  },
  toExternalAdd: function() {
    var box = cur.uploadVideoBox;
    box.setOptions({title: '<a class="video_upload_title_back" onclick="VideoUpload.toUploadVideo();">' + getLang('video_upload_back') + '</a>'});
    VideoUpload.onHideUploadPanel();
    hide('video_upload_box_tab');
    show('video_add_from_youtube_tab');
    box.removeButtons();
    if (isVisible('video_extra_settings') || isVisible('video_share_not_allowed') || isVisible('video_share_error')) {
      box.setOptions({hideButtons: 0});
      box.addButton(getLang('global_save'), cur.saveExternalVideo);
    } else {
      box.setOptions({hideButtons: 1});
    }
    box.addButton(getLang('global_cancel'), box.hide, 'no');
    ge('video_external_link').focus();
  },
  toGroupVideoSelect: function(groupId) {
    var uploadBox = curBox();
    showBox('al_video.php', {act: 'a_choose_video_box', to_id: -groupId, from: 'video_add', no_header: 1}, {
      dark: 1,
      onDone: function(box) {
        box.setOptions({title: '<a class="video_upload_title_back" onclick="curBox().hide();">' + getLang('video_upload_back') + '</a>'});
      }
    });
    cur.chooseVideoAdd = function(obj, hash) {
      ajax.post('al_video.php', {act: 'a_add', video: obj, hash: hash, gid: groupId}, {
        onDone: function() {
          if (cur.module != 'video') {
            nav.go('/videos-' + groupId, false, {onDone: function() {
              cur.__phinputs = cur.__phinputs || [];
              globalHistoryDestroy(nav.objLoc[0]);
            }});
          } else {
            nav.reload();
            boxQueue.hideAll();
            uploadBox.destroy();
          }
        }
      });
      return false;
    }
  },
  initShare: function(owner_id, share_hash) {
    var box = cur.uploadVideoBox;

    var external = ge('video_external_link');

    placeholderSetup(external, {back: true});

    var externalTimout, externalCheckVal;
    var fetchExternalVideo = function() {
      var val = trim(external.value);
      if (!val || externalCheckVal == val) {
        return;
      }
      box.showProgress();
      externalCheckVal = val;
      ge('video_share_form').submit();
    };

    function fetchExternalVideoTimeout(e) {
      if (externalTimout) clearTimeout(externalTimout);
      if (e.keyCode == KEY.ENTER) {
        fetchExternalVideo();
      } else {
        externalTimout = setTimeout(fetchExternalVideo, 1000);
      }
    }

    var sharedVideo;

    window.onParseDone = function(obj) {
      hide('video_share_server_error');
      hide('video_share_error');

      if (obj.images_proxy) {
        var proxyBase = ge('video_share_form').action.replace(/\/[^\/]*$/, '') + '/upload.php?act=proxy_img&';
        each(obj.images_proxy, function(k, v) {
          obj.images_proxy[k] = proxyBase + v;
        });
      } else {
        obj.images_proxy = obj.images;
      }
      if (obj.extra > 0 && obj.extraData && obj.images[0]) {
        hide('video_share_descr');
        hide('video_share_error');
        box.hideProgress();
        ge('video_share_photo_url').value = obj.url;
        ge('video_share_photo_image').value = obj.images[0];
        ge('video_share_photo_extra').value = obj.extra;

        cur.changeExternalImage = function(elem) {
          cur.externalVideoImage++;
          var img = obj.images[cur.externalVideoImage];
          if (img) {
            elem.src = obj.images_proxy[cur.externalVideoImage];
          } else {
            cur.externalVideoImage = 0;
            elem.src = obj.images_proxy[0];
          }
        };

        if (obj.images[0]) {
          cur.externalVideoImage = 0;
          var externalImageDiv = ge('video_external_image');
          setStyle(externalImageDiv, {
            'backgroundImage': 'url(\'' + obj.images_proxy[0] + '\')',
            'cursor': 'pointer'
          });
          externalImageDiv.setAttribute('onclick', 'cur.changeExternalImage(this)');
          if (obj.images.length > 1) {
            var load = vkImage();
            load.src = obj.images_proxy[0];
            load.onload = function() {
              if (load.width < 130) {
                cur.changeExternalImage(ge('video_external_img'));
              }
            }
          }

          (function() {
            var stdload = vkImage();
            stdload.onerror = function() {
              var already_loaded = false;

              each(obj.images_proxy, function(k, v) {
                if (0 == k) {
                  return;
                }

                var load = vkImage();
                load.onload = function() {
                  if (already_loaded) {
                    return;
                  }
                  already_loaded = true;
                  ge('video_share_photo_image').value = v;
                  cur.externalVideoImage = k;
                  setStyle(externalImageDiv, {
                    'backgroundImage': 'url(\'' + v + '\')'
                  });
                };
                load.src = v;
              });
            };
            stdload.src = obj.images_proxy[0];
          })();

        }

        ge('video_external_title').value = replaceEntities(obj.title);
        ge('video_external_description').value = replaceEntities(obj.description);

        { // albums
          if (cur.videoPlaylists.length) {
            cur._addExternalAlbumDD = new Dropdown(geByClass1('video_external_upload_album_chooser_input', curBox().bodyNode), [[0, getLang('video_upload_choose_album_placeholder')]].concat(cur.videoPlaylists), {
              autocomplete: true,
              width: 270,
              selectedItems: [0],
              big: true
            });
          } else {
            re(geByClass1('video_upload_album_chooser_wrap'));
          }
        }

        show('video_extra_settings');

        sharedVideo = obj;

        box.removeButtons();
        box.addButton(getLang('global_cancel'), box.hide, 'no');
        cur.saveExternalVideo = function() {
          if (obj && obj.images) {
            box.showProgress();
            cur.shareExternalImageSave = obj.images[cur.externalVideoImage];
            ge('video_share_photo_image').value = cur.shareExternalImageSave;
            ge('video_share_photo_form').submit();
          }
        };
        box.setOptions({hideButtons: 0});
        box.addButton(getLang('global_save'), cur.saveExternalVideo);
      } else if (obj.extra == -1) {
        show('video_share_not_allowed');
        box.hideProgress();
      } else {
        show('video_share_error');
        notaBene('video_external_link');
        box.hideProgress();
      }
    };

    window.onParseFail = function() {
      hide('video_share_server_error');

      box.hideProgress();
      show('video_share_error');
      notaBene('video_external_link');
    };

    window.onUploadDone = function(index, obj) {
      if (obj.photo_id && obj.user_id && sharedVideo) {
        var shareTitle = sharedVideo.title;
        sharedVideo.title = ge('video_external_title').value;
        var desc = ge('video_external_description').value;

        var aid = 0;
        if (cur.vSection) {
          var sect = cur.vSection.split('_');
          if (sect[0] == 'album') {
            aid = sect[1];
          }
        }
        var query = extend(sharedVideo, {
          oid: owner_id,
          folder_id: aid,
          act: 'save_external',
          hash: share_hash,
          share_title: shareTitle || ge('video_external_title').value,
          share_text: desc,
          image_url: cur.shareExternalImageSave,
          photo_owner_id: obj.user_id,
          photo_id: obj.photo_id,
          extra: sharedVideo.extra,
          extra_data: sharedVideo.extraData,
          to_video: 1,
          album_id: cur._addExternalAlbumDD ? cur._addExternalAlbumDD.selectedItems()[0][0] : ''
        });
        if (query.openGraph) {
          delete query.openGraph;
        }
        delete sharedVideo.extraData;

        if (query.oid > 0) {
          query['privacy_video'] = Privacy.getValue('video_external');
          query['privacy_videocomm'] = Privacy.getValue('videocomm_external');
        } else {
          query.gid = -query.oid;
        }

        if (isChecked('video_external_status_export')) {
          query['to_status'] = 1;
        }

        if (isChecked('video_external_no_comments')) {
          query['no_comments'] = 1;
        }

        delete query.images;
        delete query.images_proxy;
        setTimeout(function() {
          ajax.post('/al_video.php', query, {onDone: function(data) {
            box.hideProgress();
            hide('share_error');
            if (data.owner_id && data.video_id) {
              var ownerId = vk.id == data.owner_id ? '' : ('s' + data.owner_id);
              nav.go('/video'+ownerId+'?section=all&z=video'+data.owner_id+'_'+data.video_id, undefined, {nocur: true});
            } else {
              show('share_server_error');
            }
          },
            onFail: function(text) {
              box.hideProgress();
              hide('video_share_error');
              ge('video_share_server_error').innerHTML = text;
              show('video_share_server_error');
              return true;
            }});
        }, 0);
      } else {
        box.showProgress();
        show('video_share_error');
      }
    };

    window.onUploadFail = function() {
      box.hideProgress();
      hide('video_share_error');
      show('video_share_server_error');
    };

    addEvent(external, 'paste blur', fetchExternalVideo);
    addEvent(external, 'keydown input', fetchExternalVideoTimeout);

    cur.destroy.push(function() {
      removeEvent(external, 'paste blur', fetchExternalVideo);
      removeEvent(external, 'keydown input', fetchExternalVideoTimeout);
    });
  }
};

try{stManager.done('video_upload.js');}catch(e){}
