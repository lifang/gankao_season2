# encoding: utf-8
class UsersController < ApplicationController

  def delete_user
    cookies.delete(:user_id)
    cookies.delete(:user_name)
    cookies.delete(:user_roles)
    redirect_to "/logins"
  end
end
