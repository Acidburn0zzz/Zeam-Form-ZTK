
// Requires: json-template.js

(function ($){

    var field_name_regexp = /(.*)\.field\.(\d+)$/;

    var increment = function(value) {
        return (parseInt(value) + 1).toString();
    };

    var create_template = function(node) {
        var template = new jsontemplate.Template(node.get(0).innerHTML, {});

        // Remove the template from the DOM.
        node.html('');
        return template;
    };

    var starts_with = function(string) {
        var starter = '^';

        for (var i= 1; i < arguments.length; i++) {
            starter += arguments[i];
        };
        return string.match(starter);
    };

    var update_line_names = function(line, base_name, count) {
        var selector_name = base_name + '.checked.';
        var present_name = base_name + '.present.';
        var field_name = base_name + '.field.';

        var rewriter = function () {
            var input = $(this);
            var old_name = input.attr('name');

            if (starts_with(old_name, selector_name)) {
                input.attr('name', selector_name + count);
            } else if (starts_with(old_name, present_name)) {
                input.attr('name', present_name + count);
            } else if (starts_with(old_name, field_name)) {
                var new_name = field_name + count;
                var i = field_name.length;

                // Consume the old count
                for (; i < old_name.length && old_name[i] != '.'; i++);
                // Copy the end of the old name to the new one
                for (; i < old_name.length; i++) {
                    new_name += old_name[i];
                };
                input.attr('name', new_name);
            };
        };
        // Rewrite name for input, textarea and select tags.
        line.find('input').each(rewriter);
        line.find('textarea').each(rewriter);
        line.find('select').each(rewriter);

        // Update the rel attribute on the file.
        line.attr('rel', field_name + count);
    };

    var update_move_buttons = function(line_top, line_bottom) {
        // Show or hide move up/down button depending if it is the
        // first line or last line or not. This code exist because IE
        // 7 doesn't support last-child in CSS.
        if (line_top.is(':first-child')) {
            line_top.find('.field-list-move-up').hide();
            line_bottom.find('.field-list-move-up').show();
        };
        if (line_bottom.is(':last-child')) {
            line_top.find('.field-list-move-down').show();
            line_bottom.find('.field-list-move-down').hide();
        };
    };

    $(document).ready(function (){
        $('form.zeam-form div.field-list').each(function (){
            var field = $(this);
            var counter = field.find('input.field-list-counter');
            var container = field.find('div.field-list-lines');
            var template = create_template(field.find('div.field-list-template'));

            // Clear style on any existing buttons.
            update_move_buttons(
                container.find('.field-list-line:first'),
                container.find('.field-list-line:last'));

            // Bind the add button
            field.find('input.field-list-add-line').bind('click', function() {
                var identifier = counter.val();
                var new_line = $(template.expand({identifier: identifier}));
                var empty_message = field.find('.field-list-empty');
                var remove_button = field.find('.field-list-remove-line');
                var previous_line = container.children('.field-list-line:last');

                if (empty_message.is(':visible')) {
                    empty_message.slideUp();
                };
                if (!remove_button.is(':visible')) {
                    remove_button.fadeIn();
                };
                update_move_buttons(previous_line, new_line);
                new_line.appendTo(container);
                counter.val(increment(identifier));
                return false;
            });

            // Bind the remove button
            field.find('input.field-list-remove-line').bind('click', function() {
                field.find('input.field-list-line-selector:checked').each(function (){
                    var selector = $(this);
                    var line = selector.parents('.field-list-line');
                    var previous_line = line.prev('.field-list-line');
                    var next_line = line.next('.field-list-line');

                    line.remove();

                    update_move_buttons(next_line, previous_line);

                    var lines = container.find('.field-list-line');

                    if (!lines.length) {
                        var empty_message = field.find('.field-list-empty');
                        var remove_button = field.find('.field-list-remove-line');

                        empty_message.slideDown();
                        remove_button.fadeOut();
                    };
                });
                return false;
            });

            // Bind the up button
            field.find('button.field-list-move-up').live('click', function () {
                var button = $(this);
                var line = button.parents('.field-list-line');
                var previous_line = line.prev();

                if (previous_line.hasClass('field-list-line')) {
                    var name_info = field_name_regexp.exec(line.attr('rel'));
                    var base_name = name_info[1];
                    var count = name_info[2];

                    var previous_name_info = field_name_regexp.exec(
                        previous_line.attr('rel'));
                    var previous_count = previous_name_info[2];

                    line.remove();
                    line.insertBefore(previous_line);
                    update_line_names(line, base_name, previous_count);
                    update_line_names(previous_line, base_name, count);
                    update_move_buttons(line, previous_line);
                };
                return false;
            });

            // Bind the down button
            field.find('button.field-list-move-down').live('click', function () {
                var button = $(this);
                var line = button.parents('.field-list-line');
                var next_line = line.next();

                if (next_line.hasClass('field-list-line')) {
                    var name_info = field_name_regexp.exec(line.attr('rel'));
                    var base_name = name_info[1];
                    var count = name_info[2];

                    var next_name_info = field_name_regexp.exec(next_line.attr('rel'));
                    var next_count = next_name_info[2];

                    line.remove();
                    line.insertAfter(next_line);
                    update_line_names(line, base_name, next_count);
                    update_line_names(next_line, base_name, count);
                    update_move_buttons(next_line, line);
                };
                return false;
            });
        });
    });
})(jQuery);