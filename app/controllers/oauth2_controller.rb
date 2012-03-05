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
        #        ,:access_token=>access_token,:end_time=>Time.now+(Constant::QQ_DATE).days
        @user=User.create(:code_type=>'qq',:name=>user_info["nickname"],:username=>user_info["nickname"],:open_id=>openid)
        cookies[:first] = {:value => "1", :path => "/", :secure  => false}
        #      else
        #        @user.update_attributes(:access_token=>access_token,:end_time=>Time.now+(Constant::QQ_DATE).days)
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

  def request_sina
    redirect_to "https://api.weibo.com/oauth2/authorize?client_id=3987186573&redirect_uri=http://www.gankao.co/oauth2/respond_sina&response_type=token"
  end

  def respond_sina
    if cookies[:sina_url_generate]
      cookies.delete(:sina_url_generate)
      #发送微博
      access_token=params[:access_token]
      uid=params[:uid]
      expires_in=params[:expires_in]
      response = JSON sina_get_user(access_token,uid)
      @user=User.where("code_id='#{response["id"]}' and code_type='sina'").first
      if @user.nil?
        @user=User.create(:code_id=>"#{response["id"]}",:code_type=>'sina',:name=>response["screen_name"],:username=>response["screen_name"])
        cookies[:first] = {:value => "1", :path => "/", :secure  => false}
      end
      cookies[:user_name] = {:value =>@user.username, :path => "/", :secure  => false}
      cookies[:user_id] = {:value =>@user.id, :path => "/", :secure  => false}
      user_role?(cookies[:user_id])
      ActionLog.login_log(cookies[:user_id])
      render :inline=>"<p>#{@user.id}   #{response["screen_name"]} #{@user.code_id}</p><p>#{response.to_s}</p>"
    else
      cookies[:sina_url_generate]="replace('#','?')"
      render :inline=>"<script type='text/javascript'>window.location.href=window.location.toString().replace('#','?');</script>"
    end
   
  end

  def manage_sina
    render :inline=>"<p>测试</p>"
  end



end
