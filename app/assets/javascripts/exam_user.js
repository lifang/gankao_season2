
//下一题
function click_next_problem(){
    if(init_problem==(problems.length-1)){
        tishi_alert("当前已是最后一题");
        return false;
    }
    init_problem = init_problem+1;
    setCookie("init_problem",init_problem);
    load_problem(init_problem);
}

//上一题
function click_prev_problem(){
    if(init_problem==0){
        tishi_alert("当前已是第一题");
        return false;
    }
    init_problem = init_problem-1;
    setCookie("init_problem",init_problem);
    load_problem(init_problem);
}


//载入题目
function load_problem(problem_index){
    $("#global_problem_index").html(problem_index+1);
    $("#global_problem_title").html(problems[problem_index].title);

    //组合questions数组
    load_questions(problems[problem_index].questions.question,problem_index);
    var p_answer = answers[problem_index];
    var u_answer = storage[problem_index];
    for(var i=0;i<u_answer.length;i++){
        if(u_answer[i]!=""){
            $("#exam_user_answer_"+problem_index+"_"+i).val(u_answer[i]);
            $(".hedui_t_btn:eq("+i+")").trigger("click");
        }
    }
}

//循环载入小题
function load_questions(questions,problem_index){
    $("#questions_resource").empty();
    for(var q_index=0;q_index<questions.length;q_index++){
        var q_description = questions[q_index].description ;
        var q_correct_type = questions[q_index].correct_type;
        var q_answer =answers[problem_index][q_index].answer;
        var q_analysis =answers[problem_index][q_index].analysis;
        var u_answer = storage[problem_index][q_index];
        var pro_question_list = $("#questions_resource")[0].appendChild(create_element("div", null, null, "pro_question_list p_q_line", null, "innerHTML"));
        var pql_left = pro_question_list.appendChild(create_element("div", null, null, "pql_left", null, "innerHTML"));
        pql_left.innerHTML=""+(q_index+1)+".";
        var pql_right = pro_question_list.appendChild(create_element("div", null, null, "pql_right p_q_line", null, "innerHTML"));
        var pro_qu_t = pql_right.appendChild(create_element("div", null, null, "pro_qu_t pro_qu_k pro_qu_h", null, "innerHTML"));
        if(q_description!=null){
            pro_qu_t.innerHTML=q_description;
        }
        var pass_radio = pql_right.appendChild(create_element("input",null,"pass_radio_"+problem_index+"_"+q_index,"pass_radio","radio",""));
        pass_radio.style.display="none";
        var green_dui = pql_right.appendChild(create_element("div", null, "green_dui_"+problem_index+"_"+q_index, "green_dui", null, "innerHTML"));
        green_dui.innerHTML="<img src='/assets/green_dui.png' />";
        green_dui.style.display="none";
        var red_cuo = pql_right.appendChild(create_element("div", null, "red_cuo_"+problem_index+"_"+q_index, "green_dui", null, "innerHTML"));
        red_cuo.innerHTML="<img src='/assets/red_cuo.png' />";
        red_cuo.style.display="none";
        var pro_qu_div = pql_right.appendChild(create_element("div", null, null, "pro_qu_div", null, "innerHTML"));
        pro_qu_div.style.display="none";
        var exam_user_answer = pro_qu_div.appendChild(create_element("input", null, "exam_user_answer_"+problem_index+"_"+q_index, "exam_user_answer", "hidden", ""));
        //pro_qu_ul 小题答案div
        var pro_qu_ul = pro_qu_div.appendChild(create_element("div", null, null, "pro_qu_ul", null, "innerHTML"));
        generate_correct_type(q_correct_type,pro_qu_ul,problem_index,q_index,exam_user_answer);
        var pro_btn = pro_qu_div.appendChild(create_element("div", null, null, "pro_btn", null, "innerHTML"));
        pro_btn.innerHTML += "<button class='t_btn hedui_t_btn' onclick=\"javascript:check_question('"+q_correct_type+"','"+escape(q_answer)+"','"+escape(q_analysis)+"',"+problem_index+","+q_index+")\">核对</button>"
        pro_btn.innerHTML += "<a href='javascript:void(0);'>报告错误</a>";
        pro_btn.innerHTML += "<a href='javascript:void(0);'>相关词汇</a>";
        var jiexi = pro_qu_div.appendChild(create_element("div", null, "display_jiexi_"+problem_index+"_"+q_index, "jiexi", null, "innerHTML"));
        jiexi.style.display="none";
        var xx_x = jiexi.appendChild(create_element("div", null, null, "xx_x", null, "innerHTML"));
        xx_x.innerHTML="<img onclick=\"javascript:close_display_answer("+problem_index+","+q_index+");\" src='/assets/x.gif' />";
        jiexi.innerHTML +="<div>正确答案：<span id='display_answer_"+problem_index+"_"+q_index+"' class='red'></span></div>";
        jiexi.innerHTML +="<div id='display_analysis_"+problem_index+"_"+q_index+"'></div>";

        //预载用户的答案
        if(u_answer!=""){
            if(u_answer==q_answer){
                $(pro_qu_t).css("background","#DBEAD5");
                $(pro_qu_t).closest(".pro_question_list").css("background","#DBEAD5");
            }else{
                $(pro_qu_t).css("background","#FEE6E6");
                $(pro_qu_t).closest(".pro_question_list").css("background","#FEE6E6");
            }
        }
        
        //绑定显示，隐藏事件
        $(pro_qu_t).bind("click",function(){
            var pro_qu_div = $(this).parent().find(".pro_qu_div");
            var checked = $(this).parent().find(".pass_radio").is(":checked");
            if(pro_qu_div.is(":visible")){
                pro_qu_div.hide();
                $(this).parent().parent().addClass("p_q_line");
                $(this).parent().addClass("p_q_line");
                $(this).addClass("pro_qu_h");
                if(checked){
                    $(this).css("background","#DBEAD5");
                    $(this).closest(".pro_question_list").css("background","#DBEAD5");
                }else{
                    $(this).css("background","#FEE6E6");
                    $(this).closest(".pro_question_list").css("background","#FEE6E6");
                }
                last_open_question=null;
            }else{
                if(last_open_question!=null){
                    last_open_question.trigger("click");
                }
                pro_qu_div.show();
                $(this).parent().parent().removeClass("p_q_line");
                $(this).parent().removeClass("p_q_line");
                $(this).removeClass("pro_qu_h");
                $(this).css("background","");
                $(this).closest(".pro_question_list").css("background","");
                last_open_question=$(this);
            }
        })
    }
}

//根据小题的类型，区别操作
function generate_correct_type(correct_type,ele,problem_index,question_index,exam_user_answer){
    //显示单选题
    var question_detail = problems[problem_index].questions.question[question_index];
    var q_answer = answers[problem_index][question_index];
    var u_answer = storage[problem_index][question_index];
    //单选题
    if(correct_type=='0'){
        var attrs =  question_detail.questionattrs.split(";-;");
        var ul = ele.appendChild(create_element("ul", null, null, null, null, "innerHTML"));
        for(var i=0;i<attrs.length;i++){
            var li = ul.appendChild(create_element("li", null, null, null, null, "innerHTML"));
            if(attrs[i].split(") ")[0]&&attrs[i].split(") ")[1]){
                li.innerHTML="<span class='single_choose_li single_choose_"+problem_index+"_"+question_index+"' onclick='javascript:do_single_choose(this,\""+escape(attrs[i])+"\","+problem_index+","+question_index+");'>"+attrs[i].split(") ")[0]+"</span>"+attrs[i].split(") ")[1];
            }else{
                li.innerHTML="<span>X</span><font color='red'>该选项存在问题，请修正或联系管理员</font>";
            }
        }
    }

    //多选题
    if(correct_type=='1'){
        var attrs =  question_detail.questionattrs.split(";-;");
        var ul = ele.appendChild(create_element("ul", null, null, null, null, "innerHTML"));
        for(var i=0;i<attrs.length;i++){
            var li = ul.appendChild(create_element("li", null, null, null, null, "innerHTML"));
            if(attrs[i].split(") ")[0]&&attrs[i].split(") ")[1]){
                li.innerHTML = "<span class='multi_choose_li multi_choose_"+problem_index+"_"+question_index+"' onclick='javascript:do_multi_choose(this,\""+escape(question_detail.questionattrs)+"\","+problem_index+","+question_index+");'>"+attrs[i].split(") ")[0]+"</span>"+attrs[i].split(") ")[1];
            }else{
                li.innerHTML="<span>X</span><font color='red'>该选项存在问题，请修正或联系管理员</font>";
            }
        }
    }

    //判断题
    if(correct_type=='2'){
        var ul = ele.appendChild(create_element("ul", null, null, null, null, "innerHTML"));
        var li = ul.appendChild(create_element("li", null, null, null, null, "innerHTML"));
        li.innerHTML="<span class='single_choose_li judge_"+problem_index+"_"+question_index+"' onclick='javascript:do_judge(this,\"1\","+problem_index+","+question_index+");'></span>对/是";
        var li = ul.appendChild(create_element("li", null, null, null, null, "innerHTML"));
        li.innerHTML="<span class='single_choose_li judge_"+problem_index+"_"+question_index+"' onclick='javascript:do_judge(this,\"0\","+problem_index+","+question_index+");'></span>错/否";
    }

    //填空题
    if(correct_type=='3'){
        ele.innerHTML="<input id='fill_blank_"+problem_index+"_"+question_index+"' type='text' class='input_xz' onchange='javascript:do_fill_blank(this,this.value,"+problem_index+","+question_index+");'>";
    }

    //简答题
    if(correct_type=='5'){
        ele.innerHTML="<textarea cols='' rows='' class='textarea_xz1' onchange='javascript:do_fill_blank(this,this.value,"+problem_index+","+question_index+");'></textarea>";
    }

}

//单选题,做题
function do_single_choose(ele,answer,problem_index,question_index){
    answer=unescape(answer);
    //hide_detail(problem_index,question_index);
    $(".single_choose_"+problem_index+"_"+question_index).removeClass("hover");
    $(ele).addClass("hover");
    $("#exam_user_answer_"+problem_index+"_"+question_index).val(answer);
}

//多选题，做题
function do_multi_choose(ele,attrs,problem_index,question_index){
    attrs=unescape(attrs).split(";-;");
    //hide_detail(problem_index,question_index);
    $(ele).toggleClass("hover");
    var ques_index = 0;
    var user_answer = [];
    $(".multi_choose_"+problem_index+"_"+question_index).each(function(){
        if($(this).hasClass("hover")){
            user_answer.push(attrs[ques_index]);
        }
        ques_index++;
    });
    $("#exam_user_answer_"+problem_index+"_"+question_index).val(user_answer.join(";|;"));
}

//判断，做题
function do_judge(ele,answer,problem_index,question_index){
    //hide_detail(problem_index,question_index);
    $(".judge_"+problem_index+"_"+question_index).removeClass("hover");
    $(ele).addClass("hover");
    $("#exam_user_answer_"+problem_index+"_"+question_index).val(answer);
}

function do_fill_blank(ele,answer,problem_index,question_index){
    //hide_detail(problem_index,question_index);
    $("#exam_user_answer_"+problem_index+"_"+question_index).val(answer);
}

//做题时，清空之前的答案判断
function hide_detail(problem_index,question_index){
    $("#green_dui_"+problem_index+"_"+question_index).hide();
    $("#red_cuo_"+problem_index+"_"+question_index).hide();
    $("#display_jiexi_"+problem_index+"_"+question_index).hide();
}

//核对小题
function check_question(correct_type,answer,analysis,problem_index,question_index){
    answer=unescape(answer);
    analysis=unescape(analysis);
    $("#display_answer_"+problem_index+"_"+question_index).empty();
    $("#display_analysis_"+problem_index+"_"+question_index).empty();
    var user_answer = $("#exam_user_answer_"+problem_index+"_"+question_index).val();
    storage[problem_index][question_index]=user_answer;
    if(user_answer==answer){
        $("#pass_radio_"+problem_index+"_"+question_index).attr("checked",true);
        $("#green_dui_"+problem_index+"_"+question_index).show();
        $("#red_cuo_"+problem_index+"_"+question_index).hide();
    }else{  
        $("#pass_radio_"+problem_index+"_"+question_index).attr("checked",false);
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