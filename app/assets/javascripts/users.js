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


function show_detail(date,out_no,name,fee,remark){
    $("#date").html(date);
    $("#out_no").html(out_no);
    $("#name").html(name);
    $("#remark").html(remark);
    $("#fee").html(fee);
    show_div(".mess_tab");
}

function load_email(){
    $.ajax({
        async:true,
        dataType:'script',
        url:"/users/email_info",
        type:'get'
    });
    return false;
}

function load_message(){
    $.ajax({
        async:true,
        dataType:'script',
        url:"/users/mess_info",
        type:'get'
    });
    return false;
}

function get_record(){
    $.ajax({
        async:true,
        dataType:'script',
        url:"/users/record_info",
        type:'get'
    });
    return false;
}

//提示框样式设定
function generate_flash_div(style) {
    var scolltop = document.body.scrollTop|document.documentElement.scrollTop;
    var win_height = document.documentElement.clientHeight;//jQuery(document).height();
    var win_width = jQuery(window).width();
    var z_layer_height = jQuery(style).height();
    var z_layer_width = jQuery(style).width();
    jQuery(style).css('top',(win_height-z_layer_height)/2 + scolltop);
    jQuery(style).css('left',(win_width-z_layer_width)/2);
    jQuery(style).css('display','block');
}

//提示框弹出层
function show_flash_div() {
    $('.tishi_tab').stop();
    generate_flash_div(".tishi_tab");
    $('.tishi_tab').delay(2500).fadeTo("slow",0,function(){
        $(this).remove();
    });
}

//创建元素
function create_element(element, name, id, class_name, type, ele_flag) {
    var ele = document.createElement("" + element);
    if (name != null)
        ele.name = name;
    if (id != null)
        ele.id = id;
    if (class_name != null)
        ele.className = class_name;
    if (type != null)
        ele.type = type;
    if (ele_flag == "innerHTML") {
        ele.innerHTML = "";
    }
    else {
        ele.value = ele_flag;
    }
    return ele;
}

//弹出错误提示框
function tishi_alert(str){
    var div = create_element("div",null,"flash_notice","tishi_tab",null,null);
    var p = create_element("p","","","","innerHTML");
    p.innerHTML = str;
    div.appendChild(p);
    var body = jQuery("body");
    body.append(div);
    show_flash_div();
}

function delete_email(){
    if ($('#email_check input:checked').length==0){
        tishi_alert("请选择删除对象");
        return false;
    }
    var ids=[];
    var all_emails=$('#email_check input:checked');
    for(var i=0;i<=all_emails.length-1;i++){
        ids.push(parseInt(all_emails[i].value));
    }
    $.ajax({
        async:true,
        dataType:'json',
        data:{
            ids:ids
        },
        url:"/users/delete_mess",
        type:'post',
        success : function(data) {
            tishi_alert(data.message)
            load_email();
        }
    });
    return false;
}

function delete_mess(){
    if ($('#mess_check input:checked').length==0){
        tishi_alert("请选择删除对象");
        return false;
    }
    var ids=[];
    var all_emails=$('#mess_check input:checked');
    for(var i=0;i<=all_emails.length-1;i++){
        ids.push(parseInt(all_emails[i].value));
    }
    $.ajax({
        async:true,
        dataType:'json',
        data:{
            ids:ids
        },
        url:"/users/delete_mess",
        type:'post',
        success : function(data) {
            tishi_alert(data.message)
            load_message();
        }
    });
    return false;
}

function accredit(){
    if($("#invit_code").val()==""||$("#invit_code").val()==null){
        tishi_alert("请输入邀请码");
        return false;
    }
    $.ajax({
        async:true,
        dataType:'json',
        data:{
            info:$("#invit_code").val()
        },
        url:"/users/accredit_check",
        type:'post',
        success : function(data) {
            $("#invit_code").val("");
            tishi_alert(data.message);
            get_record();
        }
    });
    return false;
}


function check_vip(){
    if($("#vip_style option:selected").val()==""){
        tishi_alert("请选择需要充值的产品类型。")
        return false;
    }
    $.ajax({
        async:true,
        dataType:'json',
        url:"/users/check_vip",
        data:{
            category:$("#category").val()
        },
        type:'post',
        success : function(data) {
            if(data.message){
                vip_tishi();
                window.open("/users/alipay_exercise?category="+data.category,'_blank','height=750,width=1000,left=200,top=50');
            }else{
                tishi_alert("您已是vip用户，截止日期是"+data.time);
            }
        }
    });
}

//充值弹出遮罩层及提示框
function vip_tishi(){
    var doc_height = jQuery(document).height();
    //var doc_width = $(document).width();
    var win_height = jQuery(window).height();
    var win_width = jQuery(window).width();
    var s_layer_height = jQuery('.cz_tishi').height();
    var s_layer_width = jQuery('.cz_tishi').width();
    jQuery('.zhezhao').css('display','block');
    jQuery('.zhezhao').css('height',doc_height);
    jQuery('.cz_tishi').css('top',(win_height-s_layer_height)/2)
    jQuery('.cz_tishi').css('left',(win_width-s_layer_width)/2);
    jQuery('.cz_tishi').css('display','block');
}

