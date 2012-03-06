#encoding: utf-8
class LoginsController < ApplicationController
  require 'oauth2'
  include Oauth2Helper
  layout "application", :except => "index"

  def  renren_like
    redirect_to "http://widget.renren.com/dialog/friends?target_id=#{Constant::RENREN_ID}&app_id=163813&redirect_uri=http%3A%2F%2Fwww.gankao.co"
  end

  #退出
  def logout
    cookies.delete(:user_id)
    cookies.delete(:user_name)
    cookies.delete(:user_role)
    redirect_to root_path
  end

  #查看是否充值成功
  def charge_vip
    cookies.delete(:user_role)
    user_role?(cookies[:user_id])
    redirect_to "/users/#{cookies[:user_id]}"
  end

  def request_qq
    redirect_to "#{Oauth2Helper::REQUEST_URL_QQ}?#{Oauth2Helper::REQUEST_ACCESS_TOKEN.map{|k,v|"#{k}=#{v}"}.join("&")}"
  end

  def respond_qq
    render :layout=>"oauth"
  end

  def manage_qq
    begin
      meters=params[:access_token].split("&")
      access_token=meters[0].split("=")[1]
      expires_in=meters[1].split("=")[1].to_i
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
        @user=User.create(:code_type=>'qq',:name=>user_info["nickname"],:username=>user_info["nickname"],:open_id=>openid ,:access_token=>access_token,:end_time=>Time.now+expires_in.seconds)
        cookies[:first] = {:value => "1", :path => "/", :secure  => false}
      else
        if @user.end_time.nil?||@user.end_time<Time.now
          @user.update_attributes(:access_token=>access_token,:end_time=>Time.now+expires_in.seconds)
        end
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
    redirect_to "https://api.weibo.com/oauth2/authorize?client_id=#{Constant::SINA_CLIENT_ID}&redirect_uri=http://www.gankao.co/logins/respond_sina&response_type=token"
  end

  def respond_sina
    if cookies[:oauth2_url_generate]
      begin
        cookies.delete(:oauth2_url_generate)
        #发送微博
        access_token=params[:access_token]
        uid=params[:uid]
        expires_in=params[:expires_in].to_i
        response = JSON sina_get_user(access_token,uid)
        @user=User.where("code_id='#{response["id"]}' and code_type='sina'").first
        if @user.nil?
          @user=User.create(:code_id=>"#{response["id"]}", :code_type=>'sina', :name=>response["screen_name"], :username=>response["screen_name"], :access_token=>access_token, :end_time=>Time.now+expires_in.seconds)
          cookies[:first] = {:value => "1", :path => "/", :secure  => false}
        else
          @user.update_attributes(:access_token=>access_token,:end_time=>Time.now+expires_in.seconds)
        end
        cookies[:user_name] = {:value =>@user.username, :path => "/", :secure  => false}
        cookies[:user_id] = {:value =>@user.id, :path => "/", :secure  => false}
        user_role?(cookies[:user_id])
        ActionLog.login_log(cookies[:user_id])
        render :inline => "<script>var url = (window.opener.location.href.split('?last_url=')[1]==null)? '/' : window.opener.location.href.split('?last_url=')[1] ;window.opener.location.href=url;window.close();</script>"
      rescue
        render :inline => "<script>window.opener.location.reload();window.close();</script>"
      end
    else
      cookies[:oauth2_url_generate]="replace('#','?')"
      render :inline=>"<script type='text/javascript'>window.location.href=window.location.toString().replace('#','?');</script>"
    end
  end

  def watch_weibo
    layout "oauth"
    if cookies[:user_id].nil?
      redirect_to "#{Oauth2Helper::REQUEST_URL_WEIBO}?#{Oauth2Helper::REQUEST_WEIBO_TOKEN.map{|k,v|"#{k}=#{v}"}.join("&")}"
    else
      user=User.find(cookies[:user_id].to_i)
      if user.code_type!="sina" || user.access_token.nil? || user.end_time<Time.now
        redirect_to "#{Oauth2Helper::REQUEST_URL_WEIBO}?#{Oauth2Helper::REQUEST_WEIBO_TOKEN.map{|k,v|"#{k}=#{v}"}.join("&")}"
      else
        flash[:warn]=request_weibo(user.access_token,user.code_id,"关注失败")
        render :inline => "<div id='flash_notice' class='tishi_tab'><p><%= flash[:warn] %></p></div>
                            <script type='text/javascript'>show_flash_div();</script><script> setTimeout(function(){
                            window.close();}, 3000)</script><% flash[:warn]=nil %>"
      end
    end
  end

  def respond_weibo
    render :layout=>"oauth"
  end

  def add_watch_weibo
    layout "oauth"
    data="关注失败"
    begin
      meters={}
      params[:access_token].split("&").each do |parm|
        parms=parm.split("=")
        parms.each {meters[parms[0]]=parms[1]}
      end
      data=request_weibo(meters["access_token"],meters["uid"],data)
    rescue
    end
    respond_to do |format|
      format.json {
        render :json=>{:data=>data}
      }
    end
  end


  def request_renren
    redirect_to "http://graph.renren.com/oauth/authorize?response_type=token&client_id=#{Constant::RENREN_CLIENT_ID}&redirect_uri=http://www.gankao.co/logins/respond_renren"
  end

  def respond_renren
    if cookies[:oauth2_url_generate]
      begin
        cookies.delete(:oauth2_url_generate)
        #发送微博
        access_token=params[:access_token]
        expires_in=params[:expires_in].to_i
        response = JSON(renren_get_user(access_token))[0]
        @user=User.where("code_id=#{response["uid"].to_s} and code_type='renren'").first
        if @user.nil?
          @user=User.create(:code_id=>response["uid"],:code_type=>'renren',:name=>response["name"],:username=>response["name"], :access_token=>access_token, :end_time=>Time.now+expires_in.seconds)
          cookies[:first] = {:value => "1", :path => "/", :secure  => false}
        else
          @user.update_attributes(:access_token=>access_token,:end_time=>Time.now+expires_in.seconds)
        end
        cookies[:user_name] ={:value =>@user.username, :path => "/", :secure  => false}
        cookies[:user_id] ={:value =>@user.id, :path => "/", :secure  => false}
        user_role?(cookies[:user_id])
        ActionLog.login_log(cookies[:user_id])
        render :inline => "<script>var url = (window.opener.location.href.split('?last_url=')[1]==null)? '/' : window.opener.location.href.split('?last_url=')[1] ;window.opener.location.href=url;window.close();</script>"
      rescue
        render :inline => "<script>window.opener.location.reload();window.close();</script>"
      end
    else
      cookies[:oauth2_url_generate]="replace('#','?')"
      render :inline=>"<script type='text/javascript'>window.location.href=window.location.toString().replace('#','?');</script>"
    end


  end

end
