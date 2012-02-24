//此JS进行试卷初始化，处理试卷和答案数据

var attrs = []; //拖拽题选项临时保存。
//将变量转化为数组 具体 ： null => [] , 'abc'=>['abc'] , 1=>[1] , {}=>[{}]  若是数组，则返回本身
function transform_array(object){
    var result = [];
    var resource = object;
    if(resource){
        if(resource.length){
            result = resource;
        }else{
            result.push(resource);
        }
    }
    return result;
}
//组合标准答案
var answers=[];
var a = transform_array(answer.paper.problems.problem);
for(var i=0;i<a.length;i++){
    if(a[i]!=null){
        var a1 = transform_array(a[i].question);
        answers.push(a1);
    }
}
//组合试题
var problems = [];
var b = transform_array(papers.paper.blocks.block);
for(var i=0;i<b.length;i++){
    if(b[i]!=null&&b[i].problems!=null){
        var b1 = transform_array(b[i].problems.problem);
        for(var j=0;j<b1.length;j++){
            if(b1[j].questions!=null){
                b1[j].questions.question =  transform_array(b1[j].questions.question);
                problems.push(b1[j]);
            }
        }
    }
}

function rp(str){
    str = str.replace(/&amp;/g,"&");
    str = str.replace(/&lt;/g,"<");
    str = str.replace(/&gt;/g,">");
    str = str.replace(/&acute;/g,"'");
    str = str.replace(/&quot;/g, '"');
    str = str.replace(/&brvbar;/g, '|');
    return str;
}

//loadxml文件
function loadxml(xmlFile) {
    var xmlDoc;
    try {
        if(window.ActiveXObject) {
            xmlDoc = new ActiveXObject('MSXML2.DOMDocument');
            xmlDoc.async = true;
            xmlDoc.load(xmlFile);
        }else if (document.implementation&&document.implementation.createDocument) {
            var xmlhttp = new window.XMLHttpRequest();
            xmlhttp.open("GET", xmlFile, false);
            xmlhttp.send(null);
            xmlDoc = xmlhttp.responseXML;
        }else{
            return null;
        }
        return xmlDoc;
    } catch (e) {
        var flash_div = create_element("div", null, "flash_notice", "tishi_tab", null, "innerHTML");
        flash_div.innerHTML = "<p>您的浏览器安全级别设置过高，屏蔽了一些功能，请您重新设置您的浏览器安全级别。</p>";
        document.body.appendChild(flash_div);
        show_flash_div();
        return null;
    }

}





