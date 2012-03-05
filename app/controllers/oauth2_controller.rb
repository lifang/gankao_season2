#encodeing: utf-8
class Oauth2Controller < ApplicationController
  include Oauth2Helper
  
  def request_qq
    redirect_to "#{Oauth2Helper::REQUEST_URL_QQ}?#{Oauth2Helper::REQUEST_ACCESS_TOKEN.map{|k,v|"#{k}=#{v}"}.join("&")}"
  end

  def respond_qq
    render :layout=>"oauth"
  end

  def manage_qq
    begin
      access_token=params[:access_token].split("&")[0].split("=")[1]
      openid=params[:open_id]
      @user= User.find_by_open_id(openid)
      if @user.nil?
        user_url="graph.qq.com"
        user_http = Net::HTTP.new(user_url, 443)
        user_http.use_ssl = true
        user_http.verify_mode = OpenSSL::SSL::VERIFY_NONE
        back_res = user_http.get("/user/get_user_info?access_token=#{access_token}&oauth_consumer_key=#{Oauth2Helper::APPID}&openid=#{openid}")
        user_info=JSON back_res.body
        user_info["nickname"]="qq用户" if user_info["nickname"].nil?||user_info["nickname"]==""
        @user=User.create(:code_type=>'qq',:name=>user_info["nickname"],:username=>user_info["nickname"],:open_id=>openid ,:access_token=>access_token,:end_time=>Time.now+(Constant::QQ_DATE).days)
        cookies[:first] = {:value => "1", :path => "/", :secure  => false}
      else
        @user.update_attributes(:access_token=>access_token,:end_time=>Time.now+(Constant::QQ_DATE).days)
      end
      cookies[:user_id] ={:value =>@user.id, :path => "/", :secure  => false}
      cookies[:user_name] ={:value =>@user.username, :path => "/", :secure  => false}
      user_role?(cookies[:user_id])
      ActionLog.login_log(cookies[:user_id])
      data=true
    rescue
      data=false
    end
    respond_to do |format|
      format.json {
        render :json=>data
      }
    end
  end

  def watch_weibo
    redirect_to "#{Oauth2Helper::REQUEST_URL_WEIBO}?#{Oauth2Helper::REQUEST_WEIBO_TOKEN.map{|k,v|"#{k}=#{v}"}.join("&")}"
  end

  def add_watch_weibo
    meters={}
    params[:access_token].split("&").each do |parm|
      parms=parm.split("=")
      parms.each {meters[parms[0]]=parms[1]}
    end
    weibo_url="api.weibo.com"
    weibo_http = Net::HTTP.new(weibo_url, 443)
    weibo_http.use_ssl = true
    weibo_http.verify_mode = OpenSSL::SSL::VERIFY_NONE
    back_res = weibo_http.get("/2/friendships/show?access_token=#{meters["access_token"]}&source_id=#{meters["uid"]}&target_screen_name=#{Oauth2Helper::WEIBO_NAME}")
    user_info=JSON back_res.body
    unless user_info[:source][:following]
      add_url="api.weibo.com"
      add_http = Net::HTTP.new(add_url, 443)
      add_http.use_ssl = true
      add_http.verify_mode = OpenSSL::SSL::VERIFY_NONE
      back_res = add_http.post("/2/friendships/create?access_token=#{meters["access_token"]}&source_id=#{Oauth2Helper::WEIBO_ID}&target_screen_name=#{Oauth2Helper::WEIBO_NAME}")
      add_info=JSON back_res.body
      if add_info["following"]
        data="关注成功"
      else
        data="关注失败"
      end
    else
      data="您已关注"
    end
    respond_to do |format|
      format.json {
        render :json=>data
      }
    end
  end





end
