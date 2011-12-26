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