# encoding: utf-8
module Oauth2Helper
  require 'net/http'
  require "uri"
  require 'openssl'

  #qq登录参数
  REQUEST_URL_QQ="https://graph.qq.com/oauth2.0/authorize"
  #请求openId
  REQUEST_OPENID_URL="https://graph.qq.com/oauth2.0/me"
  #请求详参
  APPID="223448"
  REQUEST_ACCESS_TOKEN={
    :response_type=>"token",
    :client_id=>APPID,
    :redirect_uri=>"#{Constant::SERVER_PATH}/logins/respond_qq",
    :scope=>"get_user_info,add_topic",
    :state=>"1"
  }


  #新浪微博参数
  REQUEST_URL_WEIBO="https://api.weibo.com/oauth2/authorize"
  REQUEST_WEIBO_TOKEN={
    :response_type=>"token",
    :client_id=>"3987186573",
    :redirect_uri=>"#{Constant::SERVER_PATH}/logins/respond_weibo"
  }
  WEIBO_NAME="gankao2011"
  WEIBO_ID="2359288352"

  #构造post请求
  def create_post_http(url,route_action,params)
    uri = URI.parse(url)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.verify_mode = OpenSSL::SSL::VERIFY_NONE
    request = Net::HTTP::Post.new(route_action)
    request.set_form_data(params)
    return JSON http.request(request).body
  end

  
  #构造get请求
  def create_get_http(url,route)
    uri = URI.parse(url)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.verify_mode = OpenSSL::SSL::VERIFY_NONE
    request= Net::HTTP::Get.new(route)
    back_res =http.request(request)
    return JSON back_res.body
  end

  #新浪微博添加关注
  def request_weibo(access_token,code_id,data)
    weibo_url="https://api.weibo.com"
    weibo_route="/2/friendships/show.json?access_token=#{access_token}&source_id=#{code_id}&target_id=#{Oauth2Helper::WEIBO_ID}"
    user_info=create_get_http(weibo_url,weibo_route)
    unless user_info["source"]["following"]
      params={ :access_token=>access_token,:screen_name=>Oauth2Helper::WEIBO_NAME,:uid=>Oauth2Helper::WEIBO_ID}
      action="/2/friendships/create.json"
      add_info=create_post_http(weibo_url,action,params)
      if add_info["following"]
        data="关注成功"
      end
    else
      data="您已关注"
    end
    return data
  end

  
  #START -------新浪微博API----------
  #
  #新浪微博主方法
  def sina_api(request)
    uri = URI.parse("https://api.weibo.com")
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.verify_mode = OpenSSL::SSL::VERIFY_NONE
    response = http.request(request).body
  end
  #
  #新浪微博获取用户信息
  def sina_get_user(access_token,uid)
    request = Net::HTTP::Get.new("/2/users/show.json?access_token=#{access_token}&uid=#{uid}")
    response = JSON sina_api(request)
  end
  #
  #新浪微博发送微博
  def sina_send_message(access_token,message)
    request = Net::HTTP::Post.new("/2/statuses/update.json")
    request.set_form_data({"access_token" =>access_token, "status" => message})
    response =JSON sina_api(request)
  end
  #
  #END -------新浪微博API----------


  #START -------人人API----------
  #
  #人人主方法
  def renren_api(request)
    uri = URI.parse("http://api.renren.com")
    http = Net::HTTP.new(uri.host, uri.port)
    response = http.request(request).body
  end
  #
  #构成人人签名请求
  def renren_sig_request(query)
    str = ""
    query.sort.each{|key,value|str<<"#{key}=#{value}"}
    str<<Constant::RENREN_API_SECRET
    sig = Digest::MD5.hexdigest(str)
    query[:sig]=sig
    request = Net::HTTP::Post.new("/restserver.do")
    request.set_form_data(query)
    return request
  end
  #
  #人人获取用户信息
  def renren_get_user(access_token)
    query = {:access_token => access_token,:format => 'JSON',:method => 'xiaonei.users.getInfo',:v => '1.0'}
    request = renren_sig_request(query)
    response = JSON renren_api(request)
  end
  #
  #人人发送新鲜事
  def renren_send_message(access_token,message)
    query = {:access_token => "#{access_token}",:comment=>"#{message}",:format => 'JSON',:method => 'share.share',:type=>"6",:url=>"http://www.gankao.co",:v => '1.0'}
    request = renren_sig_request(query)
    response =JSON renren_api(request)
  end
  #
  #END -------人人API----------


  #START -------开心网API----------
  #
  #开心主方法
  def kaixin_api(request)
    uri = URI.parse("https://api.kaixin001.com")
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.verify_mode = OpenSSL::SSL::VERIFY_NONE
    response = http.request(request).body
  end
  #
  #开心获取accesstoken
  def kaixin_accesstoken(code)
    request = Net::HTTP::Get.new("/oauth2/access_token?grant_type=authorization_code&code=#{code}&client_id=#{Constant::KAIXIN_API_KEY}&client_secret=#{Constant::KAIXIN_API_SECRET}&redirect_uri=#{Constant::SERVER_PATH}/logins/respond_kaixin")
    response = JSON kaixin_api(request)
  end
  #
  #开心获取用户信息
  def kaixin_get_user(access_token)
    request = Net::HTTP::Get.new("/users/me.json?access_token=#{access_token}")
    response = JSON kaixin_api(request)
  end
  #
  #END -------开心网API----------


  #START -------百度API----------
  #
  #百度主方法
  def baidu_api(request)
    uri = URI.parse("https://openapi.baidu.com")
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.verify_mode = OpenSSL::SSL::VERIFY_NONE
    response = http.request(request).body
  end
  #
  #百度获取accesstoken
  def baidu_accesstoken(code)
    request = Net::HTTP::Get.new("/oauth/2.0/token?grant_type=authorization_code&code=#{code}&client_id=#{Constant::BAIDU_API_KEY}&client_secret=#{Constant::BAIDU_API_SECRET}&redirect_uri=#{Constant::SERVER_PATH}/logins/respond_baidu")
    response = JSON baidu_api(request)
  end
  #
  #百度获取用户信息
  def baidu_get_user(access_token)
    request = Net::HTTP::Get.new("/users/me.json?access_token=#{access_token}")
    response = JSON baidu_api(request)
  end
  #
  #
  #百度获取用户信息
  def baidu_get_user(access_token)
    request = Net::HTTP::Get.new("/rest/2.0/passport/users/getLoggedInUser?access_token=#{access_token}")
    response = JSON baidu_api(request)
  end
  #
  #END -------百度API----------


  #qq添加说说
  def send_message_qq(con,openid,access_token,user_id)
    send_parms={:access_token=>access_token,:openid=>openid,:oauth_consumer_key=>Oauth2Helper::APPID,:format=>"json",:third_source=>"3",:con=>con}
    info=create_post_http("https://graph.qq.com","/shuoshuo/add_topic",send_parms)
    if info["data"]["ret"].nil?
      p "qq error_code #{info["data"]["ret"]}"
    else
      p "qq user #{user_id}  send success"
    end
  end

  #开心网添加记录
  def send_message_kaixin(access_token,message)
    url="https://api.kaixin001.com"
    info=create_post_http(url,"/records/add.json",{:access_token=>access_token,:content=>message})
    if info["rid"].nil?
      p "kaixin error code - #{info["error"]}"
    else
      p "kaixin user-record id is  #{info["rid"]}"
    end
  end

  #根据用户类型发送消息
  def send_message(message,user_id)
    begin
      user=User.find(user_id)
      if !user.access_token.nil? and user.access_token!="" and !user.end_time.nil? and user.end_time>Time.now
        message +="赶考网http://www.gankao.co --#{Time.now.strftime(("%Y-%m-%d"))}"
        send_message_qq(message,user.open_id,user.access_token,user_id) if user.code_type=="qq" and !user.open_id.nil?
        renren_send_message(user.access_token,message)  if user.code_type=="renren"
        sina_send_message(user.access_token,message) if user.code_type=="sina"
        send_message_kaixin(user.access_token,message) if  user.code_type=="kaixin"
        sleep 2
      end
    rescue
    end
  end
end
