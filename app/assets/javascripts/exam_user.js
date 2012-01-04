
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
        tishi_alert("当前已是最后一题");
        return false;
    }else{
        this_problem.hide();
        next_problem.show();
        var problem_index = $(".problem_resource").index(next_problem);
        $("#report_error").hide();
        $("#jquery_jplayer_1").jPlayer("stop");
        if($("#drag_tk_"+problem_index).height()){
            $("#drag_tk_box_"+problem_index).css("height",$("#drag_tk_"+problem_index).height());
        }
        setCookie("init_problem",problem_index);
    }
}

//上一题
function click_prev_problem(){
    var this_problem = $(".problem_resource:visible");
    var prev_problem = this_problem.prev(".problem_resource");
    if(prev_problem.length==0){
        tishi_alert("当前已是第一题");
        return false;
    }else{
        this_problem.hide();
        prev_problem.show();
        var problem_index = $(".problem_resource").index(prev_problem);
        $("#report_error").hide();
        $("#jquery_jplayer_1").jPlayer("stop");
        if($("#drag_tk_"+problem_index).height()){
            $("#drag_tk_box_"+problem_index).css("height",$("#drag_tk_"+problem_index).height());
        }
        setCookie("init_problem",$(".problem_resource").index(prev_problem));
    }
}

last_opened_question = null;
//初始化显示、隐藏小题功能
$(function(){  
    $(".pro_qu_t").bind("click",function(){
        var pro_qu_div = $(this).parent().find(".pro_qu_div");
        if(pro_qu_div.is(":visible")){
            pro_qu_div.hide();
            $(this).parent().parent().addClass("p_q_line");
            $(this).addClass("pro_qu_h");
            last_opened_question = null;
            var pass = $(this).parent().find(".pass_check").val();
            change_color(pass,this);
        }else{
            pro_qu_div.show();
            $(this).parent().parent().removeClass("p_q_line");
            $(this).parent().removeClass("p_q_line");
            $(this).removeClass("pro_qu_h");
            change_color(null,this);
            if(last_opened_question!=null){
                last_opened_question.parent().find(".pro_qu_div").hide();
                last_opened_question.parent().parent().addClass("p_q_line");
                last_opened_question.addClass("pro_qu_h");
                var pass = last_opened_question.parent().find(".pass_check").val();
                change_color(pass,last_opened_question);
            }
            last_opened_question = $(this);
        }
    })
    //题面内大题取消此功能
    for(var i=0;i<unbind_arr.length;i++){
        $(".pro_qu_t_"+unbind_arr[i]).unbind("click");
    }
})

//题面后小题列表改变颜色
function change_color(value,ele){
    if(value=="1"){
        $(ele).css("background","#DBEAD5");
        $(ele).closest(".pro_question_list").css("background","#DBEAD5");
    }else{
        if(value=="0"){
            $(ele).css("background","#FEE6E6");
            $(ele).closest(".pro_question_list").css("background","#FEE6E6");
        }else{
            $(ele).css("background","");
            $(ele).closest(".pro_question_list").css("background","");
        }
    }
}

//单选题,做题
function do_single_choose(ele,attrs,problem_index,question_index){
    attrs=attrs.split(";-;");
    $(".single_choose_li_"+problem_index+"_"+question_index).removeClass("hover");
    $(ele).addClass("hover");
    var n=0;
    $(".single_choose_li_"+problem_index+"_"+question_index).each(function(){
        if($(this).hasClass("hover")){
            $("#exam_user_answer_"+problem_index+"_"+question_index).val(attrs[n]);
            return false;
        }
        n++;
    });
}

//多选题，做题
function do_multi_choose(ele,attrs,problem_index,question_index){
    attrs=attrs.split(";-;");
    $(ele).toggleClass("hover");
    var n = 0;
    var user_answer = [];
    $(".multi_choose_li_"+problem_index+"_"+question_index).each(function(){
        if($(this).hasClass("hover")){
            user_answer.push(attrs[n]);
        }
        n++;
    });
    $("#exam_user_answer_"+problem_index+"_"+question_index).val(user_answer.join(";|;"));
}

//判断，做题
function do_judge(ele,answer,problem_index,question_index){
    $(".judge_li_"+problem_index+"_"+question_index).removeClass("hover");
    $(ele).addClass("hover");
    $("#exam_user_answer_"+problem_index+"_"+question_index).val(answer);
}

function do_fill_blank(ele,answer,problem_index,question_index){
    $("#exam_user_answer_"+problem_index+"_"+question_index).val(answer);
}

//核对小题
function check_question(question_type,correct_type,attrs,problem_index,question_index){
    $("#display_answer_"+problem_index+"_"+question_index).empty();
    $("#display_analysis_"+problem_index+"_"+question_index).empty();
    var answer = answers[problem_index][question_index].answer;
    var analysis = answers[problem_index][question_index].analysis;
    var user_answer = $("#exam_user_answer_"+problem_index+"_"+question_index).val();

    //保存用户答案
    $.ajax({
        type: "POST",
        url: "/exam_users/"+init_exam_user_id+"/ajax_save_question_answer.json",
        dataType: "json",
        data : {
            "question_type":question_type,
            "correct_type":correct_type,
            "problem_index":problem_index,
            "question_index":question_index,
            "answer":user_answer
        }
    });

    if(user_answer==answer){
        $("#pass_check_"+problem_index+"_"+question_index).val(1);
        $("#green_dui_"+problem_index+"_"+question_index).show();
        $("#red_cuo_"+problem_index+"_"+question_index).hide();
        $("#hedui_btn_"+problem_index+"_"+question_index).css("color","green");
    }else{
        $("#pass_check_"+problem_index+"_"+question_index).val(0);
        $("#green_dui_"+problem_index+"_"+question_index).hide();
        $("#red_cuo_"+problem_index+"_"+question_index).show();
        $("#hedui_btn_"+problem_index+"_"+question_index).css("color","red");
    }
    if(correct_type=="0"){
        answer=answer.split(") ")[0];
    }
    if(correct_type=="1"){
        var split_answer = answer.split(";|;");
        var answer_arr=[];
        for(var i=0;i<split_answer.length;i++){
            answer_arr.push(split_answer[i].split(") ")[0]);
        }
        answer=answer_arr.join(",");
    }
    if(correct_type=="2"){
        if(answer=="1"){
            answer="对/是";
        }else{
            answer="错/否";
        }
    }
    $("#display_jiexi_"+problem_index+"_"+question_index).show();
    $("#display_answer_"+problem_index+"_"+question_index).html(answer);
    $("#display_analysis_"+problem_index+"_"+question_index).html(analysis);  
}

//同步小题答案
function refer_question(question_type,correct_type,attrs,problem_index,question_index){
    var answer = answers[problem_index][question_index].answer;
    var analysis = answers[problem_index][question_index].analysis;
    var user_answer = $("#exam_user_answer_"+problem_index+"_"+question_index).val();
    if(user_answer==answer){
        $("#pass_check_"+problem_index+"_"+question_index).val(1);
        if(question_type=="0"){
            change_color("1",$("#pro_qu_t_"+problem_index+"_"+question_index)[0]);
        }
        $("#green_dui_"+problem_index+"_"+question_index).show();
        $("#red_cuo_"+problem_index+"_"+question_index).hide();
        $("#hedui_btn_"+problem_index+"_"+question_index).css("color","green");
    }else{
        $("#pass_check_"+problem_index+"_"+question_index).val(0);
        if(question_type=="0"){
            change_color("0",$("#pro_qu_t_"+problem_index+"_"+question_index)[0]);
        }
        $("#green_dui_"+problem_index+"_"+question_index).hide();
        $("#red_cuo_"+problem_index+"_"+question_index).show();
        $("#hedui_btn_"+problem_index+"_"+question_index).css("color","red");
    }
    if(correct_type=="0"){
        answer=answer.split(") ")[0];
    }
    if(correct_type=="1"){
        var split_answer = answer.split(";|;");
        var answer_arr=[];
        for(var i=0;i<split_answer.length;i++){
            answer_arr.push(split_answer[i].split(") ")[0]);
        }
        answer=answer_arr.join(",");
    }
    if(correct_type=="2"){
        if(answer=="1"){
            answer="对/是";
        }else{
            answer="错/否";
        }
    }
    $("#display_jiexi_"+problem_index+"_"+question_index).show();
    $("#display_answer_"+problem_index+"_"+question_index).html(answer);
    $("#display_analysis_"+problem_index+"_"+question_index).html(analysis);

    //模拟用户操作，如单选题选择了哪个，selector选中哪个
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

//关闭答案，解析显示
function close_display_answer(problem_index,question_index){
    $("#display_jiexi_"+problem_index+"_"+question_index).hide();
}


//用户操作题目内小题
function do_inner_question(correct_type,problem_index,question_index){
    var this_answer = $("#input_inner_answer_"+problem_index+"_"+question_index).val();
    $("#exam_user_answer_"+problem_index+"_"+question_index).val(this_answer);
}

//题面内小题，需要隐藏右边的小题框
function choose_pro_question_list(problem_index,question_index){
    $(".pro_question_list_"+problem_index).hide();
    $(".pro_question_list_"+problem_index+":eq("+question_index+")").show();
}

//播放音频
function jplayer_play(src){
    $("#jquery_jplayer_1").jPlayer("setMedia", {
        mp3: src
    });
    $("#jquery_jplayer_1").jPlayer("play");
}

//ajax载入相关词汇
function ajax_load_about_words(words,problem_index,question_index){
    $.ajax({
        type: "POST",
        url: "/exam_users/ajax_load_about_words.json",
        dataType: "json",
        data : {
            "words":words
        },
        success : function(data) {
            var words_arr = words.split(";");
            $("#about_words_list").empty();
            var html_str="";
            n=0;
            for(var i=0;i<words_arr.length;i++){
                if(data[i]!=null){
                    html_str +="<li>";
                    html_str +="<a class='single_word_li' href='javascript:void(0);' onclick='javascript:show_single_word(this,"+n+");'>"+data[n].name+"</a>";
                    html_str +="<input type='hidden' id='about_word_name_"+n+"' value='"+data[n].name+"' />";
                    html_str +="<input type='hidden' id='about_word_category_id_"+n+"' value='"+data[n].category_id+"' />";
                    html_str +="<input type='hidden' id='about_word_en_mean_"+n+"' value='"+data[n].en_mean+"' />";
                    html_str +="<input type='hidden' id='about_word_ch_mean_"+n+"' value='"+data[n].ch_mean+"' />";
                    html_str +="<input type='hidden' id='about_word_types_"+n+"' value='"+data[n].types+"' />";
                    html_str +="<input type='hidden' id='about_word_phonetic_"+n+"' value='"+data[n].phonetic+"' />";
                    html_str +="<input type='hidden' id='about_word_enunciate_url_"+n+"' value='"+data[n].enunciate_url+"' />";
                    html_str +="<input type='hidden' id='about_word_sentences_"+n+"' value='"+data[n].sentences+"' />";
                    html_str +="</li>";
                    n++;

                }
            }
            $("#about_words_list").html(html_str);
            $(".single_word_li:eq(0)").trigger("click");
            if(data["error"]==null){
                $("#about_words_position_"+problem_index+"_"+question_index).append($("#about_words"));
            }else{
                tishi_alert(data["error"]);
            }

        }
    });
}

//关闭相关词汇框
function close_about_words(){
    $("#about_words_loader").append($("#about_words"));
}

//打开报告错误框
function open_report_error(question_id){
    $("#report_error").show();
    $("#report_error_description").val("");
    $(".report_error_radio").attr("checked",false);
    $("#report_error_question_id").val(question_id);
}

//ajax报告错误
function ajax_report_error(){
    if(!$(".report_error_radio:checked").val()){
        tishi_alert("请选择错误类型");
        return false;
    }
    $.ajax({
        type: "POST",
        url: "/exam_users/ajax_report_error.json",
        dataType: "json",
        data : {
            "post":{
                "paper_id":$("#report_error_paper_id").val(),
                "paper_title":$("#report_error_paper_title").val(),
                "user_id":$("#report_error_user_id").val(),
                "user_name":$("#report_error_user_name").val(),
                "description":$("#report_error_description").val(),
                "error_type":$(".report_error_radio:checked").val(),
                "question_id":$("#report_error_question_id").val()
            }
        },
        success : function(data) {
            tishi_alert(data["message"]);
            close_report_error();
        }
    });
}

//关闭报告错误框
function close_report_error(){
    $("#report_error").hide();
}

function show_single_word(ele,i){
    $(".single_word_li").removeClass("hover");
    $(ele).addClass("hover");
    $("#about_word_name").html($("#about_word_name_"+i).val());
    $("#about_word_en_mean").html($("#about_word_en_mean_"+i).val());
    $("#about_word_ch_mean").html($("#about_word_ch_mean_"+i).val());
    $("#about_word_types").html($("#about_word_types_"+i).val());
    $("#about_word_phonetic").html($("#about_word_phonetic_"+i).val());
    $("#about_word_enunciate_url").val($("#about_word_enunciate_url_"+i).val());
    var sentences = $("#about_word_sentences_"+i).val().split(";");
    var sentences_html = "";
    for(var i=0;i<sentences.length;i++){
        if(sentences[i]!=""){
            sentences_html += "<li>"+sentences[i]+"</li>";
        }
    }
    $("#about_word_sentences").html(sentences_html);
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

function confirm_redo(){
    if(confirm("如果您选择重做此卷，所有已保存的答案都将被清空。\n您确认要重做么？")){
        var category_id = category ? category : "2" ;
        window.location.href="/exam_users/"+init_exam_user_id+"/redo?category="+category_id;
    }
}