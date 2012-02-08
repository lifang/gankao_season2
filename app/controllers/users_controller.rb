# encoding: utf-8
class UsersController < ApplicationController
  layout 'user'
  respond_to :html, :xml, :json
  include AlipaysHelper

  def delete_user
    cookies.delete(:user_id)
    cookies.delete(:user_name)
    redirect_to "/"
  end

  def show
    @title = "个人信息 - 赶考网"
    @user=User.find(cookies[:user_id])
    @order=Order.first(:conditions=>"user_id=#{cookies[:user_id]} and TO_DAYS(end_time)>TO_DAYS('#{Time.now}') and status=#{Order::STATUS[:NOMAL]}")
  end

  def update_users
    User.find(params[:id].to_i).update_attributes(params[:info])
    data="更新成功"
    respond_to do |format|
      format.json {
        render :json=>{:message=>data}
      }
    end
  end

  def mess_info
    mess_sql="select * from notices where send_types=#{Notice::SEND_TYPE[:SYSTEM]} and TO_DAYS(ended_at)>TO_DAYS('#{Time.now}')"
    @mess=Notice.paginate_by_sql(mess_sql,:per_page =>5, :page => params[:page])
    respond_with (@mess) do |format|
      format.js
    end
  end

  def email_info
    e_sql="select * from notices where send_types=#{Notice::SEND_TYPE[:SINGLE]} and target_id=#{cookies[:user_id]}"
    @email=Notice.paginate_by_sql(e_sql,:per_page =>5, :page => params[:page])
    respond_with (@email) do |format|
      format.js
    end
  end


  def record_info
    sql = "(select o.created_at created_at, c.name name, o.remark remark, o.total_price total_price,o.out_trade_no from orders o join categories c on c.id = o.category_id
           where o.user_id =#{cookies[:user_id]})"
    @orders=Order.paginate_by_sql(sql,:per_page =>5, :page => params[:page])
    respond_with (@orders) do |format|
      format.js
    end
  end

  def delete_mess
    Notice.delete(params[:ids])
    data="删除成功"
    respond_to do |format|
      format.json {
        render :json=>{:message=>data}
      }
    end
  end


  def accredit_check
    code=InviteCode.first(:conditions=>"code='#{params[:info]}'")
    if code.nil?
      data="邀请码不存在"
    else
      if code.is_used
        data="邀请码已被使用"
      else
        code.update_attributes(:use_time=>Time.now,:is_used=>InviteCode::IS_USED[:YES])
        order=Order.first(:conditions=>"user_id=#{cookies[:user_id]} and category_id=#{Constant::EXAM_TYPES[:forth_level]}")
        if order.nil? || order.types==Order::TYPES[:COMPETE] || order.types==Order::TYPES[:TRIAL_SEVEN]
          Order.create(:user_id=>cookies[:user_id],:category_id=>Constant::EXAM_TYPES[:forth_level],:types=>Order::TYPES[:ACCREDIT],
            :out_trade_no=>"#{cookies[:user_id]}_#{Time.now.strftime("%Y%m%d%H%M%S")}#{Time.now.to_i}",:status=>Order::STATUS[:NOMAL],:remark=>"邀请码升级vip",:start_time=>Time.now,:end_time=>Time.now+Constant::DATE_LONG[:vip].days)
        else
          if order.status
            data="您已是vip用户，截止日期是#{order.end_time.strftime("%Y-%m-%d")}"
          else
            Order.update_attributes(:types=>Order::TYPES[:ACCREDIT],:out_trade_no=>"#{cookies[:user_id]}_#{Time.now.strftime("%Y%m%d%H%M%S")}#{Time.now.to_i}",
              :status=>Order::STATUS[:NOMAL],:remark=>"邀请码升级vip",:start_time=>Time.now,:end_time=>Time.now+Constant::DATE_LONG[:vip].days)
          end         
        end
        data="升级成功"
      end
    end
    respond_to do |format|
      format.json {
        render :json=>{:message=>data}
      }
    end
  end


  def check_vip
    order=Order.first(:conditions=>"user_id=#{cookies[:user_id]} and category_id=#{Constant::EXAM_TYPES[:forth_level]}")
    end_time=""
    if order.nil? || order.types==Order::TYPES[:TRIAL_SEVEN] || order.types==Order::TYPES[:COMPETE]
      data=true
    else
      if order.status
        end_time=order.end_time.strftime("%Y-%m-%d")
        data=false
      else
        data=true
      end
    end
    respond_to do |format|
      format.json {
        render :json=>{:message=>data,:time=>end_time}
      }
    end
  end

  def alipay_exercise
    options ={
      :service=>"create_direct_pay_by_user",
      :notify_url=>"http://localhost:3001/competes/alipay_compete",
      :subject=>"会员升级vip",
      :payment_type=>Constant::VIP_TYPE[:good],
      :total_fee=>Constant::SIMULATION_FEE
    }
    out_trade_no="#{cookies[:user_id]}_#{Time.now.strftime("%Y%m%d%H%M%S")}#{Time.now.to_i}"
    options.merge!(:seller_email =>AlipaysHelper::SELLER_EMAIL, :partner =>AlipaysHelper::PARTNER, :_input_charset=>"utf-8", :out_trade_no=>out_trade_no)
    options.merge!(:sign_type => "MD5", :sign =>Digest::MD5.hexdigest(options.sort.map{|k,v|"#{k}=#{v}"}.join("&")+AlipaysHelper::PARTNER_KEY))
    redirect_to "#{AlipaysHelper::PAGE_WAY}?#{options.sort.map{|k, v| "#{CGI::escape(k.to_s)}=#{CGI::escape(v.to_s)}"}.join('&')}"
  end


  def alipay_compete
    out_trade_no=params[:out_trade_no]
    trade_nu =out_trade_no.to_s.split("_")
    order=Order.find(:first, :conditions => ["user_id=?",trade_nu[0]])
    if order.nil?
      alipay_notify_url = "#{AlipaysHelper::NOTIFY_URL}?partner=#{AlipaysHelper::PARTNER}&notify_id=#{params[:notify_id]}"
      response_txt =Net::HTTP.get(URI.parse(alipay_notify_url))
      my_params = Hash.new
      request.parameters.each {|key,value|my_params[key.to_s]=value}
      my_params.delete("action")
      my_params.delete("controller")
      my_params.delete("sign")
      my_params.delete("sign_type")
      mysign = Digest::MD5.hexdigest(my_params.sort.map{|k,v|"#{k}=#{v}"}.join("&")+AlipaysHelper::PARTNER_KEY)
      dir = "#{Rails.root}/public/compete"
      Dir.mkdir(dir)  unless File.directory?(dir)
      file_path = dir+"/#{Time.now.strftime("%Y%m%d")}.log"
      if File.exists? file_path
        file = File.open( file_path,"a")
      else
        file = File.new(file_path, "w")
      end
      file.puts "#{Time.now.strftime('%Y%m%d %H:%M:%S')}   #{request.parameters.to_s}\r\n"
      file.close
      if mysign==params[:sign] and response_txt=="true"
        if params[:trade_status]=="WAIT_BUYER_PAY"
          render :text=>"success"
        elsif params[:trade_status]=="TRADE_FINISHED" or params[:trade_status]=="TRADE_SUCCESS"
          @@m.synchronize {
            begin
              Order.transaction do
                order=Order.first(:conditions=>"user_id=#{cookies[:user_id]} and category_id=#{Constant::EXAM_TYPES[:forth_level]}")
                if order.nil? || order.types==Order::TYPES[:TRIAL_SEVEN] || order.types==Order::TYPES[:COMPETE]
                  Order.create(:user_id=>cookies[:user_id],:category_id=>Constant::EXAM_TYPES[:forth_level],:types=>Order::TYPES[:CHARGE],
                    :out_trade_no=>"#{cookies[:user_id]}_#{Time.now.strftime("%Y%m%d%H%M%S")}#{Time.now.to_i}",:status=>Order::STATUS[:NOMAL],:remark=>"支付宝充值升级vip",:start_time=>Time.now,:end_time=>Time.now+Constant::DATE_LONG[:vip].weeks)
                else
                  unless order.status
                    Order.update_attributes(:user_id=>cookies[:user_id],:category_id=>Constant::EXAM_TYPES[:forth_level],:types=>Order::TYPES[:CHARGE],
                      :out_trade_no=>"#{cookies[:user_id]}_#{Time.now.strftime("%Y%m%d%H%M%S")}#{Time.now.to_i}",:status=>Order::STATUS[:NOMAL],:remark=>"支付宝充值升级vip",:start_time=>Time.now,:end_time=>Time.now+Constant::DATE_LONG[:vip].weeks)
                  end
                end
              end
              render :text=>"success"
            rescue
              render :text=>"success"
            end
          }
        else
          render :text=>"fail" + "<br>"
        end
      else
        redirect_to "/users/#{cookies[:user_id]}/record?vip=1"
      end
    else
      render :text=>"success"
    end
  end

  def info
    @title = "消息 - 赶考网"
  end

  def record
    @title = "消费记录 - 赶考网"
  end

end
