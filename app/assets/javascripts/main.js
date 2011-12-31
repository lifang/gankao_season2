// JavaScript Document
//jQuery(window).height()代表了当前可见区域的大小，而jQuery(document).height()则代表了整个文档的高度，可视具体情况使用注意当浏览器窗口大小

//控制做题页面主体高度
$(function(){
    // var doc_height = $(document).height();
    //var doc_width = $(document).width();
    var win_height = $(window).height();
    //var win_width = $(window).width();
    var head_height = $(".head").height();
    var mainTop_height = $(".m_top").height();
    var foot_height = $(".foot").height();

    var main_height = win_height-(head_height+mainTop_height+foot_height);
    $(".m_side").css('height',main_height-12);//12为head的padding的12px
    $(".main").css('height',main_height-12+34);//34是m_top的高度，
})

//控制其他页面主体高度
$(function(){
    // var doc_height = $(document).height();
    //var doc_width = $(document).width();
    var win_height = $(window).height();
    //var win_width = $(window).width();
    var head_height = $(".head").height();
    var foot_height = $(".foot").height();

    var main_height = win_height-(head_height+foot_height);
    $(".main_Div").css('height',main_height-12);
})


//tooltip提示
$(function(){
    var x = -20;
    var y = 15;
    $(".tooltip").mouseover(function(e){
        var tooltip = "<div class='tooltip_box'><div class='tooltip_t'></div><div class='tooltip_next'>"+this.name+"</div></div>";
        $("body").append(tooltip);
        $(".tooltip_box").css({
            "top":(e.pageY+y)+"px",
            "left":(e.pageX+x)+"px"
        }).show("fast");
    }).mouseout(function(){
        $(".tooltip_box").remove();
    }).mousemove(function(e){
        $(".tooltip_box").css({
            "top":(e.pageY+y)+"px",
            "left":(e.pageX+x)+"px"
        })
    });
})



//填空拖拽-------
$(function(){
    var drag_tk_height = $(".drag_tk").height();
    $(".drag_tk_box").css("height",drag_tk_height);
})

//鼠标经过邮件图标
$(function(){
    $(".h_email")[0].onmouseover = show_email_info ;
    $(".email_tab")[0].onmouseout = close_email_info ;
})

function show_email_info ( ae ){
    var e = window.event || ae ;
    var s = e.fromElement || e.relatedTarget ;
    if( document.all ){
        if(  !(s == this || this.contains(s))  ){
            $('.email_tab').css("display","block");
        }
    }else{
        var res= this.compareDocumentPosition(s) ;
        if(  !(s == this || res == 20 || res == 0 )  ){
            $('.email_tab').css("display","block");
        }
    }
}

function close_email_info( ae ){
    var e = window.event || ae;
    var s = e.toElement || e.relatedTarget;
    var temp = document.getElementById('but_temp');
    if(document.all){
        if( !this.contains(s) ){
            $('.email_tab').css("display","none");
        }
    }else{
        var res= this.compareDocumentPosition(s) ;
        if( ! ( res == 20 || res == 0) ){
            $('.email_tab').css("display","none");
        }
    }
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


//显示未完成的单词
//$(function(){
//    var d1=$(".words_tishi")[0];
//    d1.onmouseover = mouseover_x ;
//    d1.onmouseout = mouseout_x ;
//    function mouseover_x ( ae ){
//        var e = window.event || ae ;
//        var s = e.fromElement || e.relatedTarget ;
//        if( document.all ){
//            if(  !(s == this || this.contains(s))  ){
//                if(!$(e).is(":animated")){
//                    moveOut();
//                }
//            }
//        }else{
//            var res= this.compareDocumentPosition(s) ;
//            if(  !(s == this || res == 20 || res == 0 )  ){
//                if(!$(e).is(":animated")){
//                    moveOut();
//                }
//            }
//        }
//    }
//
//    function mouseout_x( ae ){
//        var e = window.event || ae;
//        var s = e.toElement || e.relatedTarget;
//        //var temp = document.getElementById('but_temp');
//        if(document.all){
//            if( !this.contains(s) ){
//                if(!$(e).is(":animated")){
//                    moveBack();
//                }
//
//            }
//        }else{
//            var res= this.compareDocumentPosition(s) ;
//            if( ! ( res == 20 || res == 0) ){
//                //alert(!$(e).is(":animated"));
//                if(!$(e).is(":animated")){
//                    moveBack();
//                }
//            }
//        }
//    }
//})

function moveOut() {
    $('.words_tishi').animate({
        'opacity': 0
    }, {
        queue: false,
        duration: 1000
    });
    $('.words_tishi').stop().animate({
        "left":"0",
        "opacity":1
    },500);
}

function moveBack() {
    $('.words_tishi').stop().animate({
        "left":"-145",
        "opacity":0.5
    },500);
}

