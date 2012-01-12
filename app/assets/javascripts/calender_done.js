//var $ = function (id) {
//    return "string" == typeof id ? document.getElementById(id) : id;
//};
var Class = {
    create: function() {
        return function() {
            this.initialize.apply(this, arguments);
        }
    }
}
Object.extend = function(destination, source) {
    for (var property in source) {
        destination[property] = source[property];
    }
    return destination;
}
var Calendar = Class.create();
Calendar.prototype = {
    initialize: function(container, options) {
        this.Container = jQuery(container);//table结构容器
        this.Days = [];//日期列表
        this.SetOptions(options);
        this.Year = this.options.Year;
        this.Month = this.options.Month;
        this.SelectDay = this.options.SelectDay ? new Date(this.options.SelectDay) : null;
        this.onSelectDay = this.options.onSelectDay;
        this.onToday = this.options.onToday;
        this.onFinish = this.options.onFinish;
        this.Draw();
    },

    SetOptions: function(options) {
        this.options = {//默认值
            Year: new Date().getFullYear(),
            Month: new Date().getMonth() + 1,
            SelectDay: null,//选择日期
            onSelectDay: function(){},
            onToday: function(){},
            onFinish: function(){}
        };
        Object.extend(this.options, options || {});
    },
    //上月
    PreMonth: function() {
        //取得上月日期对象
        var d = new Date(this.Year, this.Month - 2, 1);
        //设置属性
        this.Year = d.getFullYear();
        this.Month = d.getMonth() + 1;
        //重绘日历
        this.Draw();
    },
    //下一个月
    NextMonth: function() {
        var d = new Date(this.Year, this.Month, 1);
        this.Year = d.getFullYear();
        this.Month = d.getMonth() + 1;
        this.Draw();
    },

    Draw: function() {
        //保存日期列表
        //用当月第一天在一周中的日期值作为当月离第一天的天数
        for(var i = 1, firstDay = new Date(this.Year, this.Month - 1, 1).getDay(); i <= firstDay; i++){
            arr.push(" ");
        }
        //用当月最后一天在一个月中的日期值作为当月的天数
        for(var k = 1, monthDay = new Date(this.Year, this.Month, 0).getDate(); k <= monthDay; k++){
            arr.push(k);
        }
        var frag = document.createDocumentFragment();
        this.Days = [];
        var head=["SE","MO","TU","WE","TH","FR","SU"]
        for(var i = 1; i <= 7; i++){
            var  div=document.createElement("div");
            var strong=document.createElement("strong");
            strong.innerHTML=head[i-1]
            div.appendChild(strong)
            frag.appendChild(div);
        }
        while(arr.length > 0){
            var cell = document.createElement("div");
            cell.innerHTML = " ";
            if(arr.length > 0){
                var d = arr.shift();
                cell.innerHTML = d;
                if(d > 0){
                    this.Days[d] = cell;
                    //获取今日
                    if(this.IsSame(new Date(this.Year, this.Month - 1, d), new Date())){
                        this.onToday(cell);
                    }
                    //判断用户是否作了选择
                    if(this.SelectDay && this.IsSame(new Date(this.Year, this.Month - 1, d), this.SelectDay)){
                        this.onSelectDay(cell);
                    }
                }
            }
            frag.appendChild(cell);
        }
        //此先清空然后再插入(ie的table不能用innerHTML)
        while(this.Container[0].hasChildNodes()){
            this.Container[0].removeChild(this.Container[0].firstChild);
        }
        this.Container[0].appendChild(frag);
        this.onFinish();
    },
    //判断是否同一日
    IsSame: function(d1, d2) {
        return (d1.getFullYear() == d2.getFullYear() && d1.getMonth() == d2.getMonth() && d1.getDate() == d2.getDate());
    }
};

function new_calender(){
    var cale = new Calendar(document.getElementById("idCalendar"), {
        onFinish: function(){
            var year=this.Year;
            var month=this.Month;
            var days=this.Days;
            var divs=jQuery("#idCalendar div");
            divs.splice(divs[0],7);
            document.getElementById("date").innerHTML=today.getFullYear()+"-"+(today.getMonth()+1)+"-"+today.getDate();
            var start=this.Year+"-"+(this.Month)+"-"+ parseInt(days[1].innerHTML);
            var end=this.Year+"-"+(this.Month)+"-"+parseInt(days[days.length-1].innerHTML);
            jQuery.ajax({
                type: "POST",
                url: "/study_plans/plan_status.json",
                dataType: "json",
                data : {
                    start :start,
                    end : end,
                    category :  document.getElementById("category").value
                },
                beforeSend: function() {
                },
                success : function(data) {
                    var which=data.which;
                    document.getElementById("whichs").innerHTML="第"+ which[0]+"天";
                    document.getElementById("practice").innerHTML=which[1];
                    document.getElementById("exercise").innerHTML=which[2];
                    var flag = data.days
                    var status=data.status
                    var done_plans=new Array();
                    for(var n = 0, lens = flag[month].length; n < lens; n++){
                        done_plans[n]=days[flag[month][n]]
                    }
                    for(var i =0, len = divs.length; i < len; i++){
                        if(flag[month]==undefined){
                            if (today.getDate()==parseInt(divs[i].innerHTML)&&month==(today.getMonth()+1)&&today.getFullYear()==year){
                                divs[i].className= "pt_day_new";
                                divs[i].innerHTML=document.getElementById("today").innerHTML;
                            }else{
                                divs[i].className= "gray";
                            }
                        }else{
                            if (today.getDate()==parseInt(divs[i].innerHTML)&&month==(today.getMonth()+1)&&today.getFullYear()==year){
                                divs[i].className= "pt_day_new";
                                if(status[parseInt(divs[i].innerHTML)]){
                                    divs[i].innerHTML=  divs[i].innerHTML+document.getElementById("medal").innerHTML;
                                }else{
                                    divs[i].innerHTML=document.getElementById("today").innerHTML;
                                }
                            }else{
                                Array.prototype.indexOf=function(el, index){
                                    var n = this.length>>>0, i = ~~index;
                                    if(i < 0) i += n;
                                    for(; i < n; i++) if(i in this && this[i] === el) return i;
                                    return -1;
                                }
                                if(done_plans.indexOf(divs[i])>=0){
                                    if(parseInt(divs[i].innerHTML)<today.getDate()&&month==(today.getMonth()+1)&&year<=today.getFullYear()){
                                        if(status[parseInt(divs[i].innerHTML)]){
                                            divs[i].innerHTML=  divs[i].innerHTML+document.getElementById("medal").innerHTML;
                                        }else{
                                            divs[i].innerHTML= divs[i].innerHTML+document.getElementById("yellow_card").innerHTML;
                                        }
                                    }
                                    if(year<today.getFullYear()){
                                        if(status[parseInt(divs[i].innerHTML)]){
                                            divs[i].innerHTML=  divs[i].innerHTML+document.getElementById("medal").innerHTML;
                                        }else{
                                            divs[i].innerHTML= divs[i].innerHTML+document.getElementById("yellow_card").innerHTML;
                                        }
                                    }
                                    divs[i].className= "pt_day";
                                }else{
                                    divs[i].className= "gray";
                                }
                            }
                        }
                    }
                }
            });
        }
    });
    document.getElementById("idCalendarPre").onclick = function(){
        cale.PreMonth();
    }
    document.getElementById("idCalendarNext").onclick = function(){
        cale.NextMonth();
    }
}