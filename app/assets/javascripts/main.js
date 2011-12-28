// JavaScript Document
//jQuery(window).height()代表了当前可见区域的大小，而jQuery(document).height()则代表了整个文档的高度，可视具体情况使用注意当浏览器窗口大小

//控制做题页面主体高度
$(function(){
    // var doc_height = $(document).height();
    //var doc_width = $(document).width();
    var win_height = $(window).height();
    //var win_width = $(window).width();
    var head_height = $(".head").height();
    var mainTop_height = $(".m_top").height();
    var foot_height = $(".foot").height();

    var main_height = win_height-(head_height+mainTop_height+foot_height);
    $(".m_side").css('height',main_height-12);//12为head的padding的12px
    $(".main").css('height',main_height-12+34);//34是m_top的高度，
})

//控制其他页面主体高度
$(function(){
    // var doc_height = $(document).height();
    //var doc_width = $(document).width();
    var win_height = $(window).height();
    //var win_width = $(window).width();
    var head_height = $(".head").height();
    var foot_height = $(".foot").height();

    var main_height = win_height-(head_height+foot_height);
    $(".main_Div").css('height',main_height-12);
})


//tooltip提示
$(function(){
    var x = -20;
    var y = 10;
    $("a.tooltip").mouseover(function(e){
        this.myTitle=this.title;
        this.title="";
        var tooltip = "<div class='tooltip_box'><div class='tooltip_t'></div><div class='tooltip_next'>"+this.myTitle+"</div></div>";

        $("body").append(tooltip);
        $(".tooltip_box").css({
            "top":(e.pageY+y)+"px",
            "left":(e.pageX+x)+"px"
        }).show("fast");
    }).mouseout(function(){
        this.title = this.myTitle;
        $(".tooltip_box").remove();
    });
})

//点击显示隐藏小题
$(function(){
    $(".pro_qu_t").bind("click",function(){
        var $pro_qu_div = $(this).parent().find(".pro_qu_div")
        if($pro_qu_div.is(":visible")){
            $pro_qu_div.hide();
            $(this).parent().addClass("p_q_line");
        }else{
            $pro_qu_div.show();
            $(this).parent().removeClass("p_q_line");
        }

    })
})

