function onLoad() {
  // MRVS variable name, e.g. 'mobile_devices_set'
  var mrvsName = "";

  /**
   * Runs on ANY MRVS change (add/edit/remove/clear).
   * @param {string|Object} value - The raw MRVS value (often a JSON string).
   */
  function handleValueChange(value) {
    console.log("MRVS current value:", value)
    // TODO: parse JSON, calculate totals, validate, etc.
  }

  if (isServicePortal()) {
    if (top.window.angular) {
      var $scope = top.window.angular.element(
        top.document.querySelector('#sc_cat_item')
      ).scope();

      $scope.$watch(function() {
        return g_form.getValue(mrvsName);
      }, function(value) {
        handleValueChange(value);
      });
    }
  } else {
    // Legacy/Classic UI16 Catalog
    setTimeout(function() {
      var mrvsHTML = top.window.g_form.getControl(mrvsName);
      Object.defineProperty(mrvsHTML, 'value', {
        set: function(t) {
          mrvsHTML.setAttribute('value', t);
          handleValueChange(t);
        },
        get: function() {
          return mrvsHTML.getAttribute('value');
        }
      });
    }, 5000);
  }

  function isServicePortal() {
    return !!(top.window.NOW && Object.prototype.hasOwnProperty.call(top.window.NOW, 'sp'));
  }
}
