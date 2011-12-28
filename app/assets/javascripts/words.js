//预加载MP3
$(document).ready(function(){
    var mp3_path = $("#enunciate_url").val();
    jQuery("#jquery_jplayer").jPlayer({
        ready: function() {
            jQuery(this).jPlayer("setMedia", {
                mp3:""+mp3_path
            });
        },
        swfPath: "/assert/jplayer",
        supplied: "mp3",
        wmode: "window"
    });
})

//播放MP3
function control_media() {
    var audio = jQuery("#jquery_jplayer");
    audio.jPlayer("play");
}

//显示提示弹出框
function generate_flash_div(style) {
    var scolltop = document.body.scrollTop|document.documentElement.scrollTop;
    var win_height = document.documentElement.clientHeight;
    var win_width = $(window).width();
    var z_layer_height = jQuery(style).height();
    var z_layer_width = jQuery(style).width();
    $(style).css('top',(win_height-z_layer_height)/2 + scolltop);
    $(style).css('left',(win_width-z_layer_width)/2);
}

//回顾释义
function recollection_word(current_word, target_word, category_id, index) {
    generate_flash_div("#tab_box");
    if (current_word == target_word) {
        var innhtml = "<div class='tab_x'><a href='javascript:void(0);' "
        + "onclick='javascript:next_task("+ current_word +", "+ category_id +", "+ index +");'>"
        + "<img src='/assets/x.gif'/></a></div><div class='tab_con'>"
        + "<div>恭喜你，回答正确！</div></div>";
        $("#tab_box").removeClass("icon_false").addClass("icon_true");
        $("#tab_box").html(innhtml);
    } else {
        var innhtml = "<div class='tab_x'>"
        + "<a href='javascript:void(0);' onclick=\"javascript:$('#tab_box').css('display', 'none');\";>"
        + "<img src='/assets/x.gif'/></a></div><div class='tab_con'>"
        + "<div>答错了，继续努力哦。</div></div>";
        $("#tab_box").removeClass("icon_true").addClass("icon_false");
        $("#tab_box").html(innhtml);
    }
    $("#tab_box").css('display','block');
}

//下一个任务
function next_task(word_id, category_id, index) {
    $("#tab_box").css("display", "none");
    if(index == null) {
        window.location.href = "/words/" + word_id + "/use?category="+ category_id;
    } else {
        var next_index = index + 1;
        if ($("#sentence_" + next_index).html() == "" || $("#sentence_" + next_index).html() == null) {
            $("#sentence_" + index).css("display", "none");
            window.location.href = "/words/" + word_id + "/hand_man?category="+ category_id;
        } else {
            $("#sentence_" + index).css("display", "none");
            $("#sentence_" + next_index).css("display", "block");
        }
    }
    
}

//显示左侧可移动的显示单词的列表
$(function(){
    var d1=$(".words_tishi")[0];
    d1.onmouseover = mouseover_x ;
    d1.onmouseout = mouseout_x ;
    function mouseover_x ( ae ){
        var e = window.event || ae ;
        var s = e.fromElement || e.relatedTarget ;
        if( document.all ){
            if(  !(s == this || this.contains(s))  ){
                if(!$(e).is(":animated")){
                    moveOut();
                }
            }
        }else{
            var res= this.compareDocumentPosition(s) ;
            if(  !(s == this || res == 20 || res == 0 )  ){
                if(!$(e).is(":animated")){
                    moveOut();
                }
            }
        }
    }

    function mouseout_x( ae ){
        var e = window.event || ae;
        var s = e.toElement || e.relatedTarget;
        //var temp = document.getElementById('but_temp');
        if(document.all){
            if( !this.contains(s) ){
                if(!$(e).is(":animated")){
                    moveBack();
                }

            }
        }else{
            var res= this.compareDocumentPosition(s) ;
            if( ! ( res == 20 || res == 0) ){
                //alert(!$(e).is(":animated"));
                if(!$(e).is(":animated")){
                    moveBack();
                }
            }
        }
    }
})

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

//显示单词的意思
function show_mean(word_id){
    $("#mean_" + word_id).fadeIn("slow");
    $("#sentence_next_" + word_id).fadeIn("slow");
}

//显示单词例句
function show_sentence(word_id) {
    $("#sentence_" + word_id).fadeIn("slow");
    $("#btn_" + word_id).fadeIn("slow");
}

//熟悉单词了
function remember_word(current_index, total_num, category_id) {
    alert(getCookie("rem_word"));
    if (current_index < (total_num - 1)) {
        var rem_word = getCookie("rem_word").split(",");
        rem_word[current_index] = 1;
        setCookie("rem_word",rem_word.join(","));
        show_word(current_index);
    } else {
        is_unremb_word(category_id);
    }
}

//没有熟悉单词
function unre_word(current_index, total_num, category_id){
    alert(getCookie("current_word"));
    if (current_index < (total_num - 1)) {
        show_word(current_index);
    } else {
        is_unremb_word(category_id);
    }
}

//显示下一个单词
function show_word(current_index) {
    $("#word_info_" + current_index).css("display", "none");
    $("#word_info_" + (current_index + 1)).css("display", "block");
    setCookie("current_word",$("#word_id_" + (current_index + 1)));
}

//判断有没有不熟悉的单词
function is_unremb_word(category_id) {
    var all_rem = true;
    var remb_word = getCookie("rem_word").split(",");
    for (var i=0; i<remb_word.length; i++) {
        if (remb_word[i] != 1 && i < word_ids.length) {
            all_rem = false;
            break;
        }
    }
    if (all_rem) {
        window.location.href = "/words/recollection?category=" + category_id;
    } else {
        alert(jQuery.inArray("0", remb_word));
    }
}