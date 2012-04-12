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
    generate_flash_div("#fankui_success");
    $("#fankui_success").show();
}

function share_steak(study_plan_id){
    var img_url=$("#img_url").val();
    var share_url=$("#share_url").val();
    var category=$("#share_category").val();
    category= category==null? 2 : eval(category)
    var content="四级"
    if (category!=2){
        content="六级"
    }
    fusion2.dialog.share

    ({
        // 可选。分享应用的URL，点击该URL可以进入应用，必须是应用在平台内的地址。
        url:share_url,

        // 可选。默认展示在输入框里的分享理由。

        desc:"赶考网的"+content +"必过挑战太给力，提高英语过"+ content+"还有机会拿“The new iPad”，”牛排”也很给力啊",

        // 必须。应用简要描述。

        summary :"赶考网为广大参加英语"+ content+"必过学习计划并成功完成当月任务的考生准备的丰厚“婚礼”，将有机会迎娶“牛排”，让你双喜临门。",

        // 必须。分享的标题。

        title :"接受挑战，迎娶“牛排”",

        // 可选。图片的URL。

        pics :img_url,

        // 可选。透传参数，用于onSuccess回调时传入的参数，用于识别请求。

        context:{"plan_id":study_plan_id,"category":category},

        // 可选。用户操作后的回调方法。
        onSuccess : function (opt) {
            window.location.href="/study_plans/"+opt.context.plan_id +"?activity=1&category="+opt.context.category;
        },

        // 可选。用户取消操作后的回调方法。
        onCancel : function () {
            tishi_alert("取消分享将不能获得参加抽奖的机会");
        },

        // 可选。对话框关闭时的回调方法。
        onClose : function () {
        }

    });

}
