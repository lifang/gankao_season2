Array.prototype.indexOf=function(el, index){
    var n = this.length>>>0, i = ~~index;
    if(i < 0) i += n;
    for(; i < n; i++) if(i in this && this[i] === el) return i;
    return -1;
};

//预加载MP3
$(document).ready(function(){
    if (word_ids == null) {
        word_ids = $("#all_words").val().split(",");
    }
    if (getCookie("rem_word") == null) {
        var step = $("#step_page").val();
        var all_index = "";
        for (var i=0; i<word_ids.length; i++) {
            if (all_index != "") {
                all_index += ","
            }
            all_index += step;
        }
        setCookie("rem_word", all_index, 86400000, '/');
    }    
    load_word();
    if ($("#jquery_jplayer").attr("id") != undefined) {
        $("#jquery_jplayer").jPlayer({
            swfPath: "/assets/jplayer",
            supplied: "mp3",
            wmode: "window"
        });
    } 
})

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
        if(document.all){
            if( !this.contains(s) ){
                if(!$(e).is(":animated")){
                    moveBack();
                }

            }
        }else{
            var res= this.compareDocumentPosition(s) ;
            if( ! ( res == 20 || res == 0) ){
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


//加载本次已经记录的单词
function load_word() {
    if (getCookie("current_word") != null && getCookie("current_word") != "" && getCookie("current_word") != undefined) {
        var current_index = word_ids.indexOf(getCookie("current_word"));
        if (current_index != -1 && ($("#word_info_" + current_index).attr("id") != null
            || $("#word_info_" + current_index).attr("id") != undefined)) {
            $("#word_info_" + current_index).css("display", "block");
        } else {
            $("#word_info_0").css("display", "block");
        }
    } else {
        for (var i=0; i<word_ids.length; i++) {
            if ($("#word_info_" + i).attr("id") != null) {
                $("#word_info_" + i).css("display", "block");
                break;
            }
        }
        
    }
    if (getCookie("right_word") != null) {
        var current_order = getCookie("rem_word").split(",");
        var rem_word = getCookie("right_word").split("&");
        var right_position = new Array();
        for (var i=0; i<rem_word.length; i++) {
            var word = rem_word[i].split("=");
            $("#five_"+word[0]).html("<img src='/assets/z/z"+word[1]+".png'/>");
            $("#five_"+word[0]).css("display", "block");
            var position = word_ids.indexOf(word[0]);
            current_order[position] = word[1];
            right_position.push(position);
        }
        for (var j=0; j<current_order.length; j++) {
            if (right_position.indexOf(j) == -1) {
                current_order[j] = $("#step_page").val();
            }
        }
        setCookie("rem_word", current_order.join(","), 86400000, '/');
    }
}

//播放MP3
function control_media(src) {
    var audio = $("#jquery_jplayer");
    audio.jPlayer("setMedia", {
        mp3: src
    });
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

//显示单词的意思
function show_mean(word_id){
    $("#mean_" + word_id).fadeIn("slow");
    if ($("#sentence_next_" + word_id).length > 0) {
        $("#sentence_next_" + word_id).fadeIn("slow");
    } else {
        $("#btn_" + word_id).fadeIn("slow");
    }
    
}

//显示单词例句
function show_sentence(word_id) {
    $("#sentence_" + word_id).fadeIn("slow");
    $("#btn_" + word_id).fadeIn("slow");
}

//看是否熟悉单词了
function remember_word(word_id, current_index, category_id, flag, type) {
    var rem_word = getCookie("rem_word").split(",");
    var next_index = jQuery.inArray("0", rem_word, (current_index + 1));
    if (flag == 1) {
        is_right(word_id, rem_word, current_index, 1);
    }
    show_word(word_id, current_index, next_index);
    is_remeber_pass(rem_word, word_id, next_index, category_id, type);
}

//判断熟悉单词是否全部通过
function is_remeber_pass(rem_word, word_id, next_index, category_id, type) {
    if (is_unremb_word(rem_word, 1)) {
        window.location.href = "/words/recollection?category=" + category_id + "&type=" + type;
    } else if (next_index == word_ids.length || next_index == -1) {
        show_word(word_id, next_index, jQuery.inArray("0", rem_word));
    }
}

//单词认读显示下一个单词
function show_word(word_id, current_index, next_index) {
    $("#word_info_" + current_index).css("display", "none");
    $("#mean_" + word_id).css("display", "none");
    $("#sentence_next_" + word_id).css("display", "none");
    $("#sentence_" + word_id).css("display", "none");
    $("#btn_" + word_id).css("display", "none");
    $("#word_info_" + next_index).css("display", "block");    
    setCookie("current_word", word_ids[next_index], 86400000, '/');
}

//判断有没有不熟悉的单词
function is_unremb_word(rem_word, current_step) {
    var all_rem = true;
    for (var i=0; i<rem_word.length; i++) {
        if (rem_word[i] != current_step && i < word_ids.length) {
            all_rem = false;
            break;
        }
    }
    return all_rem;
}

//回顾释义显示下一个单词
function show_re_word(current_step, current_index, next_index) {
    $("#word_info_" + current_index).css("display", "none");
    $("#word_info_" + next_index).css("display", "block");
    setCookie("current_word", word_ids[next_index], 86400000, '/');
    if (current_step == 4) {
        var inputs = $("#word_info_" + current_index + " .words_input");
        if (inputs != null) {
            for (var i=0; i<inputs.length; i ++) {
                inputs[i].value = "";
            }
        }
        $("#word_info_" + current_index + " #error_num").attr("value", 0);
        $("#man_" + current_index).html("请从如下字母列表中选择您觉得在这个词中的字母。");
        var letters = $(".words_letter li");
        if (letters != null) {
            for (var j=0; j<letters.length; j++) {
                if (letters[j].className == "hover") {
                    letters[j].style.display = "none";
                } else {
                    letters[j].style.display = "block";
                }
            }
        }
    }
}

//回答正确
function answer_right(current_word, category_id, current_index, current_step, type) {
    var innhtml = "<div class='tab_con1'>"
    + "恭喜你，回答正确，进入下一题！</div>";
    $("#tab_box").removeClass("icon_false").addClass("icon_true");
    $("#tab_box").html(innhtml);
}

//记录回答错误的单词，目的是为了得到第一次全部正确的单词
function get_wrong_word(word_id) {
    if (getCookie("wrong_word") == null) {
        setCookie("wrong_word", word_id, 86400000, '/');
    } else {
        var wrong_words = getCookie("wrong_word").split(",");
        if ($.inArray(""+word_id, wrong_words) == -1) {
            setCookie("wrong_word", getCookie("wrong_word") + "," + word_id, 86400000, '/');
        }
    }
}

//回答错误
function answer_wrong(current_word, category_id, current_index, current_step, str, type) {
    get_wrong_word(current_word);
    var error_str = (str == null) ? "答错了，继续努力哦。" : str ;
    var innhtml = "";
    if (str == null) {
        innhtml = "<div class='tab_con1'>" + error_str +"</div>";
    } else {
        innhtml = "<span class='xx_x' onclick=\"javascript:close_result_tab('"+ current_word +"', '"
            + category_id +"', '"+ current_index +"', "+ current_step +", '"+ type +"');\">"
            +"<img src='/assets/x.gif'></span><div class='tab_con1'>"
            + error_str +"</div>";
    }
    $("#tab_box").removeClass("icon_true").addClass("icon_false");
    $("#tab_box").html(innhtml);
}

//回顾释义
function recollection_word(current_word, target_word, category_id, current_index, current_step, type) {
    generate_flash_div("#tab_box");
    if (current_word == target_word) {
        answer_right(current_word, category_id, current_index, current_step, type);
    } else {
        answer_wrong(current_word, category_id, current_index, current_step, null, type);
    }
    $("#tab_box").css('display','block');
    $("#tab_box").css('opacity','100');
    $('#tab_box').delay(1500).fadeTo("slow",0,function(){
        $(this).css("display", "none");
        if (current_word == target_word) {
            next_task(current_word, category_id, current_index, current_step, 1, ""+type);
        } else {
            next_task(current_word, category_id, current_index, current_step, 0, ""+type);
        }
    });
    
}

//回顾释义回答正确
function is_right(word_id, rem_word, current_index, current_step) {
    rem_word[current_index] = current_step;
    setCookie("rem_word",rem_word.join(","), 86400000, '/');
    $("#five_"+word_id).html("<img src='/assets/z/z"+current_step+".png'/>");
    $("#five_"+word_id).css("display", "block");
    write_right_word(word_id, current_step);
}

//记录已经回答正确的题目，为了显示右侧的“正”字
function write_right_word(word_id, current_step) {
    if (getCookie("right_word") == null) {
        setCookie("right_word", word_id+"="+current_step, 86400000, '/');
    } else {
        var word_index = getCookie("right_word").indexOf(""+word_id+"=");
        if (word_index != -1) {
            var old_step = getCookie("right_word").substring(word_index, (word_index + ("" + word_id).length + 2));
            setCookie("right_word", getCookie("right_word").replace(old_step, word_id+"="+current_step), 86400000, '/');
        } else {
            setCookie("right_word", getCookie("right_word")+"&"+word_id+"="+current_step, 86400000, '/');
        }
    }
}

//下一个任务
function next_task(word_id, category_id, current_index, current_step, flag, type) {
    $("#tab_box").css("display", "none");
    var rem_word = getCookie("rem_word").split(",");
    var next_index = -1;
    for (var m=new Number(current_index)+1; m<rem_word.length; m++) {
        if (new Number(rem_word[m]) < current_step) {
            if ($("#word_info_" + m).length == 0) {
                //直接置当前的单词正确
                var next_word_id = $("#no_s_"+m).val();
                is_right(next_word_id, rem_word, m, current_step);
            } else {
                next_index = m;
                break;
            }
        }
    }
    if (flag == 1) {
        is_right(word_id, rem_word, current_index, current_step);
    }
    //    if (next_index != -1) {
    //        var no_sen_index = no_sentence_words(word_id, current_step, rem_word, next_index);
    //        if (no_sen_index != -2) {
    //            next_index = no_sen_index;
    //        }
    //    }
    show_re_word(current_step, current_index, next_index);
    is_recollection_pass(word_id, rem_word, next_index, category_id, current_step, type);
}

//如果没有例句则直接跳过当前词并将对于的词设置对于的基本
function no_sentence_words(word_id, current_step, rem_word, current_index) {
    var return_index = -2;
    if ($("#word_info_" + current_index).length == 0) {
        //直接置当前的单词正确
        var next_word_id = $("#no_s_"+current_index).val();
        is_right(next_word_id, rem_word, current_index, current_step);
        var next_index = -1;
        for (var m=new Number(current_index)+1; m<rem_word.length; m++) {
            if (new Number(rem_word[m]) < current_step && ($("#word_info_" + m).length != 0)) {
                next_index = m;
                break;
            }
        }
        return_index = next_index;
    }
    return return_index;
}

//回归释义是否全部通过
function is_recollection_pass(word_id, rem_word, next_index, category_id, current_step, type) {
    if (is_unremb_word(rem_word, current_step)) {
        recollection_next(category_id, current_step, type);
    } else if (next_index == word_ids.length || next_index == -1) {
        var n_n_index = 0;
        for (var m=0; m<rem_word.length; m++) {
            if (new Number(rem_word[m]) < current_step) {
                n_n_index = m;
                break;
            }
        }
        generate_flash_div("#goon_tab");
        var innhtml = "<div class='tab_con'><div>您有回答错误的题，您需要重新回答做错的题吗？</div>"
        +"</div><div class='tab_btn'><button class='t_btn' "
        +"onclick=\"javascript:recollection_reload("+current_step+","+next_index+", "+n_n_index+");\">是</button>"
        +"<button class='t_btn' onclick=\"javascript:recollection_next("+category_id+", "+current_step+", '"+ type +"');\">否</button></div>";
        $("#goon_tab").html(innhtml);
        $("#goon_tab").css('display','block');
    }
}

//重新做回顾错题中的错误
function recollection_reload(current_step, current_index, next_index) {
    $("#goon_tab").css('display','none');
    show_re_word(current_step, current_index, next_index);
}

//不再做做错的题
function recollection_next(category_id, current_step, type) {
    setCookie("current_word", "", 86400000, '/');
    if (current_step == 2) {
        window.location.href = "/words/use?category=" + category_id + "&type=" + type;
    } else if (current_step == 3) {
        window.location.href = "/words/hand_man?category=" + category_id + "&type=" + type;
    } else if (current_step == 4 && type == "new") {
        var right_ids = [];
        var rights = getCookie("right_word").split("&");
        for (var i=0; i<rights.length; i++) {
            var id = rights[i].split("=");
            if (new Number(id[1]) == current_step) {
                right_ids.push(id[0]);
            }
        }
        $.ajax({
            async:true,
            complete:function(request){
                delCookie("wrong_word");
                delCookie("rem_word");
                delCookie("right_word");
                delCookie("current_word");
                window.location.href = "/words?category=" + category_id;
            },
            data:{
                category_id :category_id,
                word_id :word_ids.join(","),
                wrong_id :(getCookie("wrong_word") == null) ? "" : getCookie("wrong_word"),
                right_id :right_ids.join(",")
                
            },
            dataType:'script',
            url:"/words/word_log",
            type:'post'
        });
        return false;
    } else if (current_step ==4 && type == "old") {
        delCookie("wrong_word");
        delCookie("rem_word");
        delCookie("right_word");
        delCookie("current_word");
        window.location.href = "/words?category=" + category_id;
    }
}

//关闭拼写游戏最后的错误框
function close_result_tab(current_word, category_id, current_index, current_step, type) {
    next_task(current_word, category_id, current_index, current_step, 0, type);
}

//拼写游戏
function show_result(letter, category_id, current_step, type) {
    if ($("#li_letter_"+letter).css("display") != "none") {
        var word = $(".ch_text:visible input:hidden:first");
        var error_time = $(".ch_text:visible input:hidden:last").val();
        var inputs = $(".ch_text:visible .words_input");
        var word_arr = word.val().replace(/ /g, "").split("");
        if ($.inArray(letter, word_arr) > -1) {
            for (var i=0; i<word_arr.length; i++) {
                if (word_arr[i] == letter) {
                    for (var k=0; k<inputs.length; k++) {
                        if (inputs[k].id == "letter_" + i) {
                            inputs[k].value = letter;
                        }
                    }
                }
            }
            var is_complete = true;
            for (var j=0; j<inputs.length; j++) {
                if (inputs[j].value == "" || inputs[j].value == null) {
                    is_complete = false;
                    break;
                }
            }
            if (is_complete) {
                generate_flash_div("#tab_box");
                answer_right(word.attr("id"), category_id, word.attr("name"), current_step, type);
                $("#tab_box").css('display','block');
                $("#tab_box").css('opacity','100');
                $('#tab_box').delay(1500).fadeTo("slow",0,function(){
                    $(this).css("display", "none");
                    next_task(word.attr("id"), category_id, word.attr("name"), current_step, 1, ""+type);
                });
            
            }
        } else {
            $(".ch_text:visible input:hidden:last").attr("value", parseFloat(error_time) + 1);
            if (parseFloat(error_time)+1 <= 4) {
                $(".ch_text:visible .xiaoren").html("<img src='/assets/sd/0"+(parseFloat(error_time)+1)+".png'/>");
            } else {
                $(".ch_text:visible .xiaoren").html("<img src='/assets/sd/04.png'/>");
            }
            if (parseFloat(error_time) + 1 == 4) {
                generate_flash_div("#tab_box");
                answer_wrong(word.attr("id"), category_id, word.attr("name"), current_step, "拼字失败,正确答案为" + word.val(), type);
                $("#tab_box").css('display','block');
                $("#tab_box").css('opacity','100');
                //                $('#tab_box').delay(1500).fadeTo("slow",0,function(){
                //                    $(this).css("display", "none");
//                next_task(word.attr("id"), category_id, word.attr("name"), current_step, 0, ""+type);
            //                });
            }
        }
        $("#li_letter_"+letter).css("display", "none");
        $("#hi_letter_"+letter).css("display", "block");
    } 
}

$(document).keyup(function(e){
    if ($("#letter_list").val() != null && $("#letter_list").val() != undefined) {
        if (e.keyCode >= 65 && e.keyCode <= 90) {
            var letters = $("#letter_list").val().split(",");
            show_result(""+letters[e.keyCode-65], $("#category_id").val(), 4, $("#type").val());
        }
    }
})


