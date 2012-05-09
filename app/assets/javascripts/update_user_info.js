function update_users(){
    var info={};
    info["username"]=$("#username").val();
    info["school"]=$("#school").val();
    info["email"]=$("#email").val();
    $.ajax({
        async:true,
        dataType:'json',
        data:{
            info:info
        },
        url:"/users/update_users",
        type:'post',
        success : function(data) {
            $('#complete_info').hide();
            $('#first_zhez').hide();
            tishi_alert(data.message);
        }
    });
    return false;
}

function complete_activity_user() {
    var info = {};
    var name = $("#name").val();
    var email = $("#email").val();
    if (name == null || checkspace(name)) {
        tishi_alert("请您填写您的姓名。");
        return false;
    }
    if (email == null || checkspace(email)) {
        tishi_alert("请您填写您的邮箱。");
        return false;
    }
    info["name"]=$("#name").val();
    info["mobilephone"]=$("#mobilephone").val();
    info["email"]=$("#email").val();
    $.ajax({
        async:true,
        dataType:'json',
        data:{
            info:info
        },
        url:"/users/update_users",
        type:'post',
        success : function(data) {
            $('#activity_user_info').hide();
            $('#ac_zhez').hide();
            tishi_alert(data.message);
        }
    });
    return false;
}