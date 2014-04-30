// Generated by CoffeeScript 1.4.0

jQuery(function() {
  var load_current_homepage_pins, load_more_items, simplify_url;
  $.loading_items = false;
  $.current_page = 0;
  $.current_column = 1;
  $.pin_template = _.template($('#pin_template').html());
  load_current_homepage_pins = function() {
    $.getJSON('/admin/homepage_pins/current_pins', function(data) {
      var pin, pin_html, _i, _len;
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        pin = data[_i];
        pin['simplifiedurl'] = simplify_url(pin['link']);
        if (pin['tags'] !== null) {
          pin['taglist'] = pin['tags'].split(' ');
        }
        pin_html = $.pin_template(pin);
        $('#current_homepage_pins').append(pin_html);
      }
      window.setTimeout($('img.lazy').lazyload({
        failure_limit: 100
      }), 100);
    });
  };
  simplify_url = function(url) {
    var first_slash_position, simplified;
    simplified = url;
    if (url === null) {
      return url;
    }
    if (simplified.indexOf('http:') === 0) {
      simplified = simplified.substring(6, simplified.length - 1);
    }
    if (simplified.indexOf('https:') === 0) {
      simplified = simplified.substring(7, simplified.length - 1);
    }
    if (simplified.indexOf('//') === 0) {
      simplified = simplified.substring(2, simplified.length - 1);
    }
    if (simplified.indexOf('/') === 0) {
      simplified = simplified.substring(1, simplified.length - 1);
    }
    first_slash_position = simplified.indexOf('/');
    if (first_slash_position > 0) {
      simplified = simplified.substring(0, first_slash_position);
    }
    return simplified;
  };
  load_more_items = function() {
    var url;
    if ($.loading_items) {
      return;
    }
    $.loading_items = true;
    url = '/admin/homepage_pins/unselected_pins?page=' + $.current_page;
    $.getJSON(url, function(data) {
      var pin, pin_html, _i, _len;
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        pin = data[_i];
        if ($.current_column > 3) {
          $.current_column = 1;
        }
        pin['simplifiedurl'] = simplify_url(pin['link']);
        if (pin['tags'] !== null) {
          pin['taglist'] = pin['tags'].split(' ');
        }
        pin_html = $.pin_template(pin);
        $('#column' + $.current_column).append(pin_html);
        $.current_column += 1;
      }
      $.loading_items = false;
      window.setTimeout($('img.lazy').lazyload({
        failure_limit: 100
      }), 100);
    });
  };
  load_current_homepage_pins();
  load_more_items();
});
