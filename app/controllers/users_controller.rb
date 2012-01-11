# encoding: utf-8
class UsersController < ApplicationController
 layout 'user'
  def delete_user
    cookies.delete(:user_id)
    cookies.delete(:user_name)
    redirect_to "/"
  end

  def show
    
  end

  def info
    @email=Notice.find_by_sql("select * from notices where send_types=#{Notice::SEND_TYPE[:SINGLE]} and target_id=#{cookies[:user_id]}")
    @mess=Notice.find_by_sql("select * from notices where send_types=#{Notice::SEND_TYPE[:SYSTEM]} and TO_DAYS(ended_at)>TO_DAYS('#{Time.now}')")
  end

end
