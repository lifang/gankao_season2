//生成考试页面

$(function(){
    load_problem(init_problem);
})
var current_problem;
var current_answer;
var current_index = init_problem;
var problem_resource;
var element1;
var element2;

function load_problem(problem_id){
    current_problem = problems[init_problem];
    current_answer = answers[init_problem];
    problem_resource = create_element("div",init_problem,null,"problem_resource",null,"innerHTML");
    if(current_index<=init_problem){
        $("#generate").append(problem_resource);
    }else{
        $("#generate").html(problem_resource.html()+$("#generate").html());
    }
    current_problem = init_problem;
    left_side(); //左边，大题描述，大题标题，音频，以及题面内小题的处理
    right_side(); //右边，小题列表，各类小题的细节
    main_height(); //控制页面的高度
}


function left_side(){
    element1 = create_element("div",null,null,"m_side m_problem_bg",null,"innerHTML");
    $(problem_resource).append(element1);
    element2 = create_element("div",null,null,"problem_box",null,"innerHTML");
    $(element1).append(element2);
    $(element2).append(create_element("div",null,"jplayer_location_"+init_problem,null,null,"innerHTML"));
    element1 = create_element("div",null,null,"question_explain",null,"innerHTML");
    if(problems[init_problem].description){
        element1.innerHTML="<p><em>"+problems[init_problem].description+"</em></p>";
    }
    $(element2).append(element1);
    element1 = create_element("div",null,null,"problem_text",null,"innerHTML");
    element1.innerHTML=problem_title();
    $(element2).append(element1);
    
}

function right_side(){
    element1 = create_element("div",null,null,"m_side",null,"innerHTML");
    $(problem_resource).append(element1);
    element2 = create_element("div",null,null,"problem_box",null,"innerHTML");
    $(element1).append(element2);
}

//处理题面标题
function problem_title(){
    var problem_title = problems[init_problem].title;
    if(problem_title.split("((mp3))").length>1){
        clone_flowplayer($("#jplayer_location_"+init_problem),problem_title.split("((mp3))")[1]);
        problem_title = problem_title.split("((mp3))")[0]+problem_title.split("((mp3))")[2];
    }
    return problem_title;   
}

function main_height(){
    var win_height = $(window).height();
    var head_height = $(".head").height();
    var mainTop_height = $(".m_top").height();
    var foot_height = $(".foot").height();
    var main_height = win_height-(head_height+mainTop_height+foot_height);
    $(".m_side").css('height',main_height-12);//12为head的padding的12px
    $(".main").css('height',main_height-12+30);//34是m_top的高度，
}