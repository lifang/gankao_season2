# encoding: utf-8
class UsersController < ApplicationController

  def delete_user
    cookies.delete(:user_id)
    cookies.delete(:user_name)
    redirect_to "/"
  end
end
