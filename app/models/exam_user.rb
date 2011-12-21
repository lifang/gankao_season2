# encoding: utf-8
class ExamUser < ActiveRecord::Base
  belongs_to :user
  #has_many :rater_user_relations,:dependent=>:destroy
  belongs_to :examination
  #has_many :exam_raters,:through=>:rater_user_relations,:foreign_key=>"exam_rater_id"
  belongs_to :paper
  require 'rexml/document'
  include REXML
  require 'spreadsheet'

  IS_SUBMITED = {:YES => 1, :NO => 0} #用户是否提交 1 提交 2 未提交
  IS_USER_AFFIREMED = {:YES => 1, :NO => 0} #用户是否确认  1 已确认 0 未确认
  default_scope :order => "exam_users.total_score desc"
  
end
