# encoding: utf-8
class GankaoController < ApplicationController
  layout false
  
  def index
   user_role?(cookies[:user_id]) unless cookies[:user_id].nil?
  end
  
end
