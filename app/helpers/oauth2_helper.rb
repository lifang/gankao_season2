# encoding: utf-8
module Oauth2Helper

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
    :scope=>"get_user_info",
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

  #新浪微博添加关注
  def request_weibo(access_token,code_id,data)
    weibo_url="api.weibo.com"
    weibo_http = Net::HTTP.new(weibo_url, 443)
    weibo_http.use_ssl = true
    weibo_http.verify_mode = OpenSSL::SSL::VERIFY_NONE
    back_res = weibo_http.get("/2/friendships/show.json?access_token=#{access_token}&source_id=#{code_id}&target_id=#{Oauth2Helper::WEIBO_ID}")
    user_info=JSON back_res.body
    #    测试是否已关注
    unless user_info["source"]["following"]
      add_url="api.weibo.com"
      add_http = Net::HTTP.new(add_url, 443)
      add_http.use_ssl = true
      add_http.verify_mode = OpenSSL::SSL::VERIFY_NONE
      request = Net::HTTP::Post.new("/2/friendships/create.json")
      request.set_form_data({ :access_token=>access_token,:screen_name=>Oauth2Helper::WEIBO_NAME,:uid=>Oauth2Helper::WEIBO_ID})
      add_info=add_http.request(request).body
      if add_info["following"]
        data="关注成功"
      end
    else
      data="您已关注"
    end
    return data
  end

  
  #START -------新浪微博API----------
  #主方法
  def sina_api(request)
    uri = URI.parse("https://api.weibo.com")
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.verify_mode = OpenSSL::SSL::VERIFY_NONE
    response = http.request(request).body
  end

  #获取用户信息
  def sina_get_user(access_token,uid)
    request = Net::HTTP::Get.new("/2/users/show.json?access_token=#{access_token}&uid=#{uid}")
    sina_api(request)
  end

  #发送微博
  def sina_send_message(access_token,message)
    request = Net::HTTP::Post.new("/2/statuses/update.json")
    request.set_form_data({"access_token" =>access_token, "status" => message})
    sina_api(request)
  end
  #END -------新浪微博API----------

end
