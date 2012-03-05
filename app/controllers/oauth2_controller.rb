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
      meters=params[:access_token].split("&")
      access_token=meters[0].split("=")[1]
      expires_in=meters[1].split("=")[1]
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
        @user.update_attributes(:access_token=>access_token,:end_time=>Time.now+expires_in.seconds)
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
      begin
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
        render :inline => "<script>var url = (window.opener.location.href.split('?last_url=')[1]==null)? '/' : window.opener.location.href.split('?last_url=')[1] ;window.opener.location.href=url;window.close();</script>"
      rescue
        render :inline => "<script>window.opener.location.reload();window.close();</script>"
      end
    else
      cookies[:sina_url_generate]="replace('#','?')"
      render :inline=>"<script type='text/javascript'>window.location.href=window.location.toString().replace('#','?');</script>"
    end
  end

  def watch_weibo
    layout "oauth"
    if cookies[:user_id].nil?
      redirect_to "#{Oauth2Helper::REQUEST_URL_WEIBO}?#{Oauth2Helper::REQUEST_WEIBO_TOKEN.map{|k,v|"#{k}=#{v}"}.join("&")}"
    else
      user=User.find(cookies[:user_id].to_i)
      if user.code_type!="sina"
        redirect_to "#{Oauth2Helper::REQUEST_URL_WEIBO}?#{Oauth2Helper::REQUEST_WEIBO_TOKEN.map{|k,v|"#{k}=#{v}"}.join("&")}"
      else
        flash[:warn]=request_weibo(user.access_token,user.code_id,"关注失败")
        render :inline => "<style>.tishi_tab { width: 288px; padding: 20px; background: url(/assets/black01_bg.png) repeat; position: absolute; display: none;z-index: 1000;border-radius: 5px;} .tishi_tab p { text-align: center; line-height: 24px; font-size: 18px; color:#fff; font-family:'微软雅黑';}</style>
    <script type='text/javascript' src='/assets/application.js'></script><script type='text/javascript' src='/assets/login.js'></script>
     <div id='flash_notice' class='tishi_tab'><p><%= flash[:warn]%></p></div>
    <script type='text/javascript'>show_flash_div();</script><script> setTimeout(function(){
      window.close();}, 3000)</script><% flash[:warn]=nil %>"
      end
    end
  end
  def respond_weibo
    render :layout=>"oauth"
  end

  def add_watch_weibo
    data="关注失败"
#    begin
      meters={}
      params[:access_token].split("&").each do |parm|
        parms=parm.split("=")
        parms.each {meters[parms[0]]=parms[1]}
      end
      data=request_weibo(meters["access_token"],meters["uid"],data)
      #    rescue
    #    end
    respond_to do |format|
      format.json {
        render :json=>{:data=>data}
      }
    end
  end



end
