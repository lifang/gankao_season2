# encoding: utf-8
class Notice < ActiveRecord::Base
  belongs_to :category
  belongs_to :user
  
  SEND_TYPE = {:SYSTEM => 0, :SINGLE => 1} #发送类型 0 系统  1 个人

end
