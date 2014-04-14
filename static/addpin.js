// Generated by CoffeeScript 1.4.0
(function() {
  var category_selected, clear_all_error_messages, clear_error_for_field, have_valid_price, images, preview, price_regex, selected_a_price_range, show_error_for_field;

  preview = $('#preview');

  images = [];

  window.imagesLoading = false;

  $('#link,#product_url').change(function() {
    var url, value;
    value = $(this).val();
    if (value !== '' && (value.indexOf('http://') !== 0 || value.indexOf('http://') !== 0)) {
      if (value.indexOf('//') === 0) {
        $(this).val('http:' + value);
      } else {
        $(this).val('http://' + value);
      }
    }
    if (value !== '') {
      clear_error_for_field($('#link,#product_url'));
    }
    if (window.imagesLoading) {
      return false;
    }
    if ($('#image_url').val() === void 0) {
      return false;
    }
    window.imagesLoading = true;
    url = $(this).val();
    $('#input-link').val(url);
    if (url.replace('https://', '').replace('http://', '').indexOf('/') === -1) {
      url += '/';
    }
    preview.html('loading images&hellip;');
    $('#btn-add').prop('disabled', true);
    return $.getJSON('/preview?url=' + url, function(data) {
      var counter, first, image_source, img, src, _i, _len, _ref;
      $('#btn-add').prop('disabled', false);
      preview.html('');
      if ('title' in data) {
        $('#input-desc').val(data.title);
      }
      if ('images' in data) {
        first = true;
        counter = 0;
        preview.html('<h4>Choose an image:</h4>');
        _ref = data.images;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          src = _ref[_i];
          image_source = {
            'src': src
          };
          img = _.template($('#image-template').html(), image_source);
          if (first) {
            if ($('#image_url').val() === '') {
              $('#image_url').val(src);
              $('#image_url').change();
            }
            first = false;
          }
          preview.append(img);
        }
      }
      window.imagesLoading = false;
    });
  });

  $('#image_url').on('change', function() {
    var value;
    value = $(this).val();
    if (value !== '' && (value.indexOf('http://') !== 0 || value.indexOf('http://') !== 0)) {
      if (value.indexOf('//') === 0) {
        $(this).val('http:' + value);
      } else {
        $(this).val('http://' + value);
      }
    }
    if (value !== '') {
      clear_error_for_field($(this));
      $('#preview_of_selected_image').prop('src', value);
      $('#layer_preview_of_selected_image').show();
    } else {
      $('#layer_preview_of_selected_image').hide();
    }
  });

  $('#tags,#title').on('change', function() {
    if ($(this).val() !== '') {
      clear_error_for_field($(this));
    }
  });

  $('#preview').on('click', 'img', function() {
    var src;
    src = $(this).attr('src');
    $('#image_url').val(src);
    $('#image_url').change();
    $('img.clickable').removeClass('selected');
    $(this).addClass('selected');
  });

  $('input[name=price_range]').on('change', function() {
    clear_error_for_field($('#price_range'));
  });

  $('input[name=category_check]').on('change', function() {
    clear_error_for_field($('#categories'));
  });

  $('#form').submit(function() {
    var errors;
    if (window.imagesLoading) {
      alert("Please wait for all images to load.");
      return false;
    }
    clear_all_error_messages();
    errors = false;
    if ($('#product_url').val() === '' && $('#link').val() === '') {
      show_error_for_field($('#product_url'), 'Please provide a Product URL or Source URL');
      show_error_for_field($('#link'), 'Please provide a Product URL or Source URL');
      errors = true;
    }
    if ($('#title').val() === '') {
      show_error_for_field($('#title'), 'Please provide a title');
      errors = true;
    }
    if ($('#tags').val() === '') {
      show_error_for_field($('#tags'), 'Please provide tag words');
      errors = true;
    }
    if (!have_valid_price()) {
      show_error_for_field($('#price'), 'Only numbers and decimal point');
      errors = true;
    }
    if (!selected_a_price_range()) {
      errors = true;
    }
    if (!category_selected()) {
      show_error_for_field($('#categories'), 'Select one or more categories for this product');
      errors = true;
    }
    if ($('#image_url').val() !== void 0) {
      if ($('#image_url').val() === '') {
        show_error_for_field($('#image_url'), 'Provide the image URL or select an image from the right (if available)');
        errors = true;
      }
    } else if ($('#image').val() === '') {
      show_error_for_field($('#image'), 'Provide the image file to upload');
      errors = true;
    }
    if ($('#board_id').val() === '' && $('#board_name').val() === '') {
      errors = true;
      show_error_for_field($('#layer_add_new_board'), 'Select or create a new getlist');
      $('#button_change_layer_to_select_existing_board').click();
    }
    if (errors) {
      alert("Ooops, there are missing fields to fill, please review...");
      return false;
    }
    return true;
  });

  price_regex = /^\d+(?:\.?\d{0,2})$/;

  have_valid_price = function() {
    var new_val, price, value;
    price = $('#price');
    if (price.val() === '') {
      return true;
    }
    new_val = price.val().replace(/[^\d\.]/g, '');
    price.val(new_val);
    if (!price_regex.test(price.val())) {
      return false;
    } else {
      value = price.val();
      if (value.indexOf('.') === -1) {
        price.val(value + '.00');
      } else if (value.indexOf('.') === value.length - 1) {
        price.val(value + '00');
      } else if (value.indexOf('.') === value.length - 2) {
        price.val(value + '0');
      }
    }
    return true;
  };

  selected_a_price_range = function() {
    var price_range;
    price_range = $('input[name=price_range]:checked').val();
    if (price_range === void 0) {
      show_error_for_field($('#price_range'), 'Select a price range');
      return false;
    }
    return true;
  };

  show_error_for_field = function(field, text) {
    field.addClass('field_error');
    field.after('<div class="error_text">' + text + '</div>');
  };

  clear_error_for_field = function(field) {
    field.removeClass('field_error');
    field.next('div.error_text').remove();
  };

  clear_all_error_messages = function() {
    $('input').removeClass('field_error');
    $('div.error_text').remove();
  };

  category_selected = function() {
    var c, category_value, checked_categories, value, _i, _len;
    checked_categories = $('input[name=category_check]:checked');
    if (checked_categories.length > 0) {
      category_value = '';
      for (_i = 0, _len = checked_categories.length; _i < _len; _i++) {
        c = checked_categories[_i];
        value = c.value;
        if (category_value !== '' && category_value.lastIndexOf(',') !== category_value.length - 1) {
          category_value = category_value + ',';
        }
        category_value = category_value + value;
      }
      $('#categories').val(category_value);
      return true;
    } else {
      return false;
    }
  };

  $('#button_change_layer_to_add_new_board').on('click', function(event) {
    event.preventDefault();
    $('#board_id').val('');
    $('#layer_select_existing_board').hide();
    return $('#layer_add_new_board').show();
  });

  $('#button_change_layer_to_select_existing_board').on('click', function(event) {
    event.preventDefault();
    $('#board_name').val('');
    $('#layer_add_new_board').hide();
    return $('#layer_select_existing_board').show();
  });

}).call(this);
