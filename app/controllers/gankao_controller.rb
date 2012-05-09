# encoding: utf-8
class GankaoController < ApplicationController
  layout false
  before_filter :sign?, :except => ["index"]
  
  def index
   user_role?(cookies[:user_id]) unless cookies[:user_id].nil?
  end

  def goto_plan
    @join_tab = true
    render "index"
  end
  
end
