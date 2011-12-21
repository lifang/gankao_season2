#encoding: utf-8
class ExamRater < ActiveRecord::Base
  require 'rexml/document'
  include REXML
  has_many :rater_user_relations,:dependent => :destroy
  has_many :exam_users, :through=>:rater_user_relations, :foreign_key => "exam_user_id"
  belongs_to :examination

end
