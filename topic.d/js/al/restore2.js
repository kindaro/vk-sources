var Restore2 = {
  initAdmins: function() {},
  showAdminsRightTT: function(el, admin_id) {
    showTooltip(el, {
      text: ge('restore2_admins_tt_value_'+admin_id).innerHTML,
      slideX: 15,
      className: 'restore2_admins_tt right',
      shift: [244, -130, -35],
      hasover: 1,
      forcetodown: 1,
      showdt: 200,
      hidedt: 200,
      asrtl: true
    });
  }
};

try{stManager.done('restore2.js');}catch(e){}
