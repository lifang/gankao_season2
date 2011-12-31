var word_in_problem;
var types=[ "n.",  "v.",  "pron.",  "adj.",  "adv.","num.",  "art.","prep.","conj.", "interj.", "u = ",  "c = ",  "pl = "];
$(function(){
    var frag = document.createDocumentFragment();
    for(var i=0;i<tag_list.length;i++){
        var option=create_element("option", null, "options", null, null, "innerHTML");
        option.innerHTML=""+tag_list[i];
        frag.appendChild(option)   
    }
    $("#scope")[0].appendChild(frag);
    $("#scope").change(function () {
        var str ="";
        $("select option:selected").each(function () {//选取select中被选中的元素
            str +=$(this).text() ;
        });
        tag_types=str;
        setCookie("collection_problem_init","0");
        init_problem=0;
        load_problem_collection(init_problem,tag_types);
    })
  
    $("#jplayer").jPlayer({
        swfPath: "/javascripts/jplayer",
        supplied: "mp3",
        wmode: "window"
    });
})


function load_problem_collection(problem_index,tag){
    var word_list=[];
    var problems_tags=tag_problems[tag];
    var questions=problems_tags[problem_index].questions.question;
    for(var n=0;n<questions.length;n++){
        if(questions[n].words!=undefined){
            var words= questions[n].words.split(";");
            for(var m=0;m<words.length;m++){
                if(word_list.indexOf(words[m])==-1){
                    word_list.push(""+words[m]);
                }
            }
        }
    }
    $("#global_problem_sum").html(problems_tags.length);
    $("#global_problem_index").html(problem_index+1);
    $("#global_problem_title").html(problems_tags[problem_index].title);
    if(word_list.length!=0){
        //准备数据，为problems加载词汇
        $.ajax({
            async:true,
            type: "POST",
            url: "/collections/load_words.json",
            dataType: "json",
            data : {
                words :word_list
            },
            success : function(data) {
                word_in_problem=data.words;
                //组合questions数组
                load_questions_collection(questions,problem_index,tag);
            }
        });
    }else{
        //组合questions数组
        load_questions_collection(questions,problem_index,tag);
    }
}

//循环载入小题
function load_questions_collection(questions,problem_index,tag){
    $("#questions_resource").empty();
    for(var q_index=0;q_index<questions.length;q_index++){
        var tags= questions[q_index].tags==undefined?[]:questions[q_index].tags.split(",");
        if(tag=="全部收藏"||tags.indexOf(tag)!=-1){
            var q_description = questions[q_index].description ;
            var q_correct_type = questions[q_index].correct_type;
            var q_answer = questions[q_index].answer==undefined ? "" : questions[q_index].answer;
            var q_analysis = questions[q_index].analysis==null? "":questions[q_index].analysis;
            var u_answer =  questions[q_index].user_answer[0];
            var pro_question_list = $("#questions_resource")[0].appendChild(create_element("div", null, null, "pro_question_list p_q_line", null, "innerHTML"));
            var pql_left = pro_question_list.appendChild(create_element("div", null, null, "pql_left", null, "innerHTML"));
            pql_left.innerHTML=""+(q_index+1)+".";
            var pql_right = pro_question_list.appendChild(create_element("div", null, null, "pql_right p_q_line", null, "innerHTML"));
            var pro_qu_t = pql_right.appendChild(create_element("div", null, "pro_qu_t_"+q_index, "pro_qu_t pro_qu_k pro_qu_h", null, "innerHTML"));
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
            var pro_qu_div = pql_right.appendChild(create_element("div", null, "pro_qu_div_"+q_index, "pro_qu_div", null, "innerHTML"));
            pro_qu_div.style.display="none";
            //pro_qu_ul 小题答案div
            var pro_qu_ul = pro_qu_div.appendChild(create_element("div", null, "pro_qu_ul_"+q_index, "pro_qu_ul", null, "innerHTML"));
            collection_correct_type(q_correct_type,pro_qu_ul,problem_index,q_index);
            var pro_btn = pro_qu_div.appendChild(create_element("div", null, "pro_btn_"+q_index, "pro_btn", null, "innerHTML"));
            pro_btn.innerHTML +="<button class='t_btn hedui_t_btn' style='display:none' onclick=\"javascript:check_question("+q_index+",'"+problem_index+"_"+q_index+"','"+escape(q_answer) +"',"+problem_index+")\">核对</button>"
            pro_btn.innerHTML += "<a href='#' class='upErrorTo_btn' onclick=javascript:$('#question_id').val("+questions[q_index].id +");show_div('.upErrorTo_tab');>报告错误</a>";
            pro_btn.innerHTML += "<a href='javascript:void(0);' onclick=javascript:$('.word_"+problem_index+"_"+q_index+"').css('display','');>相关词汇</a>";
            var jiexi = pro_qu_div.appendChild(create_element("div", null, "display_jiexi_"+problem_index+"_"+q_index, "jiexi", null, "innerHTML"));
            var xx_x = jiexi.appendChild(create_element("div", null, null, "xx_x", null, "innerHTML"));
            xx_x.innerHTML="<img onclick=\"javascript:close_display_answer("+problem_index+","+q_index+");\" src='/assets/x.gif' />";
            jiexi.innerHTML +="<div>正确答案：<span id='display_answer_"+problem_index+"_"+q_index+"' class='red'>"+ show_answer(q_correct_type,q_answer)+"</span></div>";
            jiexi.innerHTML +="<div id='display_analysis_"+problem_index+"_"+q_index+"'>"+q_analysis  +"</div>";
            var jiexi_word = pro_qu_div.appendChild(create_element("div", null, null, "jiexi word_"+problem_index+"_"+q_index, null, "innerHTML"));
            jiexi_word.style.display="none";
            var xx_word = jiexi_word.appendChild(create_element("div", null, null, "xx_x", null, "innerHTML"));
            xx_word.innerHTML="<img onclick=javascript:$('.word_"+problem_index+"_"+q_index+"').css('display','none'); src='/assets/x.gif' />";
            var xg_word=jiexi_word.appendChild(create_element("div", null, null, "xg_words", null, "innerHTML"));
            var words= questions[q_index].words==undefined ?[]:questions[q_index].words.split(";");
            if(words.length!=0){
                var word_ul=xg_word.appendChild(create_element("ul", null, null, null, null, "innerHTML"));
                for(var k=0;k<words.length;k++){
                    jiexi_word.appendChild(create_element("input", null, "li_value_"+ q_index+"_"+k, "", "hidden",words[k]))
                    var word_li=create_element("li", null, null, null, null, "innerHTML");
                    var li_a="<a href='#' onclick=javascript:show_words("+q_index+","+k+")>"+words[k] +"</a>";
                    word_li.innerHTML=li_a;
                    word_ul.appendChild(word_li);
                }
                jiexi_word.appendChild(create_element("input", null, "enunciate_url_"+q_index, "", "hidden",word_in_problem[words[0]][0].enunciate_url ))
                var xg_word_ny=jiexi_word.appendChild(create_element("div", null, null, "xg_words_ny", null, "innerHTML"));
                var ch_text=xg_word_ny.appendChild(create_element("div", null, null, "ch_text", null, "innerHTML"));
                var ch_words_line_1=ch_text.appendChild(create_element("div", null, "ch_words_line", "ch_words_line", null, "innerHTML"));
                var ch_words_line_2=ch_text.appendChild(create_element("div", null, "ch_words_line", "ch_words_line", null, "innerHTML"));
                var ch_words_line_3=ch_text.appendChild(create_element("div", null, "ch_words_line_"+q_index, "ch_words_line", null, "innerHTML"));
                ch_words_line_1.innerHTML="<span class='font_size_24' id='name_"+q_index +"'>"+word_in_problem[words[0]][0].name +"</span><span id='types_"+q_index +"'>"+
                types[word_in_problem[words[0]][0].types] +"</span><span id='phonetic"+q_index +"'>"+word_in_problem[words[0]][0].phonetic +"</span>\n\
                <a href='#'onclick=javascript:jplayer_play("+q_index +");><img src='/assets/icon_fy.png' /></a>"
                ch_words_line_2.innerHTML="<p class='font_size_16' id='en_mean"+ q_index+"'>"+word_in_problem[words[0]][0].en_mean +"</p><p id='ch_mean"+q_index +"'>"+word_in_problem[words[0]][0].ch_mean +"</p>";
                var sentence=word_in_problem[words[0]][1];
                if(sentence.length!=0){
                    var sentence_ul=ch_words_line_3.appendChild(create_element("ul", null, null, null, null, "innerHTML"));
                    for(var s=0;s<sentence.length;s++){
                        var li=sentence_ul.appendChild(create_element("ul", null, null, null, null, "innerHTML"));
                        li.innerHTML=""+sentence[s].description;
                    }
                }
            }else{
                xg_word.innerHTML="<center>没有相关词汇</center>"
            }



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
}

function show_words(index,li_index){
    var name=$("#li_value_"+ index+"_"+li_index).val();
    $("#enunciate_url_"+index).val(word_in_problem[name][0].enunciate_url);
    $("#name_"+index).html(word_in_problem[name][0].name);
    $("#types_"+index).html(types[word_in_problem[name][0].types]);
    $("#phonetic_"+index).html(word_in_problem[name][0].phonetic);
    $("#en_mean_"+index).html(word_in_problem[name][0].en_mean);
    $("#ch_mean_"+index).html(word_in_problem[name][0].ch_mean);
    var sentences=word_in_problem[name][1];
    var  words_line=$("#ch_words_line_"+index);
    words_line.html(null);
    var frag = document.createDocumentFragment();
    if(sentences.length!=0){
        for(var s=0;s<sentences.length;s++){
            var li=frag.appendChild(create_element("li", null, null, null, null, "innerHTML"));
            li.innerHTML=""+sentences[s].description;
        }
        words_line.html(frag);
    }
}
function jplayer_play(index){
    var src=$('#enunciate_url_'+index).val();
    $("#jplayer").jPlayer("setMedia", {
        mp3: "http://localhost:3000/"+src
    });
    $("#jplayer").jPlayer("play");
}

//根据小题的类型，区别操作
function collection_correct_type(correct_type,ele,problem_index,question_index){
    //显示单选题
    var question_detail = problems[problem_index].questions.question[question_index];
    var q_answer = question_detail.answer==undefined ? null : question_detail.answer;
    var q_analysis =question_detail.analysis==undefined ? null : question_detail.analysis;
    var u_answer = question_detail.user_answer==undefined ? null : question_detail.user_answer[0];
    //单选题
    if(question_detail.user_answer!=undefined&&u_answer==q_answer){
        $("#pass_radio_"+problem_index+"_"+question_index).attr("checked",true);
        $("#green_dui_"+problem_index+"_"+question_index).show();
        $("#red_cuo_"+problem_index+"_"+question_index).hide();
    }else{
        $("#pass_radio_"+problem_index+"_"+question_index).attr("checked",false);
        $("#green_dui_"+problem_index+"_"+question_index).hide();
        $("#red_cuo_"+problem_index+"_"+question_index).show();
    }
    if(correct_type=='0'){
        var attrs =  question_detail.questionattrs.split(";-;");
        var ul = ele.appendChild(create_element("ul", null, null, null, null, "innerHTML"));
        for(var i=0;i<attrs.length;i++){
            var li = ul.appendChild(create_element("li", null, null, null, null, "innerHTML"));
            if(attrs[i].split(") ")[0]&&attrs[i].split(") ")[1]){
                var span_li="<span class='single_choose_li";
                if(question_detail.user_answer!=undefined&&attrs[i]==u_answer){
                    span_li += " hover";
                }
                span_li +=   "'>"+attrs[i].split(") ")[0]+"</span>"+attrs[i].split(") ")[1];
                li.innerHTML=""+span_li;
            }else{
                li.innerHTML="<span>X</span><font color='red'>该选项存在问题，请修正或联系管理员</font>";
            }
        }
    }

    //多选题
    if(correct_type=='1'){
        var attrs =  question_detail.questionattrs.split(";-;");
        var ul = ele.appendChild(create_element("ul", null, null, null, null, "innerHTML"));
        var u_answers=u_answer==null?[]:u_answer.split(";-;")
        for(var i=0;i<attrs.length;i++){
            var li = ul.appendChild(create_element("li", null, null, null, null, "innerHTML"));
            if(attrs[i].split(") ")[0]&&attrs[i].split(") ")[1]){
                span_li = "<span class='multi_choose_li";
                if(question_detail.user_answer!=undefined&&u_answers.indexOf(attrs[i])!=-1){
                    span_li += " hover";
                }
                span_li += "'>"+attrs[i].split(") ")[0]+"</span>"+attrs[i].split(") ")[1];
                li.innerHTML=span_li;
            }else{
                li.innerHTML="<span>X</span><font color='red'>该选项存在问题，请修正或联系管理员</font>";
            }
        }
    }

    //判断题
    if(correct_type=='2'){
        var ul2 = ele.appendChild(create_element("ul", null, null, null, null, "innerHTML"));
        var li1 = ul2.appendChild(create_element("li", null, null, null, null, "innerHTML"));
        var span_li1="<span class='single_choose_li"
        if(question_detail.user_answer!=undefined&&parseInt(u_answer)==1){
            span_li1 += " hover";
        }
        span_li1 += "'></span>对/是";
        li1.innerHTML=span_li1;
        var li2 = ul2.appendChild(create_element("li", null, null, null, null, "innerHTML"));
        var span_li2="<span class='single_choose_li"
        if(question_detail.user_answer!=undefined&&parseInt(u_answer)==0){
            span_li2 += " hover";
        }
        span_li2 +="'></span>错/否";
        li2.innerHTML=span_li2
    }

    //填空题
    if(correct_type=='3'){
        var answer= u_answer==null? "": u_answer
        ele.innerHTML="<input id='fill_blank_"+problem_index+"_"+question_index+"' type='text' class='input_xz' value='"+answer +"' disabled>";
    }

    //简答题
    if(correct_type=='5'){
        var answer5= u_answer==null? "": u_answer
        ele.innerHTML="<textarea cols='' rows='' class='textarea_xz1' disabled>"+ answer5+"</textarea>";
    }

}

//下一题
function click_next_problem(){
    if(init_problem==(tag_problems[tag_types].length-1)){
        tishi_alert("当前已是最后一题");
        return false;
    }
    init_problem = init_problem+1;
    setCookie("collection_problem_init",init_problem);
    load_problem_collection(init_problem,tag_types);
}

//上一题
function click_prev_problem(){
    if(init_problem==0){
        tishi_alert("当前已是第一题");
        return false;
    }
    init_problem = init_problem-1;
    setCookie("collection_problem_init",init_problem);
    load_problem_collection(init_problem,tag_types);
}

function get_array(value){
    var result = [];
    if(value){
        if(value.length){
            result = value;
        }else{
            result.push(value);
        }
    }
    return result;
}

//核对小题
function check_question(question_index,problem_question_index,answer,problem_index){
    answer=unescape(answer);
    var user_answer = $("#user_answer_"+question_index).val();
    if(user_answer==answer){
        $("#pro_qu_t_"+question_index).css("background","#DBEAD5");
        $("#pro_qu_t_"+question_index).closest(".pro_question_list").css("background","#DBEAD5");
        $("#pass_radio_"+problem_question_index).attr("checked",true);
        $("#green_dui_"+problem_question_index).show();
        $("#red_cuo_"+problem_question_index).hide();
    }else{
        $("#pro_qu_t_"+question_index).css("background","#FEE6E6");
        $("#pro_qu_t_"+question_index).closest(".pro_question_list").css("background","#FEE6E6");
        $("#pass_radio_"+problem_question_index).attr("checked",false);
        $("#green_dui_"+problem_question_index).hide();
        $("#red_cuo_"+problem_question_index).show();
        var collection_problem=get_array(collections.problems.problem);
        for(var i=0;i<collection_problem.length;i++){
            collections.problems.problem[i].questions.question=get_array(collection_problem[i].questions.question);
        }
        var one_problem=tag_problems[tag_types][problem_index];
        one_problem.questions.question[question_index].user_answer.push(user_answer);
        collections.problems.problem[problems.indexOf(tag_problems[tag_types][problem_index])].questions.question[question_index].user_answer=one_problem.questions.question[question_index].user_answer;
        alert(collections.problems.problem[problems.indexOf(tag_problems[tag_types][problem_index])].questions.question[question_index].user_answer);
        var new_collection=collections;
        alert(new_collection.problems.problem[problems.indexOf(tag_problems[tag_types][problem_index])].questions.question[question_index].user_answer);
        $.ajax({
            async:true,
            type: "POST",
            url: "/collections/write_file.json",
            dataType: "json",
            data : {
                collecton :JSON.stringify(new_collection)
                
            }
        });
    }
    $("#pro_qu_div_"+ question_index+" .pro_btn a").css("display","");
    $("#display_jiexi_"+problem_question_index).show();
  
}

//字体放大、缩小
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

//关闭答案，解析显示
function close_display_answer(problem_index,question_index){
    $("#display_jiexi_"+problem_index+"_"+question_index).hide();
}
//附加答案
function show_answer(correct_type,answer){
    var answers;
    if(correct_type=="0"){
        answers=answer.split(") ")[0];
    }
    if(correct_type=="1"){
        var split_answer = answer.split(";|;");
        var answer_arr=[];
        for(var i=0;i<split_answer.length;i++){
            answer_arr.push(split_answer[i].split(") ")[0]);
        }
        answers=answer_arr.join(",");
    }
    if(correct_type=="2"){
        if(answer=="1"){
            answers="对/是";
        }else{
            answers="错/否";
        }
    }
    if(correct_type=="3"||correct_type=="5"){
        answers=answer;
    }
    return answers==undefined ? "" : answers
}

//将弹出层放置在页面中间
function show_div(id){
    var scolltop = document.body.scrollTop|document.documentElement.scrollTop;
    var win_height = document.documentElement.clientHeight;//jQuery(document).height();
    var win_width = jQuery(window).width();
    var z_layer_height = jQuery(id).height();
    var z_layer_width = jQuery(id).width();
    jQuery(id).css('top',(win_height-z_layer_height)/2 + scolltop);
    jQuery(id).css('left',(win_width-z_layer_width)/2);
    jQuery(id).css('display','block');
}

function test_again(){
    var problems_tags=tag_problems[tag_types];
    var questions=problems_tags[init_problem].questions.question;
    for(var q_index=0;q_index<questions.length;q_index++){
        var correct_type=questions[q_index].correct_type;
        var answer= questions[q_index].answer==undefined ? "" : questions[q_index].answer
        var tags= questions[q_index].tags==undefined?[]:questions[q_index].tags.split(",");
        if(tag_types=="全部收藏"||tags.indexOf(tag_types)!=-1){
            $("#green_dui_"+init_problem+"_"+q_index).hide();
            $("#red_cuo_"+init_problem+"_"+q_index).hide();
            $(".pro_btn a").css("display","none");
            $(".pro_btn button").css("display","");
            $(".jiexi").css("display","none");
            var ele=$("#pro_qu_ul_"+q_index);
            ele.html("");
            next_correct_type(correct_type,ele,init_problem,q_index,questions[q_index]);
            $(".pro_question_list,.pro_qu_t").attr("style","");
            $("#pro_qu_ul_"+q_index).html($("#pro_qu_ul_"+q_index).html()+"<input id='user_answer_"+q_index+"' value='' type='hidden' />");
        }
    }
}

//根据小题的类型，区别操作
function next_correct_type(correct_type,ele,problem_index,question_index,question_detail){
    //单选题
    var frag = document.createDocumentFragment();
    if(correct_type=='0'){
        var attrs =  question_detail.questionattrs.split(";-;");
        var ul = frag.appendChild(create_element("ul", null, null, null, null, "innerHTML"));
        for(var i=0;i<attrs.length;i++){
            var li = ul.appendChild(create_element("li", null, null, null, null, "innerHTML"));
            if(attrs[i].split(") ")[0]&&attrs[i].split(") ")[1]){
                li.innerHTML="<span class='single_choose_li single_choose_"+problem_index+"_"+question_index+"' onclick=javascript:do_answer(this,'"+escape(attrs[i])+"','"+question_index+"',"+correct_type+");>"+attrs[i].split(") ")[0]+"</span>"+attrs[i].split(") ")[1];
            }else{
                li.innerHTML="<span>X</span><font color='red'>该选项存在问题，请修正或联系管理员</font>";
            }
        }
    }

    //多选题
    if(correct_type=='1'){
        var attrs_more =  question_detail.questionattrs.split(";-;");
        var ul_more = frag.appendChild(create_element("ul", null, null, null, null, "innerHTML"));
        for(var k=0;k<attrs_more.length;k++){
            var li_more = ul_more.appendChild(create_element("li", null, null, null, null, "innerHTML"));
            if(attrs_more[k].split(") ")[0]&&attrs_more[k].split(") ")[1]){
                li_more.innerHTML = "<span class='multi_choose_li multi_choose_"+problem_index+"_"+question_index+"' onclick=javascript:do_answer(this,'"+escape(attrs_more[k])+"','"+question_index+"',"+correct_type+");>"+attrs_more[k].split(") ")[0]+"</span>"+attrs_more[k].split(") ")[1];
            }else{
                li_more.innerHTML="<span>X</span><font color='red'>该选项存在问题，请修正或联系管理员</font>";
            }
        }
    }
    //判断题
    if(correct_type=='2'){
        var judge_ul = frag.appendChild(create_element("ul", null, null, null, null, "innerHTML"));
        var judge_li1 = judge_ul.appendChild(create_element("li", null, null, null, null, "innerHTML"));
        judge_li1.innerHTML="<span class='single_choose_li judge_"+problem_index+"_"+question_index+"' onclick=javascript:do_judge(this,'1','"+question_index+"',"+correct_type +");></span>对/是";
        var judge_li2 = judge_ul.appendChild(create_element("li", null, null, null, null, "innerHTML"));
        judge_li2.innerHTML="<span class='single_choose_li judge_"+problem_index+"_"+question_index+"' onclick=javascript:do_judge(this,'0','"+question_index+"',"+correct_type +");></span>错/否";
    }
    ele.html(frag);
    //填空题
    if(correct_type=='3'){
        ele.html("<input id='fill_blank_"+problem_index+"_"+question_index+"' type='text' class='input_xz' onchange=javascript:do_answer(this,this.value,'"+question_index+"',"+correct_type +");>");
    }
    //简答题
    if(correct_type=='5'){
        ele.html("<textarea cols='' rows='' class='textarea_xz1' onchange='javascript:do_answer(this,this.value,'"+question_index+"',"+correct_type +");'></textarea>");
    }
}

function do_answer(e,single_answer,question,correct_type){
    $(e).toggleClass("hover");
    var answer=unescape(single_answer);
    if(correct_type!='1'){
        $("#user_answer_"+question).val(unescape(answer));
    }else{
        var all_answer=$("#user_answer_"+question).val();
        if(all_answer.length!=0){
            if(all_answer.indexOf(answer)==-1){
                all_answer +=(";|;"+answer);
            }else{
                var answers=all_answer.split(";|;");
                if(answers.length==1){
                    all_answer=all_answer.replace(answer,"");
                }else{
                    if (answers.indexOf(answer)==0){
                        all_answer=all_answer.replace(answer+";|;","");
                    }else{
                        all_answer=all_answer.replace(";|;"+answer,"");
                    }
                }               
            }
        }else{
            all_answer=answer;
        }
        $("#user_answer_"+question).val(all_answer);
    }
}

function for_error(){
    var question_id=$("#question_id").val();
    var paper_id=tag_problems[tag_types][init_problem].paper_id;
    $.ajax({
        type: "POST",
        url: "/exam_users/ajax_report_error.json",
        dataType: "json",
        data : {
            "post":{
                "paper_id":paper_id,
                "user_id":"1",//getCookies("user_id"),
                "user_name":"qianjun",//getCookies("user_name"),
                "description":$("#error_content").val(),
                "error_type":$("#upErrorTo_tab radio:checked").val(),
                "question_id":question_id
            }
        },
        success : function(data) {
            tishi_alert(data["message"]);
        }
    });
}