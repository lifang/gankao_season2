# encoding: utf-8
class UserMailer < ActionMailer::Base
  default :from => "xuqiyong@comdosoft.com"
  

  def fankui(record,name)
    @record = record
    @name = name
    mail(:to => Constant::FANKUI_EMAIL, :subject =>"来自 #{@name}(用户编号:#{@record.user_id}) 的反馈信息" )
  end

  
end
