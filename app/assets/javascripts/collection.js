var word_in_problem={};
var types=[ "n.",  "v.",  "pron.",  "adj.",  "adv.","num.",  "art.","prep.","conj.", "interj.", "u = ",  "c = ",  "pl = "];
var question_types=["单选题","多选题","判断题","填空题","","简答题"];
var close_question=null;
var collections;
//预载页面信息
$(document).ready(function(){
    $.ajax({
        async:true,
        type: "POST",
        url: "/collections/get_collections.json",
        dataType: "json",
        success : function(data) {
            collections=data.message;
            if (collections.problems.problem==null||collections.problems.problem.length==0||collections.problems.problem==""){
                window.location.href='/collections/error'
            }else{
                var problem=get_array(collections.problems.problem);
                var word_list=[];
                for(var i=0;i<problem.length;i++){
                    var questions=get_array(problem[i].questions.question);
                    problem[i].questions.question=questions;
                    for(var n=0;n<questions.length;n++){
                        var answer_array=[]
                        if(problem[i].questions.question[n].user_answer==null){
                            problem[i].questions.question[n].user_answer=[];
                        }else{
                            "string"==(typeof problem[i].questions.question[n].user_answer)?answer_array.push(problem[i].questions.question[n].user_answer):answer_array=problem[i].questions.question[n].user_answer
                        }
                        problem[i].questions.question[n].user_answer=answer_array;
                        if(questions[n].words!=null){
                            var words= questions[n].words.split(";");
                            for(var m=0;m<words.length;m++){
                                if(word_list.indexOf(words[m])==-1){
                                    word_list.push(""+words[m]);
                                }
                            }
                        }
                        if(questions[n].tags!=null){
                            var tags= questions[n].tags.split(",");
                            for(var k=0;k<tags.length;k++){
                                if(tag_problems[tags[k]]==null){
                                    tag_problems[tags[k]]=[i]
                                }else{
                                    if(tag_problems[tags[k]].indexOf(i)==-1){
                                        tag_problems[tags[k]].push(i)
                                    }
                                }
                                if(tag_list.indexOf(tags[k])==-1){
                                    tag_list.push(tags[k]);
                                }
                            }
                        }
                    }
                    problems.push(i);
                }
                tag_problems[tag_types]=problems;
                $("#global_problem_sum").html(problems.length);
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
                            if (problem_init>(tag_problems[tag_types].length-1)){
                                problem_init=tag_problems[tag_types].length-1;
                                setCookie("collection_problem_init",tag_problems[tag_types].length-1);
                            }
                            load_problem_collection(problem_init,tag_types);
                        }
                    });
                }else{
                    if (problem_init>(tag_problems[tag_types].length-1)){
                        problem_init=tag_problems[tag_types].length-1;
                        setCookie("collection_problem_init",tag_problems[tag_types].length-1);
                    }
                    load_problem_collection(problem_init,tag_types);
                }
                var frag = document.createDocumentFragment();
                for(var i=0;i<tag_list.length;i++){
                    var option=create_element("option", null, "options", null, null, "innerHTML");
                    option.innerHTML=""+tag_list[i];
                    frag.appendChild(option)
                }
                $("#scope")[0].appendChild(frag);
                $("#scope").change(function () {
                    var str ="";
                    $("#scope option:selected").each(function () {//选取select中被选中的元素
                        str +=$(this).text() ;
                    });
                    tag_types=str;
                    setCookie("collection_problem_init","0");
                    problem_init=0;
                    load_problem_collection(problem_init,tag_types);
                })
                $("#jplayer_one").jPlayer({
                    swfPath: "/javascripts/jplayer",
                    supplied: "mp3",
                    wmode: "window",
                    preload: "none"
                });
            }
        }
            
    });
   
})

function delete_this(){
    $.ajax({
        async:true,
        type: "POST",
        url: "/collections/delete_problem.json",
        dataType: "json",
        data : {
            problem_id :problem_init,
            category_id:$("#category_id").val()
        },
        success : function(data) {
            window.location.href="/collections?category="+data.category
        }
    });
}


function flowplayer_mp3(audio_src){
    $("#flowplayer_postion").append($("#flowplayer_loader"));
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

function load_problem_collection(problem_index,tag){
    var total_problem=get_array(collections.problems.problem);
    var problems_tags=tag_problems[tag];
    var question_type=total_problem[problems_tags[problem_index]].question_type;
    var questions=total_problem[problems_tags[problem_index]].questions.question;
    $("#global_problem_sum").html(problems_tags.length);
    $("#global_problem_index").html(problem_index+1);
    var audio_title = total_problem[problems_tags[problem_index]].title==null ? [] : total_problem[problems_tags[problem_index]].title.split("((mp3))");
    audio_title[1]= audio_title[1] == null? "": "<input type='button'   id='jplayer_play' style='display:none'  onclick=\"javascript:flowplayer_mp3('"+ audio_title[1]+"')\" />";
    var title=audio_title.join("");
    $("#draggable_list").html("");
    if(question_type=='1'){
        $("#drag_tk_box").css("display","");
        var title_arr = title==null ? [] : title.split("((sign))");
        var result_title = [] ;
        for(var sign_index=0;sign_index<title_arr.length;sign_index++){
            result_title.push(title_arr[sign_index]);
            if(questions[sign_index]!=undefined){
                var q_answer = questions[sign_index].answer==undefined ? "" : questions[sign_index].answer;
                var u_answer =  questions[sign_index].user_answer[0];
                var flag=questions[sign_index].c_flag;
                var correct_type=questions[sign_index].correct_type;
                var element_str="<span class='span_tk'>";
                if (correct_type=="0"){
                    element_str += "<select class='select_tk' id='"+sign_index+"'";
                    if(question_type=='1'&&flag!=null&&parseInt(flag)==1){
                        element_str += "onclick=\"javascript:show_question('"+sign_index +"', this)\";"
                    }
                    element_str += "><option></option>"
                    var question_attrs=questions[sign_index].questionattrs.split(";-;");
                    for(var attr_index=0;attr_index<question_attrs.length;attr_index++){
                        element_str += "<option ";
                        if(u_answer!=null&&question_attrs[attr_index]==u_answer){
                            element_str += "selected";
                        }
                        element_str += ">"+question_attrs[attr_index]+"</option>";
                    }
                    element_str +="</select>"
                } else if(correct_type=="1"){
                    var answers=u_answer==null?[]:u_answer.split(")");
                    var answer=answers[1]==null? " ":answers[1]
                    element_str += "<div class='dragDrop_box"
                    if(question_type=='1'&&flag!=null&&parseInt(flag)==1){
                        element_str +=" drag_box'"
                    }
                    element_str +=" id='"+sign_index +"'>"+ answer +"</div>";
                    var attrs =questions[sign_index].questionattrs.split(";-;");
                    var new_attrs = "";
                    for(var i=0;i<attrs.length;i++){
                        new_attrs += "<li name='"+escape(attrs[i])+"'>"+attrs[i]+"</li>"
                    }
                    $("#draggable_list").html($("#draggable_list").html()+new_attrs);
                } else if(correct_type=="3"){
                    var single_answer= u_answer==null? " ":u_answer
                    element_str = "<input class='input_tk' type='text' id='"+ sign_index+"' value='"+single_answer +"'"
                    if(question_type=='1'&&flag!=null&&parseInt(flag)==1){
                        element_str += "onclick=\"javascript:show_question('"+sign_index +"', this);\" onblur=\"javascript:$(this).removeClass('backg_blue');\""
                    }
                    element_str +=" readonly /> "
                }
                element_str += "</span>";
                result_title.push(element_str);
            }
        }
        title=result_title.join("");
        $("#drag_tk_box").css("height",$("#drag_tk").height());
    }else{
        $("#drag_tk_box").css("display","none");
    }
    $("#global_problem_title").html(title);
    $(".drag_box").bind("click",function(){
        var question_index=this.id;
        if(last_open_question!=null){
            last_open_question.trigger("click");
        }
        $(this).addClass("backg_blue");
        var index=problem_init+"_"+question_index;
        $("#pro_question_list_"+index).css("display","");
        $("#pro_question_list_"+index).removeClass("p_q_line");
        $("#pro_question_list_"+index).removeClass("pro_qu_h");
        $("#pro_question_list_"+index).addClass("backg_blue");
        $("#pro_qu_div_"+question_index).css("display","");
        $("#check_"+question_index).css("display","none");
        last_open_question=$("#pro_question_list_"+index).children().find(".pro_qu_t");
    });
    $("#jplayer_play").trigger("onclick");
    load_questions_collection(questions,problem_index,tag,question_type);
}

//显示右侧对应的试题
function show_question(question_index,sel){
    if(last_open_question!=null){
        last_open_question.trigger("click");
    }
    var index=problem_init+"_"+question_index;
    $("#pro_question_list_"+index).css("display","");
    $("#pro_question_list_"+index).removeClass("p_q_line");
    $("#pro_question_list_"+index).removeClass("pro_qu_h");
    $(sel).addClass("backg_blue");
    $("#pro_question_list_"+index).addClass("backg_blue");
    $("#pro_qu_div_"+question_index).css("display","");
    $("#check_"+question_index).css("display","none");
    last_open_question=$("#pro_question_list_"+index).children().find(".pro_qu_t");
}

//循环载入小题
function load_questions_collection(questions,problem_index,tag,question_type){
    $("#questions_resource").empty();
    var the_first=0;
    for(var q_index=0;q_index<questions.length;q_index++){
        var flag= questions[q_index].c_flag;
        var tags= questions[q_index].tags==undefined?[]:questions[q_index].tags.split(",");
        if(tag=="全部收藏"||question_type=='1'||tags.indexOf(tag)!=-1){
            var q_description = questions[q_index].description ;
            var q_correct_type = questions[q_index].correct_type;
            var q_answer = questions[q_index].answer==undefined ? "" : questions[q_index].answer;
            var q_analysis = questions[q_index].analysis==null? "":questions[q_index].analysis;
            var u_answer =  questions[q_index].user_answer[0];
            var pro_question_list = $("#questions_resource")[0].appendChild(create_element("div", null, "pro_question_list_"+problem_index+"_"+q_index, "pro_question_list border_rb  p_q_line", null, "innerHTML"));
            var pql_left = pro_question_list.appendChild(create_element("div", null, null, "pql_left", null, "innerHTML"));
            pql_left.appendChild(create_element("div", null, "color_"+q_index, "un_white", null, "innerHTML"));
            pql_left.innerHTML=pql_left.innerHTML+(q_index+1)+".";
            var pql_right = pro_question_list.appendChild(create_element("div", null, null, "pql_right", null, "innerHTML"));
            var pro_qu_t = pql_right.appendChild(create_element("div", null, "pro_qu_t_"+q_index, "pro_qu_t pro_qu_k pro_qu_h", null, "innerHTML"));
            if(q_description!=null){
                var pro_t_con = pro_qu_t.appendChild(create_element("div", null, null, "pro_t_con", null, "innerHTML"));
                pro_t_con.innerHTML=q_description;
            }
            //            var title= pql_right.appendChild(create_element("div", null, null, "question_tx", null, "innerHTML"));
            //            title.innerHTML=question_types[parseInt(q_correct_type)];
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
            collection_correct_type(q_correct_type,pro_qu_ul,problem_index,q_index,question_type,questions[q_index]);
            var pro_btn = pro_qu_div.appendChild(create_element("div", null, "pro_btn_"+q_index, "pro_btn", null, "innerHTML"));
            pro_btn.innerHTML +="<button class='t_btn hedui_t_btn' style='display:none'id='check' onclick=\"javascript:check_question("+q_index+",'"+problem_index+"_"+q_index+"','"+escape(q_answer) +"',"+problem_index+",'','"+question_type +"')\">核对</button>"
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
            var words= questions[q_index].words==null ?[]:questions[q_index].words.split(";");
            var word_ul=xg_word.appendChild(create_element("ul", null, null, null, null, "innerHTML"));
            var valid_words=[];
            for(var k=0;k<words.length;k++){
                jiexi_word.appendChild(create_element("input", null, "li_value_"+ q_index+"_"+k, "", "hidden",words[k]))
                if(word_in_problem[words[k]]!=null){
                    valid_words.push(words[k]);
                    var word_li=create_element("li", null, null, null, null, "innerHTML");
                    var li_a="<a href='#' onclick=javascript:show_words("+q_index+","+k+")>"+words[k] +"</a>";
                    word_li.innerHTML=li_a;
                    word_ul.appendChild(word_li);
                }
            }
            if(valid_words[0]!=null){
                var single_word=word_in_problem[valid_words[0]];
                jiexi_word.appendChild(create_element("input", null, "enunciate_url_"+q_index, "", "hidden",single_word[0].enunciate_url ))
                var xg_word_ny=jiexi_word.appendChild(create_element("div", null, null, "xg_words_ny", null, "innerHTML"));
                var ch_text=xg_word_ny.appendChild(create_element("div", null, null, "ch_text", null, "innerHTML"));
                var ch_words_line_1=ch_text.appendChild(create_element("div", null, "ch_words_line", "ch_words_line", null, "innerHTML"));
                var ch_words_line_2=ch_text.appendChild(create_element("div", null, "ch_words_line", "ch_words_line", null, "innerHTML"));
                var ch_words_line_3=ch_text.appendChild(create_element("div", null, "ch_words_line_"+q_index, "ch_words_line", null, "innerHTML"));
                ch_words_line_1.innerHTML="<span class='font_size_24' id='name_"+q_index +"'>"+single_word[0].name +"</span><span id='types_"+q_index +"'>"+
                types[single_word[0].types] +"</span><span id='phonetic_"+q_index +"'>"+single_word[0].phonetic +"</span>\n\
                <a href='#'onclick=javascript:jplayer_play("+q_index +");><img src='/assets/icon_fy.png' /></a>"
                ch_words_line_2.innerHTML="<p class='font_size_16' id='en_mean_"+ q_index+"'>"+single_word[0].en_mean +"</p><p id='ch_mean_"+q_index +"'>"+single_word[0].ch_mean +"</p>";
                var sentence=single_word[1];
                if(sentence.length!=0){
                    for(var s=0;s<sentence.length;s++){
                        var li=ch_words_line_3.appendChild(create_element("li", null, null, null, null, "innerHTML"));
                        li.innerHTML=""+sentence[s].description;
                    }
                }
            }else{
                xg_word.innerHTML="<center>没有相关词汇</center>"
            }
            //绑定显示，隐藏事件
            $(pro_qu_t).bind("click",function(){
                var pro_qu_div = $(this).parent().find(".pro_qu_div");
                if(pro_qu_div.is(":visible")){
                    pro_qu_div.hide();
                    $(this).parent().parent().addClass("p_q_line");
                    $(this).parent().parent().removeClass("backg_blue");
                    $(this).addClass("pro_qu_h");
                    var ids=this.id.split("_");
                    var id=ids[ids.length-1];
                    $("#"+id).removeClass("backg_blue");
                    last_open_question=null;
                }else{
                    if(last_open_question!=null){
                        var question=(last_open_question[0].id).split("_");
                        var question_id=question[question.length-1];
                        $("#"+question_id).removeClass("backg_blue");
                        last_open_question.trigger("click");
                    }
                    pro_qu_div.show();
                    var open_ids=this.id.split("_");
                    var open_id=open_ids[open_ids.length-1];
                    $("#"+open_id).addClass("backg_blue");
                    $(this).parent().parent().removeClass("p_q_line");
                    $(this).parent().parent().addClass("backg_blue");
                    $(this).parent().removeClass("p_q_line");
                    $(this).removeClass("pro_qu_h");
                    last_open_question=$(this);
                }
            });
            //将其他小题隐藏
            if(question_type=='1'&&flag==null&&parseInt(flag)!=1){
                $(pro_question_list).css("display","none");
            }else{
                if (the_first==0){
                    $(pro_qu_t).trigger("click");
                    the_first =the_first+1;
                }
            }
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
    $("#jplayer_one").jPlayer("setMedia", {
        mp3: "http://localhost:3000"+src
    });
    $("#jplayer_one").jPlayer("play");
}

function jplayer_play_title(src){
    $("#jplayer_one").jPlayer("setMedia", {
        mp3:src
    });
    $("#jplayer_one").jPlayer("play");
}


//根据小题的类型，区别操作
function collection_correct_type(correct_type,ele,problem_index,question_index,question_type,question_detail){
    //显示单选题
    var q_answer = question_detail.answer==undefined ? null : question_detail.answer;
    var u_answer = question_detail.user_answer==undefined ? null : question_detail.user_answer[0];
    //单选题
    if(question_detail.user_answer.length!=0&&u_answer==q_answer){
        $("#green_dui_"+problem_index+"_"+question_index).show();
        $("#red_cuo_"+problem_index+"_"+question_index).hide();
    }else{
        $("#green_dui_"+problem_index+"_"+question_index).hide();
        $("#red_cuo_"+problem_index+"_"+question_index).show();
    }
    if(question_type=='0'){
        if(correct_type=='0'){
            var attrs =  question_detail.questionattrs.split(";-;");
            var ul = ele.appendChild(create_element("ul", null, null, null, null, "innerHTML"));
            for(var i=0;i<attrs.length;i++){
                var li = ul.appendChild(create_element("li", null, null, null, null, "innerHTML"));
                var span_li="<span class='single_choose_li";
                if(question_detail.user_answer!=undefined&&attrs[i]==u_answer){
                    span_li += " hover";
                }
                if(attrs[i].split(")").length>1){
                    span_li +=   "'>"+attrs[i].split(")")[0]+"</span>"+attrs[i].split(")")[1];
                }else{
                    span_li +=   "'></span>"+attrs[i];
                }
                li.innerHTML=""+span_li;
            }
        }

        //多选题
        if(correct_type=='1'){
            var attrs =  question_detail.questionattrs.split(";-;");
            var ul = ele.appendChild(create_element("ul", null, null, null, null, "innerHTML"));
            var u_answers= u_answer==null?[]:u_answer.split(";-;")
            for(var i=0;i<attrs.length;i++){
                var li = ul.appendChild(create_element("li", null, null, null, null, "innerHTML"));
                span_li = "<span class='multi_choose_li";
                if(question_detail.user_answer!=undefined&&u_answers.indexOf(attrs[i])!=-1){
                    span_li += " hover";
                }
                if(attrs[i].split(")").length>1){
                    span_li +=   "'>"+attrs[i].split(")")[0]+"</span>"+attrs[i].split(")")[1];
                }else{
                    span_li +=   "'></span>"+attrs[i];
                }
                li.innerHTML=""+span_li;
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
}

//下一题
function click_next_problem(){
    if(problem_init==(tag_problems[tag_types].length-1)){
        tishi_alert("当前已是最后一题");
        return false;
    }
    problem_init = problem_init+1;
    setCookie("collection_problem_init",problem_init);
    $("#draggable_list").html("");
    $("#upErrorTo_tab").hide();
    $("#flowplayer_hidden_position").append($("#flowplayer_loader"));
    load_problem_collection(problem_init,tag_types);
    $("#jplayer_play").trigger("onclick");
}

//上一题
function click_prev_problem(){
    if(problem_init==0){
        tishi_alert("当前已是第一题");
        return false;
    }
    problem_init = problem_init-1;
    setCookie("collection_problem_init",problem_init);
    $("#draggable_list").html("");
    $("#upErrorTo_tab").hide();
    $("#flowplayer_hidden_position").append($("#flowplayer_loader"));
    load_problem_collection(problem_init,tag_types);
    $("#jplayer_play").trigger("onclick");
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
function check_question(question_index,problem_question_index,answer,problem_index,drag_answer_index,question_type){
    answer=unescape(answer);
    var user_answer;
    if(drag_answer_index!=''){
        user_answer = unescape($("#drag_answer_"+drag_answer_index).val());
    }else{
        user_answer = $("#user_answer_"+question_index).val();
    }
    if(user_answer!=null&&user_answer!=""&&user_answer==answer){
        $("#green_dui_"+problem_question_index).show();
        $("#red_cuo_"+problem_question_index).hide();
        $("#color_"+question_index).attr("class","ture_green");
    }else{
        $("#color_"+question_index).attr("class","false_red");
        $("#green_dui_"+problem_question_index).hide();
        $("#red_cuo_"+problem_question_index).show();
        var collection_problem=get_array(collections.problems.problem);
        for(var i=0;i<collection_problem.length;i++){
            collections.problems.problem[i].questions.question=get_array(collection_problem[i].questions.question);
        }
        var one_problem=get_array(collections.problems.problem)[tag_problems[tag_types][problem_index]];
        var question_id=one_problem.questions.question[question_index].id;
        if (user_answer!=null&&user_answer!=""){
            $.ajax({
                async:true,
                type: "POST",
                url: "/collections/write_file.json",
                dataType: "json",
                data : {
                    problem_id :one_problem.id,
                    question_id :question_id,
                    user_answer : user_answer
                }
            });
        }
       
    }
    if(question_type=='0'){
        $("#pro_qu_div_"+ question_index+" .pro_btn a").css("display","");
        $("#pro_qu_div_"+ question_index+" .pro_btn #check").attr("onclick","");
        $("#pro_qu_div_"+ question_index+" .pro_btn #check").html("继续");
        $("#pro_qu_div_"+ question_index+" .pro_btn #check").bind("click",function(){
            if(($(".pro_qu_t").index($("#pro_qu_t_"+question_index))+1)==$(".pro_qu_t").length){
                $(".icon_next a").trigger("onclick");
                $(".pro_qu_t").first().trigger("click");
            }else{
                $($(".pro_qu_t")[$(".pro_qu_t").index($("#pro_qu_t_"+question_index))+1]).trigger("click");
            }
            
        })
        $("#display_jiexi_"+problem_question_index).show();
    }else{
        if(last_open_question!=null){
            var question=(last_open_question[0].id).split("_");
            var que_id=question[question.length-1];
            $("#"+que_id).removeClass("backg_blue");
            last_open_question.trigger("click");
        }
        $("#"+question_index).addClass("backg_blue");
        $("#pro_question_list_"+problem_question_index).css("display","");
        $("#pro_question_list_"+problem_question_index).removeClass("p_q_line");
        //        $("#pro_question_list_"+problem_question_index+" .pql_right").removeClass("p_q_line");
        $("#pro_question_list_"+problem_question_index).removeClass("pro_qu_h");
        $("#pro_question_list_"+problem_question_index).addClass("backg_blue");
        $("#pro_qu_div_"+question_index).css("display","");
        $("#check_"+question_index).css("display","none");
        last_open_question=$("#pro_question_list_"+problem_question_index).children().find(".pro_qu_t");
    }
   
  
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
    var problem=get_array(collections.problems.problem)[problems_tags[problem_init]]
    var question_type=problem.question_type;
    var questions=problem.questions.question;
    last_open_question=null;
    if(question_type=='0'){
        for(var q_index=0;q_index<questions.length;q_index++){
            var correct_type=questions[q_index].correct_type;
            var tags= questions[q_index].tags==undefined?[]:questions[q_index].tags.split(",");
            if(tag_types=="全部收藏"||tags.indexOf(tag_types)!=-1){
                $("#green_dui_"+problem_init+"_"+q_index).hide();
                $("#red_cuo_"+problem_init+"_"+q_index).hide();
                $(".pro_btn a").css("display","none");
                //                $(".pro_btn button").css("display","");
                $(".jiexi").css("display","none");
                var ele=$("#pro_qu_ul_"+q_index);
                ele.html("");
                next_correct_type(correct_type,ele,problem_init,q_index,questions[q_index]);
                $(".pro_question_list,.pro_qu_t").attr("style","");
                $("#pro_qu_ul_"+q_index).html($("#pro_qu_ul_"+q_index).html()+"<input id='user_answer_"+q_index+"' value='' type='hidden' />");
            }
        }
    }else{
        $(".pro_question_list").css('display','none');
        $("#draggable_list").html("");
        var audio_title =problem.title==null ? [] : problem.title.split("((mp3))");
        audio_title[1]= audio_title[1] == null? "": "<input type='button'   id='jplayer_play' style='display:none'  onclick=javascript:flowplayer_mp3('"+ audio_title[1]+"'); />";
        var title=audio_title.join("");
        var title_arr = title==null ? [] : title.split("((sign))");
        var result_title = [] ;
        var drag_index=0
        for(var sign_index=0;sign_index<title_arr.length;sign_index++){
            result_title.push(title_arr[sign_index]);
            if(questions[sign_index]!=undefined){
                var inner_correct_type=questions[sign_index].correct_type;
                var answer=questions[sign_index].answer==null? "":questions[sign_index].answer;
                var element_str="<span class='span_tk' onmouseover=\"javascript:$('#check_"+sign_index +"').css('display','');\" onmouseout=\"javascript:$('#check_"+sign_index +"').css('display','none');\" >";
                if (inner_correct_type=="0"){
                    $("#pro_qu_ul_"+sign_index).html($("#pro_qu_ul_"+sign_index).html()+"<input id='user_answer_"+sign_index+"' value='' type='hidden' />");
                    element_str += "<select class='select_tk' id='"+sign_index +"' onfocus=javascript:$('#check_"+sign_index +"').css('display','');  onchange=javascript:inner_value("+inner_correct_type+","+sign_index +");><option></option>";
                    var question_attrs=questions[sign_index].questionattrs.split(";-;");
                    for(var attr_index=0;attr_index<question_attrs.length;attr_index++){
                        element_str += "<option>"+question_attrs[attr_index]+"</option>";
                    }
                    element_str +="</select>"
                    element_str += " <span class='button_span' id='check_"+sign_index +"' style='display:none'><button class='button_tk' id='check_button_"+sign_index +"' onclick=check_question("+sign_index +",'"+problem_init +"_"+sign_index +"','"+ escape(answer)+"',"+problem_init +",'',"+question_type +") >核对</button></span></span>";
                }
                if(inner_correct_type=="1"){
                    drag_index++;
                    $("#pro_qu_ul_"+sign_index).html($("#pro_qu_ul_"+sign_index).html()+"<input id='drag_answer_"+drag_index+"' value='' type='hidden' />");
                    element_str += "<span class='dragDrop_box' id='"+sign_index+"'></span>";
                    var attrs =questions[sign_index].questionattrs.split(";-;");
                    var new_attrs = "";
                    for(var i=0;i<attrs.length;i++){
                        new_attrs += "<li name='"+attrs[i]+"' class='drag_li_"+sign_index +"'>"+attrs[i]+"</li>"
                    }
                    $("#draggable_list").html($("#draggable_list").html()+new_attrs);
                    element_str += "<span class='button_span' id='check_"+sign_index +"' style='display:none'><button class='button_tk' id='check_button_"+sign_index +"' onclick=check_question("+sign_index +",'"+problem_init+"_"+ sign_index +"','"+ escape(answer)+"',"+problem_init +",'"+drag_index +"') >核对</button></span></span>";
                }
                if(inner_correct_type=="3"){
                    $("#pro_qu_ul_"+sign_index).html($("#pro_qu_ul_"+sign_index).html()+"<input id='user_answer_"+sign_index+"' value='' type='hidden' />");
                    element_str += "<input class='input_tk' id='"+ sign_index+"' onfocus=javascript:$('#check_"+sign_index +"').css('display','');  onchange=javascript:inner_value("+inner_correct_type+","+sign_index +"); />";
                    element_str += "<span class='button_span' id='check_"+sign_index +"' style='display:none'><button class='button_tk' id='check_button_"+sign_index +"' onclick=check_question("+sign_index +",'"+problem_init +"_"+sign_index +"','"+ escape(answer)+"',"+problem_init +",'') >核对</button></span></span>";
                }
           
                result_title.push(element_str);
            }
        }
        title=result_title.join("");
        $("#global_problem_title").html(title);
        $(".dragDrop_box").droppable({
            drop: function( event, ui ) {
                $(this).html(ui.draggable.attr("name"));
                var index=$(".dragDrop_box").index($(this));
                drag_index=this.id.split("_");
                $("#check_"+drag_index[2]).css('display','');
                $("#drag_answer_"+(index+1)).val(ui.draggable.attr("name"));
            }
        })
        $("li[class*='drag_li']").draggable({
            helper: "clone"
        });
    }
}


function inner_value(correct_type,question_index){
    if(correct_type=="0"){
        $("#user_answer_"+question_index).val($("#"+question_index +" option:selected").html());
    }
    if(correct_type=="3"){
        $("#user_answer_"+question_index).val($("#"+question_index).val());
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
            if(attrs[i].split(")").length>1){
                li.innerHTML="<span class='single_choose_li single_choose_"+problem_index+"_"+question_index+"' onclick=javascript:do_answer(this,'"+escape(attrs[i])+"','"+question_index+"',"+correct_type+");>"+attrs[i].split(")")[0]+"</span>"+attrs[i].split(")")[1];
            }else{
                li.innerHTML="<span class='single_choose_li single_choose_"+problem_index+"_"+question_index+"' onclick=javascript:do_answer(this,'"+escape(attrs[i])+"','"+question_index+"',"+correct_type+");></span>"+attrs[i];
            }
        }
    }

    //多选题
    if(correct_type=='1'){
        var attrs_more =  question_detail.questionattrs.split(";-;");
        var ul_more = frag.appendChild(create_element("ul", null, null, null, null, "innerHTML"));
        for(var k=0;k<attrs_more.length;k++){
            var li_more = ul_more.appendChild(create_element("li", null, null, null, null, "innerHTML"));
            if(attrs_more[k].split(")").length>1){
                li_more.innerHTML = "<span class='multi_choose_li multi_choose_"+problem_index+"_"+question_index+"' onclick=javascript:do_answer(this,'"+escape(attrs_more[k])+"','"+question_index+"',"+correct_type+");>"+attrs_more[k].split(")")[0]+"</span>"+attrs_more[k].split(")")[1];
            }else{
                li_more.innerHTML = "<span class='multi_choose_li multi_choose_"+problem_index+"_"+question_index+"' onclick=javascript:do_answer(this,'"+escape(attrs_more[k])+"','"+question_index+"',"+correct_type+");></span>"+attrs_more[k];
            }
        }
    }
    //判断题
    if(correct_type=='2'){
        var judge_ul = frag.appendChild(create_element("ul", null, null, null, null, "innerHTML"));
        var judge_li1 = judge_ul.appendChild(create_element("li", null, null, null, null, "innerHTML"));
        judge_li1.innerHTML="<span class='single_choose_li judge_"+problem_index+"_"+question_index+"' onclick=javascript:do_answer(this,'1','"+question_index+"',"+correct_type +");></span>对/是";
        var judge_li2 = judge_ul.appendChild(create_element("li", null, null, null, null, "innerHTML"));
        judge_li2.innerHTML="<span class='single_choose_li judge_"+problem_index+"_"+question_index+"' onclick=javascript:do_answer(this,'0','"+question_index+"',"+correct_type +");></span>错/否";
    }
    ele.html(frag);
    //填空题
    if(correct_type=='3'){
        ele.html("<input id='fill_blank_"+problem_index+"_"+question_index+"' type='text' class='input_xz' onchange=javascript:do_answer(this,this.value,'"+question_index+"',"+correct_type +");>");
    }
    //简答题
    if(correct_type=='5'){
        ele.html("<textarea cols='' rows='' class='textarea_xz1' onchange=javascript:do_answer(this,this.value,'"+question_index+"',"+correct_type +");></textarea>");
    }
}

function do_answer(e,single_answer,question,correct_type){
    if(correct_type=="0"||correct_type=="2"){
        $(e).parent().parent().find("span").removeClass("hover");
    }
    $(e).toggleClass("hover");
    if($(e).parent().parent().children().find(".hover").length>=1){
        $("#pro_btn_"+question+" #check").css("display","");
    }
    var answer=unescape(single_answer);
    if(correct_type!='1'){
        $("#user_answer_"+question).val(unescape(answer));
    }else{
        var all_answer=$("#user_answer_"+question).val();
        if(all_answer!=null){
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
    var paper_id=get_array(collections.problems.problem)[tag_problems[tag_types][problem_init]].paper_id;
    var error_type=$("#upErrorTo_tab :radio:checked").val();
    if(paper_id==null){
        tishi_alert("试题有问题");
        return false;
    }
    if(error_type==null){
        tishi_alert("请选择错误类型");
        return false;
    }
    $.ajax({
        type: "POST",
        url: "/exam_users/ajax_report_error.json",
        dataType: "json",
        data : {
            "post":{
                "paper_id":paper_id,
                "user_id":getCookies("user_id"),
                "user_name":getCookies("user_name"),
                "description":$("#error_content").val(),
                "error_type":error_type,
                "question_id":question_id
            }
        },
        success : function(data) {
            $("#upErrorTo_tab :radio").removeAttr("checked");
            $("#error_content").val("");
            $(".upErrorTo_tab").css("display","none");
            tishi_alert(data["message"]);
        }
    });
}