define(['jquery',
        'backbone',
        'underscore',
        'i18next',
        'view/index'],
    function($,Backbone,_,i18n,IndexView) {

        var indexView       = new IndexView()

        var that = this;
        that.current = null;

        return Backbone.Router.extend({
            routes: {
                ''                      :   'index',
                'dashboard'             :   'dashboard',
                'homepage'              :   'homepage',
                'login'                 :   'login',
                'register'              :   'register',
                'activate/:code'        :   'activate',
                'settings'              :   'settings',
                'user/profile'          :   'profile',
                'egzersizhazirla'       :   'egzersizhazirla',
                'diyethazirla'          :   'diyethazirla',
                'sifredegistir/:code'   :   'sifredegistir',
                'iletisim'              :   'iletisim',
                '*path'                 :   'default'
            },
            index: function() {
                indexView.render();
            },
            dashboard: function() {
                require(['view/dashboard'], function(DashboardView) {
                    if(that.current!==null) { that.current.close(); }
                    var dashboardView = new DashboardView();
                    dashboardView.render();
                    that.current = dashboardView;
                });
            },
            register: function() {
                require(['view/register'], function(RegisterView) {
                    if(that.current!==null) { that.current.close(); }
                    var registerView = new RegisterView();
                    registerView.render();
                    that.current = registerView;
                });
            },
            login: function() {
                require(['view/login'], function(LoginView) {
                    if(that.current!==null) { that.current.close(); }
                    var loginView = new LoginView();
                    loginView.render();
                    that.current = loginView;
                });
            },
            homepage: function() {
                require(['view/homepage'], function(HomepageView) {
                    if(that.current!==null) { that.current.close(); }
                    var homepageViev = new HomepageView();
                    homepageViev.render();
                    that.current = homepageViev;
                });
            },
            profile: function() {
                require(['view/profile'], function(ProfileView) {
                    if(that.current!==null) { that.current.close(); }
                    var profileViev = new ProfileView();
                    profileViev.render();
                    that.current = profileViev;
                });
            },
            egzersizhazirla: function() {
                require(['view/egzersizhazirla'], function(EgzersizHazirlaView) {
                    if(that.current!==null) { that.current.close(); }
                    var egzersizHazirlaView = new EgzersizHazirlaView();
                    egzersizHazirlaView.render();
                    that.current = egzersizHazirlaView;
                });
            },
            diyethazirla: function() {
                require(['view/diyethazirla'], function(DiyetHazirlaView) {
                    if(that.current!==null) { that.current.close(); }
                    var diyetHazirlaView = new DiyetHazirlaView();
                    diyetHazirlaView.render();
                    that.current = diyetHazirlaView;
                });
            },
            sifredegistir: function(code) {
                require(['view/sifredegistir'], function(SifreDegistirView) {
                    if(that.current!==null) { that.current.close(); }
                    var sifreDegistirView = new SifreDegistirView();
                    sifreDegistirView.render(code);
                    that.current = sifreDegistirView;
                });
            },
            iletisim: function(code) {
                require(['view/iletisim'], function(IletisimView) {
                    if(that.current!==null) { that.current.close(); }
                    var iletisimView = new IletisimView();
                    iletisimView.render(code);
                    that.current = iletisimView;
                });
            },
            default: function() {
                require(['view/error'], function(ErrorView) {
                    if(that.current!==null) { that.current.close(); }
                    var errorView = new ErrorView();
                    errorView.render();
                    that.current = errorView;
                });
            }
        });

    }
);