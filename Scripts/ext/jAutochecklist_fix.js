/* jQuery plugin : jAutochecklist
 @Version: 1.3.3
 @Desctrition: Create a list of checkbox with autocomplete
 @Website: https://github.com/flyingangel/jAutochecklist
 @Licence: MIT

 Copyright (C) 2013-2017 Thanh Trung NGUYEN
 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

(function ($, document, window, undefined) {
    'use strict';

    var pluginName = 'jAutochecklist';
    //detect dragging
    var dragging = false;
    var drag_memory;
    var dragging_state;

    //detect mobile. http://detectmobilebrowsers.com/
    var isMobile = (function (a) {
        return (/(android|bb\d+|meego)|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od|ad)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)));
    })(navigator.userAgent || navigator.vendor || window.opera);

    //if format isn't implemented
    if (!String.prototype.format) {
        String.prototype.format = function () {
            var args = arguments;
            return this.replace(/{(\d+)}/g, function (match, number) {
                return args[number] !== undefined ? args[number] : match;
            });
        };
    }

    //drag handling
    $(window).on('mouseup.' + pluginName, function () {
        dragging = false;
    });

    var classes = {
        wrapper: pluginName + '_wrapper',
        widget: pluginName + '_widget',
        disabled: pluginName + '_disabled',
        rtl: pluginName + '_rtl',
        multiple: pluginName + '_multiple',
        single: pluginName + '_single',
        nosearch: pluginName + '_nosearch',
        remote: pluginName + '_remote'
    };

    var fn = {
        init: function (options) {
            //default setting
            var config = $.extend(true, {
                absolutePosition: false, //use absolute position instead of inline
                accentInsensitive: true, //if enable, search autocomplete will be accent insensitive
                accessibility: false, //enable accessibility mode
                allowDeselectSingleList: true, //allow deselection on a single list
                alphabetical: false, //order item alphabetically
                animation: true, //show popup and list with fade animation
                arrow: true, //show or hide the arrow
                chainable: null, //the selector to chain lists
                chainableSource: null, //a function defining the data of the next chainable list
                checkbox: false, //show or hide checkbox
                defaultFallbackValue: '', //default value for fallback
                dynamicPosition: false, //support dynamic position for list at the bottom of page
                fallback: false, //fallback support for values
                firstItemSelectAll: false, //enable checkall on first item
                inline: false, //display the list inline style
                labelStyle: false, //label style
                listWidth: null, //width of the list
                listMaxHeight: null, //max height of the list
                maxSelected: null, //maximum of item selected
                multiple: true, //checkbox or radio
                openOnHover: false, //open the list on hover, and close as well
                rtl: false, //right-to-left text support
                search: true, //ability to search
                showValue: false, //show value instead of text
                theme: null, //use a theme
                uniqueValue: false, //item with the same text cannot be selected more than one
                updateOriginal: false, //whether to update original everytime the list change
                valueAsLogo: false, //use value as logo
                width: 200, //width of the wrapper
                //popup
                popup: true, //show or hide popup
                popupLogoAsValue: false, //show logo instead of item value/text
                popupGroupValue: false, //item with the same value will be grouped together
                popupMaxItem: 10, //maximum number of item on popup
                popupSizeDelta: 100, //this will add to the popup width
                //text
                textAllSelected: 'All', //text when all selected
                textClose: 'Done', //text close in mobile style
                textCloseMatch: 'Did you mean "{0}" ?', //text when found a close match, {0} will be replaced by a word
                textEmpty: 'Please select...', //the default text
                textMoreItem: 'and {0} more...', //text on popup when there are more items, {0} will be replaced with a number
                textNoResult: 'No result found...', //text no result
                textSearch: 'Type something...', //the default text
                //group
                autoCollapse: false, //use in conjunction with collapseGroup to auto collapse/expand items
                autoExpand: false, //use in conjunction with collapseGroup to auto collapse/expand items
                collapseGroup: false, //ability to collapse
                expandOnSearch: false, //when a group is found on search, expand it
                expandSelected: 0, //auto expand the root parent if find any selected element (binary)
                //0 => default. Nothing will be expanded
                //1 => All ancestors will be shown
                //2 => The direct parent will be expanded and other ancestors will be shown (but not expanded)
                //4 => All ancestors will be expanded
                //8 => Selected item will be expanded (if it's a group)
                selectorGroup: 'group', //the class selector of a group
                selectorChild: 'child', //the class selector of a child
                groupType: 0, //global setting of the type of a group
                //0 => default. The parent item will be selected if all of the children items are selected
                //1 => The parent item will be selected if at least one child item is selected
                //2 => The parent item acts independantly from the children items (exclusive)
                //3 => A combination of type0 and type2 - The parent item acts independantly but the children will affect the parent
                //4 => A combination of type1 and type2 - The parent item acts independantly but the children will affect the parent
                //5 => The parent item will select all the children but the children will not affect the parent

                onClose: null, //func(vals, valBefore, changed)
                //values    = list of selected values
                //valBefore = list of selected values at opening of the list
                //changed   = boolean whether the list is changed or not
                onInit: null, //event just after initialization
                onItemClick: null, //func(value, li, valBefore, valAfter, checked)
                //value		= the selected value
                //li 		= the selected list item object
                //valBefore = list of values before selection
                //valAfter 	= list of values after selection
                //checked	= the current check state
                onOpen: null, //func(values)
                //values=list of selected values
                onRemoveAll: null, //func(button, values)
                //button    = the removeAll button object
                //values    = list of values before removing all
                onSmartChange: null, // Trigger like onClose and onRemoveAll

                //fetch data from remote source
                remote: {
                    cache: true, //whether to cache found data (should be disable when loadMoreOnScroll is enable)
                    delay: 0, //the delay (in ms) before setting query to the remote source to reduce charge
                    data: null, //additional data to append to the source. String | function
                    filter: false, //autofilter after fetching data from the remote source, it means that the client side will handle word match
                    forceRefresh: false, //force refresh even if the last request is empty
                    loadMoreOnScroll: false, //when scroll down, next data will be loaded (will conflict with cache)
                    minLength: 0, //the minimum length of the text
                    source: null, //source of data to fetch if fnQuery isn't defined
                    fnPredict: null, //func(text, input, callback)         custom function that handle suggestion
                    //text  = the typing search text
                    //input = the underlying input object
                    //callback  = callback function used to build suggestion
                    fnQuery: null      //func(obj, text, offset, callback)   custom function that handle query
                            //obj       = the current jQuery list object
                            //text      = the typing search text
                            //offset    = the offset position of the result
                            //callback  = callback function used to build the list
                },
                menuStyle: {
                    enable: false, //enable menu style
                    search: true, //display or hide the search zone
                    fixedPosition: false, //if menu styleis active, then it's a fixed menu
                    fixedPositionContainer: 'window', //the element to compare the position (selector)
                    fixedPositionOffsetTop: 20, //the top position
                    scrollSpyContainer: 'window', //the element which is scrolled (selector)
                    scrollSpyAnimationDuration: 500,
                    scrollSpyOffsetTop: 20,
                    onScrollSpyActivate: null   //func(element) event when scroll spy triggered
                            //element = triggered list item element
                },
                autocompleteStyle: {
                    enable: false, //enable autocomplete style
                    //                    attachTo: null,  //if no set, attach to the internal input by default (selector) @TODO
                    separator: ' ;.,?!;/()&<>|', //trigger word search after these chars only
                    minLength: 3
                },
                widget: {
                    source: null, //widget to append to the list: selector, DOM, jquery object, function
                    onInputChange: null, //input inside widget is changed
                    onValidate: null    //validate, close the list
                }
            },
                    options);

            return this.each(function () {
                var $this = $(this);
                var data = $this.data(pluginName);
                var id = this.id;
                var className = this.className;

                //if isn't a list or a select
                var isSelect = $this.is('select');
                if (!$this.is('ul') && !isSelect)
                    return;

                //make sure the element is not initialized twice
                if (data)
                    return;

                //clone the config setting
                var settings = $.extend(true, {
                }, config);

                //bind the current list
                settings.originalObject = this;

                //data passed by attribute json will override the settings
                var json = $this.data('json');
                if (json) {
                    //json = $.parseJSON(json); //it's already an object
                    settings = $.extend(true, settings, json);
                }

                if (isSelect)
                    settings.multiple = this.multiple;
                else {
                    var multiple = $this.data('multiple');
                    //if data attribute is set, override JS setting
                    if (multiple !== undefined)
                        settings.multiple = multiple === 1;
                }

                if (!settings.multiple) {
                    settings.popup = false;
                    settings.firstItemSelectAll = false;
                }

                if ($this.hasClass('inline-style'))
                    settings.inline = true;

                //if has menu-style consider it's an inline list
                if ($this.hasClass('menu-style') || settings.menuStyle.enable) {
                    settings.inline = true;
                    settings.arrow = false;
                    settings.menuStyle.enable = true;
                }

                if (settings.inline || isMobile)
                    settings.popup = false;

                //label style
                if ($this.hasClass('label-style') || settings.labelStyle) {
                    settings.arrow = false;
                    settings.allowDeselectSingleList = false;
                    settings.popup = false;
                    settings.labelStyle = true;
                    settings.width = 'auto';
                }

                if ($this.hasClass('autocomplete-style') || settings.autocompleteStyle.enable) {
                    settings.arrow = false;
                    settings.autocompleteStyle.enable = true;
                    settings.popup = false;
                }

                if ($this.hasClass('absolutePosition'))
                    settings.absolutePosition = true;

                //accessibility mode
                var title = $this.attr('title');
                if (title && settings.accessibility)
                    settings.textSearch = title;

                //copy the original tabindex
                var tabindex = $this.attr('tabindex') || 0;

                //create a div wrapper
                var wrapper = $('<div>').attr({
                    'class': classes.wrapper,
                    tabindex: tabindex
                })
                        .width(settings.width === null ? $this.width() : settings.width)
                        .append(
                                ('<div class="{0}_popup"></div>'
                                        + '<div class="{0}_dropdown_wrapper">'
                                        + '<div class="{0}_arrow"><div></div></div>'
                                        + '<div class="{0}_dropdown"><div class="{0}_result"></div><input class="{0}_prediction" tabindex="-1" /><input class="{0}_input" placeholder="{1}" tabindex="-1" /><div class="{0}_remove_all"></div><div class="{0}_close">{2}</div></div></div>'
                                        + '<ul class="{0}_list"></ul>').format(pluginName, settings.textSearch, settings.textClose)
                                );

                if (settings.widget.source) {
                    var wg_html;
                    if (typeof settings.widget.source === 'string' || settings.widget.source instanceof window.Element)
                        wg_html = $(settings.widget.source);
                    else if (settings.widget.source instanceof jQuery)
                        wg_html = settings.widget.source;
                    else if (typeof settings.widget.source === 'function')
                        wg_html = settings.widget.source.call($this);

                    if (wg_html) {
                        var wg = $('<div>').html(wg_html).addClass(classes.widget);
                        wrapper.append(wg).addClass('has-widget');

                        //manage tabindex in widget
                        wg.find('input,button').attr('tabindex', tabindex);
                    }
                }

                if (id)
                    wrapper.attr('id', classes.wrapper + '_' + id);
                if (className)
                    wrapper.addClass(className);
                if (this.disabled || $this.data('disabled'))
                    wrapper.addClass(classes.disabled);
                if (settings.rtl)
                    wrapper.addClass(classes.rtl);
                if (settings.inline)
                    wrapper.addClass('inline-style');
                if (settings.menuStyle.enable)
                    wrapper.addClass('menu-style');
                if (settings.autocompleteStyle.enable)
                    wrapper.addClass('autocomplete-style');
                if (settings.labelStyle)
                    wrapper.addClass('label-style');
                else {  //not label style
                    var w = wrapper.width();
                    if (w < 50)
                        wrapper.addClass('mini-style');
                    else if (w >= 50 && w < 100)
                        wrapper.addClass('small-style');
                }
                if (settings.multiple)
                    wrapper.addClass(classes.multiple);
                else
                    wrapper.addClass(classes.single);

                if (settings.theme)
                    wrapper.addClass(settings.theme);
                if (!settings.search)
                    wrapper.addClass(classes.nosearch);
                if (settings.remote.source || settings.remote.fnQuery)
                    wrapper.addClass(classes.remote);
                if (settings.absolutePosition)
                    wrapper.addClass('absolutePosition');

                //add a signature of this plugin
                $this.addClass(pluginName);

                //the popup should have 100px more than the wrapper width by default
                var popup = wrapper.find('.' + pluginName + '_popup').width(settings.width + settings.popupSizeDelta).css({
                    marginLeft: -settings.popupSizeDelta / 2
                });
                var dropdown = wrapper.find('.' + pluginName + '_dropdown');
                var result = wrapper.find('.' + pluginName + '_result');
                var input = wrapper.find('.' + pluginName + '_input');
                var prediction = wrapper.find('.' + pluginName + '_prediction');
                var arrow = wrapper.find('.' + pluginName + '_arrow');
                var ul = wrapper.find('.' + pluginName + '_list');
                var removeAll = wrapper.find('.' + pluginName + '_remove_all');
                var close = isMobile ? wrapper.find('.' + pluginName + '_close') : null;
                var widget = wrapper.find('.' + classes.widget);

                //manual size of the list
                if (settings.listWidth) {
                    if (settings.listWidth === 'auto' && !isMobile)
                        ul.addClass('display-table');
                    else
                        ul.width(settings.listWidth * 1 - 2);   //minus 2px border
                }
                if (settings.listMaxHeight)
                    ul.css({
                        maxHeight: settings.listMaxHeight + 'px'
                    });
                if (settings.menuStyle.enable && (!settings.menuStyle.search || !settings.search))
                    wrapper.find('.' + pluginName + '_dropdown_wrapper').remove();
                if (!settings.arrow) {
                    arrow.remove();
                    arrow = null;
                    if (settings.rtl)
                        removeAll.css({
                            left: 5
                        });
                    else
                        removeAll.css({
                            right: 5
                        });
                }
                if (!settings.popup) {
                    popup.remove();
                    popup = null;
                }
                if (settings.inline || settings.autocompleteStyle.enable) {
                    result.remove();
                    result = null;
                }
                //                if (settings.autocompleteStyle.enable && settings.autocompleteStyle.attachTo){
                //                    input = $(settings.autocompleteStyle.attachTo);
                //                    prediction.remove();
                //                    prediction = $();
                //                }

                //list item
                var name;
                if (isSelect) {
                    json = fn._buildFromSelect($this, settings);
                    name = this.name || $this.data('name') || '';
                    //remove name to prevent bug
                    this.removeAttribute('name');
                }
                else {
                    json = fn._buildFromUl($this, settings);
                    name = $this.data('name');
                }

                //detect whether another list of the same name exist; warn to prevent bug
                if (name && $('select[name="' + name + '"], ul[data-name="' + name + '"], input[name="' + name + '"], input[name="' + name + '\[\]"]').not($this).length)
                    window.console.warn('WARNING another list with the same attribute name="' + name + '" exist on the same page');

                //default to the plugin name and a random number
                if (!name)
                    name = pluginName + '_' + Math.floor(Math.random() * (1000000000 - 0 + 1));

                //remember the name
                $this.data('name', name);

                if (settings.autocompleteStyle.enable)
                    input.attr('name', name);

                var li = fn._buildItemFromJSON(json, settings, name);
                var tmp = fn._insertList(ul, li, settings, false);

                //register elements
                var elements = {
                    popup: popup,
                    wrapper: wrapper,
                    dropdown: dropdown,
                    result: result,
                    input: input,
                    arrow: arrow,
                    prediction: prediction,
                    selectAll: tmp.selectAll,
                    removeAll: removeAll,
                    close: close,
                    widget: widget,
                    list: ul,
                    listItem: {
                        li: tmp.li,
                        checkbox: tmp.checkbox
                    }
                };

                data = {
                    elements: elements,
                    settings: settings
                };

                $this.data(pluginName, data);

                //insert the checklist into the DOM, right after the main list
                $this.after(wrapper);
                //hide the original element
                $this.hide();

                fn._registerEvent($this);
                fn._postProcessing($this, false);

                if (settings.onInit)
                    settings.onInit.call($this);
            });
        },
        destroy: function () {
            return this.each(function () {
                var $this = $(this);
                var data = $this.data(pluginName);
                if (!data)
                    return;

                $(document).add(window).off('.' + pluginName);
                data.elements.wrapper.remove();

                fn._updateOriginal($this);

                $this.removeData(pluginName).show();
                //reset the name
                this.setAttribute('name', $this.data('name'));
            });
        },
        selectAll: function () {
            return this.each(function () {
                fn._selectAll($(this), true);
            });
        },
        deselectAll: function () {
            return this.each(function () {
                fn._selectAll($(this), false);
            });
        },
        //open the list, can only open one a time
        open: function () {
            return this.each(function () {
                fn._open($(this));
            });
        },
        //close the list
        close: function () {
            return this.each(function () {
                fn._close($(this));
            });
        },
        //update the result box basing on the selected element
        update: function () {
            return this.each(function () {
                fn._update($(this));
            });
        },
        //count selected item, can only count one instance
        count: function () {
            return fn._count(this);
        },
        //get the values, can only get value of one instance
        get: function () {
            return fn._get(this);
        },
        //get all values, including non selected values
        getAll: function () {
            return fn._getAll($(this));
        },
        //get text of selected items
        getText: function () {
            return fn._getText(this);
        },
        getAllText: function () {
            return fn._getAllText($(this));
        },
        getValueAndText: function () {
            return fn._getValueAndText(this);
        },
        getSelectedObject: function () {
            return fn._getObject(this, true);
        },
        getObject: function () {
            return fn._getObject(this, false);
        },
        //set the values
        set: function (vals, clearAll) {
            if (clearAll === undefined)
                clearAll = false;

            //convert to array if not array
            if (!(vals instanceof Array))
                vals = [vals];

            //convert to string
            for (var i = 0; i < vals.length; i++)
                vals[i] = vals[i] === null || vals[i] === undefined ? vals[i] : vals[i].toString();

            return this.each(function () {
                fn._set($(this), vals, clearAll);
            });
        },
        unset: function (vals) {
            //convert to array if not array
            if (!(vals instanceof Array))
                vals = [vals];

            //convert to string
            for (var i = 0; i < vals.length; i++)
                vals[i] = vals[i] === undefined ? '' : vals[i].toString();

            return this.each(function () {
                fn._unset($(this), vals);
            });
        },
        //disable
        disable: function (vals) {
            return this.each(function () {
                var data = $(this).data(pluginName);
                if (!data)
                    return;

                //undefined 2nd parameter => disable the whole list
                if (vals === undefined)
                    data.elements.wrapper.addClass(classes.disabled);
                //disable element
                else if (vals) {
                    //convert to array if not array
                    if (!(vals instanceof Array))
                        vals = [vals];

                    if (vals.length && data.elements.listItem.checkbox) {
                        data.elements.listItem.checkbox.each(function () {
                            //found matched value
                            if (vals.indexOf(this.value) >= 0)
                                $(this).parent().addClass('locked');
                        });
                    }
                }
            });
        },
        //enable
        enable: function (vals) {
            return this.each(function () {
                var data = $(this).data(pluginName);
                if (!data)
                    return;

                //undefined 2nd parameter => enable the whole list
                if (vals === undefined)
                    data.elements.wrapper.removeClass(classes.disabled);
                //enable element
                else if (vals) {
                    //convert to array if not array
                    if (!(vals instanceof Array))
                        vals = [vals];

                    if (vals.length && data.elements.listItem.checkbox) {
                        data.elements.listItem.checkbox.each(function () {
                            //found matched value
                            if (vals.indexOf(this.value) >= 0)
                                $(this).parent().removeClass('locked');
                        });
                    }
                }
            });
        },
        //change the settings
        settings: function (json) {
            //get setting
            if (json === undefined) {
                var d = this.data(pluginName);
                if (!d)
                    return null;

                return d.settings;
            }

            //set settings
            return this.each(function () {
                var $this = $(this);
                var data = $this.data(pluginName);
                if (!data)
                    return;
                data.settings = $.extend(true, data.settings, json);
                $this.data(pluginName, data);
            });
        },
        //refresh the list memory
        refresh: function (totalRefresh) {
            return this.each(function () {
                var $this = $(this);
                var data = $this.data(pluginName);
                if (!data)
                    return;

                //if totalrefresh, completely refresh by destroying then rebuilding the list
                if (totalRefresh)
                    $this.jAutochecklist('destroy').jAutochecklist(data.settings);
                else {
                    var ul = data.elements.list;
                    var selectAll;
                    if (data.settings.firstItemSelectAll)
                        selectAll = ul.children(':first').addClass(pluginName + '_checkall');

                    var li = ul.children();
                    data.elements.listItem = {
                        li: li,
                        checkbox: li.children('.' + pluginName + '_listItem_input')
                    };
                    data.elements.selectAll = selectAll;

                    $this.data(pluginName, data);
                }

            });
        },
        refreshPosition: function () {
            return this.each(function () {
                fn._refreshPosition($(this));
            });
        },
        //return object elements that construct the list
        widget: function () {
            var data = this.data(pluginName);
            if (!data)
                return null;

            return data.elements;
        },
        clearCache: function () {
            return this.each(function () {
                var data = $(this).data(pluginName);
                if (!data)
                    return;

                data.elements.input.removeData(['remote', 'lastRequest']);
            });
        },
        /**
         * rebuild the list from JSON
         * @param json ARRAY an array of JSON
         * @param showNoResult BOOLEAN whether to show text "No result found" if nothing found
         * @param isAdd BOOLEAN if true, data will be add to the end of the list instead of replacing the current list
         * @returns object
         */
        buildFromJSON: function (json, showNoResult, isAdd) {
            if (showNoResult === undefined)
                showNoResult = true;

            if (isAdd === undefined)
                isAdd = false;

            return this.each(function () {
                fn._buildFromJSON($(this), json, showNoResult, isAdd);
            });
        },
        /**
         * Intentionally release the drag status to prevent some bugs
         */
        releaseDrag: function () {
            dragging = false;
        },
        trigger: function (eventName) {
            var data = this.data(pluginName);
            if (!data)
                return;

            var settings = data.settings;
            var funcName = '_trigger' + eventName.substr(0, 1).toUpperCase() + eventName.substr(1);

            if (settings[eventName])
                return fn[funcName](this);
            else
                window.console.warn('Event ' + eventName + " doesn't exist");
        },
        /*
         *  PRIVATE
         */
        _triggerOnClose: function (obj) {
            return fn._eventOnClose(obj);
        },
        _triggerOnSmartChange: function (obj) {
            return fn._eventSmartChange(obj);
        },
        _eventOnClose: function (obj) {
            var data = obj.data(pluginName);
            var settings = data.settings;
            var val = fn._get(obj);
            var valBefore = obj.data('value');
            var changed = fn._valueChanged(val, valBefore);
            return settings.onClose.call(obj, val, valBefore, changed);
        },
        _eventSmartChange: function (obj) {
            var data = obj.data(pluginName);
            var settings = data.settings;
            var val = fn._get(obj);
            var valBefore = obj.data('value');
            var changed = fn._valueChanged(val, valBefore);
            return settings.onSmartChange.call(obj, val, valBefore, changed);
        },
        //compare array values, order insensible
        _valueChanged: function (val1, val2) {
            var val_tmp = val1;
            var val2_tmp = val2;
            //sort if is array
            if (val_tmp && val_tmp.constructor === Array)
                val_tmp = val_tmp.sort();
            if (val2_tmp && val2_tmp.constructor === Array)
                val2_tmp = val2_tmp.sort();

            var changed = !(val1 === val2 || JSON.stringify(val_tmp) === JSON.stringify(val2_tmp));

            return changed;
        },
        _buildFromJSON: function (obj, json, showNoResult, isAdd, selected, offset) {
            var data = obj.data(pluginName);
            if (!data)
                return;

            //convert to array if empty
            if (!json)
                json = [];

            //if json is not an object, such as string, try to convert
            if (typeof json !== 'object')
                json = JSON && JSON.parse(json) || $.parseJSON(json);

            //it's an array
            var i, new_json = [];
            if (json instanceof Array) {
                //convert if it's an array of non object item
                if (json.length && typeof json[0] !== 'object') {
                    for (i = 0; i < json.length; i++) {
                        new_json.push({
                            html: json[i],
                            val: i
                        });
                    }

                    json = new_json;
                }
            }
            //json of value=>label items
            else {
                for (i in json) {
                    if (json.hasOwnProperty(i)) {
                        new_json.push({
                            html: json[i],
                            val: i
                        });
                    }
                }

                json = new_json;
            }

            var elements = data.elements;
            var settings = data.settings;
            var li = fn._buildItemFromJSON(json || [], settings, obj.data('name'), selected, offset);
            var tmp = fn._insertList(elements.list, li, settings, isAdd, elements.mobile_popup);

            elements.input.removeClass('loading');

            data.elements.listItem = {
                li: tmp.li,
                checkbox: tmp.checkbox
            };

            data.elements.selectAll = tmp.selectAll;
            obj.data(pluginName, data);
            fn._postProcessing(obj, showNoResult);

            return json;
        },
        _registerEvent: function (self) {
            var data = self.data(pluginName);
            var settings = data.settings;
            var elements = data.elements;
            var wrapper = elements.wrapper;
            var dropdown = elements.dropdown;
            var input = elements.input;
            var prediction = elements.prediction;
            var ul = elements.list;
            var removeAll = elements.removeAll;
            var popup = elements.popup;
            var arrow = elements.arrow;
            var close = elements.close;
            var widget = elements.widget;
            var shift_on = false;
            var timer;

            if (arrow)
                arrow.on('mousedown.' + pluginName, function () {
                    if (!ul.is(':hidden')) {
                        fn._close(self);
                        return false;
                    }
                });

            //searching
            input.on('keydown.' + pluginName, function (e) {
                if (!settings.search || wrapper.hasClass(classes.disabled))
                    return false;

                var key = e.keyCode;
                if (key === 38 || key === 40)
                    e.preventDefault();

                //directional key
                if (!fn._isAlphabetKey(key) && key !== 9)
                    return;

                var v = prediction.val();
                //clear prediction if different than directional key
                prediction.val(null);

                //if TAB and underlying input is different
                if (key === 9 && v && this.value !== v) {
                    this.value = v;
                    return false;
                }

                //if escape
                if (key === 27) {
                    //if use absolute position simulate escape key on dummy element
                    if (!isMobile && settings.absolutePosition) {
                        var ev = $.Event('keydown');
                        key = 27;
                        $('.' + pluginName + '_dummy').trigger(ev);
                    }
                    fn._close(self);
                }
            })
                    .on('keyup.' + pluginName, function (e) {
                        if (!fn._isAlphabetKey(e.keyCode) && e.keyCode !== 9)
                            return;

                        var $this = $(this);
                        var val = this.value;
                        var hasResult = false;
                        var remote = settings.remote;

                        //add delay to prevent lag
                        var delay = ul.children().length * 2;
                        if (delay > 3000)
                            delay = 3000;

                        if (remote.source || remote.fnQuery)
                            delay = remote.delay;

                        //clear the previous timer
                        window.clearTimeout(timer);
                        //set a timer to reduce server charge
                        timer = window.setTimeout(function () {
                            ul.children('.' + pluginName + '_noresult').remove();
                            prediction.val(val);


                            //if menu-style, show removeAll button, doesn't matter if items are selected or not
                            if (settings.menuStyle.enable) {
                                if (val)
                                    removeAll.show();
                                else
                                    removeAll.hide();
                            }

                            if (settings.autocompleteStyle.enable) {
                                //val is the last word
                                val = fn._getLastWord(val, settings.autocompleteStyle.separator);
                                //do nothing if too few character
                                if (val.length < settings.autocompleteStyle.minLength) {
                                    fn._close(self);
                                    //stop here
                                    return;
                                }
                            }

                            //if remote, replace the current list with new data
                            if (remote.source || remote.fnQuery) {
                                var cache = $this.data('remote');

                                //if text length < minLength do nothing
                                if (val.length < remote.minLength)
                                    return;

                                //before emptying the list, we must remember the selected values
                                var selected = fn._getValueAndText(self);

                                //force empty the last request
                                $this.data('lastRequest', null);

                                //if cache not exist, fetch from remote source
                                if (!cache || cache[val] === undefined) {
                                    //we dont know if there are results, open the list anyway
                                    if (settings.autocompleteStyle.enable)
                                        fn._open(self, false);

                                    //predict the next word
                                    if (remote.fnPredict && !settings.autocompleteStyle.enable)
                                        remote.fnPredict.call(self, val, prediction, fn._predict);
                                    //user defined func
                                    fn._fetchData(self, val, 0, selected);
                                    //predict from local source
                                    if (!remote.fnPredict && !settings.autocompleteStyle.enable)
                                        fn._setPredictionFromLocalSource(self);

                                    return; //break the code here
                                }
                                else {  //load from cache
                                    var json = cache[val];
                                    if (json && json.length) {
                                        fn._buildFromJSON(self, json, true, false, selected);
                                        hasResult = true;
                                    }
                                }
                            }
                            else {  //using local source
                                hasResult = fn._filterListItem(self);
                            }

                            if (hasResult && settings.autocompleteStyle.enable)
                                fn._open(self, false);

                            fn._setClosestMatch(self, hasResult);
                        }, delay);
                    })
                    //stop propagoation to the wrapper
                    .on('focusin.' + pluginName, function (e) {
                        if (wrapper.hasClass(classes.disabled))
                            return false;

                        e.stopPropagation();
                    });

            if (isMobile)
                input.on('focusout.' + pluginName, function (e) {
                    e.stopPropagation();
                });

            //show popup
            if (popup) {
                dropdown.on('mouseover.' + pluginName, function () {
                    window.clearTimeout(popup.data('timeout'));
                    var timeout = window.setTimeout(function () {
                        //if have at least one element
                        if (fn._count(self) && !wrapper.hasClass(classes.disabled)) {
                            //if using absolute position, we need to move the popup to outside
                            if (settings.absolutePosition && ul.is(':hidden'))
                                fn._movePopupAway(elements);

                            settings.animation ? popup.fadeIn() : popup.show();
                        }
                    }, 200);
                    popup.data('timeout', timeout);
                });
                //if list is not opened, hide popup if mouse leave
                dropdown.add(popup).on('mouseout.' + pluginName, function () {
                    if (ul.is(':hidden')) {
                        window.clearTimeout(popup.data('timeout'));
                        var timeout = window.setTimeout(function () {
                            popup.hide();
                            //move back to the list
                            if (settings.absolutePosition && ul.is(':hidden'))
                                fn._movePopupBackToList(elements);
                        }, 200);
                        popup.data('timeout', timeout);
                    }
                });

                popup.on('mouseover.' + pluginName, function () {
                    window.clearTimeout(popup.data('timeout'));
                })
                        //on popup item click, deselect that item
                        .on('mousedown.' + pluginName, 'div', function () {
                            var $this = $(this);

                            if ($this.hasClass('stack') || $this.hasClass('locked'))
                                return;

                            //if this is a "more" button
                            if ($this.hasClass(pluginName + '_more'))
                                fn._update(self, false, true);
                            else {
                                if (settings.popupGroupValue) {
                                    //find anything that has the same value and deselect it
                                    $this.children('div.stack').remove();
                                    var val = $this.text();

                                    ul.children('li.selected').each(function () {
                                        var $t = $(this);
                                        var input = $t.children('.' + pluginName + '_listItem_input');
                                        var v = settings.showValue ? input.val() : $t.text();
                                        //found the bound item, deselect the checkbox
                                        if (val === v) {
                                            input.prop('checked', false);
                                            $t.removeClass('selected');
                                        }
                                    });
                                }
                                else {
                                    var id = this.className.replace(pluginName + '_popup_item_', '');
                                    ul.find('.' + pluginName + '_input' + id).parent('li').trigger('mousedown').trigger('mouseup');
                                }

                                fn._update(self);
                            }
                            return false;
                        });
            }

            widget.on('click', '.trigger-close', function () {
                if (settings.widget.onValidate && settings.widget.onValidate.call(self) === false)
                    return false;

                fn._close(self);
            })
                    .on('change', ':input', function () {
                        if (settings.widget.onInputChange)
                            settings.widget.onInputChange.call(self);
                    })
                    .on('mousedown', function () {
                        //stop propagation
                        return false;
                    });

            //on checkbox click prevent default behaviour
            ul.on('click.' + pluginName, '.' + pluginName + '_listItem_input', function (e) {
                e.preventDefault();
            })
                    //on item mouse down
                    .on('mousedown.' + pluginName, '.' + pluginName + '_listItem', function (e) {
                        var $this = $(this);

                        //if locked or blocked or menu-style
                        if ($this.hasClass('locked') || $this.hasClass('blocked') || $this.hasClass('maxBlocked') || settings.menuStyle.enable || wrapper.hasClass(classes.disabled) || $this.hasClass('isError'))
                            return false;

                        //on select text, disable click
                        var text;
                        if (window.getSelection)
                            text = window.getSelection().toString();
                        else if (document.getSelection)
                            text = document.getSelection();
                        else if (document.selection)
                            text = document.selection.createRange().text;

                        if (text)
                            return false;

                        //disable propagation for live event
                        e.stopPropagation();

                        //handle menu style
                        var input = $this.children('.' + pluginName + '_listItem_input');
                        if (settings.autocompleteStyle.enable) {
                            var val = input.val();
                            var str = elements.input.val();
                            //replace last found word
                            str = fn._replaceLastWord(str, val, settings.autocompleteStyle.separator);
                            elements.input.val(str);
                            elements.prediction.val(str);
                            fn._close(self);
                            return false;
                        }

                        var checked = $this.hasClass('selected');

                        //do nothing if single list and prevent deselect
                        if (checked && !settings.multiple && !settings.allowDeselectSingleList)
                            return false;

                        //reset the drag memory
                        if (!dragging)
                            drag_memory = [];

                        //add to the drag memory to notify that this element has been processed
                        drag_memory.push($this);

                        //if is dragging and the checkbox has same state, exit
                        if (dragging && dragging_state === checked)
                            return false;

                        var valBefore = [];
                        elements.listItem.checkbox.filter(':checked').each(function () {
                            valBefore.push(this.value);
                        });

                        //reverse the checkbox status if the event is not from the checkbox
                        checked = !checked;

                        //checkall
                        if ($this.hasClass(pluginName + '_checkall')) {
                            //call user defined function click
                            if (settings.onItemClick) {
                                //if return false, prevent the selection
                                if (settings.onItemClick.call(self, null, $this, valBefore, fn._getAll(self), checked) === false) {
                                    dragging = false;
                                    return false;
                                }
                            }

                            //do not select all if maxSelected enable
                            if (checked && settings.maxSelected)
                                return false;

                            fn._selectAll(self, checked);
                        }
                        else {  //simple checkbox
                            //if is label do nothing if type radio
                            if (!settings.multiple && $this.hasClass(settings.selectorGroup))
                                return false;

                            var groupType = fn._getGroupType($this, settings);
                            var checkboxes = [];
                            var i;

                            //if a group is checked and is not exclusive, get the list of children
                            if ($this.hasClass(settings.selectorGroup) && groupType !== 2 && groupType !== 3 && groupType !== 4) {
                                //do not select childrens if maxSelected enable
                                if (checked && settings.maxSelected)
                                    return false;

                                var children = fn._getChildren($this, settings.selectorChild, undefined, true);
                                for (i = 0; i < children.length; i++)
                                    checkboxes.push(children[i].children('.' + pluginName + '_listItem_input'));
                            }

                            checkboxes.push(input);
                            for (i = 0; i < checkboxes.length; i++) {
                                //if is already checked, remove this item from the list
                                if (checkboxes[i].prop('checked') === checked)
                                    checkboxes[i] = null;
                                else
                                    checkboxes[i].prop('checked', checked);
                            }

                            //call user defined function click
                            if (settings.onItemClick) {
                                //if return false, revert to previous selection
                                if (settings.onItemClick && settings.onItemClick.call(self, input.prop('value'), $this, valBefore, fn._get(self), checked) === false) {
                                    for (i = 0; i < checkboxes.length; i++) {
                                        if (checkboxes[i])
                                            checkboxes[i].prop('checked', !checked);
                                    }

                                    dragging = false;
                                    return false;
                                }
                            }

                            fn._update(self);
                        }

                        //start dragging handling, only the first clicked li can reach here
                        if (!dragging && settings.multiple) {
                            dragging = true;
                            //the state of checkbox at the moment of dragging (the first checked)
                            dragging_state = checked;
                        }

                        //if is radio, close the list on click
                        if (!settings.multiple && !settings.autocompleteStyle.enable) {
                            fn._close(self);
                            return false;
                        }
                    })
                    //on close match click
                    .on('click.' + pluginName, 'li.hasCloseMatch', function () {
                        var str = $(this).find('span.closeMatch').text();
                        input.val(str).trigger('keyup');
                    })
                    .on('mouseenter.' + pluginName, '.' + pluginName + '_listItem', function () {
                        if (!dragging)
                            return;
                        var $this = $(this);
                        var found = false;

                        //do not click the item twice
                        for (var i = 0; i < drag_memory.length; i++) {
                            if ($this.is(drag_memory[i])) {
                                found = true;
                                break;
                            }
                        }

                        if (!found)
                            $(this).trigger('mousedown');
                    })
                    .on('click.' + pluginName, 'a', function (e) {
                        if (wrapper.hasClass(classes.disabled))
                            return false;

                        e.stopPropagation();

                        var $this = $(this);
                        var href = $this.attr('href');
                        var menuStyle = settings.menuStyle;

                        //if contain an anchor, scroll to that item
                        if (href !== '#' && /^#/.test(href)) {
                            var container = menuStyle.scrollSpyContainer;
                            if (container === 'window')
                                container = 'body';

                            var target = $(href);
                            if (!target.length)
                                return false;

                            var pos = $(href).offset().top;

                            if (container !== 'body')
                                pos += $(container).scrollTop();

                            container = $(container);

                            var offsetTop = container.offset().top;
                            var marginTop = parseInt(container.css('marginTop'));

                            if (container.is('body') && fn._isIE())
                                container = $('html');

                            container.animate({
                                scrollTop: pos - offsetTop + marginTop - menuStyle.scrollSpyOffsetTop
                            },
                                    menuStyle.scrollSpyAnimationDuration, function () {
                                        window.setTimeout(function () {
                                            //deselect all then select the clicked one
                                            var li = $this.closest('.' + pluginName + '_listItem');
                                            li.closest('ul').children('li.selected').removeClass('selected');
                                            li.addClass('selected');
                                        });
                                    });

                            return false;
                        }
                    })
                    .on('mousedown.' + pluginName, 'a', function (e) {
                        e.stopPropagation();
                        return false;
                    })
                    .on('scroll.' + pluginName, function () {
                        var $this = $(this);

                        //reduce server load
                        window.clearTimeout(timer);
                        timer = window.setTimeout(function () {
                            if (!settings.remote.loadMoreOnScroll)
                                return;

                            //load more only if the list reach its bottom
                            if ($this.innerHeight() + $this.scrollTop() + 50 < $this.get(0).scrollHeight)
                                return;

                            var val = input.val();
                            var lastRequest = input.data('lastRequest');

                            //fetch only if last request is not empty
                            if (settings.remote.forceRefresh || !lastRequest || !lastRequest[val] || !lastRequest[val].empty) {
                                var offset = $this.children('li').not('li.auto-added').length;
                                //note: do not add selected value otherwise it will create bug
                                fn._fetchData(self, val, offset);
                            }
                        }, 500);
                    })
                    .on('mousedown.' + pluginName, '.' + pluginName + '_expandable', function () {
                        var $this = $(this);
                        //the current group li
                        var group = $this.parent();

                        //already expanded
                        if ($this.hasClass('expanded'))
                            fn._collapse(group, settings);
                        else
                            fn._expand(group, settings);

                        return false;
                    })
                    .on('mousedown.' + pluginName, '.' + pluginName + '_listItem_group_empty', function () {
                        var $this = $(this);
                        //the current group li
                        var group = $this.is('li') ? $this : $this.parent();

                        //already expanded
                        if ($this.children('.' + pluginName + '_expandable').hasClass('expanded'))
                            fn._collapse(group, settings);
                        else
                            fn._expand(group, settings);

                        return false;
                    })
                    .on('mouseenter.' + pluginName, '.' + pluginName + '_listItem_group_empty', function () {
                        if (!settings.autoExpand)
                            return;

                        var $this = $(this);
                        if (!$this.find('.' + pluginName + '_expandable').hasClass('expanded'))
                            fn._expand($this, settings);

                        //collapse other li
                        if (settings.autoCollapse) {
                            var level = fn._getLevel($this);
                            var group = $this.siblings('.' + pluginName + '_listItem_group_empty.level' + level);
                            group.each(function () {
                                fn._collapse($(this), settings);
                            });
                        }
                    });

            wrapper.on('focusin.' + pluginName, function () {
                if (wrapper.hasClass(classes.disabled))
                    return false;

                if (!settings.labelStyle && ul.is(':hidden') && !settings.autocompleteStyle.enable)
                    fn._open(self);

                //as long as the wrapper has focus, focus on the input
                //IE hack
                if (!isMobile && !settings.accessibility)
                    window.setTimeout(function () {
                        //if current item is not a form input, default focus to the search
                        if (!$(document.activeElement).is('input,button'))
                            input.focus();
                    });
            })
                    //blur not triggered in FF
                    .on('focusout.' + pluginName, function (e) {
                        if (isMobile || !settings.labelStyle && $(e.target).is($(this)))
                            return;

                        //need to add delay for activeElement to be set
                        window.setTimeout(function () {
                            //close list if the active element isn't any child of the wrapper
                            if (!$(document.activeElement).closest(wrapper).length)
                                fn._close(self);
                        }, 20);
                    })
                    .on('keydown.' + pluginName, function (e) {
                        var key = e.keyCode;
                        //if menustyle or character key, do nothing
                        if (settings.menuStyle.enable || fn._isAlphabetKey(key))
                            return;

                        var li = ul.children('li:visible');
                        var current = li.filter('li.over');
                        var next, index;

                        //up/down
                        if (key === 40 || key === 38) {
                            //find the next over item
                            if (current.length) {
                                //down
                                if (key === 40) {
                                    index = li.index(current.last());
                                    next = li.eq(index + 1);
                                }
                                //up
                                else {
                                    index = li.index(current.first());
                                    next = (index - 1 < 0) ? $() : li.eq(index - 1);
                                }
                            }
                            else
                                next = li.first();

                            //if has the next element
                            if (next && next.length) {
                                //if shift is on, do not remove the current item
                                if (!shift_on)
                                    ul.children('li.over').removeClass('over');
                                next.addClass('over');

                                //scroll handling
                                if (key === 40 && next.position().top + next.height() > ul.height())
                                    ul.scrollTop(ul.scrollTop() + 50);
                                else if (key === 38 && next.position().top < 0)
                                    ul.scrollTop(ul.scrollTop() - 50);

                                if (settings.accessibility)
                                    next.focus();
                            }

                            return false;
                        }
                        //enter: do not submit form and select item
                        else if (key === 13) {
                            //if no selection, (de)select the first visible item
                            if (!current.length)
                                current = li.filter(':visible').first();

                            //if the first item is hasCloseMatch, then trigger a search on it
                            if (current.hasClass('hasCloseMatch')) {
                                var txt = current.find('span.closeMatch').text();
                                input.val(txt).trigger('keyup');
                            }
                            else {
                                current.trigger('mousedown').trigger('mouseup');
                                input.val(null);
                                prediction.val(null);
                            }

                            return false;
                        }
                        //shift
                        else if (key === 16)
                            shift_on = true;
                    })
                    .on('keyup.' + pluginName, function (e) {
                        if (e.keyCode === 16)
                            shift_on = false;
                    })
                    .on('mouseup.' + pluginName, function (e) {
                        dragging = false;
                        e.stopPropagation();
                    })
                    .on('mousedown.' + pluginName, function (e) {
                        e.stopPropagation();

                        if (wrapper.hasClass('mobile-style'))
                            return;

                        if (settings.labelStyle) {
                            if (ul.is(':hidden'))
                                fn._open(self);
                        }
                    });

            removeAll.on('mousedown.' + pluginName, function () {
                if (wrapper.hasClass(classes.disabled))
                    return false;

                var vals = fn._get(self);
                if (settings.onRemoveAll && settings.onRemoveAll.call(self, $(this), vals) === false)
                    return false;

                var emptyVal = settings.multiple ? [] : null;
                var changed = fn._valueChanged(emptyVal, vals);
                if (settings.onSmartChange && settings.onSmartChange.call(self, emptyVal, vals, changed) === false)
                    return false;

                input.val(null).trigger('keyup');
                //deselect if is not menu-style
                if (!settings.menuStyle.enable)
                    fn._selectAll(self, false);

                return false;
            });

            //show/hide list on hover
            if (settings.openOnHover) {
                var timeout;
                wrapper.on('mouseenter.' + pluginName, function () {
                    window.clearTimeout(timeout);
                    fn._open(self);
                })
                        .on('mouseleave.' + pluginName, function () {
                            timeout = window.setTimeout(function () {
                                fn._close(self);
                            }, 500);
                        });
            }

            if (close)
                close.on('click.' + pluginName, function () {
                    fn._close(self);
                    return false;
                });

        },
        _getWordsList: function (str, charList) {
            charList = charList.replace('/', '\\/');
            var regex = new RegExp('[' + charList + ']+');

            return str.split(regex);
        },
        _getLastWord: function (str, charList) {
            var str_arr = fn._getWordsList(str, charList);
            var val = str_arr[str_arr.length - 1] || '';

            return val;
        },
        _replaceLastWord: function (str, replacement, charList) {
            charList = charList.replace('/', '\\/');
            var regex = new RegExp('[^' + charList + ']+$');
            str = str.replace(regex, replacement);

            return str;
        },
        _filterListItem: function (obj) {
            var data = obj.data(pluginName);
            var elements = data.elements;
            var settings = data.settings;
            var val = elements.input.val();
            var hasResult = false;
            var listItem = elements.listItem.li;

            //extract the last word
            if (val && settings.autocompleteStyle.enable)
                val = fn._getLastWord(val, settings.autocompleteStyle.separator);

            if (val === '') {
                //show all including checkall
                listItem.show();
                hasResult = true;
                if (settings.collapseGroup)
                    fn._collapseGroup(obj);
            }
            else {
                if (elements.selectAll)
                    elements.selectAll.hide();

                //search for at least one instance only
                var search = fn._escapeRegexpString(val.toLowerCase());
                if (settings.accentInsensitive)
                    search = fn._removeAccent(search);

                var matchLi = [];
                listItem.not(elements.selectAll).each(function () {
                    var $this = $(this);
                    var text = $this.text().toLowerCase();

                    if (settings.accentInsensitive)
                        text = fn._removeAccent(text);

                    var index = text.indexOf(search);
                    var found = index !== -1;
                    //found but not begin of the sentence
                    if (settings.autocompleteStyle.enable && index !== 0)
                        found = false;

                    if (found) {
                        $this.show();
                        hasResult = true;
                        matchLi.push($this);
                        //if this is a child, also show the parent if collapseGroup mode is on
                        var parents = fn._getParents($this, settings.selectorChild, settings.selectorGroup);
                        for (var i = 0; i < parents.length; i++)
                            parents[i].show();
                    }
                    else
                        $this.hide();
                });

                //auto expand if match is a group with no value or when config is activate
                for (var i = 0; i < matchLi.length; i++) {
                    var li = matchLi[i];
                    if (li.hasClass(pluginName + '_listItem_group_empty') || settings.expandOnSearch)
                        fn._expand(li, settings);
                }
            }

            //word predict only if not autocomplete style
            if (!settings.autocompleteStyle.enable)
                fn._setPredictionFromLocalSource(obj);

            return hasResult;
        },
        _setClosestMatch: function (obj, hasResult) {
            var data = obj.data(pluginName);
            var elements = data.elements;
            var settings = data.settings;
            var val = elements.input.val();
            var remote = settings.remote;
            var listItem = elements.listItem.li;

            //if is not menu or inline style and noresult
            if (!settings.menuStyle.enable && !settings.inline && !hasResult) {
                //val is the last word
                if (settings.autocompleteStyle.enable)
                    val = fn._getLastWord(val, settings.autocompleteStyle.separator);

                elements.prediction.val(null);
                //search for the closest word
                var closest;
                if (!remote.source)
                    closest = fn._getClosestMatchToken(listItem, val.toLowerCase(), settings.accentInsensitive);

                //found a close match
                var dom;
                if (closest) {
                    dom = '<li class="{0}_noresult hasCloseMatch">{1}</li>'.format(pluginName, settings.textCloseMatch);
                    dom = dom.replace('{0}', '<span class="closeMatch">' + closest + '</span>');
                }
                else
                    dom = '<li class="{0}_noresult">{1}</li>'.format(pluginName, settings.textNoResult);
                elements.list.append(dom);
            }
        },
        _movePopupBackToList: function (elements) {
            if (!elements.popup)
                return;

            elements.popup.css({
                top: 'auto',
                left: 'auto'
            })
                    .prependTo(elements.wrapper)
                    .removeClass(pluginName + '_absolute');
        },
        _movePopupAway: function (elements) {
            if (!elements.popup)
                return;

            var offset = elements.wrapper.offset();
            elements.popup.addClass(pluginName + '_absolute')
                    .appendTo('body')
                    .css({
                        top: offset.top - elements.popup.height() - 25,
                        left: offset.left
                    });
        },
        //fetch date from remote source
        _fetchData: function (obj, val, offset, selected) {
            var data = obj.data(pluginName);
            var settings = data.settings;
            var remote = settings.remote;
            var elements = data.elements;
            var input = elements.input;

            input.addClass('loading');

            if (remote.fnQuery)
                remote.fnQuery.call(obj, obj, val, offset, fn._buildFromJSON);
            else {
                var getData = {
                    text: val,
                    offset: offset
                };

                //additional data to send
                if (remote.data) {
                    var d = typeof remote.data === 'function' ? remote.data.call(obj) : remote.data;
                    if (typeof d === 'object')
                        $.extend(true, getData, d);
                }

                //the built-in fnQuery
                $.get(remote.source, getData, function (json) {
                    //convert to array if empty
                    if (!json)
                        json = [];

                    var showNoResult = true;
                    if (settings.autocompleteStyle.enable || remote.loadMoreOnScroll)
                        showNoResult = false;

                    //build the list from a VALID json
                    json = fn._buildFromJSON(obj, json, showNoResult, offset > 0, selected, offset);

                    //cache only when offset=0
                    if (remote.cache && !offset) {
                        var cache = input.data('remote') || [];
                        cache[val] = json;
                        input.data('remote', cache);
                    }

                    //last request, create if not exist
                    var lastRequest = input.data('lastRequest') || {};
                    //update last request
                    lastRequest[val] = {
                        value: val,
                        empty: $.isArray(json) && json.length === 0 || $.isEmptyObject(json)
                    };
                    input.data('lastRequest', lastRequest);
                });
            }
        },
        _postProcessing: function (obj, showNoResult) {
            var data = obj.data(pluginName);
            var elements = data.elements;
            var wrapper = elements.wrapper;
            var ul = elements.list;
            var settings = data.settings;

            //prevent tab stop
            ul.find('a,button,input,textarea,select,object').attr('tabIndex', -1);

            //dynamic positioning, do not handle mobile support
            if (!isMobile) {
                var pos = wrapper.offset();
                var wrapperH = wrapper.height();
                var $window = $(window);
                var x = pos.left - $window.scrollLeft();
                var y = pos.top - $window.scrollTop() + wrapperH;
                var w = ul.width() + 2;   //with border
                var h = ul.height() + 2;   //with border
                var wW = $window.width();
                var wH = $window.height();

                //dynamic-x
                if (x + w > wW) {
                    var left = -(wW - x) + 2;   //with border
                    if (x - left >= 0 && left >= 0)
                        ul.css({
                            left: left
                        });
                }

                //dynamic-y only when option is activated
                if (settings.dynamicPosition && y + h > wH) {
                    var top = -h - wrapperH + 1;
                    if (top)
                        ul.css({
                            top: top
                        });
                }
            }

            //if inline, wrapper height should be the same as list height
            if (settings.inline)
                wrapper.css({
                    minHeight: wrapper.outerHeight()
                });

            //hide removeAll at the start
            elements.removeAll.hide();

            if (settings.menuStyle.enable) {
                fn._registerMenuStyle(obj);
                //collapse group at start
                fn._collapseGroup(obj);
            }
            else if (settings.collapseGroup)
                fn._collapseGroup(obj);

            //update selected element
            fn._update(obj, true);

            //if using remote source, check if there is any error
            var hasError = false;
            if (settings.remote.source || settings.remote.fnQuery)
                hasError = ul.children('li.isError').length > 0;

            if (!hasError) {
                //filter list item
                var hasResult = settings.remote.filter ? fn._filterListItem(obj) : true;

                if (!hasResult && settings.autocompleteStyle.enable)
                    fn._close(obj);

                if (showNoResult)
                    fn._setClosestMatch(obj, hasResult);
            }

            //copy attributes data
            var original;
            if (obj.is('ul')) {
                //get the list of original item
                original = obj.find('li');
            }
            else {
                original = obj.find('option, optgroup');
                if (settings.firstItemSelectAll)
                    original = original.slice(1);
            }

            //update original
            if (elements.listItem.li && elements.listItem.li.length)
                elements.listItem.li.each(function (k) {
                    $(this).data(original.eq(k).data());
                });
        },
        _selectAll: function (obj, state) {
            var data = obj.data(pluginName);
            if (!data)
                return;
            //all item without the locked one
            data.elements.listItem.li.not('.locked').children('.' + pluginName + '_listItem_input').prop('checked', state);
            this._update(obj);
        },
        _update: function (obj, isInitialisation, showFullItems) {
            var data = obj.data(pluginName);
            if (!data)
                return;
            var settings = data.settings;
            var elements = data.elements;
            var li = elements.listItem.li;
            var val = [];
            var count = 0;
            var selectAll = true;
            var more = 0;
            var html = '';

            settings.popupMaxItem = showFullItems ? 1000 : settings.popupMaxItem;

            //list the selected values
            li.each(function () {
                var $this = $(this);
                if ($this.hasClass(pluginName + '_checkall'))
                    return;

                //if is a group
                if ($this.hasClass(settings.selectorGroup))
                    fn._updateParent($this, settings);

                var input = $this.children('.' + pluginName + '_listItem_input');
                if (!input.length)
                    return;

                //prepare the data, if uniqueValue activated, check whether the item of the same value-text is selected twice
                if (input.prop('checked')) {
                    var v = input.val();
                    var text;

                    if (settings.showValue && v !== '')
                        text = v;
                    else if ($this.find('span.logo').length)
                        text = $this.clone().find('span.logo').remove().end().text();
                    else
                        text = $this.text();

                    //if logo, text is the src
                    if (settings.popupLogoAsValue)
                        text = $this.find('img.logo').attr('src');

                    //update popup if enable
                    if (settings.popup) {
                        var txt = text;

                        if (count >= settings.popupMaxItem)
                            more++;
                        else {
                            //get the id of the input
                            var id = input.attr('class').match(/input(\d+)/);

                            if (settings.popupLogoAsValue)
                                txt = '<img class="logo" src="{0}" />'.format(txt);

                            var className = pluginName + '_popup_item_' + id[1];
                            if ($this.hasClass('locked'))
                                className += ' locked';

                            html += '<div class="{0}">{1}</div>'.format(className, txt);
                        }
                    }

                    $this.addClass('selected');
                    val.push(text);
                    count++;
                }
                //not check
                else {
                    $this.removeClass('selected');
                    //if this item is locked, don't count it
                    if (!$this.hasClass('locked'))
                        selectAll = false;
                }
            });

            //handle max item
            if (settings.maxSelected) {
                //if count > max, lock all item that isn't selected yet
                if (count >= settings.maxSelected)
                    li.not('li.selected').addClass('maxBlocked');
                else
                    li.filter('li.maxBlocked').removeClass('maxBlocked');
            }

            //if unique value, do the loop for a second time to gray out whatever has the same value
            if (settings.uniqueValue) {
                li.not('li.selected').each(function () {
                    var $this = $(this);
                    var v = settings.showValue ? $this.children('.' + pluginName + '_listItem_input').val() : $this.text();

                    if (settings.popupLogoAsValue)
                        v = $this.find('img.logo').attr('src');

                    //found dupplicate item
                    if ($.inArray(v, val) !== -1)
                        $this.addClass('blocked');
                    else
                        $this.removeClass('blocked');
                });
            }

            //update selected status of checkall
            if (elements.selectAll) {
                if (selectAll)
                    elements.selectAll.addClass('selected');
                else
                    elements.selectAll.removeClass('selected');
            }

            //update popup if enable
            if (settings.popup) {
                //if group value, need to rebuild the html, only loop through unique item
                if (settings.popupGroupValue) {
                    //reset
                    html = '';
                    more = 0;
                    count = 0;

                    //loop through the unique value to build the html
                    var tmp_val = fn._getUniqueArray(val);
                    for (var i = 0; i < tmp_val.length; i++) {
                        var v = tmp_val[i];
                        //count the number of time this text has appeared in the original list
                        var c = val.filter(function (x) {
                            return x === v;
                        }).length;

                        if (count >= settings.popupMaxItem)
                            more++;
                        else {
                            if (settings.popupLogoAsValue) {
                                v = '<img class="logo" src="{0}" />'.format(v);
                            }

                            html += '<div>';
                            //if count more than one
                            if (c > 1) {
                                html += '<div class="stack">' + c + '</div>';
                            }
                            html += v + '</div>';
                        }

                        count++;
                    }
                }

                if (more)
                    html += '<div class="{0}_more">'.format(pluginName) + settings.textMoreItem.format(more) + '</div>';

                if (elements.popup)
                    elements.popup.html(html);
            }

            //update result
            if (!settings.menuStyle.enable)
            {
                var text;
                if (val.length) {
                    text = settings.textAllSelected && settings.multiple && selectAll && count > 1 && !settings.remote.source && !settings.remote.fnQuery ? settings.textAllSelected : val.join(', ');
                    //show only if list multiple or allowDeselectSingleList
                    if (settings.multiple || settings.allowDeselectSingleList)
                        elements.removeAll.show();
                }
                else {
                    text = '<span class="{0}_placeholder">{1}</span>'.format(pluginName, data.settings.textEmpty);
                    elements.removeAll.hide();
                }

                if (elements.result)
                    elements.result.html(text);
            }

            //trigger change
            if (settings.updateOriginal)
                fn._updateOriginal(obj);

            //trigger if it's really a change
            if (!isInitialisation)
                obj.trigger('change');

            fn._updateChainedList(obj, settings);
        },
        //search if an event exist
        _eventExist: function (obj, evt_type) {
            var evt = $._data(obj.get(0), 'events');
            //find if event exist first
            if (evt && evt[evt_type] !== undefined) {
                for (var i = 0; i < evt[evt_type].length; i++) {
                    if (evt[evt_type][i].namespace === pluginName)
                        return true;
                }
            }

            return false;
        },
        _open: function (obj, triggerSearch) {
            var data = obj.data(pluginName);
            if (!data)
                return;

            var elements = data.elements;
            var wrapper = elements.wrapper;
            var settings = data.settings;

            if (wrapper.hasClass(classes.disabled))
                return;

            var list = elements.list;
            //ignore if is already opened
            if (!elements.list.is(':hidden'))
                return;

            var val = fn._get(obj);

            if (settings.onOpen) {
                //if return false, do not open the list
                if (settings.onOpen.call(obj, val) === false)
                    return;
            }

            //expand parent group item if option is active
            if (settings.collapseGroup && settings.expandSelected) {
                elements.listItem.li.filter('.selected').each(function () {
                    var $this = $(this);
                    var parents = fn._getParents($this, settings.selectorChild, settings.selectorGroup);
                    //show all ancestors (mode 1)
                    for (var i = 0; i < parents.length; i++) {
                        //expand all ancestors (mode 4)
                        if (settings.expandSelected & 4)
                            fn._expand(parents[i], settings);
                        //expand only direct parent (mode 2)
                        else if (i === 0 && settings.expandSelected & 2)
                            fn._expand(parents[i], settings);

                        parents[i].show();
                    }

                    //showing self
                    $this.show();

                    //expand current group (mode 8)
                    if (settings.expandSelected & 8)
                        fn._expand($this, settings);
                });
            }

            if (elements.result && settings.search)
                elements.result.hide();
            elements.input.show().removeClass('fakeHidden');
            elements.prediction.show();
            wrapper.addClass(pluginName + '_active');

            if (isMobile) {
                wrapper.addClass('mobile-style');
                list.show();
            }
            else {
                //before showing the list, convert to absolute position if enable
                if (settings.absolutePosition) {
                    var offset = wrapper.offset();
                    //create dummy element to fill up space
                    $('<div></div>').attr('class', pluginName + '_dummy ' + classes.wrapper)
                            .width(wrapper.width())
                            .height(wrapper.height())
                            .insertAfter(obj);

                    //move the list so the absolute position can become effective
                    wrapper.addClass(pluginName + '_absolute').appendTo('body').css({
                        top: offset.top + 3,
                        left: offset.left
                    });

                    //bind an event to the document to detect lost of focus
                    var doc = $(document);
                    if (!fn._eventExist(doc, 'mousedown')) {
                        doc.on('mousedown.' + pluginName, function () {
                            $('ul.' + pluginName + ', select.' + pluginName).jAutochecklist('close');
                        });
                    }

                    //update position when window resize, scroll
                    var win = $(window);
                    if (!fn._eventExist(win, 'resize') || !fn._eventExist(win, 'scroll')) {
                        win.on('resize.' + pluginName + ', scroll.' + pluginName, function () {
                            fn._refreshPosition(obj);
                        });
                    }

                    fn._movePopupBackToList(elements);
                }

                if (settings.labelStyle) {
                    //set a fix width for the wrapper
                    wrapper.width(wrapper.outerWidth() + 1);
                    //set input width if using remote
                    if (settings.remote.source || settings.remote.fnQuery)
                        elements.input.add(elements.prediction).width(list.outerWidth() - 22);
                }

                //display list
                settings.animation ? list.fadeIn() : list.show();
                if (settings.listWidth === 'auto' || settings.labelStyle)
                    list.css('display', 'inline-block');

                //display widget
                settings.animation ? elements.widget.fadeIn() : elements.widget.show();

                //display popup if there is any selected item
                if (elements.popup && fn._count(obj))
                    settings.animation ? elements.popup.fadeIn() : elements.popup.show();

                //set focus on input
                if (settings.labelStyle)
                    elements.wrapper.focus();
                else
                    elements.input.focus();
            }

            //trigger keyup if remote source enable
            if ((triggerSearch === true || triggerSearch === undefined) && (settings.remote.source || settings.remote.fnQuery))
                elements.input.trigger('keyup');

            //autoscroll to item
            var firstItem = elements.listItem.li.filter('li.selected').first();
            if (firstItem.length)
                list.scrollTop(firstItem.position().top + list.scrollTop());

            //remember the value when opening
            obj.data('value', val);

            //trigger focus
            obj.triggerHandler('focus');

            //transfer tabindex to input
            var tabindex = wrapper.attr('tabindex');
            wrapper.removeAttr('tabindex');
            elements.input.attr('tabindex', tabindex);

            //close all other checklist
            $('ul.' + pluginName + ', select.' + pluginName).not(obj).jAutochecklist('close');
        },
        _close: function (obj) {
            var data = obj.data(pluginName);
            if (!data)
                return;

            var elements = data.elements;

            //the object is destroyed or is not our plugin
            if (elements.list.is(':hidden'))
                return;

            var wrapper = elements.wrapper;
            var settings = data.settings;

            //trigger blur
            if (obj.triggerHandler('blur') === false)
                return;

            //do not close if is inline, menustyle
            if (settings.inline || settings.menuStyle.enable)
                return;

            //if return false, do not close the list
            if (settings.onClose && fn._eventOnClose(obj) === false)
                return;
            if (settings.onSmartChange && fn._eventSmartChange(obj) === false)
                return;

            if (elements.popup)
                elements.popup.hide();
            if (elements.result)
                elements.result.show();
            if (!settings.autocompleteStyle.enable) {
                elements.input.addClass('fakeHidden');
                elements.input.val(null);
            }
            elements.prediction.hide().val(null);
            elements.list.hide().children('.' + pluginName + '_noresult').remove();
            elements.listItem.li.show().filter('.over').removeClass('over');
            elements.widget.hide();
            wrapper.removeClass(pluginName + '_active');
            if (settings.collapseGroup)
                fn._collapseGroup(obj);

            //convert back absolute position to inline
            if (!isMobile && settings.absolutePosition) {
                wrapper.css({
                    top: 0,
                    left: 0
                }).removeClass(pluginName + '_absolute');
                var next = obj.next();
                if (next.hasClass(pluginName + '_dummy'))
                    next.replaceWith(wrapper);
            }

            if (isMobile)
                wrapper.removeClass('mobile-style');

            //reset to automatic width
            if (settings.labelStyle)
                wrapper.width('auto');

            //reset tabindex
            var tabindex = elements.input.attr('tabindex');
            elements.input.removeAttr('tabindex');
            wrapper.attr('tabindex', tabindex);

            wrapper.trigger('blur');

            dragging = false;
        },
        _count: function (obj) {
            var data = obj.data(pluginName);
            if (!data || !data.elements.listItem.checkbox)
                return 0;

            return data.elements.listItem.checkbox.filter(':checked').length;
        },
        _get: function (obj) {
            var data = obj.data(pluginName);
            if (!data)
                return obj.val ? obj.val() : null;
            else if (!data.elements.listItem.checkbox)
                return data.settings.multiple ? [] : null;

            var val = [];
            data.elements.listItem.checkbox.filter(':checked').each(function () {
                val.push(this.value);
            });

            if (!data.settings.multiple)
                return val[0] === undefined ? null : val[0];

            return val;
        },
        _getAll: function (obj) {
            var data = obj.data(pluginName);
            if (!data || !data.elements.listItem.checkbox)
                return [];
            var val = [];

            data.elements.listItem.checkbox.each(function () {
                val.push(this.value);
            });

            return val;
        },
        _getText: function (obj) {
            var data = obj.data(pluginName);
            if (!data || !data.elements.listItem.li)
                return [];

            var settings = data.settings;
            var val = [];
            data.elements.listItem.li.filter('li.selected.child').each(function () {
                var $this = $(this);
                var txt;
                if ($this.find('span.logo').length)
                    txt = $this.clone().find('span.logo').remove().end().text();
                else
                    txt = $this.text();

                val.push(txt);
                //break the loop if is single select
                if (!settings.multiple)
                    return false;
            });

            if (!settings.multiple)
                return val[0] === undefined ? '' : val[0];

            return val;
        },
        _getAllText: function (obj) {
            var data = obj.data(pluginName);
            if (!data || !data.elements.listItem.checkbox)
                return [];

            var val = [];
            data.elements.listItem.li.each(function () {
                var $this = $(this);
                var txt;
                if ($this.find('span.logo').length)
                    txt = $this.clone().find('span.logo').remove().end().text();
                else
                    txt = $this.text();
                val.push(txt);
            });

            return val;
        },
        _getValueAndText: function (obj) {
            var data = obj.data(pluginName);
            if (!data || !data.elements.listItem.li)
                return [];

            var settings = data.settings;
            var val = [];
            data.elements.listItem.li.filter('li.selected').each(function () {
                var $this = $(this);
                var o = {};
                var txt;
                var v = $this.children('.' + pluginName + '_listItem_input').val();
                if ($this.find('span.logo').length)
                    txt = $this.clone().find('span.logo').remove().end().text();
                else
                    txt = $this.text();

                o[v] = txt;
                val.push(o);
                //break the loop if is single select
                if (!settings.multiple)
                    return false;
            });

            return val;
        },
        _getObject: function (obj, filterOnSelected) {
            var data = obj.data(pluginName);
            //return empty jquery object
            if (!data || !data.elements.listItem.li.length)
                return $();

            var el = data.elements.listItem.li;

            if (filterOnSelected)
                el = el.filter('li.selected');

            return el;
        },
        _set: function (obj, vals, clearAll) {
            var data = obj.data(pluginName);
            if (!data || !data.elements.listItem.checkbox)
                return;
            if (clearAll)
                fn._selectAll(obj, false);

            data.elements.listItem.checkbox.each(function () {
                //value found
                if (vals.indexOf(this.value) !== -1)
                    this.checked = true;
            });

            fn._update(obj);
        },
        _unset: function (obj, vals) {
            var data = obj.data(pluginName);
            if (!data || !data.elements.listItem.checkbox)
                return;

            data.elements.listItem.checkbox.each(function () {
                //value found
                if (vals.indexOf(this.value) !== -1)
                    this.checked = false;
            });

            fn._update(obj);
        },
        _getLevel: function (li) {
            var match = li.attr('class').match(/level(\d+)/);
            return match ? parseInt(match[1]) : null;
        },
        _getChildren: function (li, selectorChild, level, ignoreLocked) {
            if (level === undefined)
                level = fn._getLevel(li);

            var next = li.next();
            //if next is a locked one, ignore it
            if (ignoreLocked && next.hasClass('locked'))
                next = next.next();
            if (!next.length)
                return [];

            var next_level = fn._getLevel(next);

            //find all li which has the same level or more until meet a group of the same level or a normal li
            if (next_level < level || (next_level === level && (!next.hasClass(selectorChild))))
                next = null;

            return next ? [next].concat(fn._getChildren(next, selectorChild, level, ignoreLocked)) : [];
        },
        _getDirectChildren: function (li, selectorChild, selectorGroup, ignoreLocked) {
            var level_group = fn._getLevel(li);
            var children = fn._getChildren(li, selectorChild, level_group, ignoreLocked);
            var directChildren = [];

            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                var level = fn._getLevel(child);

                if (child.hasClass(selectorChild) && level === level_group)
                    directChildren.push(child);
                else if (child.hasClass(selectorGroup) && level === (level_group + 1)) {
                    directChildren.push(child);
                }
            }

            return directChildren;
        },
        _getParents: function (li, selectorChild, selectorGroup) {
            var isGroup = li.hasClass(selectorGroup);
            var isChild = li.hasClass(selectorChild);

            //if this is not any child
            if (!isChild && !isGroup)
                return [];

            var level = fn._getLevel(li);
            //if group first level
            if (isGroup) {
                if (li.hasClass('level1'))
                    return [];
                level--;
            }

            var parent = li.prevAll('li.' + selectorGroup + '.level' + level + ':first');

            return parent ? [parent].concat(fn._getParents(parent, selectorChild, selectorGroup)) : [];
        },
        _updateParent: function (li, settings) {
            var groupType = fn._getGroupType(li, settings);

            //children exclusive, so we don't handle this parent
            if (groupType === 2 || groupType === 5)
                return;

            var children = fn._getChildren(li, settings.selectorChild);
            var select, i;
            var checkbox = li.children('.' + pluginName + '_listItem_input');

            if (groupType === 0 || groupType === 3) {
                //by default selected, find at least one item not selected
                select = true;
                for (i = 0; i < children.length; i++) {
                    if (children[i].children('.' + pluginName + '_listItem_input').prop('checked') === false) {
                        select = false;
                        break;
                    }
                }
            }
            else if (groupType === 1 || groupType === 4) {
                //by default not selected, find at least one selected
                select = false;
                for (i = 0; i < children.length; i++) {
                    if (children[i].children('.' + pluginName + '_listItem_input').prop('checked') === true) {
                        select = true;
                        break;
                    }
                }
            }

            if (select)
                li.addClass('selected');
            //do not uncheck if the type is 3 and 4 because the parent is exclusive
            else if (groupType !== 3 && groupType !== 4)
                li.removeClass('selected');

            if (groupType !== 3 && groupType !== 4)
                checkbox.prop('checked', select);
            else if (select)
                checkbox.prop('checked', true);

        },
        _getGroupType: function (li, settings) {
            var groupType = settings.groupType;
            //detect the type of the group if overriden
            if (li.hasClass('groupType0')) //all
                groupType = 0;
            else if (li.hasClass('groupType1')) //at least one
                groupType = 1;
            else if (li.hasClass('groupType2'))  //exclusive
                groupType = 2;
            else if (li.hasClass('groupType3'))  //exclusive
                groupType = 3;
            else if (li.hasClass('groupType4'))  //exclusive
                groupType = 4;
            else if (li.hasClass('groupType5'))  //exclusive
                groupType = 5;

            return groupType;
        },
        _buildFromUl: function (obj, settings) {
            var json = [];
            var locked_origin = null;

            obj.children().each(function (k) {
                var t = $(this);
                var className = this.className || '';
                var locked = t.data('locked');
                var isGroup = t.hasClass(settings.selectorGroup);
                var isChild = t.hasClass(settings.selectorChild);
                var level;

                //get level from className
                if (className)
                    level = fn._getLevel(t);
                //if isChild minimum level is 1
                if (!level && isChild)
                    level = 1;
                //lock all the chidren if parent is locked
                if (locked_origin && level >= locked_origin)
                    locked = true;
                //determine the level origin of the locked group
                if (isGroup && locked && locked_origin === null)
                    locked_origin = level || 1;

                json.push({
                    className: className,
                    groupType: t.data('grouptype'),
                    html: t.html(),
                    isChild: isChild,
                    isGroup: isGroup,
                    level: level,
                    locked: locked,
                    selected: t.data('selected'),
                    style: this.getAttribute('style'),
                    val: t.data('value') === null || t.data('value') === undefined ? '' : t.data('value'),
                    index: k,
                    orderLocked: t.data('orderlocked'),
                    logo: t.data('logo'),
                    info: t.data('info'),
                    json: t.data('json')
                });
            });

            return json;
        },
        _buildFromSelect: function (obj, settings) {
            var json = [];
            var isFirstOption = true;
            var i = 0;

            obj.children().each(function () {
                var t = $(this);

                //if is a group
                if (t.is('optgroup')) {
                    //if group is disabled/locked the children has to be locked too
                    var forceLocked = t.data('locked') || this.disabled;

                    //create a li from optgroup
                    json.push({
                        className: (this.className || '') + ' ' + settings.selectorGroup,
                        groupType: t.data('grouptype'),
                        html: this.label,
                        isChild: false,
                        isGroup: true,
                        level: null,
                        locked: forceLocked,
                        selected: false,
                        style: this.getAttribute('style'),
                        val: null,
                        index: null,
                        orderLocked: t.data('orderlocked'),
                        logo: t.data('logo'),
                        info: t.data('info'),
                        json: t.data('json')
                    });

                    //foreach option in group
                    t.children().each(function () {
                        var c = $(this);
                        json.push({
                            className: (this.className || '') + ' ' + settings.selectorChild,
                            groupType: 0,
                            html: this.innerHTML,
                            isChild: true,
                            isGroup: false,
                            level: null,
                            locked: forceLocked || c.data('locked') || this.disabled,
                            selected: fn._isSelected(this, settings.multiple, isFirstOption),
                            style: this.getAttribute('style'),
                            val: this.value,
                            index: i++,
                            orderLocked: t.data('orderlocked'),
                            logo: c.data('logo'),
                            info: c.data('info'),
                            json: c.data('json')
                        });

                        isFirstOption = false;
                    });
                }
                else {
                    json.push({
                        className: this.className || '',
                        groupType: 0,
                        html: this.innerHTML,
                        isChild: false,
                        isGroup: false,
                        level: null,
                        locked: t.data('locked') || this.disabled,
                        selected: fn._isSelected(this, settings.multiple, isFirstOption),
                        style: this.getAttribute('style'),
                        val: this.value,
                        index: i++,
                        orderLocked: t.data('orderlocked'),
                        logo: t.data('logo'),
                        info: t.data('info'),
                        json: t.data('json')
                    });

                    isFirstOption = false;
                }

            });

            return json;
        },
        _buildItemFromJSON: function (json, settings, name, preSelected, offset) {
            //strip white spaces
            if (name)
                name = name.replace(/^\s+|\s+$/g, '');

            //remove [] if exist at the end, if [] is very necessary, then use [0], [1]... instead
            if (settings.multiple && name && name.indexOf('[]', name.length - 2) !== -1)
                name = name.slice(0, -2);

            if (settings.autocompleteStyle.enable)
                name += '_input';

            var li = '';
            var type = settings.multiple ? 'checkbox' : 'radio';
            var count = 0;
            var i;

            //sort items
            if (settings.alphabetical)
                json = fn._sortListItems(json);

            //clone because we dont want to modify the original json
            var list = preSelected && preSelected.length ? json.slice() : json;

            //to ignore
            var selectArr = [];
            //add element if additional selected element
            if (preSelected && preSelected.length) {
                for (i = 0; i < preSelected.length; i++) {
                    //get the first key value pair
                    for (var k in preSelected[i])
                        if (preSelected[i].hasOwnProperty(k))
                            break;

                    var txt = preSelected[i][k];
                    selectArr[k] = txt;

                    //find if exist in list
                    var exist = false;
                    for (var l in list)
                        if (list.hasOwnProperty(l) && list[l].val == k) {//&& $.trim(list[l].html) === $.trim(txt)
                            exist = true;
                            break;
                        }

                    //do not add if exist
                    if (exist)
                        continue;

                    list.unshift({
                        val: k,
                        html: txt,
                        selected: true,
                        className: 'auto-added'
                    });

                }
            }

            for (i = 0; i < list.length; i++) {
                var e = list[i];
                var val = (e.val === '' || e.val === undefined || e.val === null) ? '' : e.val;
                var className = (e.className ? e.className + ' ' : '') + pluginName + '_listItem';
                var isGroup = e.isGroup || false;
                var isChild = e.isChild || false;
                var index = e.index === undefined ? (offset ? i + offset : i) : (e.index === null ? '' : e.index);
                var selected = e.selected;
                var jsons = e.json && typeof e.json === 'object' ? JSON.stringify(e.json) : e.json;

                if (selectArr[val] !== undefined)
                    selected = true;

                if (e.groupType !== undefined)
                    className += ' groupType' + e.groupType;
                if (e.locked)
                    className += ' locked';

                //add some padding
                var level = e.level;

                //check the item level
                if (!level)
                    level = 1;

                var px = 5;
                if (level > 1) {
                    px += (level - 1) * 20;
                    className += ' level' + level;
                }
                else if (isGroup || isChild)
                    className += ' level' + level;

                //if is a group
                var style = e.style ? [e.style] : [];
                if (isGroup) {   //group
                    if (val === '')
                        className += ' ' + pluginName + '_listItem_group_empty ';
                }
                else if (isChild) {   //child
                    className += ' ' + pluginName + '_listItem_child';
                    px += 20;
                    if (settings.collapseGroup)
                        px += 18;
                }

                if (px > 5)
                    style.push('{0}-{1}:{2}px'.format(settings.menuStyle.enable ? 'padding' : 'margin', settings.rtl ? 'right' : 'left', px));

                style = style.length ? 'style="' + style.join(';') + '"' : '';

                li += '<li class="{0}" {1} data-index="{2}" {3} tabindex="-1">'.format(className, style, index, e.json ? "data-jsons='" + jsons + "'" : '');

                var logo = e.logo;
                if (settings.valueAsLogo)
                    logo = val;

                if (logo)
                    li += '<div class="float-left"><span class="logo">' + logo + '</span></div> ';  //trailing space necessary

                //if case single select and is first item, must add a fallback, if name doesn't contain []
                if (!settings.multiple && !count && name.indexOf('[]', name.length - 2) === -1)
                    li += '<input type="hidden" name="{0}" value="{1}" />'.format(name, settings.defaultFallbackValue);

                //if is a group add an icon collapse/expand is enable
                if (isGroup && settings.collapseGroup)
                    li += '<div class="{0}_expandable"></div>'.format(pluginName);

                //if is not a group, or empty label or select all
                if ((!isGroup || val !== '') && (!settings.firstItemSelectAll || i > 0)) {
                    //multiple, add []
                    var n = name;
                    if (settings.multiple) {
                        //fallback, only apply to multiple element
                        if (settings.fallback) {
                            n += '[' + count + ']';
                            li += '<input type="hidden" name="{0}" value="{1}" />'.format(n, settings.defaultFallbackValue);
                        }
                        else
                            n += '[]';
                    }

                    li += '<input type="{0}" name="{1}" value="{2}" class="{3}_listItem_input {3}_input{5}" {4} />'.format(type, n, val, pluginName, selected ? 'checked' : '', count++);
                }

                li += e.html;

                if (e.info)
                    li += ' <span class="info">' + e.info + '</span>';  //beginning space necessary

                li += '</li>';
            }

            return li;
        },
        _sortListItems: function (json) {
            var indexed = {};
            var lastGroupIndex = {};
            var i;

            //register the parent index
            for (i = 0; i < json.length; i++) {
                var e = json[i];
                e.effectiveIndex = i;
                if (e.isGroup) {
                    lastGroupIndex[e.level || 1] = i;
                    if (e.level > 1)
                        e.parentIndex = lastGroupIndex[e.level - 1];
                }
                if (e.isChild)
                    e.parentIndex = lastGroupIndex[e.level];

                indexed[i] = e;
            }

            //create relationship
            fn._createObjectRelationship(indexed);

            for (i in indexed) {
                //delete if is a child
                if (indexed[i].parentIndex !== undefined)
                    delete indexed[i];
            }

            //sort recursive
            indexed = fn._sortRecursive(indexed);

            //destroy relationship
            json = fn._destroyObjectRelationship(indexed);

            return json;
        },
        _createObjectRelationship: function (obj) {
            for (var i in obj) {
                if (obj.hasOwnProperty(i)) {
                    var e = obj[i];
                    //if is not a child
                    if (e.parentIndex === undefined)
                        continue;

                    if (!obj[e.parentIndex].children)
                        obj[e.parentIndex].children = {};

                    obj[e.parentIndex].children[i] = obj[i];
                }
            }

            return obj;
        },
        _destroyObjectRelationship: function (arr) {
            var a = [], tmp;
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].children) {
                    tmp = arr[i].children;
                    delete arr[i].children;
                    a.push(arr[i]);
                    a = a.concat(fn._destroyObjectRelationship(tmp));
                }
                else
                    a.push(arr[i]);
            }

            return a;
        },
        _sortRecursive: function (json) {
            //to array
            if (json instanceof Object)
                json = $.map(json, function (v) {
                    return v;
                });

            //keep items which is order locked in a different array
            var fixed = [], i;
            for (i = json.length; i--; ) {
                if (!json[i].orderLocked)
                    continue;

                fixed.unshift({
                    index: i,
                    item: json[i]
                });
                json.splice(i, 1);
            }

            json.sort(function (a, b) {
                var aV = (a.html === '' || a.html === undefined || a.html === null) ? '' : a.html.toLowerCase();
                var bV = (b.html === '' || b.html === undefined || b.html === null) ? '' : b.html.toLowerCase();
                aV = fn._removeAccent(aV);
                bV = fn._removeAccent(bV);

                if (aV === bV)
                    return 0;
                else
                    return aV < bV ? -1 : 1;
            });

            //add items back into original array
            for (i = 0; i < fixed.length; i++)
                json.splice(fixed[i].index, 0, fixed[i].item);

            //we sorted the first level, now sort the children recursively
            for (i = 0; i < json.length; i++) {
                if (json[i].children)
                    json[i].children = fn._sortRecursive(json[i].children);
            }

            return json;
        },
        _insertList: function (ul, li, settings, isAdd) {
            //empty object
            var selectAll, checkbox;

            if (!li && !settings.remote.loadMoreOnScroll) {
                ul.html(null);
                li = $();
            }
            else {
                if (isAdd)
                    ul.append(li);
                else
                    ul.html(li);
                li = ul.children();

                //if checkall enable
                if (settings.firstItemSelectAll)
                    selectAll = ul.children(':first').addClass(pluginName + '_checkall');

                checkbox = li.children('.' + pluginName + '_listItem_input');

                //show or hide checkbox
                if (settings.checkbox)
                    checkbox.show();
            }

            return {
                li: li,
                checkbox: checkbox,
                selectAll: selectAll
            };

        },
        _setPredictionFromLocalSource: function (self) {
            var data = self.data(pluginName);
            var settings = data.settings;
            //if RTL, do not handle prediction
            if (settings.rtl)
                return;

            var elements = data.elements;
            var prediction = elements.prediction;
            var li = elements.listItem.li;
            var val = elements.input.val();

            //predictive search if has at least some result
            if (val === '')
                prediction.val(null);
            else {
                var text = [];
                //we already know that each li contain our value, search for the next word after the value
                li.filter(':visible').each(function () {
                    text.push($(this).text());
                });

                fn._predict(val, prediction, text, settings.accentInsensitive);
            }
        },
        //predict the next word
        _predict: function (val, input, suggest, accentInsensitive) {
            var result;
            var val_lower = val.toLowerCase();
            var valIns = fn._removeAccent(val_lower);

            //sort the text tab using the levenhstein algorithm
            suggest = suggest.sort(function (a, b) {
                return fn._levenshtein(a, val_lower) - fn._levenshtein(b, val_lower);
            });

            for (var i = 0; i < suggest.length; i++) {
                var text = suggest[i].toLowerCase();
                var index;

                if (accentInsensitive) {
                    var textIns = fn._removeAccent(text);
                    index = textIns.indexOf(valIns);
                }
                else
                    index = text.indexOf(val_lower);

                //word not found in text
                if (index === -1)
                    continue;
                //starting index
                index += val_lower.length;
                //find the index of the following space character
                var sp_index = text.indexOf(' ', index);
                //if space is the next character, find the next next space
                if (index === sp_index)
                    sp_index = text.indexOf(' ', index + 1);
                //if reaching the end without space, get all text from starting index
                result = val + (sp_index === -1 ? text.substr(index) : text.substring(index, sp_index));
                //as we found the first matched element, stop the search
                if (result !== val) {
                    input.val(result);
                    return false;
                }
            }
        },
        //collapse all groups
        _collapseGroup: function (obj) {
            var data = obj.data(pluginName);
            var elements = data.elements;
            var settings = data.settings;
            var li = elements.listItem.li;

            li.filter(function () {
                var $this = $(this);
                if ($this.hasClass(settings.selectorChild))
                    return true;
                if ($this.hasClass(settings.selectorGroup)) {
                    if (fn._getLevel($this) > 1)
                        return true;
                }
            }).hide();

            elements.list.find('div.expanded').removeClass('expanded');
        },
        _collapse: function (li, settings) {
            //if is not a group
            if (!li.hasClass(settings.selectorGroup))
                return;

            var children = fn._getChildren(li, settings.selectorChild);
            var arrow = li.children('.' + pluginName + '_expandable');
            arrow.removeClass('expanded');

            for (var i = 0; i < children.length; i++)
                children[i].hide();
        },
        _expand: function (li, settings) {
            //if is not a group
            if (!li.hasClass(settings.selectorGroup))
                return;

            var children = fn._getDirectChildren(li, settings.selectorChild, settings.selectorGroup);
            var arrow = li.children('.' + pluginName + '_expandable');
            arrow.addClass('expanded');

            for (var i = 0; i < children.length; i++) {
                children[i].show();
                if (children[i].hasClass(settings.selectorGroup))
                    children[i].children('div.expanded').removeClass('expanded');
            }
        },
        //group item in the popup together. Return true if success, false if the item doesn't exist
        _getUniqueArray: function (arr) {
            var u = {}, a = [], val;
            for (var i = 0; i < arr.length; i++) {
                val = arr[i];
                if (u.hasOwnProperty(val))
                    continue;

                a.push(val);
                u[val] = 1;
            }

            return a;
        },
        _registerMenuStyle: function (obj) {
            var data = obj.data(pluginName);
            var settings = data.settings;
            var container = settings.menuStyle.fixedPositionContainer;
            var scrollSpyContainer = settings.menuStyle.scrollSpyContainer;

            //handle menu fixed
            if (settings.menuStyle.fixedPosition) {
                if (container === 'window')
                    container = window;

                obj.data('originalPosition', data.elements.wrapper.offset());

                $(container).on('scroll.' + pluginName, function () {
                    fn._handleFixedMenu(obj);
                });
            }

            //handle scrollspy
            var anchor = [];
            data.elements.listItem.li.each(function () {
                var target = $(this).find('a').attr('href');
                //if target contain a #
                if (!/^#/.test(target))
                    return;

                target = $(target);
                if (target.length)
                    anchor.push({
                        source: $(this),
                        target: target,
                        position: target.offset().top
                    });
            });

            //if at least one anchor exist
            if (anchor.length) {
                obj.data('anchor', anchor);

                if (scrollSpyContainer === 'window')
                    scrollSpyContainer = window;

                $(scrollSpyContainer).on('scroll.' + pluginName, function () {
                    fn._handleScrollSpy(obj);
                });
            }
        },
        _handleFixedMenu: function (obj) {
            var data = obj.data(pluginName);
            var settings = data.settings;
            var menuStyle = settings.menuStyle;
            var container = menuStyle.fixedPositionContainer;
            var container_pos, container_scroll;
            if (container === 'window') {
                container_pos = $('body').offset().top;
                container_scroll = $(window).scrollTop();
            }
            else {
                container_pos = $(container).offset().top;
                container_scroll = $(container).scrollTop();
            }
            var wrapper = data.elements.wrapper;
            var pos = obj.data('originalPosition');
            var top = pos.top;
            var placeholder = obj.data('placeholder');

            //if the menu is off the screen
            if (menuStyle.fixedPositionOffsetTop >= top - container_scroll - container_pos) {
                //if is not fixed yet
                if (wrapper.css('position') !== 'fixed') {
                    wrapper.css({
                        position: 'fixed',
                        top: top - container_scroll
                    })
                            .animate({
                                top: menuStyle.fixedPositionOffsetTop + container_pos
                            },
                                    'fast');

                    placeholder = $('<div>').attr('class', pluginName + '_menustyle_placeholder').css({
                        width: wrapper.outerWidth(),
                        height: wrapper.outerHeight()
                    });
                    obj.data('placeholder', placeholder);
                    wrapper.after(placeholder);
                }
            }
            //reset to original position if is currently fixed
            else {
                if (wrapper.css('position') === 'fixed') {
                    wrapper.css({
                        position: 'static'
                    });
                    placeholder.remove();
                    obj.removeData('placeholder');
                }
            }
        },
        _handleScrollSpy: function (obj) {
            var data = obj.data(pluginName);
            var settings = data.settings;
            var menuStyle = settings.menuStyle;
            var anchor = obj.data('anchor');
            var container = menuStyle.scrollSpyContainer;
            var container_pos, container_scroll;
            if (container === 'window') {
                container_pos = 0;
                container_scroll = $(window).scrollTop();
            }
            else {
                container_pos = $(container).offset().top;
                container_scroll = $(container).scrollTop();
            }

            //clone
            anchor = $.extend([], true, anchor);

            //use pop to do a reverse scan
            var a;
            while (a = anchor.pop()) {
                if (menuStyle.scrollSpyOffsetTop >= a.position - container_scroll - container_pos) {
                    var source = a.source;

                    if (menuStyle.onScrollSpyActivate) {
                        if (menuStyle.onScrollSpyActivate.call(obj, source) === false)
                            return;
                    }

                    data.elements.listItem.li.removeClass('selected');
                    source.addClass('selected');
                    //collapse everything
                    fn._collapseGroup(obj);
                    //if is a group, expand all child
                    fn._expand(a.source, settings);
                    //also select the parent
                    var parents = fn._getParents(a.source, settings.selectorChild, settings.selectorGroup);
                    if (parents.length) {
                        for (var i = 0; i < parents.length; i++) {
                            parents[i].addClass('selected');
                            fn._expand(parents[i], settings);
                        }
                    }

                    a.source.show();

                    break;
                }
            }
        },
        _escapeRegexpString: function (regex) {
            return regex.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        },
        _removeAccent: function (str) {
            var defaultDiacriticsRemovalMap = [
                {
                    base: 'A',
                    letters: /[\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F]/g
                },
                {
                    base: 'AA',
                    letters: /[\uA732]/g
                },
                {
                    base: 'AE',
                    letters: /[\u00C6\u01FC\u01E2]/g
                },
                {
                    base: 'AO',
                    letters: /[\uA734]/g
                },
                {
                    base: 'AU',
                    letters: /[\uA736]/g
                },
                {
                    base: 'AV',
                    letters: /[\uA738\uA73A]/g
                },
                {
                    base: 'AY',
                    letters: /[\uA73C]/g
                },
                {
                    base: 'B',
                    letters: /[\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181]/g
                },
                {
                    base: 'C',
                    letters: /[\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E]/g
                },
                {
                    base: 'D',
                    letters: /[\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779]/g
                },
                {
                    base: 'DZ',
                    letters: /[\u01F1\u01C4]/g
                },
                {
                    base: 'Dz',
                    letters: /[\u01F2\u01C5]/g
                },
                {
                    base: 'E',
                    letters: /[\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E]/g
                },
                {
                    base: 'F',
                    letters: /[\u0046\u24BB\uFF26\u1E1E\u0191\uA77B]/g
                },
                {
                    base: 'G',
                    letters: /[\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E]/g
                },
                {
                    base: 'H',
                    letters: /[\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D]/g
                },
                {
                    base: 'I',
                    letters: /[\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197]/g
                },
                {
                    base: 'J',
                    letters: /[\u004A\u24BF\uFF2A\u0134\u0248]/g
                },
                {
                    base: 'K',
                    letters: /[\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2]/g
                },
                {
                    base: 'L',
                    letters: /[\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780]/g
                },
                {
                    base: 'LJ',
                    letters: /[\u01C7]/g
                },
                {
                    base: 'Lj',
                    letters: /[\u01C8]/g
                },
                {
                    base: 'M',
                    letters: /[\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C]/g
                },
                {
                    base: 'N',
                    letters: /[\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4]/g
                },
                {
                    base: 'NJ',
                    letters: /[\u01CA]/g
                },
                {
                    base: 'Nj',
                    letters: /[\u01CB]/g
                },
                {
                    base: 'O',
                    letters: /[\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C]/g
                },
                {
                    base: 'OI',
                    letters: /[\u01A2]/g
                },
                {
                    base: 'OO',
                    letters: /[\uA74E]/g
                },
                {
                    base: 'OU',
                    letters: /[\u0222]/g
                },
                {
                    base: 'P',
                    letters: /[\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754]/g
                },
                {
                    base: 'Q',
                    letters: /[\u0051\u24C6\uFF31\uA756\uA758\u024A]/g
                },
                {
                    base: 'R',
                    letters: /[\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782]/g
                },
                {
                    base: 'S',
                    letters: /[\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784]/g
                },
                {
                    base: 'T',
                    letters: /[\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786]/g
                },
                {
                    base: 'TZ',
                    letters: /[\uA728]/g
                },
                {
                    base: 'U',
                    letters: /[\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244]/g
                },
                {
                    base: 'V',
                    letters: /[\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245]/g
                },
                {
                    base: 'VY',
                    letters: /[\uA760]/g
                },
                {
                    base: 'W',
                    letters: /[\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72]/g
                },
                {
                    base: 'X',
                    letters: /[\u0058\u24CD\uFF38\u1E8A\u1E8C]/g
                },
                {
                    base: 'Y',
                    letters: /[\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE]/g
                },
                {
                    base: 'Z',
                    letters: /[\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762]/g
                },
                {
                    base: 'a',
                    letters: /[\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250]/g
                },
                {
                    base: 'aa',
                    letters: /[\uA733]/g
                },
                {
                    base: 'ae',
                    letters: /[\u00E6\u01FD\u01E3]/g
                },
                {
                    base: 'ao',
                    letters: /[\uA735]/g
                },
                {
                    base: 'au',
                    letters: /[\uA737]/g
                },
                {
                    base: 'av',
                    letters: /[\uA739\uA73B]/g
                },
                {
                    base: 'ay',
                    letters: /[\uA73D]/g
                },
                {
                    base: 'b',
                    letters: /[\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253]/g
                },
                {
                    base: 'c',
                    letters: /[\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184]/g
                },
                {
                    base: 'd',
                    letters: /[\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A]/g
                },
                {
                    base: 'dz',
                    letters: /[\u01F3\u01C6]/g
                },
                {
                    base: 'e',
                    letters: /[\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD]/g
                },
                {
                    base: 'f',
                    letters: /[\u0066\u24D5\uFF46\u1E1F\u0192\uA77C]/g
                },
                {
                    base: 'g',
                    letters: /[\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F]/g
                },
                {
                    base: 'h',
                    letters: /[\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265]/g
                },
                {
                    base: 'hv',
                    letters: /[\u0195]/g
                },
                {
                    base: 'i',
                    letters: /[\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131]/g
                },
                {
                    base: 'j',
                    letters: /[\u006A\u24D9\uFF4A\u0135\u01F0\u0249]/g
                },
                {
                    base: 'k',
                    letters: /[\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3]/g
                },
                {
                    base: 'l',
                    letters: /[\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747]/g
                },
                {
                    base: 'lj',
                    letters: /[\u01C9]/g
                },
                {
                    base: 'm',
                    letters: /[\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F]/g
                },
                {
                    base: 'n',
                    letters: /[\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5]/g
                },
                {
                    base: 'nj',
                    letters: /[\u01CC]/g
                },
                {
                    base: 'o',
                    letters: /[\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275]/g
                },
                {
                    base: 'oi',
                    letters: /[\u01A3]/g
                },
                {
                    base: 'ou',
                    letters: /[\u0223]/g
                },
                {
                    base: 'oo',
                    letters: /[\uA74F]/g
                },
                {
                    base: 'p',
                    letters: /[\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755]/g
                },
                {
                    base: 'q',
                    letters: /[\u0071\u24E0\uFF51\u024B\uA757\uA759]/g
                },
                {
                    base: 'r',
                    letters: /[\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783]/g
                },
                {
                    base: 's',
                    letters: /[\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B]/g
                },
                {
                    base: 't',
                    letters: /[\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787]/g
                },
                {
                    base: 'tz',
                    letters: /[\uA729]/g
                },
                {
                    base: 'u',
                    letters: /[\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289]/g
                },
                {
                    base: 'v',
                    letters: /[\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C]/g
                },
                {
                    base: 'vy',
                    letters: /[\uA761]/g
                },
                {
                    base: 'w',
                    letters: /[\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73]/g
                },
                {
                    base: 'x',
                    letters: /[\u0078\u24E7\uFF58\u1E8B\u1E8D]/g
                },
                {
                    base: 'y',
                    letters: /[\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF]/g
                },
                {
                    base: 'z',
                    letters: /[\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763]/g
                }
            ];

            for (var i = 0; i < defaultDiacriticsRemovalMap.length; i++) {
                str = str.replace(defaultDiacriticsRemovalMap[i].letters, defaultDiacriticsRemovalMap[i].base);
            }

            return str;
        },
        _updateOriginal: function (obj) {
            var data = obj.data(pluginName);
            var original;

            if (obj.is('ul')) {
                //get the list of original item
                original = obj.find('li');
                //no need to handle firstItemSelectAll
                //update original
                if (data.elements.listItem.li && data.elements.listItem.li.length)
                    data.elements.listItem.li.each(function (k) {
                        if ($(this).children('.' + pluginName + '_listItem_input').prop('checked'))
                            original.eq(k).attr('data-selected', '1');
                        else
                            original.eq(k).removeAttr('data-selected');
                    });
            }
            else {
                original = obj.find('option');
                if (data.settings.firstItemSelectAll)
                    original = original.slice(1);

                if (data.elements.listItem.checkbox && data.elements.listItem.checkbox.length)
                    data.elements.listItem.checkbox.each(function (k) {
                        //we use .attr to force add the attribute to the DOM
                        if (this.checked)
                            original.eq(k).attr('selected', 'selected');
                        else
                            original.eq(k).removeAttr('selected');
                    });
            }
        },
        _isIE: function () {
            if (/Trident.*rv[ :]*11\./i.test(navigator.userAgent))
                return 11;
            else if (/MSIE/i.test(navigator.userAgent))
                return parseInt(navigator.userAgent.split('MSIE')[1]);

            return false;
        },
        _isAlphabetKey: function (keyCode) {
            return $.inArray(keyCode, [9, 13, 16, 27, 35, 36, 37, 38, 39, 40]) === -1;
        },
        //A updates B, B updates C, C updates D...
        _updateChainedList: function (obj, settings) {
            //if no chaining selector
            if (!settings.chainable)
                return;

            var values = fn._get(obj);
            //make sure we don't update the previous found list, only update followings list in the stack
            var foundThis = false;

            //parse through the lists
            $(settings.chainable).each(function () {
                var $this = $(this);
                var data = $this.data(pluginName);
                //if it's not jautochecklist
                if (!data)
                    return;
                //found this one
                if ($this.is(obj)) {
                    foundThis = true;
                    return;
                }
                //this is the next one
                if (foundThis) {
                    var json = [];
                    //if values are set otherwise it's an empty list
                    if ((!settings.multiple && values !== null) || (settings.multiple && values.length))
                        json = settings.chainableSource(obj, values, $this);
                    $this.jAutochecklist('buildFromJSON', json);
                    //return false to stop update of the next of the next one
                    return false;
                }
            });
        },
        /**
         * Calculate the levenshtein to get the nearest word prediction
         * http://stackoverflow.com/questions/11919065/sort-an-array-by-the-levenshtein-distance-with-best-performance-in-javascript
         */
        _levenshtein: function (s, t) {
            var i, j;
            var d = []; //2d matrix

            // Step 1
            var n = s.length;
            var m = t.length;

            if (n === 0)
                return m;
            if (m === 0)
                return n;

            //Create an array of arrays in javascript (a descending loop is quicker)
            for (i = n; i >= 0; i--)
                d[i] = [];

            // Step 2
            for (i = n; i >= 0; i--)
                d[i][0] = i;
            for (j = m; j >= 0; j--)
                d[0][j] = j;

            // Step 3
            for (i = 1; i <= n; i++) {
                var s_i = s.charAt(i - 1);

                // Step 4
                for (j = 1; j <= m; j++) {

                    //Check the jagged ld total so far
                    if (i === j && d[i][j] > 4)
                        return n;

                    var t_j = t.charAt(j - 1);
                    var cost = (s_i === t_j) ? 0 : 1; // Step 5

                    //Calculate the minimum
                    var mi = d[i - 1][j] + 1;
                    var b = d[i][j - 1] + 1;
                    var c = d[i - 1][j - 1] + cost;

                    if (b < mi)
                        mi = b;
                    if (c < mi)
                        mi = c;

                    d[i][j] = mi; // Step 6

                    //Damerau transposition
                    if (i > 1 && j > 1 && s_i === t.charAt(j - 2) && s.charAt(i - 2) === t_j) {
                        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
                    }
                }
            }

            // Step 7
            return d[n][m];
        },
        _getClosestMatchToken: function (li, val, accentInsensitive) {
            //if no value or list is empty
            if (!val || !li.length)
                return null;

            var closest = null;
            var diff = null;

            li.each(function () {
                var text = $(this).text().toLowerCase();
                if (accentInsensitive)
                    text = fn._removeAccent(text);
                //split sentence by words
                var words = text.match(/\S+/g);
                if (words) {
                    for (var i = 0; i < words.length; i++) {
                        var w = words[i];
                        //calculate the levenstein for each words
                        var lv = fn._levenshtein(val, w);
                        if (diff === null || lv < diff) {
                            diff = lv;
                            closest = w;
                        }
                    }
                }
            });

            //if no closest word found
            if (closest === null)
                return null;

            //only take if the match is greater than half the length of the word
            var half = val.length > closest.length ? val.length / 2 : closest.length / 2;
            if (half >= 1 && diff > half)
                closest = null;

            return closest;
        },
        _isSelected: function (dom, isMultiple, isFirstOption) {
            var selected = dom.selected && dom.getAttribute('selected') !== null;   //require that the attribute is defined

            //is simple select and is IE <= 8, check if the first option is selected through attribute
            if (isFirstOption && !isMultiple && fn._isIE() <= 8 && selected)
                selected = dom.defaultSelected;

            return selected;
        },
        _refreshPosition: function (obj) {
            var data = obj.data(pluginName);
            if (!data)
                return;

            var dummy = obj.next();
            //find the current position of the dummy
            if (dummy.hasClass(pluginName + '_dummy')) {
                var offset = dummy.offset();
                data.elements.wrapper.css({
                    top: offset.top + 3,
                    left: offset.left
                });
            }
        }
    };

    $.fn.jAutochecklist = function (method) {
        //main
        if (fn[method]) {
            if (method.substr(0, 1) === '_')
                $.error('Method ' + method + ' does not exist on jQuery.' + pluginName);
            return fn[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else if (typeof method === 'object' || !method) {
            return fn.init.apply(this, arguments);
        }
        else {
            $.error('Method ' + method + ' does not exist on jQuery.' + pluginName);
        }
    };

    //modify the default behavior of the select list
    var old_val = $.fn.val;
    $.fn.val = function (value) {
        var data = this.data(pluginName);
        //if the list has applied the plugin
        if (data) {
            //getter
            if (value === undefined)
                return this.jAutochecklist('get');
            //setter
            else
                return this.jAutochecklist('set', value, true);
        }

        return old_val.apply(this, arguments);
    };

})(jQuery, document, window);
