
//首页轮播
$(function(){
    var t = n = 0, count = $(".scroll_show a").size();
    $(".scroll_show a:not(:first-child)").hide();
    $(".scroll_text").html($(".scroll_show a:first-child").find("img").attr('alt'));
    $(".scroll_num a:first").css({
        "background":"url(/assets/scroll_num_a0.png)"
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
            "background":"url(/assets/scroll_num_a0.png)"
        }).siblings().css({
            "background":"url(/assets/scroll_num_a.png)"
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

$(document).ready(function(){
    if ($('#join_zz').length > 0) {
        generate_flash_div("#j_p_div");
        $('#join_zz').css('display','block');
        $('#j_p_div').show();
        $('.rember_j').bind('click',function(){
            $('#j_p_div').hide();
            $('#join_zz').hide();
            if (getCookie("user_id") != null) {
                setCookie("never_j", "yes", 2592000000, '/');
            }
            return false;
        })
    } else if ($("#j_t_div").length > 0) {
        generate_flash_div("#j_t_div");
        $('#j_t_zz').css('display','block');
        $('#j_t_div').show();
    } else {
        generate_flash_div("#complete_info");
        $('#first_zhez').css('display','block');
        $('#complete_info').css('display','block');
        $('.xx_x').bind('click',function(){
            $('#complete_info').hide();
            $('#first_zhez').hide();
            delCookie("first");
            return false;
        })
    } 
})

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
        $(ele).attr("name",name);
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
    var div = create_element("div",null,"flash_notice","tishi_tab border_radius",null,null);
    div.innerHTML+="<span class='xx_x' onclick='javascript:close_tishi_tab();'><img src='/assets/xx.png' /></span>";
    var p = create_element("p","","","","innerHTML");
    p.innerHTML = str;
    div.appendChild(p);
    var body = jQuery("body");
    body.append(div);
    show_flash_div();
}

//关闭提示框
function close_tishi_tab(){
    $(".tishi_tab").remove();
}

//将弹出层放置在页面中间
function show_div(id){
    var scolltop = document.body.scrollTop|document.documentElement.scrollTop;
    var win_height = document.documentElement.clientHeight;//jQuery(document).height();
    var win_width = jQuery(window).width();
    var z_layer_height = jQuery(id).height();
    var z_layer_width = jQuery(id).width();
    $(id).css('top',(win_height-z_layer_height)/2);
    $(id).css('left',(win_width-z_layer_width)/2);
    $(".zhezhao").css('display','');
    $(id).css('display','block');
}

//验证
function new_p_form() {
    var info = {};
    var invit_code = $("#invit_code").val();
    var username = $("#username").val();
    var email = $("#email").val();
    if (invit_code == null || checkspace(invit_code)) {
        tishi_alert("请您填写授权码。");
        return false;
        
    }
    if (username == null || checkspace(username)) {
        tishi_alert("请您填写您的姓名。");
        return false;
    }
    if (email == null || checkspace(email)) {
        tishi_alert("请您填写您的邮箱。");
        return false;
    }
    info["invit_code"]=$("#invit_code").val();
    info["username"]=$("#username").val();
    info["school"]=$("#school").val();
    info["email"]=$("#email").val();
    info["category_id"] = $(".tz_input_ra:checked").val();
    $.ajax({
        async:true,
        dataType:'json',
        data:{
            info:info
        },
        url:"/study_plans/join",
        type:'post',
        success : function(data) {            
            if (data.message == "") {
                window.location.href = "/study_plans?category=" + $(".tz_input_ra:checked").val();
            } else {
             tishi_alert(data.message);
             if (data.message.length > 14) {
                $('#j_t_div').hide();
                $('#j_t_zz').hide();
                setCookie("never_j", "yes", 2592000000, '/');
             }
            }
        }
    });
    return false;

}

function checkspace(checkstr){
    var str = '';
    for(var i = 0; i < checkstr.length; i++) {
        str = str + ' ';
    }
    if (str == checkstr){
        return true;
    } else{
        return false;
    }
}