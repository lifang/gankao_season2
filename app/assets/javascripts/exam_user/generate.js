//此js用于生成考试页面元素

var q_type = {
    "0":"单选题",
    "1":"多选题",
    "2":"判断题",
    "3":"填空题",
    "5":"简答题"
};
var finish_index = init_problem;  //记录前一题的序号，区别“上一题”，“下一题”效果
var element1; //存储临时元素
var element2; //存储临时元素
var store1; //存储临时参数
var store2; //存储临时参数
var store3; //存储临时参数
var str1; //存储临时字符串
var question_attrs=[]; //存储小题选项
var drag_attrs=[]; //存储拖选题选项
var has_drag; // 有拖选题？
var mp3; //记录音频
var i; //循环体参数
var j; //循环体参数
var q; //小题循环参数


var problem_resource; //题目的最外层元素
var questions_resource; //小题列表最外层元素
var question_resource; //单个小题细节最外层元素


var mp3s=[];  //记录音频数组
for(i=0;i<problems.length;i++){
    mp3s.push(null);
}

$(function(){
    load_problem(init_problem);
})


function load_problem(problem_index){
    has_drag = false;
    drag_attrs=[];
    problem_resource = create_element("div",init_problem,null,"problem_resource",null,"innerHTML");
    if(finish_index<=init_problem){
        $("#generate").append(problem_resource);
    }else{
        $("#generate").prepend(problem_resource);
    }
    left_side(); //左边，大题描述，大题标题，音频，以及题面内小题的处理
    right_side(); //右边，小题列表，各类小题的细节
    if(mp3){
        clone_flowplayer(("#flowplayer_location_"+init_problem),mp3);
        mp3s[init_problem]=mp3;
        mp3=null;
    }
    main_height(); //控制页面的高度
    drag_tk();
    pro_qu_t(init_problem);
    finish_index = init_problem;
    
//    $("#log").html(JSON.encode(problems[init_problem]));
//    $("#log").html($("#log").html()+"<p>-----------------------"+(problems[init_problem].questions.question.length==answers[init_problem].length)+"------------------------</p>");
//    $("#log").html($("#log").html()+JSON.encode(answers[init_problem]));

}

//拖选框，预留高度
function drag_tk(){
    if($("#drag_tk_"+init_problem).length>0){
        $("#drag_tk_box_"+init_problem).css("height",$("#drag_tk_"+init_problem).height()+20);
    }
}

function left_side(){
    element1 = create_element("div",null,null,"m_side m_problem_bg",null,"innerHTML");
    $(problem_resource).append(element1);
    element2 = create_element("div",null,null,"problem_box",null,"innerHTML");
    $(element1).append(element2);
    element3 = create_element("div",null,"flowplayer_location_"+init_problem,null,null,"innerHTML");
    $(element2).append(element3);
    element1 = create_element("div",null,null,"question_explain",null,"innerHTML");
    if(problems[init_problem].description){
        element1.innerHTML="<p><em>"+problems[init_problem].description+"</em></p>";
    }
    $(element2).append(element1);
    element1 = create_element("div",null,null,"problem_text",null,"innerHTML");
    element1.innerHTML=problem_title();
    $(element2).append(element1);
    element1 = create_element("div",null,null,null,null,"innerHTML");
    $(element1).attr("style","height:20px;");
    $(element2).append(element1);
    if(has_drag){
        element1 = create_element("div",null,"drag_tk_box_"+init_problem,"drag_tk_box",null,"innerHTML");
        element3 = create_element("div",null,"drag_tk_"+init_problem,"drag_tk border_radius",null,"innerHTML");
        $(element1).append(element3);
        $(element2).append(element1);
        element1 = create_element("ul",null,"draggable_list_"+init_problem,null,null,"innerHTML");
        $(element3).append(element1);
        drag_attrs = drag_attrs.sort();
        str1="";
        for(i=0;i<drag_attrs.length;i++){
            str1 += "<li name='"+drag_attrs[i]+"' class='draggable_attr_"+init_problem+"'>"+drag_attrs[i]+"</li>"
        }
        $(element1).html(str1);

        for(i=0;i<problems[init_problem].questions.length;i++){
            $("#droppable_"+init_problem+"_"+i).droppable({
                drop: function( event, ui ) {
                    $(this).html(ui.draggable.attr("name"));
                    alert($(this).attr("id").split("_")[2]);
                    $("#exam_user_answer_"+init_problem+"_"+($(this).attr("id").split("_")[2])).val(ui.draggable.attr("name"));
                }
            });
        }
        $(".draggable_attr_"+init_problem).draggable({
            helper: "clone"
        });
    }
//  create_element(element, name, id, class_name, type, ele_flag)
}

function right_side(){
    element1 = create_element("div",null,null,"m_side",null,"innerHTML");
    $(problem_resource).append(element1);
    element2 = create_element("div",null,null,"problem_box",null,"innerHTML");
    $(element1).append(element2);
    questions_resource = element2;
    for(q=0;q<problems[init_problem].questions.length;q++){
        question_box(questions_resource,q);
    }
    
}

//右边单个小题
function question_box(questions_resource,question_index){
    element1 = create_element("div",null,null,"pro_question_list border_rb p_q_line pro_question_list_"+init_problem,null,"innerHTML");
    $(questions_resource).append(element1);
    element2 = create_element("div",null,null,"pql_left",null,"innerHTML");
    $(element1).append(element2);
    element3 = create_element("div",null,"color_flag_"+init_problem+"_"+question_index,"un_white",null,"innerHTML");
    $(element2).append(element3);
    element3 = create_element("span",null,null,"icon_shoucang",null,"innerHTML");
    $(element2).append(element3);
    $(element3).html("<a href='javascript:void(0);' id='shoucang_"+init_problem+"_"+question_index+"' class='tooltip' name='收藏' onclick=\"javascript:special_add_collect('"+init_problem+"','"+question_index+"','"+problems[init_problem].id+"','"+problems[init_problem].questions[question_index].id+"');\">收藏</a>");
    element2 = create_element("div",null,null,"pql_right",null,"innerHTML");
    $(element1).append(element2);
    element3 = create_element("div",null,"pro_qu_t_"+init_problem+"_"+question_index,"pro_qu_t pro_qu_k pro_qu_h pro_qu_t_"+init_problem,null,"innerHTML");
    $(element2).append(element3);
    element1 = create_element("div",null,null,"question_tx",null,"innerHTML");
    $(element1).html(q_type[(problems[init_problem].questions[question_index].correct_type)]);
    $(element3).append(element1);
    element1 = create_element("div",null,null,"pro_t_con",null,"innerHTML");
    $(element1).html(problems[init_problem].questions[question_index]["description"]);
    $(element3).append(element1);
    element3 = create_element("input",null,"exam_user_answer_"+init_problem+"_"+question_index,"exam_user_answer","hidden","");
    $(element2).append(element3);
    element3 = create_element("input",null,"pass_check_"+init_problem+"_"+question_index,"pass_check","hidden","");
    $(element2).append(element3);
    element3 = create_element("div",null,"red_cuo_"+init_problem+"_"+question_index,"red_cuo",null,"innerHTML");
    $(element3).css("display","none");
    $(element3).html("<img src='/assets/red_cuo.png'>");
    $(element2).append(element3);
    element3 = create_element("div",null,"green_dui_"+init_problem+"_"+question_index,"green_dui",null,"innerHTML");
    $(element3).css("display","none");
    $(element3).html("<img src='/assets/green_dui.png'>");
    $(element2).append(element3);
    element3 = create_element("div",null,null,"pro_qu_div",null,"innerHTML");
    $(element3).css("display","none");
    $(element2).append(element3);
    question_resource = element3;
    if(problems[init_problem]["question_type"]=="0"){
        question_detail(question_resource,question_index,problems[init_problem].questions[question_index]["correct_type"]);
    }
}

function question_detail(question_resource,question_index,correct_type){
    element1 = create_element("div",null,null,"pro_qu_ul",null,"innerHTML");
    $(question_resource).append(element1);
    if(correct_type=="0"){
       // alert("0");
    }else{
        if(correct_type=="1"){
          //  alert("1");
        }else{
            if(correct_type=="3"){
               // alert("3");
            }
        }
    }


}

//处理题面标题
function problem_title(){
    var problem_title = problems[init_problem].title;
    store1 = problem_title.split("((mp3))");
    if(store1.length>1){
        mp3 = store1[1];
        problem_title = store1[0]+store1[2];
    }
    if(problems[init_problem].question_type=="1"){
        store1 = problem_title.split("((sign))");
        store2=[];
        store3=problems[init_problem].questions;
        for(i=0;i<store3.length;i++){
            store2.push(inner_question(store3[i].correct_type,i));
        }
        problem_title="";
        for(i=0;i<store2.length;i++){
            problem_title += (store1[i]+store2[i]);
        }
        problem_title += store1[store2.length];
    }
    return problem_title;   
}

function inner_question(correct_type,question_index){
    str1 = "<span class='span_tk' id='inner_span_tk_"+init_problem+"_"+question_index+"' onmouseover='javascript:show_hedui("+init_problem+","+question_index+");' onmouseout='javascript:hide_hedui("+init_problem+","+question_index+");'>";
    if(correct_type=="0"){
        str1 += "<select class='select_tk' id='input_inner_answer_"+init_problem+"_"+question_index+"' onchange='javascript:do_inner_question(0,"+init_problem+","+question_index+");'><option value=''></option>";
        question_attrs = store3[question_index].questionattrs.split(";-;");
        for(j=0;j<question_attrs.length;j++){
            str1 += "<option value=\""+question_attrs[j]+"\">"+question_attrs[j]+"</option>";
        }
        str1 += "</select>";
    }else{
        if(correct_type=="1"){
            has_drag=true;
            question_attrs = store3[question_index].questionattrs.split(";-;");
            for(j=0;j<question_attrs.length;j++){
                drag_attrs.push(question_attrs[j]);
            }
            str1 += "<span class='dragDrop_box' id='droppable_"+init_problem+"_"+question_index+"'></span>";
        }else{
            if(correct_type=="3"){
                str1 += "<input class='input_tk' type='text' id='input_inner_answer_"+init_problem+"_"+question_index+"' onfocus='javascript:show_hedui("+init_problem+","+question_index+");' onchange='javascript:do_inner_question(3,"+init_problem+","+question_index+");'></input>";
            }
        }
    }
    str1 += "<span class='button_span' style='display:none;' ><button id='hedui_btn_"+init_problem+"_"+question_index+"' class='button_tk' onclick = \"javascript:check_question('1',"+correct_type+",$('#resource_questionattrs_"+init_problem+"_"+question_index+"').val(),"+init_problem+","+question_index+");\">核对</button></span>";
    str1 += "</span>";
    str1 += "<button style='display:none;' id='refer_btn_"+init_problem+"_"+question_index+"' onclick = \"javascript:check_question('1',"+correct_type+",$('#resource_questionattrs_"+init_problem+"_"+question_index+"').val(),"+init_problem+","+question_index+");\">更新</button>";
    return str1;
}
//check_question('<%= problem["question_type"] %>','<%= question["correct_type"] %>',$("#resource_questionattrs<%= "_#{problem_index}_#{sign_index}" %>").val(),<%= problem_index %>,<%= sign_index %>);

function main_height(){
    var win_height = $(window).height();
    var head_height = $(".head").height();
    var mainTop_height = $(".m_top").height();
    var foot_height = $(".foot").height();
    var main_height = win_height-(head_height+mainTop_height+foot_height);
    $(".m_side").css('height',main_height-12);//12为head的padding的12px
    $(".main").css('height',main_height-12+30);//34是m_top的高度，
}
