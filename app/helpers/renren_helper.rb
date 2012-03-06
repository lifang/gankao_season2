#encoding: utf-8
module RenrenHelper
  require 'oauth2'
  require 'net/http'
  TOTAL_GRAPH_URL = "https://graph.renren.com"
  GRAPH_RENREN_URL = "graph.renren.com"
  CALL_BACK_URL = Constant::SERVER_PATH + "/logins/renren_index"
  ACCESS_TOKEN_URL = "/oauth/token"
  API_RENREN_URL = "http://api.renren.com/restserver.do"
  SESSION_KEY_URL = "/renren_api/session_key"

  def client
    OAuth2::Client.new(api_key, api_secret,
      :site => {:url => TOTAL_GRAPH_URL,:response_type => 'code'})
  end

  #返回access_token
  def return_access_token(code)
    http = Net::HTTP.new(GRAPH_RENREN_URL, 443)
    http.use_ssl = true
    http.verify_mode = OpenSSL::SSL::VERIFY_NONE
    res = http.get(access_token_url(code))
    res_json = JSON res.body
    return res_json["access_token"]
  end
  
  
  def return_session_key(access_token)
    http = Net::HTTP.new(GRAPH_RENREN_URL, 443)
    http.use_ssl = true
    http.verify_mode = OpenSSL::SSL::VERIFY_NONE
    session_res = http.get(session_key_url(access_token))
    res_json = JSON session_res.body
    return res_json["renren_token"]["session_key"]
  end

  #返回用户信息
  def return_user(session_key)
    str = "api_key=#{api_key}"
    str << "call_id=#{Time.now.to_i}"
    str << "format=JSON"
    str << "method=xiaonei.users.getInfo"
    str << "session_key=#{session_key}"
    str << "v=1.0"
    str << "#{api_secret}"
    sig = Digest::MD5.hexdigest(str)

    query = {:api_key => api_key,
      :call_id => Time.now.to_i,
      :format => 'JSON',
      :method => 'xiaonei.users.getInfo',
      :session_key => session_key,
      :v => '1.0',
      :sig => sig
    }
    return JSON Net::HTTP.post_form(URI.parse(URI.encode("http://api.renren.com/restserver.do")), query).body
  end

  def share_gankao(session_key)
    str = "api_key=#{api_key}"
    str << "call_id=#{Time.now.to_i}"
    str << "comment=欢迎来到赶考网"
    str << "format=JSON"
    str << "method=share.share"
    str << "session_key=#{session_key}"
    str << "type=6"
    str << "url=www.gankao.co"
    str << "v=1.0"
    str << "#{api_secret}"
    sig = Digest::MD5.hexdigest(str)

    query = {:api_key => api_key,
      :call_id => Time.now.to_i,
      :comment => "欢迎来到赶考网",
      :format => 'JSON',
      :method => 'share.share',
      :session_key => session_key,
      :type => 6 ,
      :url => "www.gankao.co",
      :v => '1.0',
      :sig => sig
    }
    return JSON Net::HTTP.post_form(URI.parse(URI.encode("http://api.renren.com/restserver.do")), query).body
  end

  def api_key
    "98a6ed88bccc409da12a8abe3ebec3c5"             #  赶考网  人人帐号： wangguanhong@hotmail.com
  end

  def api_secret
    "0d19833c0bc34a27a58786c07ef8d9fb"             #  赶考网  人人帐号： wangguanhong@hotmail.com
  end

  def access_token_url(code)
    grant_type = "grant_type=authorization_code"
    access_code = "code=#{code}"
    client_id = "client_id=" + api_key
    client_secret = "client_secret=" + api_secret
    redirect_uri = "redirect_uri=" + CALL_BACK_URL
    return ACCESS_TOKEN_URL + "?" + grant_type + "&"+ access_code +"&" + client_id + "&"+ client_secret + "&" + redirect_uri
  end

  def session_key_url(access_token)
    return SESSION_KEY_URL + "?oauth_token=" + access_token
  end


  #excise变量
  CALLBACK_URL=Constant::SERVER_PATH+"/competes/renren_compete"

  #获取access_token
  def get_access_token(code)
    http = Net::HTTP.new(GRAPH_RENREN_URL, 443)
    http.use_ssl = true
    http.verify_mode = OpenSSL::SSL::VERIFY_NONE
    res = http.get(authorize_url(code))
    res_json = JSON res.body
    return res_json["access_token"]
  end

  def authorize_url(code)
    grant_type = "grant_type=authorization_code"
    access_code = "code=#{code}"
    client_id = "client_id=" + api_key
    client_secret = "client_secret=" + api_secret
    redirect_uri = "redirect_uri=" + CALLBACK_URL
    return ACCESS_TOKEN_URL + "?" + grant_type + "&"+ access_code +"&" + client_id + "&"+ client_secret + "&" + redirect_uri
  end

  #START -------人人API----------
  
  #人人发送新鲜事
  def renren_send_message(access_token,message)
    str = "access_token=#{access_token}"
    str << "comment=#{message}"
    str << "format=JSON"
    str << "method=share.share"
    str << "type=6"
    str << "url=http://www.gankao.co"
    str << "v=1.0"
    str << "#{api_secret}"
    sig = Digest::MD5.hexdigest(str)

    query = {
      :access_token => "#{access_token}",
      :comment=>"#{message}",
      :format => 'JSON',
      :method => 'share.share',
      :type=>"6",
      :url=>"http://www.gankao.co",
      :v => '1.0',
      :sig => sig
    }
    response = Net::HTTP.post_form(URI.parse(URI.encode("http://api.renren.com/restserver.do")), query).body
  end
  #END -------人人API----------

end
