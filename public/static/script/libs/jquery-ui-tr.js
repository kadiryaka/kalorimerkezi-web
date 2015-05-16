/**
 * Created by kadiryaka on 27.04.15.
 */
jQuery(function($){
    $.datepicker.regional['tr'] = {
        closeText: 'kapat',
        prevText: '&#x3c;geri',
        nextText: 'ileri&#x3e',
        currentText: 'bugÃün',
        monthNames: ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran',
            'Temmuz','Austos','Eylül','Ekim','Kasım','Aralık'],
        monthNamesShort: ['Oca','Şub','Mar','Nis','May','Haz',
            'Tem','Agu','Eyl','Eki','Kas','Ara'],
        dayNames: ['Pazar','Pazartesi','Salı','ÇarÅŸamba','Perşembe','Cuma','Cumartesi'],
        dayNamesShort: ['Pz','Pt','Sa','Ça','Pe','Cu','Ct'],
        dayNamesMin: ['Pz','Pt','Sa','Ça','Pe','Cu','Ct'],
        dateFormat: 'dd.mm.yy', firstDay: 1,
        isRTL: false};
    $.datepicker.setDefaults($.datepicker.regional['tr']);
});