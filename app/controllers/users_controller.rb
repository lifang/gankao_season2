# encoding: utf-8
class UsersController < ApplicationController
 layout 'user'
  def delete_user
    cookies.delete(:user_id)
    cookies.delete(:user_name)
    cookies.delete(:user_roles)
    redirect_to "/"
  end

  def show
    
  end


end
