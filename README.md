# WebOOP

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
var enLang = "en";
var koLang = "ko";
var viLang = "vi";

/**
 * enter valueband
 * @param raw_name
 * @param category
 * @param language_code
 * @returns {*}
 */
function getValueBandFormat(raw_name, category, language_code) {
    var formatNameValueBand = {
        en: raw_name + " [" + category + "]",
        ko: raw_name + " [" + category + "]",
        vi: "[" + category + "] " + raw_name,
    };
    if (typeof (formatNameValueBand[language_code]) == 'undefined')
        return formatNameValueBand['en'];
    return formatNameValueBand[language_code];
}
var quarkServerUrl = gQuarkConstant.quarkServerUrl;

var config = {
    ADD_QUARK_URL:quarkServerUrl +'/api/quarkblog/add-quark',
    GET_PROFILE_URL:quarkServerUrl +'/api/account/index',
    EDIT_QUARK_URL : quarkServerUrl +'/api/quarkblog/update-quark',
    GET_DATA_QUARK_URL : quarkServerUrl +'/api/quarkblog/get-quark-edit',
};
var errorLog = {
    INVALID_VALUE_BAND: 'invalid_value_band',
    INVALID_MARKETING_VALUE_BAND: 'invalid_marketing_value_band'
};
var jsonPropertyName = {
    LIST_VALUE_BAND_VIEW : 'list_value_band_view',
    LIST_MARKETING_VALUE_BAND : 'list_marketing_value_band_view',
    TRANSLATIONS : 'translations',
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
                /**Keeps the rest of the handers from being excuted and prevents the event from budding up the DOM tree*/
                
                //resetSection(band_section);
                return false;
            }
        }
        else {
            if (band_section.find('[selected_item]').length > 2) {
                count_marketband = false;
                alert(ALERT_maximun_value_bands);
                /**Keeps the rest of the handers from being excuted and prevents the event from budding up the DOM tree*/
                
                //resetSection(band_section);
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
                band_section.find('[select_band]').append(select_item);

            // change default category text
            band_section.find('.ddCombobox').first().removeClass('tf_error');
            var text_select_category = band_section.find('.text_select_category').text();
            changeCategoryAlert(band_section, text_select_category);
        }
        checkAddedTag();
        resetSection(band_section);
        if (band_section.attr('data-step3')) {
            //step 3: TODO my suft
        } else {
            //step 1; ; load marketing tag
            QuarkExtension.loadMarketingTags();
        }
        return false;
    }
}

function changeCategoryAlert(band_section, alert_category)
{
    band_section.find('.value_band_container').hide();
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
function addValueband(lang, async, callBack) {
    var stepAdd = true;
    var url = $('#links').data('new_quark_form_url');
    $.ajax({
        type: 'POST',
        url: url,
        data: {lang: lang, stepAdd: stepAdd},
        async: async,
        dataType: 'json',
        xhrFields: {withCredentials: true},
        success: function (result) {
            if (result.status) {
                // load form
                html_value_band_add = '<div band_section="' + lang + '" class="value_bands_language_' + lang + ' input_language" style="display:none"><div class="admin_form_step_form">' + result.html_value_band + '</div></div>';
                $('.value_band_content').append(html_value_band_add);
                $('#value_band_language_' + lang).closest('.ddCombobox').jqCombobox();
                html_marketing_value_band_add = '<div band_section="' + lang + '" data-step3="1" class="value_bands_language_' + lang + ' input_language" style="display:none">' + result.html_marketing_value_band + '<div class="clear"></div></div>';
                $('.marketing_value_band_content').append(html_marketing_value_band_add);
                $('#marketing_value_band_language_' + lang).closest('.ddCombobox').jqCombobox();
                // check & show
                showForm(lang);
                if(callBack){
                	try {
                		callBack();
					} catch (e) {
						// TODO: handle exception
					}
                }
            }
        }
    });
}

function showForm(lang) {
    if ($("#language_quark").find(".selected").attr("data-code") === lang) {
        $(".value_bands_language_" + lang).show();
    }
}

function checkKeyboardInput(code) {
    if (code == 16) {
        return false;
    }
}

function checkAddedTag() {
    if(DEBUG) {
        console.log("Fuction checkAddedTag()")
    }
    $('[band_section]').each(function () {
        if ($(this).find('[band_input]').length) {
            // $(this).find('.no_tag_alert').hide();
            var alert = $(this).find('.no_tag_alert');
            if (alert) {
                for (var i =0; i < alert.length; i++) {
                    var curElement = alert[i];
                    if ($(curElement).attr("class") === "admin_tags_right_note no_tag_alert admin_tags_ask_bot") {
                        continue;
                    } else {
                        $(curElement).hide();
                    }
                }
            }
        } else {
            var alert = $(this).find('.no_tag_alert');
            if (alert) {
                for (var i =0; i < alert.length; i++) {
                    var curElement = alert[i];
                    if ($(curElement).attr("class") === "admin_tags_right_note no_tag_alert admin_tags_ask_bot") {
                        continue;
                    } else {
                        $(curElement).show();
                    }
                }
            }
        }
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
        Default: {
            //TODO: add member for Object default
            default_lang: "en"
        }
        //TODO: add more member

    };
    $.extend(QuarkExtension, {
        //init data
        init : function () {
            if (DEBUG) {
                console.log("QuarkExtension");
            }
            // create member
            this.container = $('#quark_form');
            this.quarkId = null;//2641
            this.editQuark = false;
            this.langs = ["en"];
            this.defaultData = null;
            this.hashTagStep1 = $(document).find('[select_band]')[0];
            this.testdata = {
                en:{
                    title:'testQuark',
                    description:'testDes'
                },
                ko:{
                    title:'testQuark',
                    description:'testDes'
                },
                photo: [
                    'http://i.imgur.com/dk5vKkU.jpg',
                    'http://i.imgur.com/aXmenHK.jpg'
                ]
            }

            this.setDefaultData(this.testdata);
            // this.quarkData = {
            //     quark_type:'product',
            //     photos:[],
            //     language:'en',
            //     show_info:1,
            //     list_languages:['en'],
            //     translations: {
            //         en: {
            //             title: '',
            //             description: '',
            //             show_info: '',
            //             value_bands_data: [
            //                 'ngocson', 'test'
            //             ],
            //             marketing_value_bands_data: [
            //                 'test'
            //             ]
            //         }
            //     },
            //     valueBand:[],
            //     marketingTag:[]
            // };
            this.quarkData = null;
            this.selectedLangSpinner = this.container.find('#language_quark');
            this.addLanguageSpiner = this.container.find('#add_language');
            this.defaultLanguageSpiner = this.container.find('#language_quark_default');
            this.valueBandContent = this.container.find('.value_band_content');
            this.marketingContent = this.container.find('.marketing_value_band_content')
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

            /**
             * not permission special char
             */
            $('html').on('keypress', '[input_section]', $.proxy(this.denyCharSpecial, this));

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

            /**
             * section default language
             */
            //$('html').on('click', '#default_lang', $.proxy(this.func8(event), this));

            /**
             * Even click btn Oke to add suffix
             * use step 1, 3
             * addSuffixTagClickBtnOke
             */
            $('html').on('click', '[add_cate_btn]', $.proxy(this.addSuffixTagClickBtnOke, this));

            /**
             * fill p when [cate li] in select
             * [cate li] click select data --> add hash tag
             */
            $(document).on('change', '[cate_li]', $.proxy(this.addHashTagWhenClickSuffix, this));
//            $("li[cate_li]").on('click', $.proxy(this.addHashTagWhenClickSuffix, this));

            /**
             * item language event
             */
            $(document).on("change", '[action_add_item]', $.proxy(this.addQuark, this));

            /**
             * no find
             */
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

            /**
             * post add quark
             */
            try {
            	var addQuarkBtn = this.container.find("#update-quark");
                addQuarkBtn.on("click",$.proxy(this.doAddEditQuark,this));
			} catch (e) {
				// TODO: handle exception
			}
            

            /**
             * load quark detail
             */
            //$(document).find('#editQuarkBtn').on('click', $.proxy(this.activeEditQuark, this));
            try {
            	$(document).find('#editQuarkBtn').on('click', $.proxy(this.doGetQuarkDetail, this));
			} catch (e) {
				// TODO: handle exception
			}
            
        },

        getLangCodeActive : function(){
            var languageQuark = $("#language_quark");
            if (!languageQuark) {
                return false;
            }
            var langAreas = $(languageQuark).find("li.enabled.selected");
            var lang = $(langAreas).attr("data-code");

            //if no language
            if (!lang) {
                return false;
            }
            return lang;
        },

        getDataHashTag : function() {
            var datahashTag = [];

            var languageQuark = $("#language_quark");
            if (!languageQuark) {
                return false;
            }
            var langAreas = $(languageQuark).find("li.enabled.selected");
            var lang = $(langAreas).attr("data-code");

            //if no language
            if (!lang) {
                return false;
            }

            var condition = $("div#addQuarkFormId").find("div.admin_step.step1");

            var bandSection = $(condition).find("[band_section='"+lang+ "']");

            var recentTag = $(bandSection).find("div.admin_tags_ask_item");

            if (recentTag && recentTag.length > 0) {
                for (var i = 0; i < recentTag.length; i++) {
                    var curData = recentTag[i];
                    var data = $(curData).attr("selected_item");
                    datahashTag.push(data)
                }
            }
            return datahashTag;
        },

        loadMarketingTags : function(){
            //load lang active
            var lang = QuarkExtension.getLangCodeActive();
            if (!lang) {
                return false;
            }

            // Load recommend right hash tag
            var urlRightHashTag = gQuarkConstant.quarkServerUrl + gQuarkConstant.quark_rMarketingtags;
            var hashTagData = QuarkExtension.getDataHashTag();
            if (!hashTagData || hashTagData.length < 1) {
                var condition = $("div#addQuarkFormId").find("div.admin_step.step3");
                var bandSection = $(condition).find("[band_section='"+lang+ "']");

                $(bandSection).find(".admin_tags_ask_content").html("");
                $(bandSection).find("div.admin_tags_right_note.no_tag_alert").show();
                // $(bandSection).find("div.admin_tags_right_note.no_tag_alert").attr("style", "display : inline-block");
                return;
            }

            $.ajax({
                type: "POST",
                url: urlRightHashTag,
                dataType: 'json',
                xhrFields: {withCredentials: true},
                data: {language: lang, hashtags : hashTagData},

                success : function(result){
                    if(result ){
                        //if has data
                        if (result && result.items.length > 0) {
                            console.log(result);
                            QuarkExtension.addRecomendMarkettingTags(result);
                        } else {
                            QuarkExtension.showAlerRecommanedMarketingTag(true, true);
                        }
                    }
                }
            });
        },
        checkShowAleartMarketingTagWhenAddRecentTag : function () {
            if (DEBUG) {
                console.log("checkShowAleartMarketingTagWhenAddRecentTag");
            }
            //load lang active
            var lang = QuarkExtension.getLangCodeActive();
            if (!lang) {
                return false;
            }
            var condition = $("div#addQuarkFormId").find("div.admin_step.step3");
            var bandSection = $(condition).find("[band_section='"+lang+ "']");
            var $recommendParent = $(bandSection).find(".admin_tags_ask_content");
            var $recommends = $($recommendParent).find("div.admin_tags_ask_row");
            var numDisplay = 0;
            if ($recommends) {
                $.each($recommends, function (idx, val) {
                    if ($(val).is(":visible")) {
                        numDisplay++;
                    }
                });
            }
            if (numDisplay == 0) {
                QuarkExtension.showAlerRecommanedMarketingTag(true, false);
            } else {
                QuarkExtension.showAlerRecommanedMarketingTag(false, false);
            }
        },

        /**
         * show alert and clear html
         * @param isShow
         * @returns {boolean}
         */
        showAlerRecommanedMarketingTag : function(isShow, isClear) {
            //load lang active
            var lang = QuarkExtension.getLangCodeActive();
            if (!lang) {
                return false;
            }
            var condition = $("div#addQuarkFormId").find("div.admin_step.step3");
            var bandSection = $(condition).find("[band_section='"+lang+ "']");
            if (isShow) {
                if (isClear) {
                    $(bandSection).find(".admin_tags_ask_content").html("");
                }
                $(bandSection).find("div.admin_tags_right_note.no_tag_alert").show();
                // $(bandSection).find("div.admin_tags_right_note.no_tag_alert").attr("style", "display : inline-block");
            } else {
                $(bandSection).find("div.admin_tags_right_note.no_tag_alert").hide();
                // $(bandSection).find("div.admin_tags_right_note.no_tag_alert").attr("style", "display : none");
            }
        },

        /**
         *add recomend hash tag
         * @param data
         * @returns {boolean}
         */
        addRecomendMarkettingTags: function(data) {
            var addHtml = "";
            var numDisplay = 0;

            if (data && data.items &&  data.items.length > 0) {
                for (var i = 0; i < data.items.length; i++) {
                    var currentData = data.items[i];

                    var template = jQuery.validator.format('<div class="admin_tags_ask_row"  data-step3 data-name="{0}" recent_item="{1}" data-value="{1}">'
                        + '<div class="admin_tags_ask_left">'
                        + ' <div class="admin_tags_ask_item">{0}<i class="qa qa-page-close"></i></div>'
                        + '</div>'
                        + '<div class="admin_tags_ask_right">'
                        + '<div class="admin_tags_ask_col">{2}</div>'
                        + '<div class="admin_tags_ask_col">{3}</div>'
                        + '</div>'
                        + '</div>');
                    // template display none
                    var templateDisplayNone = jQuery.validator.format('<div class="admin_tags_ask_row"  data-step3 data-name="{0}" recent_item="{1}" data-value="{1}" style="display: none;">'
                        + '<div class="admin_tags_ask_left">'
                        + ' <div class="admin_tags_ask_item">{0}<i class="qa qa-page-close"></i></div>'
                        + '</div>'
                        + '<div class="admin_tags_ask_right">'
                        + '<div class="admin_tags_ask_col">{2}</div>'
                        + '<div class="admin_tags_ask_col">{3}</div>'
                        + '</div>'
                        + '</div>');
                    // check exits value marketing tag yes?
                    //if exits, no add, else add

                    var value = QuarkExtension.formatHashTagUtils(currentData.raw_name, currentData.category);
                    if (!value) {
                        return false;
                    }
                    var isExitsMarketingTag = QuarkExtension.isExitsMarketingTag(value);
                    // if no exit (!value)
                    if (!isExitsMarketingTag) {
                        addHtml = addHtml.concat(template(currentData.name, value,
                            currentData.count_brand, currentData.count_search));
                        numDisplay++;
                    } else {// else to do my surf
                        addHtml = addHtml.concat(templateDisplayNone(currentData.name, value,
                            currentData.count_brand, currentData.count_search));
                    }
                }
            }
            // else null --> load recent hash tag had add alert , so we not have add alert html
            // add to document
            var lang = QuarkExtension.getLangCodeActive();
            if (!lang) {
                return false;
            }
            var condition = $("div#addQuarkFormId").find("div.admin_step.step3");
            var bandSection = $(condition).find("[band_section='"+lang+ "']");

            $(bandSection).find(".admin_tags_ask_content").html(addHtml);
            if (numDisplay == 0) {
                QuarkExtension.showAlerRecommanedMarketingTag(true, false);
            } else {
                QuarkExtension.showAlerRecommanedMarketingTag(false, false);
            }
        },

        /**
         * Check marketing hash tag is exits
         * @param data
         * @returns {boolean}
         */
        isExitsMarketingTag : function(data){
            if (DEBUG) {
                console.log("QuarkExtension.isExitsMarketingTag(data: "+ data + ")");
            }
            //load lang active
            var lang = QuarkExtension.getLangCodeActive();
            if (!lang) {
                return false;
            }
            var condition = $("div#addQuarkFormId").find("div.admin_step.step3");
            var bandSection = $(condition).find("[band_section='"+lang+ "']");
            var selector = $(bandSection).find("div.admin_tags_ask_item[selected_item='"+ data +"']");
            if (selector && selector.length > 0) { // if exits, return true
                return true;
            }
            //else , no exits return false
            return false;
        },

        formatHashTagUtils : function(rawName, category) {
            if(DEBUG) {
                console.log("QuarkExtension.formatHashTagUtils");
            }
            if (!rawName || !category) {
                return false;
            }
            var lang = QuarkExtension.getLangCodeActive();
            if (!lang) {
                return false;
            }
            var value;
            if(DEBUG) {
                console.log("formatHashTagUtils[lang : "+ lang + " ]");
            }
            //if en, ko, vi
            // if lang = en, ko format hash tag rawName::category
            if (lang == enLang || lang == koLang) {
                value = rawName.trim() + "::" + category.trim();
                return value;
            }
            // if lang = vi
            if (lang == viLang) {
                value = category.trim() + "::" + rawName.trim();
                return value;
            }

            return false;
        },

        activeEditQuark : function (event) {
            // event.event.stopImmediatePropagation();
            var data = "id=" + QuarkExtension.quarkId;

            var request = $.ajax({
                url: config.GET_DATA_QUARK_URL,
                data: data,
                type: "GET",
                xhrFields: {withCredentials: true},
                dataType: 'json',
                crossDomain:true,
                success: function (data) {
                    if (DEBUG) {
                        console.log("data: +++");
                    }
                    if (data) {
                        //get quark info
                        var hashTagValueBandView = {}; //step 1
                        var hashTagMarketingvalueBandView = {}; //Step 3
                        QuarkExtension.addValueBandHashTag(data);

                    //TODO: render data top view

                    }
                },
                error: function () {
                    if (DEBUG) {
                        console.log("ajax fail");
                    }
                }
            });

        },
        setDefaultData : function (data) {
            this.defaultData = data;
        },
        doGetQuarkDetail : function(){
        	var quarkId = prompt('Enter quark id');
            if(!$.isNumeric(quarkId)){
                alert("Must be a valid number");
                return;
            }
            this.getQuarkDetail(quarkId);
        },
        getQuarkDetail : function (quarkId, quarkClientKey, callBackFunc) {            
            if((quarkId == null || quarkId == '')  && (quarkClientKey == null || quarkClientKey == '')){
            	return;
            }
            var request = new Object();
            var that = this;
            if(quarkId){
            	request.id = quarkId;	
            }
            if(quarkClientKey){
            	request.text_quark_api_id = quarkClientKey;
            }
            
            $.ajax({
                url: config.GET_DATA_QUARK_URL,
                data: request,
                method: "GET",
                dataType: 'json',
                crossDomain: true,
                xhrFields: {withCredentials: true},
                success: function (data) {
                    try {
                        if(data['status']==true) {
                            that.quarkData = data['quarkInfo'];
                            that.loadQuarkDetail();
                            that.loadMarketingTags();
                            if(quarkId != null && quarkId != ''){
                            	that.quarkId = quarkId;
                            }
                            if(that.quarkData && that.quarkData.id){
                            	that.quarkId = that.quarkData.id;
                            }
                            that.editQuark = true;
                            if(callBackFunc){
                            	callBackFunc(true ,  that.quarkData);
                            }
                        } else {
                        	if(quarkId || quarkClientKey){
//                        		alert(data['message']);
                        		if(callBackFunc){
                                	callBackFunc(false);
                                }
                        	}else{
                        		if(callBackFunc){
                                	callBackFunc(false);
                                }
                        	}
                            
                        }
                    } catch (e){
//                        alert(e);
                    }
                },
                error: function () {
                    alert('Get quark detail error');
                }
            })
        },
        getQuarkDetailAndCallBack : function (quarkId, quarkClientKey, callBackFunc) {            
            if((quarkId == null || quarkId == '')  && (quarkClientKey == null || quarkClientKey == '')){
            	return;
            }
            var request = new Object();
            var that = this;
            if(quarkId){
            	request.id = quarkId;	
            }
            if(quarkClientKey){
            	request.text_quark_api_id = quarkClientKey;
            }
            
            $.ajax({
                url: config.GET_DATA_QUARK_URL,
                data: request,
                method: "GET",
                dataType: 'json',
                crossDomain: true,
                xhrFields: {withCredentials: true},
                success: function (data) {
                    try {
                        if(data['status']==true) {
                            var quarkData = data['quarkInfo'];                            
                            if(callBackFunc){
                            	callBackFunc(true ,  quarkData);
                            }
                        } else {
                        	if(quarkId || quarkClientKey){
//                        		alert(data['message']);
                        		if(callBackFunc){
                                	callBackFunc(false);
                                }
                        	}else{
                        		if(callBackFunc){
                                	callBackFunc(false);
                                }
                        	}
                            
                        }
                    } catch (e){
                        alert(e);
                    }
                },
                error: function () {
                    alert('Get quark detail error');
                }
            })
        },
        doUpdateQuarkInfosToForm : function (quarkInfos,callBackFunc) {
        	if(quarkInfos && quarkInfos.id){
        		this.quarkData = quarkInfos;
                this.loadQuarkDetail();
                this.loadMarketingTags();
                this.quarkId = quarkInfos.id;
                this.editQuark = true;
                if(callBackFunc){
                	callBackFunc();
                }
        	}
        },
        resetAddQuarkForm : function(lang, callBackFunc){
        	if(this.quarkData == null){
        		this.quarkData = {};
        	}
        	this.quarkData['list_languages'] = [lang];
        	this.quarkData['language'] = [lang];
        	// this.resetValueBanddata();
        	// this.resetMarketingValueBand();
            this.resetValueBandEditRest();

        	this.emptySelectedLanguage();
        	this.emptyDefaultLanguage();
        	this.deselectAddLanguageCheckbox();
        	this.loadSelectedLanguage();
        	this.loadDefaultLanguageSpinner();
        	this.loadAddLanguageCheckbox();
        	updateLanguageList(null);
            this.loadDefaultLanguageName();
            // display sub title language this.quarkData['language']
            this.displaySubTitleLanguage(lang);
            // error, load new form, expect : use form avaiable
            this.resetBand();
            //this.deleteAndShowBandlanguage(lang);
            //display alert no hash tag
            this.displayAlertNoHastag();

        	this.quarkId = null;
        	this.editQuark = false;
        	this.quarkData = null;
        	if(callBackFunc){
        		callBackFunc();
        	}
        },
        /**
         * reset value band
         */
        resetValueBandEditRest : function(){
            var band = $("[band_section]");
            if (band) {
                for (var i = 0; i < band.length; i ++) {
                    $(band[i]).find(".langue_title").attr("style","display: inline;");
                    var domMarketingList = $(band[i]).find('.admin_tags_right_content');

                    domMarketingList.find(".admin_tags_ask_item").remove();

                    var domValuebandList = $(band[i]).find(".admin_form_add");
                    domValuebandList.find('.admin_tags_ask_item').remove();
                }
            }
        },

        displayAlertNoHastag : function () {
            $(".admin_tags_right_note.no_tag_alert").show();
        },

        displaySubTitleLanguage : function (lang) {
            // display all sub title
            var titleSub = $(".admin_form_step_title");
            var spanSubTitle = $(titleSub).find(".sub_title_language");
            $(spanSubTitle).hide();
            // find select language
            var selector = ".sub_title_language.langue_title_" + lang;
            $(titleSub).find(selector).show();
        },

        loadQuarkDetail: function () {
            this.loadQuarkLanguage();
            this.loadBandTemplate();
            this.loadValueBandData();
            this.loadMarketingValueBandData();
            //set sub language display
            var lang = QuarkExtension.getLangCodeActive();
            if (DEBUG) {
                console.log("loadDataAddQuark: lang = " + lang );
                console.log("gQuarkConstant.lang = " + gQuarkConstant.lang );
            }
            QuarkExtension.displaySubTitleLanguage(lang);
        },
        loadQuarkLanguage: function () {
            this.emptySelectedLanguage();
            this.emptyDefaultLanguage();
            this.deselectAddLanguageCheckbox();
            this.loadSelectedLanguage();
            this.loadDefaultLanguageSpinner();
            this.loadAddLanguageCheckbox();
            updateLanguageList(null);
            this.loadDefaultLanguageName();
        },
        emptySelectedLanguage: function () {
            this.selectedLangSpinner.find('li').remove();
            this.selectedLangSpinner.parent().find('.ddTitle').remove();
        },
        emptyDefaultLanguage : function () {
            this.defaultLanguageSpiner.find('li').remove();
            this.defaultLanguageSpiner.parent().find('.ddTitle').remove();
        },
        deselectAddLanguageCheckbox: function () {
            this.addLanguageSpiner.find('input').prop('checked',false);
        },
        loadSelectedLanguage : function () {
            var selectedLangHtmlTemplate =
                jQuery.validator.format('<li class="enabled" data-code="{0}"><span class="ddTitleText">{1}</span> </li>');
            try{
                var listLanguages = this.quarkData['list_languages'];
                var activeLangName;
                for(var i = 0;i<listLanguages.length;i++){
                    var langName = $(this.addLanguageSpiner.find('input[data-code='+listLanguages[i]+']')).attr('data-name');
                    if(i==0){
                        activeLangName = langName;
                    }
                    this.selectedLangSpinner.append(selectedLangHtmlTemplate(listLanguages[i],langName));
                }
                this.selectedLangSpinner.find('li').eq(0).addClass('selected');
                var selectedLangTitleTemplate = jQuery.validator.format(
                                    '<div class="ddTitle">'
                                    +'<span class="arrow"></span>'
                                    +'<span class="ddTitleText bold no_value_gray"><span class="ddTitleText">{0}</span>'
                                    +'</span>'
                                    +'</div>');
                this.selectedLangSpinner.parent().prepend(selectedLangTitleTemplate(activeLangName));
                $("#language_quark li").on('click', function(event) {
                    event.preventDefault();
                    aciontChangeLanguage($(this).attr('data-code'));
                });
            } catch (e){
                alert(e);
            }
        },
        loadDefaultLanguageSpinner : function () {
            var defaultLangHtmlTemplate =
                jQuery.validator.format('<li class="enabled" data-code="{0}"><span class="ddTitleText">{1}</span> </li>');
            try{
                var listLanguages = this.quarkData['list_languages'];
                //hardcode
                if(this.quarkData['language']==null){
                    this.quarkData['language'] = listLanguages[0];
                }
                for(var i = 0;i<listLanguages.length;i++){
                    var langName = $(this.addLanguageSpiner.find('input[data-code='+listLanguages[i]+']')).attr('data-name');
                    this.defaultLanguageSpiner.append(defaultLangHtmlTemplate(listLanguages[i],langName));
                }
                this.defaultLanguageSpiner.find('li').eq(0).addClass('selected');
            } catch (e){
                alert(e);
            }
        },
        loadDefaultLanguageName : function () {
            var listLanguages = this.quarkData['list_languages'];
            var activeLangName = null;
            //hardcode
            if(this.quarkData['language']==null){
                this.quarkData['language'] = listLanguages[0];
            }
            for(var i = 0;i<listLanguages.length;i++){
                var langName = $(this.addLanguageSpiner.find('input[data-code='+listLanguages[i]+']')).attr('data-name');
                if(listLanguages[i]==this.quarkData['language']){
                    activeLangName = langName;
                }
            }
            var selectedLangTitleTemplate = jQuery.validator.format(
                '<div class="ddTitle">'
                +'<span class="arrow"></span>'
                +'<span class="ddTitleText bold no_value_gray"><span class="ddTitleText">{0}</span>'
                +'</span>'
                +'</div>');
            this.defaultLanguageSpiner.parent().prepend(selectedLangTitleTemplate(activeLangName));
        },
        loadAddLanguageCheckbox : function () {
            try{
                var listLanguages = this.quarkData['list_languages'];
                this.addLanguageSpiner.find('input').each(function () {
                    var flagChecked = false;
                    for (var i = 0; i < listLanguages.length; i++) {
                        if ($(this).attr('data-code') == listLanguages[i]) {
                            flagChecked = true;
                        }
                    }
                    if(flagChecked){
                        $(this).prop('checked',true);
                    }
                });
            } catch (e){
                alert(e);
            }
        },
        deleteAndShowBandlanguage : function(lang) {
            //select 2 div contain band
            // .value_band_content step 1;
            // .marketing_value_band_content step 3
            // parent : .addQuarkFormId // div parent
            // find id, result is array ha one element
            var parentForm = $("#addQuarkFormId");
            var areasStepOne = $(parentForm).find('.value_band_content');
            var areasStepThree = $(parentForm).find('.marketing_value_band_content');
            // delete other form
            //band step 1 other language no choose
            $(areasStepOne).find("[band_section]").each(function (index) {
                if ($(this).attr('band_section') != lang) {
                    $(this).remove();
                }
            });
            //step 3
            $(areasStepThree).find("[band_section]").each(function (index) {
                if ($(this).attr('band_section') != lang) {
                    $(this).remove();
                }
            });

            //display band select language
            var bandSelectOne = $(areasStepOne).find("[band_section='" + lang + "']");
            $(bandSelectOne).show();
            //step 3
            var bandSelectThree = $(areasStepThree).find("[band_section='" + lang + "']");
            $(bandSelectThree).show();
        },
        resetBand : function(callBack){
        	 this.container.find("[band_section]").remove();
             var listLanguages = this.quarkData['list_languages'];
             var numLang = 0;
             if(listLanguages && listLanguages.length){
             	numLang = listLanguages.length;
             }
             if(numLang == 0){
             	if(callBack ){
         			try {
 						callBack();
 					} catch (e) {
 						// TODO: handle exception
 					}
         		}
             	return;
         	}
             var currentComplete = 0;
             var loadBandComplete = function(){            	
             	currentComplete ++;
             	if(numLang == currentComplete){
             		if(callBack ){
             			try {
 							callBack();
 						} catch (e) {
 							// TODO: handle exception
 						}
             		}
             	}
             }
        },

        loadBandTemplate : function (callBack) {
            //remove old band section
            this.container.find("[band_section]").remove();
            var listLanguages = this.quarkData['list_languages'];
            var numLang = 0;
            if(listLanguages && listLanguages.length){
            	numLang = listLanguages.length;
            }
            if(numLang == 0){
            	if(callBack ){
        			try {
						callBack();
					} catch (e) {
						// TODO: handle exception
					}
        		}
            	return;
        	}
            var currentComplete = 0;
            var loadBandComplete = function(){            	
            	currentComplete ++;
            	if(numLang == currentComplete){
            		if(callBack ){
            			try {
							callBack();
						} catch (e) {
							// TODO: handle exception
						}
            		}
            	}
            }
            try{
                for(var i = 0;i<listLanguages.length;i++){
                    addValueband(listLanguages[i],false, loadBandComplete);
                }

            } catch (e){
                alert(e);
            }
        },
        loadValueBandData: function () {
            try{
                var listLanguages = this.quarkData['list_languages'];
                for(var i = 0;i<listLanguages.length;i++){
                    var value_lang = listLanguages[i];
                    var sectionBand = this.valueBandContent.find('[band_section="'+value_lang+'"]');
                    //sectionBand.find('.langue_title_'+value_lang).attr('style','display: inline;');
                    var domValuebandList = sectionBand.find('.admin_form_add');
                    var domRecentlyBand = sectionBand.find('.admin_form_res_bot');
                    var valuebandtags = this.quarkData['translations'][value_lang]['list_value_band_view'];
                    var band = 'value_bands_data';
                    var htmlvalueband = '';
                    if (valuebandtags.length>0) {
                        domValuebandList.find('.admin_tags_right_note.no_tag_alert').hide();
                        for (var j = 0; j < valuebandtags.length; j++) {
                            var hashtag = valuebandtags[j];
                            var select_item = '<div class="admin_tags_ask_item" data-name="' + hashtag.display_name + '" selected_item="' + hashtag.value_name + '" data-lang="' + value_lang + '">' + hashtag.display_name + '<i class="qa qa-page-close" i_close></i>' +
                                '<input band_input="' + value_lang + '" type="hidden" name="Quark[translations][' + value_lang + '][' + band + '][]" value="' + hashtag.value_name + '"></div>';
                            htmlvalueband += select_item;
                            //hide recently value band duplicate
                            domRecentlyBand.find('[data-value="'+hashtag.value_name+'"]').attr('style', 'display: none;');
                        }
                    } else {
                    }
                    domValuebandList.append(htmlvalueband);
                }

            } catch (e){
                alert(e);
            }
        },
        resetValueBanddata : function(){
        	 var listLanguages = this.quarkData['list_languages'];
        	 for(var i = 0;i<listLanguages.length;i++){
                 var value_lang = listLanguages[i];
                 var sectionBand = this.valueBandContent.find('[band_section="'+value_lang+'"]');
                 //sectionBand.find('.langue_title_'+value_lang).attr('style','display: inline;');
                 var domValuebandList = sectionBand.find('.admin_form_add');
                 var domRecentlyBand = sectionBand.find('.admin_form_res_bot');                          
                 domValuebandList.find('.admin_tags_ask_item').remove();
             }
        },
        loadMarketingValueBandData : function () {
            try{
                var listLanguages = this.quarkData['list_languages'];
                for(var i = 0;i<listLanguages.length;i++){
                    var value_lang = listLanguages[i];
                    var sectionBand = this.marketingContent.find('[band_section="'+value_lang+'"]');
                    sectionBand.find('.langue_title_'+value_lang).attr('style','display: inline;');
                    var domMarketingList = sectionBand.find('.admin_tags_right_content');
                    var marketingtags = this.quarkData['translations'][value_lang]['list_marketing_value_band_view'];
                    var band = 'marketing_value_bands_data';
                    var htmlmarketing = '';
                    if (marketingtags.length>0) {
                        domMarketingList.find('.admin_tags_right_note.no_tag_alert').hide();
                        for (var j = 0; j < marketingtags.length; j++) {
                            var hashtag = marketingtags[j];
                            var select_item = '<div class="admin_tags_ask_item" data-value="' + hashtag.value_name + '" selected_item="' + hashtag.value_name + '" data-lang="' + value_lang + '">' + hashtag.display_name + '<i class="qa qa-page-close" i_close></i>' +
                                '<input band_input="' + value_lang + '" type="hidden" name="Quark[translations][' + value_lang + '][' + band + '][]" value="' + hashtag.value_name + '"></div>';
                            htmlmarketing += select_item;
                        }
                    } else {
                    }
                    domMarketingList.append(htmlmarketing);
                }

            } catch (e){
                alert(e);
            }
        },
        resetMarketingValueBand : function(){
        	 var listLanguages = this.quarkData['list_languages'];
             for(var i = 0;i<listLanguages.length;i++){
                 var value_lang = listLanguages[i];
                 var sectionBand = this.marketingContent.find('[band_section="'+value_lang+'"]');
                 sectionBand.find('.langue_title_'+value_lang).attr('style','display: inline;');
                 var domMarketingList = sectionBand.find('.admin_tags_right_content');
                 
                 domMarketingList.find('.admin_tags_ask_item').remove();
             }
        },
        /**
         * Add value band hash tag
         * @param e
         */
        addValueBandHashTag : function (data) {
            var quarkInfo = data.quarkInfo;
            var isStep1 = false;

            var aresStep1 = $(document).find('.admin_step.step1');
            var areasSectionBandSt1 = aresStep1.find('[select_band]');

            var aresStep3 = $(document).find('.admin_step.step3');
            var areasSectionBandSt3 = aresStep3.find('[select_band]');

            for (var attrName in quarkInfo) {
                if (quarkInfo.hasOwnProperty(attrName)) {
                    //hard code : div en

                    var translations = quarkInfo[attrName];

                    if (attrName != jsonPropertyName.TRANSLATIONS) {
                        continue;
                    }
                    //for each language
                    for (var language in translations) {
                        if (translations.hasOwnProperty(language)) {
                            var valueBand = translations[language];

                            for (var valueName in valueBand) {
                                if (!valueBand.hasOwnProperty(valueName)) {
                                    continue;
                                }
                                // each language
                                // find div contain language
                                var isStep1 = false;

                                var var_band;
                                // contain value band
                                var valueContain = valueBand[valueName];

                                if (valueName == jsonPropertyName.LIST_VALUE_BAND_VIEW) {
                                    var_band = var_band_name;
                                    isStep1 = true;
                                } else if (valueName == jsonPropertyName.LIST_MARKETING_VALUE_BAND) {
                                    var_band = 'marketing_value_bands_data';
                                } else {
                                    continue;
                                }
                                for (var item in valueContain) {
                                    if (valueContain.hasOwnProperty(item)) {
                                        var value_name = valueContain[item].value_name;
                                        var lang = language;
                                        var name = valueContain[item].display_name;


/*                                        var select_item = '<div class="admin_tags_ask_item" data-name="' + value_name + '" selected_item="' + value_name + '" data-lang="' + lang + '">' + name + '<i class="qa qa-page-close" i_close></i>' +
                                            '<input band_input="' + lang + '" type="hidden" name="Quark[translations][' + lang + '][' + var_band + '][]" value="' + value_name + '"></div>';*/

                                        var select_item = '<div class="admin_tags_ask_item" data-name="' + name + '" selected_item="' + value_name + '" data-lang="' + lang + '">' + name + '<i class="qa qa-page-close" i_close></i>' +
                                            '<input band_input="' + lang + '" type="hidden" name="Quark[translations][' + lang + '][' + var_band + '][]" value="' + value_name + '"></div>';

                                        if (isStep1) {
                                            areasSectionBandSt1.append(select_item);
                                            areasSectionBandSt1.find('.admin_tags_right_note.no_tag_alert').attr('style', 'display : none');
                                        } else {
                                            areasSectionBandSt3.append(select_item);
                                            areasSectionBandSt3.find('.admin_tags_right_note.no_tag_alert').attr('style', 'display : none');
                                        }
                                    }
                                }
                            }

                        }
                    }
                    //else ajax html
                }
            }
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
            if (!band_section.attr('data-step3')) {
                // hash tag marketting tag load process
                this.loadMarketingTags();
            }
            QuarkExtension.checkShowAleartMarketingTagWhenAddRecentTag();
        },
        /**
         * remove hash tag by click 'x'
         * @param e
         */
        removeHashTag: function(e) {
            if (DEBUG) {
                console.log("remove HashTag");
            }
            var $targetIClose = $(e.target).closest('[i_close]');

            var item = $($targetIClose).closest('[selected_item]');
            var name = item.attr('selected_item');
            name = checkFindValue(name);
            //name = checkHashtag(name);
            // if name has marketing_value_bands_data, no load marketting tag
            var parent = $(e.target).closest("div");
            var $input = $(parent).find("input");
            var nameInput = $($input).attr("name");

            item.closest('[band_section]').find('[recent_item="' + name + '"]').show();
            item.remove();
            checkAddedTag();
            //check for load hastah marketing
            if (nameInput.indexOf("marketing_value_bands_data") > 0) {
                //TODO: my suft , step 3
            } else { // step 1
                QuarkExtension.loadMarketingTags();
            }
            QuarkExtension.checkShowAleartMarketingTagWhenAddRecentTag();
        },

        denyCharSpecial: function(e) {
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
            var $target = $(e.target).closest('[input_section]');
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
                upDownSelection($($target), band_section.find('[list_search_band_section]'), key);
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
                xhrFields: {withCredentials: true},
                data: {q: q, type: type, language: lang},
                success: function (result) {
                    var $ele = band_section.find('[list_search_band_section]');
                    $ele.html('');
                    $ele.hide();
                    if (!result || !result.data || !result.data.length) {
                        var no_cate = '';
                        if (cat == '') {
                            no_cate = 'no_cate_band';
                        }
                        var htm = '<div ' + no_cate + ' search_item new_band_item class="indexbar admin_form_dropdown_bot" ' + 'data-name="' + q + '">' +
                            '<div class="admin_form_dropdown_bot_label">' + result.lang_noti + ':</div>' +
                            '<span class="text_black">' + q + '</span></div>';
                        band_section.find('[list_search_band_section]').append(htm);
                        $ele.show();
                    }else{
                    	for (var i = 0; i < result.data.length; i++) {
                            var name = result.data[i].name;
                            var count = result.data[i].count;
                            var htm = '<li class="ritm"' + '" data-name="' + name + '"' + ' search_item>' +
                                '<div class="rtx" data-lang="' + lang + '">' + name + '<span class="mq">' + count + '</span></div>' +
                                '</li>';
                            band_section.find('[list_search_band_section]').append(htm);
                            $ele.show();
                        }
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
            // hide search div
            $($targetParent).parent('ul').hide();
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
        addHashTagWhenClickSuffix : function(e) {
            if(DEBUG) {
                console.log("addHashTagWhenClickSuffix");
            }
            var band_section = $(e.target).closest('[band_section]');
            var lang = band_section.attr('band_section');
            var current_cate_name = band_section.find('[cate_band_section]').find('li.selected').data('name');
            if (current_cate_name == '')
                return false;
            var q = band_section.find('[input_section]').val();
            if (q != '') {
                selectValueBand(band_section);
            }
        },

        //todo:
        addQuark : function(e) {
            var code = $(this).data('code');
            code = code.trim();
            var name = $(this).data('name');
            var url = $('#links').data('change_lang_url');
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
        getCurUserId : function () {
            $.ajax({
                type: "GET",
                url: config.GET_PROFILE_URL,
                xhrFields: {
                    withCredentials: true
                },
                crossDomain: true,
                success : function(data){
                    var userId = JSON.parse(data)['model']['id'];
                    alert(userId);
                }
            });
        },
        doAddEditQuark: function (e) {
        	this.addEditQuark();
        },
        addEditQuark: function (clientKey, callBack) {
            try{
                this.initAndValidateData();
                //do add quark
                var url;
                if(this.editQuark){
                    url = config.EDIT_QUARK_URL;
                    this.quarkData.id = this.quarkId;
                } else {
                    url = config.ADD_QUARK_URL;
                }
                if(clientKey){
                	this.quarkData.text_quark_api_id = clientKey;
                }
                $.ajax({
                    type: "POST",
                    url: url,
                    xhrFields: { withCredentials: true   },
                    crossDomain: true,
                    data: this.quarkData,
                    success : function(data){
//                    	alert(data);
                    	if(callBack){
                    		try {
								callBack(data);
							} catch (e) {
								// TODO: handle exception
							}
                    	}
                    }
                });
            } catch (e){
                alert(e);
            }
        },
        initAndValidateData: function () {
            // this.quarkData.quarkType = '';
            //init valueband data
            // var valueBandTagList = this.valueBandContent.find('.admin_form_add[select_band]');
            // for(var i = 0;i<valueBandTagList.length;i++){
            //     var valueBand = $(valueBandTagList[i]).attr('selected_item');
            //     this.quarkData..push(valueBand);
            // }
            validateEditQuark();
            var resp = this.validateData();
            if(resp['status']==false){
                throw resp['message'];
            }
            var oldQuarkData = this.quarkData;
            this.quarkData = new Object();
            var quarkInputs = $('#quark_form').find('input[type=hidden]');

            /*for (var i = 0;i<quarkInputs.length;i++){
                var $quarkInput = $(quarkInputs[i]);
                var quarkInputName = $quarkInput.attr('name').replace('Quark','');
                var quarkInputVal = $quarkInput.attr('value');
                var matcher = quarkInputName.match(/(\[[A-Za-z0-9_]*\])/g);
                var curData = this.quarkData;
                for(var j=0;j<matcher.length;j++){
                    var prefix = matcher[j].replace('[','').replace(']','').trim();
                    if(prefix.length>0) {
                        if(j==matcher.length-1){
                            curData[prefix] = quarkInputVal;
                            break;
                        } else {
                            curData[prefix] = new Object();
                        }
                        curData = curData[prefix];
                    } else {
                        curData.push(quarkInputVal);
                        break;
                    }
                }
                this.quarkData = curData;
            }*/

            for (var i = 0;i<quarkInputs.length;i++){
                var $quarkInput = $(quarkInputs[i]);
                var quarkInputName = $quarkInput.attr('name').replace('Quark','').replace('[','').replace(']','');
                var quarkInputVal = $quarkInput.attr('value');
//                if(quarkInputName.length > 2 && !quarkInputName.includes("list_languages")) {
                if(quarkInputName.length > 2 && quarkInputName.indexOf("list_languages") < 0) {
                    if (quarkInputName.substring(quarkInputName.length - 2, quarkInputName.length) == '[]') {
                        if(this.quarkData[quarkInputName]==null){
                            this.quarkData[quarkInputName] = new Array();
                        }
                        this.quarkData[quarkInputName].push(quarkInputVal);
                    } else {
                        this.quarkData[quarkInputName] = quarkInputVal;
                    }
                }
            }
            //hard code
            
            this.initDefaultData();
            // this.quarkData.language = 'en';
            //find all language
            // var $languageContent = this.container.find('#language_quark').find('li');
            // var languageCodes = new Array();
            // for(var k = 0;k<$languageContent.length;k++){
            //     languageCodes.push($languageContent.eq(k).attr('data-code'));
            // }
            // //hardcode
            // this.quarkData.translations = new Object();
            // for(var k = 0;k<languageCodes.length;k++){
            //     this.quarkData.translations[languageCodes[k]] = new Object();
            //     this.quarkData.translations[languageCodes[k]].title = 'testQuark';
            //     this.quarkData.translations[languageCodes[k]].description = 'testDes';
            //     this.quarkData.translations[languageCodes[k]].product_status = 'new';
            //     this.quarkData.translations[languageCodes[k]].show_info = '1';
            // }
            //fix default language
            // this.quarkData.language = $(this.defaultLanguageSpiner.find('li.selected')).attr('data-code');
            /*if(this.editQuark){
                for(var i = 0;i<oldQuarkData['list_languages'].length;i++){
                    var lang = oldQuarkData['list_languages'][i];
                    this.quarkData['translations['+lang+'][old_value_bands_data][]'] = new Array();
                    this.quarkData['translations['+lang+'][old_marketing_value_bands_data][]'] = new Array();
                    // var oldValuebandVal = oldQuarkData['translations['+lang+'][value_bands_data][]'];
                    var oldValuebandVal = oldQuarkData['translations'][lang]['value_bands_data'];
                    for(var j = 0;j<oldValuebandVal.length;j++){
                        this.quarkData['translations['+lang+'][old_value_bands_data][]'].push(oldValuebandVal[j])
                    }
                    var oldMarketingValuebandVal = oldQuarkData['translations'][lang]['marketing_value_bands_data'];
                    for(var j = 0;j<oldMarketingValuebandVal.length;j++){
                        this.quarkData['translations['+lang+'][old_marketing_value_bands_data][]'].push(oldMarketingValuebandVal[j])
                    }
                }
            }*/
        },
        doGetListLangInfos : function(){
        	var listLangs = {};
        	 var quarkInputs = $('#quark_form').find('input[type=hidden]');

             for (var i = 0;i<quarkInputs.length;i++){
                 var $quarkInput = $(quarkInputs[i]);
                 var quarkInputName = $quarkInput.attr('name').replace('Quark','').replace('[','').replace(']','');
                 var quarkInputVal = $quarkInput.attr('value');
                 if(quarkInputName.length > 2 && quarkInputName.indexOf("list_languages") < 0 && 'default_lang' == quarkInputName) {
                     if ( quarkInputName.substring(quarkInputName.length - 2, quarkInputName.length) == '[]') {
                         if(listLangs[quarkInputName]==null){
                        	 listLangs[quarkInputName] = new Array();
                         }
                         listLangs[quarkInputName].push(quarkInputVal);
                     } else {
                    	 listLangs[quarkInputName] = quarkInputVal;
                     }
                 }
             }
             var $languageContent = this.container.find('#language_quark').find('li');
             var languageCodes = new Array();
             for (var k = 0; k < $languageContent.length; k++) {
                 languageCodes.push($languageContent.eq(k).attr('data-code'));
             }
             if(languageCodes){
            	 listLangs['list_langs'] = languageCodes;
             }
             return listLangs;
        },
        validateData : function () {
            var valuebandContent = this.container.find('.value_band_content').find('[band_section]');
            for(var i = 0;i<valuebandContent.length;i++){
                if(valuebandContent.eq(i).find('input[band_input]').length == 0){
                    return {
                        status: false,
                        error: errorLog.INVALID_VALUE_BAND,
                        message: ALERT_select_value_band
                    }
                }
            }
            var marketingValuebandContent = this.container.find('.marketing_value_band_content').find('[band_section]');
            for(var i = 0;i<marketingValuebandContent.length;i++){
                if(marketingValuebandContent.eq(i).find('input[band_input]').length == 0){
                    return{
                        status:false,
                        error:errorLog.INVALID_MARKETING_VALUE_BAND,
                        message: ALERT_select_marketing_value_band
                    }
                }
            }
            return{
                status:true,
                error:''
            }
        },
        initDefaultData : function () {
            // this.quarkData.type = this.defaultData['type'];
            try {
                // this.setDefaultData(this.testdata);
                this.quarkData.type = 'blog';
                this.quarkData.photos = new Array();
                for(var i = 0;i<this.defaultData['photo'].length;i++) {
                    this.quarkData.photos.push(this.defaultData['photo'][i]);
                }
                var $languageContent = this.container.find('#language_quark').find('li');
                var languageCodes = new Array();
                for (var k = 0; k < $languageContent.length; k++) {
                    languageCodes.push($languageContent.eq(k).attr('data-code'));
                }
                //hardcode
                this.quarkData.translations = new Object();
                for (var k = 0; k < languageCodes.length; k++) {
                    this.quarkData.translations[languageCodes[k]] = new Object();
                    this.quarkData.translations[languageCodes[k]].title = this.defaultData[languageCodes[k]]['title'];
                    this.quarkData.translations[languageCodes[k]].description = this.defaultData[languageCodes[k]]['description'];
                    // this.quarkData.translations[languageCodes[k]].product_status = this.defaultData['product_status'];
                    // this.quarkData.translations[languageCodes[k]].show_info = this.defaultData['show_info'];
                }
            } catch (e){
                // alert('Add quark error');
                throw ALERT_language_not_support;
            }
        }

    });

    $.fn.resetCombobox = function () {
//        $(this).jqCombobox();
    	$(this).jqComboboxReset();
    };

    //create object global
    window.QuarkExtension = QuarkExtension;
    $(document).ready(function () {
        var quark = QuarkExtension.init();
    });
    function removeSpaces(string) {
        return string.split(' ').join('');
    }

}(jQuery));

