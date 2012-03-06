Array.prototype.indexOf=function(el, index){
    var n = this.length>>>0, i = ~~index;
    if(i < 0) i += n;
    for(; i < n; i++) if(i in this && this[i] === el) return i;
    return -1;
};

//预加载MP3
$(document).ready(function(){
    var step = $("#step_page").val();
    if (word_ids == null) {
        word_ids = $("#all_words").val().split(",");
    }
    if (getCookie("rem_word") == null) {
        var all_index = "";
        for (var i=0; i<word_ids.length; i++) {
            if (all_index != "") {
                all_index += ","
            }
            all_index += step;
        }
        setCookie("rem_word", all_index, 86400000, '/');
    }    
    load_word(step);
    if ($("#jquery_jplayer").attr("id") != undefined) {
        $("#jquery_jplayer").jPlayer({
            swfPath: "/assets/jplayer",
            supplied: "mp3",
            wmode: "window"
        });
    }
    show_part_tishi(step);
    setCookie("tishi", "2", 86400000, '/');
})

if(typeof(HTMLElement) != "undefined"){
    HTMLElement.prototype.contains = function(obj){
        while(obj != null && typeof(obj.tagName) != "undefined"){
            if(obj == this)
                return true;
            obj = obj.parentNode;
        }
        return false;
    };
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
function load_word(step) {
    if (getCookie("right_word") != null) {
        var current_order = getCookie("rem_word").split(",");
        var rem_word = getCookie("right_word").split("&");
        var right_position = new Array();
        for (var i=0; i<rem_word.length; i++) {
            var word = rem_word[i].split("=");
            $("#five_"+word[0]).html("<img src='/assets/z/z"+word[1]+".png'/>");
            $("#five_"+word[0]).css("display", "block");
            if (new Number(word[1]) == 4) {
                $("#p_w_" + word[0]).addClass("words_p_hover");
            }
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
    if (getCookie("current_word") != null && getCookie("current_word") != "" && getCookie("current_word") != undefined) {
        var current_index = word_ids.indexOf(getCookie("current_word"));
        if (current_index != -1 && ($("#word_info_" + current_index).attr("id") != null
            || $("#word_info_" + current_index).attr("id") != undefined)) {
            $("#word_info_" + current_index).css("display", "block");
        }
        else {
            jump_n_sen_word(step);
        }
    } else {
        jump_n_sen_word(step);
    }
}

//特殊处理第三步，如果单词没有句子，则默认已经完成
function jump_n_sen_word(step) {
    var current_step = new Number(step) + 1;
    for (var i=0; i<word_ids.length; i++) {
        if ($("#word_info_" + i).attr("id") != null) {
            $("#word_info_" + i).css("display", "block");
            break;
        } else {
            change_pic(word_ids[i], current_step);
            is_right(word_ids[i], getCookie("rem_word").split(","), i, current_step);
        }
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
        change_pic(word_id, 1);
        is_right(word_id, rem_word, current_index, 1);
    }
    show_word(word_id, current_index, next_index);
    is_remeber_pass(rem_word, word_id, next_index, category_id, type);
}

//判断熟悉单词是否全部通过
function is_remeber_pass(rem_word, word_id, next_index, category_id, type) {
    if (is_unremb_word(rem_word, 1)) {
        setCookie("tishi", "1", 86400000, '/');
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
function answer_right(current_word, category_id, current_index, current_step, type, str) {
    change_pic(current_word, current_step);
    var says = (str == null) ? "恭喜你，回答正确，进入下一题！" : str;
    var innhtml = "<div class='tab_con1'>" + says + "</div>";
    $("#tab_box").removeClass("icon_false").addClass("icon_true");
    $("#tab_box").html(innhtml);
}

//更换百分比图片
function change_pic(current_word, current_step) {
    if ($("#five_"+current_word).html() == null || $("#five_"+current_word).html() == "") {
        $("#five_"+current_word).html("<img src='/assets/z/z"+current_step+".png'/>");
    } else {
        var img_str =  $("#five_"+current_word).html().split("/");
        if (img_str != null && img_str != undefined) {
            var img_index = new Number((img_str[3]).substring(1, 2)) + 1;
            $("#five_"+current_word).html("<img src='/assets/z/z"+ img_index +".png'/>");
        }
    }
    if (new Number(current_step) == 4) {
        $("#p_w_" + current_word).addClass("words_p_hover");
    }
    $("#five_"+current_word).css("display", "block");
}

//回答错误
function answer_wrong(current_word, category_id, current_index, current_step, str, type) {
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
        answer_right(current_word, category_id, current_index, current_step, type, null);
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
            var show_step = new Number((old_step.split("="))[1]) + 1;
            setCookie("right_word", getCookie("right_word").replace(old_step, word_id+"="+show_step), 86400000, '/');
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
                change_pic(next_word_id, current_step);
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
    show_re_word(current_step, current_index, next_index);
    is_recollection_pass(word_id, rem_word, next_index, category_id, current_step, type);
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
        setCookie("tishi", "1", 86400000, '/');
        window.location.href = "/words/use?category=" + category_id + "&type=" + type;
    } else if (current_step == 3) {
        setCookie("tishi", "1", 86400000, '/');
        window.location.href = "/words/hand_man?category=" + category_id + "&type=" + type;
    } else if (current_step == 4) {
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
                recite_word_success(word.attr("id"), category_id, word.attr("name"), current_step, type, word.val());
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
                var str = "拼字失败,正确答案为<span class='red'>" + word.val() + "</span>";
                answer_wrong(word.attr("id"), category_id, word.attr("name"), current_step, str, type);
                $("#tab_box").css('display','block');
                $("#tab_box").css('opacity','100');
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

//根据步骤弹出完成提示框
function show_part_tishi(step) {
    if (getCookie("tishi") != null && getCookie("tishi") == 1) {
        if (step == "1") {
            over_part("单词认读", "回想释义");
            $('#tab_box').delay(3500).fadeTo("slow",0,function(){
                $(this).css("display", "none");
            })
        } else if (step == "2") {
            over_part("回想释义", "词汇运用");
            $('#tab_box').delay(3500).fadeTo("slow",0,function(){
                $(this).css("display", "none");
            })
        } else if (step == "3") {
            over_part("词汇运用", "拼写游戏");
            $('#tab_box').delay(3500).fadeTo("slow",0,function(){
                $(this).css("display", "none");
            })
        }
    }    
}

//完成部分弹出提示
function over_part(str1, str2) {
    generate_flash_div("#tab_box");
    var innhtml = "<div class='tab_con1'>"
    + "恭喜你已经完成<span class='red'>"+ str1 +"</span>部分，进入<span class='red'>"+ str2 +"</span>部分！</div>";
    $("#tab_box").removeClass("icon_false").addClass("icon_true");
    $("#tab_box").html(innhtml);
    $("#tab_box").css('display','block');
    $("#tab_box").css('opacity','100');
}

//更新用户
function recite_word_success(word_id, category_id, current_index, current_step, type, word_name) {
    var is_in = false;
    var word_index = getCookie("right_word").indexOf(""+word_id+"=");
    if (word_index != -1) {
        var old_step = getCookie("right_word").substring(word_index, (word_index + ("" + word_id).length + 2));
        var show_step = new Number((old_step.split("="))[1]) + 1;
        if (new Number(current_step) == show_step) {
            is_in = true;
        }
    }
    if (is_in) {
        $.ajax({
            async:true,
            complete:function(request){
                generate_flash_div("#tab_box");
                var str = "恭喜你，你已经掌握了<span class='red'>"+ word_name +"</span>这个单词";
                answer_right(word_id, category_id, current_index, current_step, type, str);
                $("#tab_box").css('display','block');
                $("#tab_box").css('opacity','100');
                $('#tab_box').delay(1500).fadeTo("slow",0,function(){
                    $(this).css("display", "none");
                    next_task(word_id, category_id, current_index, current_step, 1, ""+type);
                });
            },
            data:{
                category_id :category_id,
                word_id :word_id
            },
            dataType:'script',
            url:"/words/word_log",
            type:'post'
        });
        return false;
    } else {
        generate_flash_div("#tab_box");
        answer_right(word_id, category_id, current_index, current_step, type, null);
        $("#tab_box").css('display','block');
        $("#tab_box").css('opacity','100');
        $('#tab_box').delay(1500).fadeTo("slow",0,function(){
            $(this).css("display", "none");
            next_task(word_id, category_id, current_index, current_step, 1, ""+type);
        });
    }
    
}