# encoding: utf-8
module Constant
  SERVER_PATH = "http://localhost:3001"
  BACK_SERVER_PATH = "http://localhost:3000"
  
  #项目文件目录
  PUBLIC_PATH = "#{Rails.root}/public"

  #后台项目文件目录
  BACK_PUBLIC_PATH = "e:/exam_season2/public"

  #weibo账号
  WEIBO_ID = 2359288352

  #赶考网官方微博
  TENCENT_WEIBO_NAME = "gankao2011"

  #人人账号
  RENREN_ID = 600942099

  #请求服务器ip
  IP="116.255.179.206:3001"
 
  #充值vip有效期
  DATE_LONG={:vip=>90,:trail=>7} #试用七天

  #考试类型
  EXAM_TYPES={:forth_level=>1,:sixth_level=>2}



  #vip价格
  VIP_FEE=48
  SIMULATION_FEE=48
  VIP_TYPE={:good=>1,:donate=>4}   #vip支付类型


  #新浪微博应用信息 gankao@hotmail.com  comdosoft2011
  SINA_CLIENT_ID = "3987186573"

  
  #人人应用信息  wangguanhong@hotmail.com  comdo2010
  RENREN_CLIENT_ID = "182012"
  RENREN_API_KEY = "98a6ed88bccc409da12a8abe3ebec3c5"             
  RENREN_API_SECRET = "0d19833c0bc34a27a58786c07ef8d9fb"
  

end
