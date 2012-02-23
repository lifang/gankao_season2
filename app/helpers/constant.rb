# encoding: utf-8
module Constant
  SERVER_PATH = "http://localhost:3001"
  BACK_SERVER_PATH = "http://localhost:3000"
  
  #项目文件目录
  PUBLIC_PATH = "#{Rails.root}/public"

  #后台项目文件目录
  BACK_PUBLIC_PATH = "f:/exam_season2/public"

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
  VIP_FEE=0.01
  SIMULATION_FEE=0.01
  VIP_TYPE={:good=>1,:donate=>4}   #vip支付类型
end
