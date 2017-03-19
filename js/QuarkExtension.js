/**
 * Created by nqlong on 15-Sep-16.
 */
(function ($) {
    var QuarkExtension = {
        Default : {
            //TODO: add member for Object default
        }
        //TODO: add more member and fuction
    };
    $.extend(QuarkExtension, {
      //init data
        init : function () {
            //create member
            this.isMember = true;
            //

        },

        //setup Quark Extension event
        setupEvent : function () {
          //TODO: set up Event
          var selector = "'[input='" + value + "']";
          
          $(selector).on('click', $.proxy(this.hander, this, data));

        },
        hander : function (event, this, data) {
            
        },
    });
    //create object global
    window.QuarkExtension = QuarkExtension;
        $(document).ready(function () {
        QuarkExtension.init();
    });
}(jQuery));
