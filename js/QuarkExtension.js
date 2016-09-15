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

        },
    });
    //create object global
    window.QuarkExtension = QuarkExtension;
    
}(jQuery));
