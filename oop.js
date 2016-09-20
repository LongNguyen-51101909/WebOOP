/**
 * Created by nqlong on 15-Sep-16.
 */
var isInvalid = false;
var var_band_name = 'value_bands_data';
if (typeof add_step !== 'undefined') {
    if (add_step == 3) {
        var_band_name = 'marketing_value_bands_data';
    }
}
function upDownSelection(input, listsearch, key_code) {
    var item = listsearch.find('li.active');
    var list = listsearch.find('li');
    var index = item.index();
    if (key_code == 38) {
        var new_index = index - 1;
        if (new_index < 0)
            new_index = 0;
        var position = listsearch.find('li:eq(' + index + ')').position().top - listsearch.find('li:eq(' + new_index + ')').position().top;
        var new_position = new_index * position;
    }
    else
    {
        var new_index = index + 1;
        if (listsearch.find('li:eq(' + new_index + ')').length) {
            var position = listsearch.find('li:eq(' + new_index + ')').position().top;
            var new_position = new_index * position;
        }
        else
            return false;
    }

    if (listsearch.find('li:eq(' + new_index + ')').length) {
        listsearch.find('li').removeClass('active');
        listsearch.find('li:eq(' + new_index + ')').addClass('active');
        input.val(listsearch.find('li:eq(' + new_index + ')').data('name'));
        listsearch.scrollTop(new_position);
    }
}
function ajaxCategory(lang, url) {
    $.ajax({
        url: url,
        method: 'post',
        dataType: 'json',
        data: {lang: lang},
        success: function (result) {
            var first_item = '<li class="selected" data-id="" data-name="" cate_li><span class="ddTitleText">Select</span></li>';
            var band_section = $('[band_section="' + lang + '"]');
            band_section.find('[cate_band_section]').append(first_item);
            for (var i = 0; i < result.list.length; i++) {
                var item = '<li cate_li class="" data-id="' + result.list[i].id + '" data-name="' + result.list[i].category + '"><span class="ddTitleText">' + result.list[i].category + '</span></li>';
                band_section.find('[cate_band_section]').append(item);
            }
            band_section.find('[cate_band_section]').closest('.ddCombobox').resetCombobox();
        }
    });
}

function ajaxRecentBand(lang, url) {
    $.ajax({
        url: url,
        method: 'post',
        dataType: 'json',
        data: {lang: lang},
        success: function (result) {
            var item = result.list
            if (item.length > 0) {
                for (var i = 0; i < item.length; i++) {
                    var name = getValueBandFormat(item[i].raw_name, item[i].cate_name, lang);
                    var value_name = item[i].raw_name + '::' + item[i].cate_name;
                    var html = '<span class="admin_form_res_item" data-name="' + name + '" recent_item="' + value_name + '" data-value="' + value_name + '">' + name + '</span>';
                    $('[recent_band="' + lang + '"]').append(html);
                }
            } else {
                $('[recent_band="' + lang + '"]').append('<span class="admin_form_res_bot_left">There is no registration tag.</span>');
            }
        }

    });
}


function resetSection(band_section) {
    band_section.find('.search-ret-container').hide();
    band_section.find('[list_search_band_section]').html('');
    band_section.find('[input_section]').val('');
    band_section.find('[add_cate_input]').val('');
    band_section.find('.cate_container').hide();
    band_section.find('.search_result_cate').html('');
    band_section.find('[cate_band_section]').closest('div').hide();
}

function selectValueBand(band_section) {
    var lang = band_section.attr('band_section');
    var q = band_section.find('[input_section]').val();
    // if q different false, 0, NAN, "", null, undefined
    if (q) {
        q = q.trim();
    }

    var q_value = checkQuote(q);
    //q = checkQuote(q);
    if (q == '') {
        band_section.find('[input_section]').val('');
        return false;
    }
    var current_cate_name = band_section.find('[cate_band_section]').find('li.selected').data('name');
    var name = getValueBandFormat(q_value, current_cate_name, lang);
    var value_name = q_value + '::' + current_cate_name;
    var value_find = q + '::' + current_cate_name;
    if (current_cate_name == '') {
        var text_select_category = band_section.find('.alert_select_category').text();
        band_section.find('.ddCombobox').first().addClass('tf_error');
        changeCategoryAlert(band_section, text_select_category);
        // alert(ALERT_select_category);
        return false;
    }
    else {
        var count_marketband = true;
        if (band_section.attr('data-step3')) {
            if (band_section.find('[selected_item]').length > 4) {
                count_marketband = false;
                alert(ALERT_maximun_makerting_tag);
                return false;
            }
        }
        else {
            if (band_section.find('[selected_item]').length > 2) {
                count_marketband = false;
                alert(ALERT_maximun_value_bands);
                return false;
            }
        }
        if (!band_section.find('[selected_item="' + checkFindValue(value_find) + '"]').length && count_marketband) {
            var var_band = var_band_name;
            if (band_section.attr('data-step3')) {
                var_band = 'marketing_value_bands_data';
            }
            var select_item = '<div class="admin_tags_ask_item" data-value="' + value_name + '" selected_item="' + value_name + '" data-lang="' + lang + '">' + name + '<i class="qa qa-page-close" i_close></i>' +
                '<input band_input="' + lang + '" type="hidden" name="Quark[translations][' + lang + '][' + var_band + '][]" value="' + value_name + '"></div>';
            //band_section.find('[select_band]').append(select_item);/**old*/
            // if step 3
            if (band_section.attr('data-step3')) {
                band_section.find('[select_band]').append(select_item);
            } else { //else step 1
                band_section.find('[select_band]').append(select_item);
            }
            // change default category text
            band_section.find('.ddCombobox').first().removeClass('tf_error');
            var text_select_category = band_section.find('.text_select_category').text();
            changeCategoryAlert(band_section, text_select_category);
        }
        checkAddedTag();
        resetSection(band_section);
        return false;
    }
}

function changeCategoryAlert(band_section, alert_category)
{
    band_section.find('[cate_band_section] li').first().text(alert_category);
    band_section.find('[cate_band_section]').closest('.ddCombobox').resetCombobox();
}

function addSearchCategory(band_section) {

    var q = band_section.find('[add_cate_input]').val();
    var q_find = checkFindValue(q);
    q = checkQuote(q);
    var new_cate_id = 'new::cate';
    var item = '<li cate_li class="" data-id="' + new_cate_id + '" data-name="' + q + '"><span class="ddTitleText">' + q + '</span></li>';
    if (!band_section.find('[cate_band_section]').find('[cate_li][data-name="' + q_find + '"]').length) {
        band_section.find('[cate_band_section]').append(item);
    }
    band_section.find('[cate_li]').removeClass('selected');
    band_section.find('[cate_li][data-name="' + q_find + '"]').addClass('selected');
    band_section.find('[cate_band_section]').closest('.ddCombobox').resetCombobox();

    band_section.find('.ddCombobox').removeClass('show');
}
/*nttay*/
function addValueband(lang)
{

    var html_value_band = "<div class=\"admin_form_step_form_top\"> <div class=\"admin_form_step_form_top_col\"> <div class=\"admin_form_step_form_top_text\"> My company is engaged in </div> <div class=\"admin_form_step_form_top_input\"> <input type=\"text\" name=\"\" class=\"tf value_bands_input_" + lang + "\" placeholder=\"Product or Service\" input_section=\"\" data-url=\"\"> <div class=\"admin_form_dropdown\"> <div class=\"search-ret-container value_band_container\"> <ul list_search_band_section=\"\"> </ul> </div> </div> </div> </div> <div class=\"admin_form_step_form_top_col\"> <div class=\"admin_form_step_form_top_text\"></div> <div class=\"admin_form_step_form_top_cbo\"> <div class=\"ddCombobox expand value_bands_" + lang + "\"> <div class=\"ddTitle\"> <span class=\"arrow\"></span><span class=\"ddTitleText bold no_value_gray\">Select</span> </div> <div class=\"ddChild\" style=\"display:none\"> <ul class=\"ddChild\" cate_band_section=\"\" data-lang=\"hi\" id=\"value_band_language_" + lang + "\" style=\"display: none\"> <li class=\"selected\" data-id=\"\" data-name=\"\" cate_li=\"\"><span class=\"ddTitleText\">Select</span></li> </ul> <div class=\"admin_form_step_form_top_add\" add_cate_list> <label class=\"rdo ui-radio\"> <input type=\"radio\" name=\"radio_name\" class=\"add_cate_radio\"> <span></span> </label> <button type=\"button\" class=\"btn btn_complete\" add_cate_btn disabled>OK</button> <div class=\"admin_form_step_form_top_add_text div_add_cate_input\"> <input type=\"text\" name=\"\" class=\"tf\" placeholder=\"\" add_cate_input data-type=\"I\" disabled> <div class=\"admin_form_step_form_top_add_text_drop\"> <div class=\"search-ret-container cate_container\" style=\"display: none;\"> <ul class=\"search_result_cate\"> </ul> <div class=\"indexbar admin_form_dropdown_bot\"> <div class=\"admin_form_dropdown_bot_label\">Search for </div> <span class=\"text_black text_cate_search cate_search_item\"></span> </div> </div> </div> </div> </div> </div> </div> </div> <div class=\"admin_form_step_form_top_text\"></div> </div> <div class=\"clear\"></div> </div> <div class=\"admin_form_add\" select_band=\"\"> <span class=\"admin_tags_right_note no_tag_alert\" > There are no registered Value Links.</span> </div> <div style=\"display:none\" class=\"text_select_category\">Select</div> <div style=\"display:none\" class=\"alert_select_category\">Please select a category.</div>";
    var html_marketing_value_band = "<div class=\"admin_form_step_form\"> <div class=\"admin_form_step_form_top\"> <div class=\"admin_form_step_form_top_col\"> <div class=\"admin_form_step_form_top_text\">This quark’s marketing targets are companies engaged in</div> <div class=\"admin_form_step_form_top_input\"> <input type=\"text\" name=\"\" class=\"tf marketing_value_bands_input_" + lang + "\" placeholder=\"Product or Service\" input_section=\"hi\" data-url=\"\"> <div class=\"admin_form_dropdown\"> <div class=\"search-ret-container value_band_container\"> <ul list_search_band_section></ul> </div> </div> </div> </div> <div class=\"admin_form_step_form_top_col\"> <div class=\"admin_form_step_form_top_text\"></div> <div class=\"admin_form_step_form_top_cbo\"> <div class=\"ddCombobox expand marketing_value_bands_" + lang + "\"> <div class=\"ddTitle\"> <span class=\"arrow\"></span> <span class=\"ddTitleText bold no_value_gray\">Select</span> </div> <div class=\"ddChild\" style=\"display:none\"> <ul id=\"marketing_value_band_language_" + lang + "\" class=\"ddChild\" cate_band_section=\"\" data-lang=\"\" style=\"display: none\"> <li class=\"selected\" data-id=\"\" data-name=\"\" cate_li=\"\"><span class=\"ddTitleText\">Select</span></li> </ul> <div class=\"admin_form_step_form_top_add\" add_cate_list> <label class=\"rdo ui-radio\"> <input type=\"radio\" name=\"radio_name\" class=\"add_cate_radio\"> <span></span> </label> <button type=\"button\" class=\"btn btn_complete\" add_cate_btn disabled>OK</button> <div class=\"admin_form_step_form_top_add_text div_add_cate_input\"> <input type=\"text\" name=\"\" class=\"tf\" placeholder=\"\" add_cate_input data-type=\"I\" disabled> <div class=\"admin_form_step_form_top_add_text_drop\"> <div class=\"search-ret-container cate_container\" style=\"display: none;\"> <ul class=\"search_result_cate\"> </ul> <div class=\"indexbar admin_form_dropdown_bot\"> <div class=\"admin_form_dropdown_bot_label\">Search for </div> <span class=\"text_black text_cate_search cate_search_item\"></span> </div> </div> </div> </div> </div> </div> </div> </div> <div class=\"admin_form_step_form_top_text\"></div> </div> <div class=\"clear\"></div> </div> <div class=\"admin_wrap\"> <div class=\"admin_col col-md-4\"> <div class=\"admin_tags_ask\"> <div class=\"admin_tags_ask_top\"> <div class=\"admin_tags_ask_title\">Recommended #Marketing Target Tags</div> <div class=\"admin_tags_ask_caption\"> <span>Brand Exposure</span> <span>Web Search</span> </div> <div class=\"clear\"></div> </div> <div class=\"admin_tags_ask_content\" recent_band=\"hi\"> </div> <div class=\"admin_tags_ask_bot\">There are no recommended Marketing Target Tags.</div> </div> </div> <div class=\"admin_col col-md-8\"> <div class=\"admin_tags_right\"> <div class=\"admin_tags_right_mod\"> <div class=\"admin_tags_right_title\">Please specify up to five Marketing Target Tags. <span class=\"sub_title_language langue_title_ar\">(Arabic)</span> <span class=\"sub_title_language langue_title_bn\">(Bengali)</span> <span class=\"sub_title_language langue_title_zh\">(Chinese)</span> <span class=\"sub_title_language langue_title_en\">(English)</span> <span class=\"sub_title_language langue_title_fr\">(French)</span> <span class=\"sub_title_language langue_title_" + lang + "\">(Hindi (India))</span> <span class=\"sub_title_language langue_title_id\">(Indonesian)</span> <span class=\"sub_title_language langue_title_ja\">(Japanese)</span> <span class=\"sub_title_language langue_title_ko\">(Korean)</span> <span class=\"sub_title_language langue_title_fa\">(Persian)</span> <span class=\"sub_title_language langue_title_pt\">(Portuguese)</span> <span class=\"sub_title_language langue_title_ru\">(Russian)</span> <span class=\"sub_title_language langue_title_es\">(Spanish)</span> <span class=\"sub_title_language langue_title_sw\">(Swahili)</span> <span class=\"sub_title_language langue_title_th\">(Thai)</span> <span class=\"sub_title_language langue_title_ur\">(Urdu)</span> <span class=\"sub_title_language langue_title_vi\">(Vietnamese)</span> </div> <div class=\"admin_tags_right_content\" select_band> <span class=\"admin_tags_right_note no_tag_alert\" > There are no registered Value Links.</span> </div> </div> </div> </div> <div class=\"clear\"></div> </div> </div> <div style=\"display:none\" class=\"text_select_category\">Select</div> <div style=\"display:none\" class=\"alert_select_category\">Please select a category.</div>";

    html_value_band_add = '<div band_section="' + lang + '" class="value_bands_language_' + lang + ' input_language" style="display:none"><div class="admin_form_step_form">' + html_value_band + '</div></div>';
    $('.value_band_content').append(html_value_band_add);
    $('#value_band_language_' + lang).closest('.ddCombobox').jqCombobox();
    html_marketing_value_band_add = '<div band_section="' + lang + '" data-step3="1" class="value_bands_language_' + lang + ' input_language" style="display:none">' + html_marketing_value_band + '<div class="clear"></div></div>';
    $('.marketing_value_band_content').append(html_marketing_value_band_add);
    $('#marketing_value_band_language_' + lang).closest('.ddCombobox').jqCombobox();
    // $.ajax({
    //     type: 'POST',
    //     url: '/quark/ajax-get-value-band-edit',
    //     data: {lang: lang},
    //     dataType: 'json',
    //     success: function (result) {
    //         if (result.status)
    //         {
    //             html_value_band_add = '<div band_section="' + lang + '" class="value_bands_language_' + lang + ' input_language" style="display:none"><div class="admin_form_step_form">' + result.html_value_band + '</div></div>';
    //             $('.value_band_content').append(html_value_band_add);
    //             $('#value_band_language_' + lang).closest('.ddCombobox').jqCombobox();
    //             html_marketing_value_band_add = '<div band_section="' + lang + '" data-step3="1" class="value_bands_language_' + lang + ' input_language" style="display:none">' + result.html_marketing_value_band + '<div class="clear"></div></div>';
    //             $('.marketing_value_band_content').append(html_marketing_value_band_add);
    //             $('#marketing_value_band_language_' + lang).closest('.ddCombobox').jqCombobox();
    //         }
    //     }
    // });
}

function checkKeyboardInput(code) {
    if (code == 16) {
        return false;
    }
}

function checkAddedTag() {
    $('[band_section]').each(function () {
        if ($(this).find('[band_input]').length) {
            $(this).find('.no_tag_alert').hide();
        }
        else
            $(this).find('.no_tag_alert').show();
    });
}
function checkValueBand(q) {
    return q.replace(/[,!$%^&*+-.#\/]+/g, '');
}
function checkQuote(q) {
    return q.replace(/"/g, "&quot;");
}

function checkFindValue(q){
    return q;
}

(function($) {
    var QuarkExtension = {
        Default : {
            //TODO: add member for Object default
        }
        //TODO: add more member

    };
    $.extend(QuarkExtension, {
        //init data
        init : function () {
            // create member
            this.container = $('.banner_pop_wrap');
            //bind event
            this.setupEvent();
        },

        // Set up Quark Extension  events
        setupEvent : function() {
            //TODO: setup event
            /**
             * add language
             */
            // $('#added_lang').on('change', '.selected', $.proxy(this.func1, this));

            /**
             * Click recent --> add hash tag
             * addRecentTag
             * step 1
             */
            $('html').on('click', '[recent_item]', $.proxy(this.addRecentTag, this));

            /**
             * Click is remove hash tag
             * use step 1, 3
             */
            $('html').on('click','[i_close]',  $.proxy(this.removeHashTag , this));
            //$('html').on('keypress', '[input_section]', $.proxy(this.func4(event), this));

            /**
             * key press add suffix hash tag
             * use step 1, 3
             * addSuffixTag
             */
            $('html').on('keypress', '[add_cate_input]', $.proxy(this.addSuffixTag , this));

            /**
             * key down on class admin_form_step_form_top_input
             * @param e
             * @returns {boolean}
             */
            $('html').on('keyup', '[input_section]', $.proxy(this.TextChangerHashTag, this));
            /**
             * Click on search item ajax(hash tag)
             * $('[search_item]') _ item has attribute search_item
             * use step 1, 3
             */
            $('html').on('click', '[search_item]', $.proxy(this.clickOnSearchItem , this));
            //$('html').on('click', '#default_lang', $.proxy(this.func8(event), this));
            /**
             * Even click btn Oke to add suffix
             * use step 1, 3
             * addSuffixTagClickBtnOke
             */
            $('html').on('click', '[add_cate_btn]', $.proxy(this.addSuffixTagClickBtnOke, this));
            //$(document).on('change', '[cate_li]', $.proxy(this.func10(event), this));
            //$(document).on("change", '[action_add_item]', $.proxy(this.addQuark(event), this));
            //$(document).on('change', "[radio_add_cate]", $.proxy(this.func11(event), this));
            /**
             * click select suffix hash tag
             * addSuffixByClickFitter
             */
            $(document).on('click', $.proxy(this.addSuffixByClickFitter, this));
            /**
             * add cate input --> add suffix hash tag
             * use step 1, 3
             * addSuffixByPressChart
             */
            $(document).on('keyup', '[add_cate_input]', $.proxy(this.addSuffixByPressChart , this));

            /**
             * Click case search item
             * target : li class="ritm cate_search_item"
             * use step 1, 3
             * clickSearchItemSuffix
             */
            $(document).on('click', '.cate_search_item', $.proxy(this.clickSearchItemSuffix, this));

            /**
             * Open input fill suffix hash tag value band
             * event when click to add suffix tag
             * use step 1, 3
             * clickAddSuffixTag
             */
            $('html').on('click', '.add_cate_radio', $.proxy(this.clickAddSuffixTag, this));

            /**
             * Open input fill suffix hash tag value band
             * use step 1, 3
             * openFillSuffixTag
             */
            $('html').on('click', '.div_add_cate_input', $.proxy(this.openFillSuffixTag , this));


            //$('html').on('change', '#address_input', $.proxy(this.func21(event), this));

        },

        //
        func1 : function(e) {
            var lang = $(e.target).data('code');
            var name = $(e.target).data('name');
            var band_section = $('[band_section="' + lang + '"');
            band_section.siblings('div').hide();
            band_section.show();
            $('#cate_band').html('');
            $('#cate_band').hide();
            var temp = $('#temp_category').find('[temp_lang="' + lang + '"]').html();
            $('#cate_band').append(temp);
        },

        addRecentTag : function(e) {
            var $this = $(e.target).closest('[recent_item]');
            var band_section = $($this).closest('[band_section]');
            var lang = band_section.attr('band_section');
            var item = $($this);
            var name = item.data('name');
            var value_name = item.data('value');
            var value_name_find = checkFindValue(value_name);
            var var_band = var_band_name;
            var count_marketband = true;
            if (band_section.attr('data-step3')) {
                var_band = 'marketing_value_bands_data';
                if (band_section.find('[selected_item]').length > 4) {
                    count_marketband = false;
                    alert(ALERT_maximun_makerting_tag);
                    return false;
                }
            }
            else {
                if (band_section.find('[selected_item]').length > 2) {
                    count_marketband = false;
                    alert(ALERT_maximun_value_bands);
                    return false;
                }
            }
            if (!band_section.find('[selected_item="' + value_name_find + '"]').length && count_marketband) {
                var select_item = '<div class="admin_tags_ask_item" data-name="' + name + '" selected_item="' + value_name + '" data-lang="' + lang + '">' + name + '<i class="qa qa-page-close" i_close></i>' +
                    '<input band_input="' + lang + '" type="hidden" name="Quark[translations][' + lang + '][' + var_band + '][]" value="' + value_name + '"></div>';
                band_section.find('[select_band]').append(select_item);
                checkAddedTag();
            }
            if (count_marketband) {
                $($this).hide();
            }
        },
        /**
         * remove hash tag by click 'x'
         * @param e
         */
        removeHashTag: function(e) {
            var $targetIClose = $(e.target).closest('[i_close]');

            var item = $($targetIClose).closest('[selected_item]');
            var name = item.attr('selected_item');
            name = checkFindValue(name);
            //name = checkHashtag(name);
            item.closest('[band_section]').find('[recent_item="' + name + '"]').show();
            item.remove();
            checkAddedTag();
        },

        func4: function(e) {
            var code = String.fromCharCode(e.which);
            if ("[,!$%^&*+-.#\/]+".indexOf(code) != -1) {
                isInvalid = true;
                e.preventDefault();
                return false;
            }
            if(e.which == 13){
                e.preventDefault();
            }
            isInvalid = false;
        },
        addSuffixTag : function(e) {
            if(e.which == 13){
                e.preventDefault();
            }
        },
        /**
         * key down on class admin_form_step_form_top_input
         * @param e
         * @returns {boolean}
         */
        TextChangerHashTag : function(e) {
            var band_section = $(e.target).closest('[band_section]');
            var key = e.which;
            if (isInvalid) return false;
            if (key == 16)
                return false;
            var lang = band_section.attr('band_section');
            var q = $(e.target).val();
            q = checkValueBand(q);
            //$(this).val(q);
            q = q.trim();
            if (q == '') {
                resetSection(band_section);
                return false;
            }
            if (key == 38 || key == 40) {
                upDownSelection($(this), band_section.find('[list_search_band_section]'), key);
                return false;
            }
            if (key == 13 || key == 188) {
                if (q != '') {
                    selectValueBand(band_section);
                }
                return false;
            }
            band_section.find('[list_search_band_section]').html('');
            band_section.find('[new_band_item]').remove();
            var url = $('#links').data('search_url');
            var type = 'I';
            if (band_section.attr('data-step3'))
                type = 'M';
            var cat = band_section.find('[cate_band_section]').find('li.selected').data('id');
            var current_cate_name = band_section.find('[cate_band_section]').find('li.selected').data('name');
            /* if (cat == 'new::cate') {
             var name = getValueBandFormat(q, current_cate_name, lang);
             var new_item = '<div search_item new_band_item class="indexbar admin_form_dropdown_bot" data-name="' + q + '">' +
             '<div class="admin_form_dropdown_bot_label">New Value-band:</div>' +
             '<span class="text_black">' + q + '</span></div>';
             band_section.find('.value_band_container').append(new_item);
             band_section.find('.value_band_container').show();
             return false;
             }*/
            $.ajax({
                url: url,
                method: 'get',
                dataType: 'json',
                data: {q: q, type: type, language: lang},
                success: function (result) {
                    var $ele = band_section.find('[list_search_band_section]');
                    $ele.html('');
                    $ele.hide();
                    if (!result.data.length) {
                        var no_cate = '';
                        if (cat == '') {
                            no_cate = 'no_cate_band';
                        }
                        var htm = '<div ' + no_cate + ' search_item new_band_item class="indexbar admin_form_dropdown_bot" ' + 'data-name="' + q + '">' +
                            '<div class="admin_form_dropdown_bot_label">' + MSG_new_value_link + ':</div>' +
                            '<span class="text_black">' + q + '</span></div>';
                        band_section.find('[list_search_band_section]').append(htm);
                        $ele.show();
                    }
                    for (var i = 0; i < result.data.length; i++) {
                        var name = result.data[i].name;
                        var count = result.data[i].count;
                        var htm = '<li class="ritm"' + '" data-name="' + name + '"' + ' search_item>' +
                            '<div class="rtx" data-lang="' + lang + '">' + name + '<span class="mq">' + count + '</span></div>' +
                            '</li>';
                        band_section.find('[list_search_band_section]').append(htm);
                        $ele.show();
                    }
                    band_section.find('.value_band_container').show();
                }
            });
        },
        /**
         * Click on search item
         * @param e
         */
        clickOnSearchItem : function(e) {
            var $targetParent = $(e.target).closest('[search_item]');
            var band_section = $($targetParent).closest('[band_section]');
            var q = $targetParent.data('name');
            band_section.find('[input_section]').val(q);
            selectValueBand(band_section);
        },

        func8 : function(e) {
            var lang = $(this).find('input').data('code');
            $('#lang_default_input').val(lang);
        },

        addSuffixTagClickBtnOke : function(e) {
            var band_section = $(e.target).closest('[band_section]');
            var q = band_section.find('[add_cate_input]').val();
            q = q.trim();
            if (q != '') {
                addSearchCategory(band_section);
                selectValueBand(band_section);
                resetSection(band_section);
            }
        },
        func10 : function(e) {
            var band_section = $(this).closest('[band_section]');
            var lang = band_section.attr('band_section');
            var current_cate_name = band_section.find('[cate_band_section]').find('li.selected').data('name');
            if (current_cate_name == '')
                return false;
            var q = band_section.find('[input_section]').val();
            if (q != '') {
                selectValueBand(band_section);
            }
        },
        addQuark : function(e) {
            var code = $(this).data('code');
            code = code.trim();
            var name = $(this).data('name');
            var url = $('#links').data('change_lang');
            var current_code = $('[band_section]').attr('band_section');
            if (code != current_code) {
                $('[band_section]').remove();
                $.ajax({
                    url: url,
                    method: 'post',
                    //dataType: 'json',
                    data: {lang: code},
                    success: function (result) {
                        $('#full_bands').append(result);
                        $('#full_bands').find('.ddCombobox').resetCombobox();
                        changeSubTitleLanguage(code);
                    }

                });
                var list_lang = '<input list_language="' + code + '" type="hidden" name="Quark[list_language][' + code + ']" value="' + name + '"></div>';
                $('[list_language]').remove();
                $('#quark_form').append(list_lang);
                $('#lang_default_input').val(code);
            }
            else {
            }
        },
        func11 : function(e) {
            if ($(this).attr("checked")) {
                $(this).closest('[add_cate_list]').find('input').removeAttr('disabled');
                $(this).closest('[add_cate_list]').find('button').removeAttr('disabled');
            }
            else {

            }
        },

        addSuffixByClickFitter : function(e) {
            if ($(e.target).closest(".admin_form_step_form_top_input").length === 0 && $(e.target).closest(".admin_form_step_form_top_cbo").length === 0) {
                var band_section = $('[band_section]');
                var list = new Array();
                $('[band_section]').find('[input_section]').each(function (index) {
                    list.push($(this).val());
                })
                resetSection(band_section);
                $('[band_section]').find('[input_section]').each(function (index, array) {
                    $(this).val(list[index]);
                })
            }
        },

        addSuffixByPressChart : function(e) {
            e.stopPropagation();
            var band_section = $(e.target).closest('[band_section]');
            var key = e.which;
            var lang = band_section.attr('band_section');
            var q = $(e.target).val();
            var type = $(e.target).data('type');
            var new_cate_id = 'new::cate';
            q = q.trim();
            q = checkValueBand(q);
            //$(this).val(q);
            if (q == '') {
                return false;
            }
            if (key == 38 || key == 40) {
                upDownSelection($(this), band_section.find('.search_result_cate'), key);
                return false;
            }
            if (key == 13) {
                e.preventDefault();
                if (q != '') {
                    addSearchCategory(band_section);
                    selectValueBand(band_section);
                    resetSection(band_section);
                    return false;
                }
            }
            var url = $('#links').data('search_cate_band_url');
            $.ajax({
                url: url,
                method: 'get',
                dataType: 'json',
                data: {q: q, type: type, language: lang},
                success: function (result) {
                    var $ele = band_section.find('.search_result_cate');
                    $ele.html('');
                    $ele.hide();
                    for (var i = 0; i < result.list.length; i++) {
                        var id = result.list[i].id;
                        var name = result.list[i].category;
                        var html = '<li class="ritm cate_search_item" data-name="' + name + '" data-id="' + id + '">' +
                            '<div class = "rtx" >' + name + '<span class = "mq" > </span></div>' +
                            '</li>';
                        band_section.find('.search_result_cate').append(html);
                        $ele.show();
                    }
                    band_section.find('.text_cate_search').html('"' + q + '"');
                    band_section.find('.cate_container').show();
                }
            });
        },
        clickSearchItemSuffix : function(e) {
            var $that = $(e.target).closest('.cate_search_item');
            var band_section = $(e.target).closest('[band_section]');
            var q = $that.data('name');
            if (q) {
                band_section.find('[add_cate_input]').val(q);
            }
            addSearchCategory(band_section);
            selectValueBand(band_section);
            resetSection(band_section);
        },
        clickAddSuffixTag : function(e) {
            var band_section = $(e.target).closest('[band_section]');
            band_section.find('[add_cate_btn]').removeAttr('disabled');
            band_section.find('[add_cate_input]').removeAttr('disabled');
        },
        openFillSuffixTag : function(e) {
            var band_section = $(e.target).closest('[band_section]');
            band_section.find('[add_cate_btn]').removeAttr('disabled');
            band_section.find('[add_cate_input]').removeAttr('disabled');
            band_section.find('.add_cate_radio').attr('checked', '');
        },
        func21 : function(e) {
            $('#location_' + code_language).val($(this).val());
        },


    });

    $.fn.resetCombobox = function () {
        $(this).jqCombobox();
    };

    //create object global
    window.QuarkExtension = QuarkExtension;
    $(document).ready(function () {
        QuarkExtension.init();
    });


}(jQuery));

