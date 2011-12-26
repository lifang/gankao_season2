


//  //下一题
//  function click_next_problem(){
//    var this_problem = $(".problem_resource:visible");
//    var next_problem = this_problem.next(".problem_resource");
//    if(next_problem.length==0){
//      tishi_alert("当前已是最后一题");
//      return false;
//    }else{
//      if(this_problem.is(":animated") ||next_problem.is(":animated")){
//        return false;
//      }
//      this_problem.slideUp();
//      next_problem.slideDown();
////      this_problem.hide("slide", { direction: "left" }, 1000);
////      next_problem.show("slide", { direction: "left" }, 1000)
//    }
//  }
//
//  //上一题
//  function click_prev_problem(){
//    var this_problem = $(".problem_resource:visible");
//    var prev_problem = this_problem.prev(".problem_resource");
//    if(prev_problem.length==0){
//      tishi_alert("当前已是第一题");
//      return false;
//    }else{
//      if(this_problem.is(":animated") ||prev_problem.is(":animated")){
//        return false;
//      }
//      this_problem.slideUp();
//      prev_problem.slideDown();
//    }
//  }