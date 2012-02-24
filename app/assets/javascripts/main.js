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
    $(".main").css('height',main_height-12+30);//34是m_top的高度，
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
        var tooltip = "<div class='tooltip_box'><div class='tooltip_next'>"+this.name+"</div></div>";
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

//鼠标经过邮件图标
$(function(){
    if ($(".h_email")[0] != null && $(".h_email")[0] != undefined
        && $(".email_tab")[0] != null && $(".email_tab")[0] != undefined) {
        $(".h_email")[0].onmouseover = show_email_info ;
        $(".email_tab")[0].onmouseout = close_email_info ;
    //$(".h_email")[0].onmouseout = close_email_info;
    }
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
    if(document.all){  
        if( (!this.contains(s))){
            $('.email_tab').css("display","none");
        }
    }else{
        var res= this.compareDocumentPosition(s) ;
        if((!( res == 20 || res == 0))){
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

//回顾单词
function start_word(category_id, type) {
    delCookie("wrong_word");
    delCookie("rem_word");
    delCookie("right_word");
    delCookie("current_word");
    window.location.href = "/words/recite_word?category="+category_id+"&type="+type;
}

//显示模拟考试每个部分的成绩
function show_part_score(total_score, rank, part1_score, part2_score, part3_score, part4_score) {
    generate_flash_div("#score_tab");
    $('#total_score').html(total_score);
    if (rank != null && rank != "") {
        $('#rank').html(rank);
    } else {
        $('#rank').html("等待排名中");
    }
    $('#listen').html(part1_score);
    $('#read').html(part2_score);
    $('#colligate').html(part3_score);
    $('#write').html(part4_score);
    $('.zhezhao').css('display','block');
    $('#score_tab').css('display','block');
    $('.xx_x').bind('click',function(){
        $('.tab_box').hide();
        $('.zhezhao').hide();
        return false;
    })
}

//显示模拟考试进入考试前的提示
function show_exam_tishi(is_submited, simulation_id) {
    generate_flash_div("#mokao_tishi_tab");
    $("#sim_id").attr("value", simulation_id);
    if (is_submited == "false") {
        $("#not_join").hide();
        $("#already_join").show();
    } else {
        $("#not_join").show();
        $("#already_join").hide();
    }
    $('.zhezhao').css('display','block');
    $('#mokao_tishi_tab').css('display','block');
    $('.xx_x').bind('click',function(){
        $('.tab_box').hide();
        $('.zhezhao').hide();
        return false;
    })
}

//跳转到开始考试页面
function goto_exam() {
    var sim_id = $("#sim_id").val();
    $('#error_p').hide();
    $('.tab_box').hide();
    $('.zhezhao').hide();
    window.open("/simulations/"+ sim_id +"/do_exam");
}

//提交之前完成的试卷
function end_exam(category_id) {
    var sim_id = $("#sim_id").val();
    window.location.href = "/simulations/" + sim_id + "/end_exam?category=" + category_id;
}

//重做模拟考试
function reset_exam() {
    var sim_id = $("#sim_id").val();
    $('#error_p').hide();
    $('.tab_box').hide();
    $('.zhezhao').hide();
    window.open("/simulations/" + sim_id + "/reset_exam");
}

// 自动轮换内容
$(document).ready(function(){
    var objStr = ".change ul li";
    $(objStr + ":not(:first)").css("display","none");
    setInterval(function(){
        if( $(objStr + ":last").is(":visible")){
            $(objStr + ":first").fadeIn("slow").addClass("in");
            $(objStr + ":last").hide()
        }
        else{
            $(objStr + ":visible").addClass("in");
            $(objStr + ".in").next().fadeIn("slow");
            $(objStr + ".in").hide().removeClass("in")
        }
    },4000) //每3秒钟切换
})

$(function(){
    var x = -20;
    var y = 15;
    if ($(".tooltip_vip").length > 0) {
        $(".tooltip_vip").mouseover(function(e){
            this.myTitle=this.title;
            this.title="";
            var tooltip = "<div class='tooltip_box'><div class='tooltip_next'>"+this.myTitle+"</div></div>";
            $("body").append(tooltip);
            $(".tooltip_box").css({
                "top":(e.pageY+y)+"px",
                "left":(e.pageX+x)+"px"
            }).show("fast");
        }).mouseout(function(){
            this.title = this.myTitle;
            $(".tooltip_box").remove();
        }).mousemove(function(e){
            $(".tooltip_box").css({
                "top":(e.pageY+y)+"px",
                "left":(e.pageX+x)+"px"
            })
        });
    }    
})

Array.prototype.indexOf=function(el, index){
    var n = this.length>>>0, i = ~~index;
    if(i < 0) i += n;
    for(; i < n; i++) if(i in this && this[i] === el) return i;
    return -1;
}
