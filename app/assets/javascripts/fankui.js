function fankui(){
    generate_flash_div("#fankui_tab_box");
    $("#fankui_answer").val("");
    $("#fankui_content").val("");
    $("#fankui_tab_box").show();
}

function ajax_send_fankui(){
    var category_id = $("#fankui_category_id").val();
    var answer = $("#fankui_answer").val();
    var content = $("#fankui_content").val();
    if(answer.trim()==""){
        tishi_alert("请留下您的联系方式。");
        return false;
    }
    if(content.trim()==""){
        tishi_alert("请提供您的反馈信息。");
        return false;
    }
    $("#fankui_tab_box").hide();
    tishi_alert("反馈信息已经收到。我们会尽快回复您。");
    $.ajax({
        type: "POST",
        url: "/users/ajax_send_fankui.json",
        dataType: "json",
        data : {
            "category_id":category_id,
            "answer":answer,
            "content":content
        }
    });
}
