# encoding: utf-8
class Role < ActiveRecord::Base
  has_one :model_role,:dependent=>:destroy
  has_many :user_role_relations,:dependent=>:destroy
  has_many :users,:through=>:user_role_relations,:foreign_key=>"user_id"

  TYPES = {:TEACHER => 1, :STUDENT => 2, :VICEGERENT => 3, :SYSTEM => 4}  #1 考试组织人  2 考生  3 学校代理人  4 系统管理员
end
