define([],
    function() {

        return {
            "token_name"        :   "kalori_token",
            "cookie_username"   :   "username",
            "login"             :   "login",
            "hash"              :   "#",
            "base_link"         :   "http://178.62.152.217:3000",
            "page_size"         :   10,
            "user"              :   "user",
            "error"             :   {
                "bad_token" : "bad_token",
                "wrong_username_or_password" : "wrong_username_or_password",
                "not_activated" : "not_activated",
                "not_found"     : "not_found",
                "validation_failed" : "validation_failed"
            },
            "info"              :   {
                "success" : "success",
                "activate_success" : "activate_success",
                "register_success" : "register_success",
                "empty_user"       : "Kullanıcınız bulunmamaktadır."
            }
        };

    }
);