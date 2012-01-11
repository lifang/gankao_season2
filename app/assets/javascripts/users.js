// JavaScript Document
$(function() {
    $('div.tab_ul li').bind('click',function(){
        $(this).addClass('hover').siblings().removeClass('hover');
        var index = $('div.tab_ul li').index(this);
        $('div.tab_box > div').eq(index).show().siblings().hide();
    });
})


//首页轮播
$(function(){
    var t = n = 0, count = $(".scroll_show a").size();
    $(".scroll_show a:not(:first-child)").hide();
    $(".scroll_text").html($(".scroll_show a:first-child").find("img").attr('alt'));
    $(".scroll_num a:first").css({
        "background":"url(images/scroll_num_a0.png)"
    });
    $(".scroll_text").click(function(){
        window.open($(".scroll_show a:first-child").attr('href'), "_blank")
    });
    $(".scroll_num a").click(function() {
        var i = $(this).text() - 1;
        n = i;
        if (i >= count) return;
        $(".scroll_text").html($(".scroll_show a").eq(i).find("img").attr('alt'));
        $(".scroll_text").unbind().click(function(){
            window.open($(".scroll_show a").eq(i).attr('href'), "_blank")
        })
        $(".scroll_show a").filter(":visible").hide().parent().children().eq(i).fadeIn(500);
        $(this).css({
            "background":"url(images/scroll_num_a0.png)"
        }).siblings().css({
            "background":"url(images/scroll_num_a.png)"
        });
    });
    function showAuto()
    {
        n = n >= (count - 1) ? 0 : ++n;
        $(".scroll_num a").eq(n).trigger('click');
    }
    t = setInterval(showAuto, 5000);
    $(".scroll_play").hover(function(){
        clearInterval(t)
    },
    function(){
        t = setInterval(showAuto, 5000);
    });
});


//将弹出层放置在页面中间
function show_div(id){
    var scolltop = document.body.scrollTop|document.documentElement.scrollTop;
    var win_height = document.documentElement.clientHeight;//jQuery(document).height();
    var win_width = jQuery(window).width();
    var z_layer_height = jQuery(id).height();
    var z_layer_width = jQuery(id).width();
    jQuery(id).css('top',(win_height-z_layer_height)/2);
    jQuery(id).css('left',(win_width-z_layer_width)/2);
    jQuery(id).css('display','block');
}