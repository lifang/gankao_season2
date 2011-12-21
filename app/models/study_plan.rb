# encoding: utf-8
class StudyPlan < ActiveRecord::Base
  belongs_to :category
  has_many :plan_tasks
  has_many :user_plan_relations,:dependent => :destroy
  has_many :users,:through=>:user_plan_relations, :source => :user
end
