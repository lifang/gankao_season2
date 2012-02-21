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