
//字体放大、缩小
var tgs = new Array( 'div','td','tr');
var szs = new Array( 'xx-small','x-small','small','medium','large','x-large','xx-large' );
var startSz = 2;
function ts( trgt,inc ) {
    if (!document.getElementById) return
    var d = document,cEl = null,sz = startSz,i,j,cTags;
    sz += inc;
    if ( sz < 0 ) sz = 0;
    if ( sz > 6 ) sz = 6;
    startSz = sz;
    if ( !( cEl = d.getElementById( trgt ) ) ) cEl = d.getElementsByTagName( trgt )[ 0 ];
    cEl.style.fontSize = szs[ sz ];
    for ( i = 0 ; i < tgs.length ; i++ ) {
        cTags = cEl.getElementsByTagName( tgs[ i ] );
        for ( j = 0 ; j < cTags.length ; j++ ) cTags[ j ].style.fontSize = szs[ sz ];
    }
}

//下一题
function click_next_problem(){
    var this_problem = $(".problem_resource:visible");
    var next_problem = this_problem.next(".problem_resource");
    if(next_problem.length==0){
        if(init_problem+1<problems_sum){
            this_problem.hide();
            ajax_load_next_problems(group_index+1,group_sum,init_problem+1);
        }
        else{
            tishi_alert("当前已是最后一题");
            return false;
        }
    }else{
        this_problem.hide();
        next_problem.show();
        var problem_index = init_problem+1;
        $("#report_error").hide();
        $f("flowplayer").stop();
        $f("audio-word").stop();
        if($("#drag_tk_"+problem_index).height()){
            $("#drag_tk_box_"+problem_index).css("height",$("#drag_tk_"+problem_index).height()+20);
        }
        $("#jplayer_play_button_"+problem_index).trigger("click");
        init_problem += 1;
    }
}

function pro_qu_t(ele){
        var pro_qu_div = $(ele).parent().find(".pro_qu_div");
        if(pro_qu_div.is(":visible")){
            pro_qu_div.hide();
            $(ele).parent().parent().addClass("p_q_line");
            $(ele).addClass("pro_qu_h");
            last_opened_question = null;
        }else{
            pro_qu_div.show();
            $(ele).parent().parent().removeClass("p_q_line");
            $(ele).parent().removeClass("p_q_line");
            $(ele).removeClass("pro_qu_h");
            if(last_opened_question!=null){
                last_opened_question.parent().find(".pro_qu_div").hide();
                last_opened_question.parent().parent().addClass("p_q_line");
                last_opened_question.addClass("pro_qu_h");
            }
            last_opened_question = $(ele);
        }
}

//上一题
function click_prev_problem(){
    var this_problem = $(".problem_resource:visible");
    var prev_problem = this_problem.prev(".problem_resource");
    if(prev_problem.length==0){
        if(init_problem>0){
            this_problem.hide();
            ajax_load_prev_problems(group_index-1,group_sum,init_problem-1);
        }else{
            tishi_alert("当前已是第一题");
            return false;
        }
    }else{
        this_problem.hide();
        prev_problem.show();
        var problem_index = init_problem-1;
        $("#report_error").hide();
        $f("flowplayer").stop();
        $f("audio-word").stop();
        if($("#drag_tk_"+problem_index).height()){
            $("#drag_tk_box_"+problem_index).css("height",$("#drag_tk_"+problem_index).height()+20);
        }
        $("#jplayer_play_button_"+problem_index).trigger("click");
        init_problem -= 1;
    }
}

function ajax_load_next_problems(g_index,g_sum,i_problem){
    $.ajax({
        type: "GET",
        url: "/collections/ajax_load_problems.html",
        dataType: "html",
        data : {
            "group_index":g_index,
            "group_sum":g_sum,
            "init_problem":i_problem
        },
        success:function(data){
            $("#collection_resource").html($("#collection_resource").html()+data);
            init_problem += 1;
            group_index += 1;
            $("#jplayer_play_button_"+init_problem).trigger("click");
        }
    });
}


function ajax_load_prev_problems(g_index,g_sum,i_problem){
    $.ajax({
        type: "GET",
        url: "/collections/ajax_load_problems.html",
        dataType: "html",
        data : {
            "group_index":g_index,
            "group_sum":g_sum,
            "init_problem":i_problem
        },
        success:function(data){
            $("#collection_resource").html(data+$("#collection_resource").html());
            init_problem -= 1;
            group_index -= 1
            $("#jplayer_play_button_"+init_problem).trigger("click");
        }
    });
}

last_opened_question = null;

//小题列表改变颜色
function change_color(value,ele){
    if(value=="1"){
        $(ele).css("background","#EEFFEE");
        $(ele).closest(".pro_question_list").css("background","#EEFFEE");
    }else{
        if(value=="0"){
            $(ele).css("background","#FFEAEA");
            $(ele).closest(".pro_question_list").css("background","#FFEAEA");
        }else{
            $(ele).css("background","");
            $(ele).closest(".pro_question_list").css("background","");
        }
    }
}

//模拟用户操作
function imitate_action(question_type,correct_type,problem_index,question_index){
    var attrs = $("#resource_questionattrs_"+problem_index+"_"+question_index).val();
    var user_answer =$("#exam_user_answer_"+problem_index+"_"+question_index).val();
    
    var split_attrs = attrs.split(";-;");
    if(question_type=="0"){
        if(correct_type=="0"){
            for(var i=0;i<split_attrs.length;i++){
                if(user_answer==split_attrs[i]){
                    $(".single_choose_li_"+problem_index+"_"+question_index+":eq("+i+")").addClass("hover");
                }
            }
        }
        if(correct_type=="1"){
            var user_answer_arr = user_answer.split(";|;");
            for(var i=0;i<user_answer_arr.length;i++){
                for(var j=0;j<split_attrs.length;j++){
                    if(user_answer_arr[i]==split_attrs[j]){
                        $(".multi_choose_li_"+problem_index+"_"+question_index+":eq("+j+")").addClass("hover");
                    }
                }
            }
        }
        if(correct_type=="2"){
            if(user_answer=="1"){
                $(".judge_li_"+problem_index+"_"+question_index+":eq(0)").addClass("hover");
            }else{
                if(user_answer=="0"){
                    $(".judge_li_"+problem_index+"_"+question_index+":eq(1)").addClass("hover");
                }
            }
        }
        if(correct_type=="3"||correct_type=="5"){
            $("#fill_input_"+problem_index+"_"+question_index).val(user_answer);
        }
    }else{
        if(question_type=="1"){
            if(correct_type=="0"){
                setSel(user_answer,$("#input_inner_answer_"+problem_index+"_"+question_index)[0],1);
            }
            if(correct_type=="1"){
                $("#droppable_"+problem_index+"_"+question_index).html(user_answer);
            }
            if(correct_type=="3"){
                $("#input_inner_answer_"+problem_index+"_"+question_index).val(user_answer);
            }
        }
    }
}

function clone_jplayer(selector,audio_src){
    $(selector).append($("#jp_container_1"));
    $("#jquery_jplayer").jPlayer("setMedia", {
        mp3: audio_src
    });
}

//设置select的默认值
function setSel(str,select,types){
    var setinfo=false;
    for(var i=0;i<select.options.length;i++){
        if (types==0 && select.options[i].text==str){
            setinfo=true;
        }else if (types==1 && select.options[i].value==str){
            setinfo=true;
        }
        if (setinfo==true){
            select.selectedIndex=i;
            break;
        }
    }
}

function clone_flowplayer(selector,audio_src){
    $(selector).append($("#flowplayer_loader"));
    $f("flowplayer", "/assets/flowplayer/flowplayer-3.2.7.swf", {
        plugins: {
            controls: {
                fullscreen: false,
                height: 30,
                autoHide: false
            }
        },
        clip: {
            autoPlay: false,
            onBeforeBegin: function() {
                this.close();
            }
        },
        onLoad: function() {
            this.setVolume(90);
            this.setClip(audio_src);
        }
    });
}
