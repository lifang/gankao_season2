
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
        setCookie("init_problem",$(".problem_resource").index(next_problem));
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
        setCookie("init_problem",$(".problem_resource").index(prev_problem));
    }
}

last_opened_question = null;
//点击显示隐藏小题
$(function(){  
    $(".pro_qu_t").bind("click",function(){
        var pro_qu_div = $(this).parent().find(".pro_qu_div");
        if(pro_qu_div.is(":visible")){
            pro_qu_div.hide();
            $(this).parent().parent().addClass("p_q_line");
            $(this).parent().addClass("p_q_line");
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
                last_opened_question.parent().addClass("p_q_line");
                last_opened_question.addClass("pro_qu_h");
                var pass = last_opened_question.parent().find(".pass_check").val();
                change_color(pass,last_opened_question);
            }
            last_opened_question = $(this);
        }
    })
})

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
function check_question(correct_type,answer,analysis,problem_index,question_index){
    $("#display_answer_"+problem_index+"_"+question_index).empty();
    $("#display_analysis_"+problem_index+"_"+question_index).empty();
    var user_answer = $("#exam_user_answer_"+problem_index+"_"+question_index).val();
    if(user_answer==answer){
        $("#pass_check_"+problem_index+"_"+question_index).val(1);
        $("#green_dui_"+problem_index+"_"+question_index).show();
        $("#red_cuo_"+problem_index+"_"+question_index).hide();
    }else{
        $("#pass_check_"+problem_index+"_"+question_index).val(0);
        $("#green_dui_"+problem_index+"_"+question_index).hide();
        $("#red_cuo_"+problem_index+"_"+question_index).show();
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

//关闭答案，解析显示
function close_display_answer(problem_index,question_index){
    $("#display_jiexi_"+problem_index+"_"+question_index).hide();
}