# encoding: utf-8
module QqHelper
  require 'oauth2'
  require 'oauth'

  #qq登录参数
  GRAPY_URL="http://openapi.qzone.qq.com/user/get_user_info"
  REQUEST_URL="http://openapi.qzone.qq.com/oauth/qzoneoauth_request_token"
  AUTHOTIZE_URL="http://openapi.qzone.qq.com/oauth/qzoneoauth_authorize"
  CALLBACK_URL="http://www.gankao.co/pages/qq_index"
  QQ_ACCESS_URL="http://openapi.qzone.qq.com/oauth/qzoneoauth_access_token"
  COMSUMER_KEY="oauth_consumer_key=223448"
  COMSUMER_SECRECT="64d7ddfe7e483dd51b2b14cf2ec0ec27"
  SIGNATRUE_METHOD="oauth_signature_method=HMAC-SHA1"
  VESION="oauth_version=1.0"

  #生成qq参数串
  def login_qq_params
    timestamp=(Time.new.to_i).to_s
    return "#{COMSUMER_KEY}&oauth_nonce=#{timestamp}&#{SIGNATRUE_METHOD}&oauth_timestamp=#{timestamp}&#{VESION}"
  end

  def access_url_params(oauth_token,oauth_vericode)
    timestamp=(Time.new.to_i).to_s
    return "#{COMSUMER_KEY}&oauth_nonce=#{timestamp}&#{SIGNATRUE_METHOD}&oauth_timestamp=#{timestamp}&oauth_token=#{oauth_token}&oauth_vericode=#{oauth_vericode}&#{VESION}"
  end

  def get_user_info_params(qqtoken,openid)
    timestamp=(Time.new.to_i).to_s
    return "#{COMSUMER_KEY}&oauth_nonce=#{timestamp}&#{SIGNATRUE_METHOD}&oauth_timestamp=#{timestamp}&oauth_token=#{qqtoken}&#{VESION}&openid=#{openid}"
  end

  #生成请求路径
  def produce_url(url,url_params,secrect)
    return "#{url}?#{url_params}&oauth_signature=#{signature_params(COMSUMER_SECRECT,url_params,url,"GET",secrect)}"
  end

  #腾讯微博登录参数:
  def weibo_app_key
    801004949
  end

  def weibo_app_secret
    "b5ab55615ee5261fcadf2f50128edb51"
  end

  REQUEST_WEIBO="https://open.t.qq.com/cgi-bin/request_token"
  ADD_FRIEND="http://open.t.qq.com/api/friends/add"
  ACCESS_TOKEN_URL="http://open.t.qq.com/cgi-bin/access_token"
  ADD_WEIBO="http://open.t.qq.com/api/t/add"
  WEIBO_COMSUMER_KEY="oauth_consumer_key=801004949"
  JSON_FORMAT="format=json"
  OPTIONS={
    :site               => "https://open.t.qq.com",
    :scheme             => :query_string,
    :http_method        => :get,
    :signature_method => "HMAC-SHA1",
    :request_token_path => "/cgi-bin/request_token",
    :access_token_path  => "/cgi-bin/access_token",
    :authorize_path     => "/cgi-bin/authorize",
    :nonce => Base64.encode64(OpenSSL::Random.random_bytes(32)).gsub(/\W/, '')[0, 32]
  }

  def add_friend_params
    timestamp=(Time.new.to_i).to_s
    "#{JSON_FORMAT}&name=#{Constant::TENCENT_WEIBO_NAME}&oauth_consumer_key=#{weibo_app_key}&oauth_nonce=#{timestamp}&#{SIGNATRUE_METHOD}&oauth_timestamp=#{timestamp}&oauth_token=#{session[:weibo_access_token]}&#{VESION}"
  end

  def define_test
    "12月要考四级的ggmm可以看看这个网站http://www.gankao.co，有在线模拟考试和新四级的全部真题，直接在线复习的，听力部分有录音，所有试题有解析，错题库可以让你更加针对性的复习，不用再到处找资料啦，全部一次搞定。"
  end

  def add_weibo_params
    timestamp = (Time.new.to_i).to_s
    return "clientip=127.0.0.1&content=#{CGI.escape(define_test)}&#{JSON_FORMAT}&jing=&oauth_consumer_key=#{weibo_app_key}&oauth_nonce=#{timestamp}&#{SIGNATRUE_METHOD}&oauth_timestamp=#{timestamp}&oauth_token=#{session[:weibo_access_token]}&#{VESION}&wei="
    
  end


  #公共方法加密url及生成签名：
  def signature_params(key,sign,url,method,secret)
    signature="#{method}&#{url_encoding(url)}&#{CGI.escape(sign)}"
    return url_encoding(Base64.encode64(OpenSSL::HMAC.digest("sha1","#{key}&#{secret}",signature)))
  end

  def url_encoding(str)
    str.gsub("=", "%3D").gsub("/","%2F").gsub(":","%3A").gsub("&","%26").gsub("+","%2B")
  end

end
