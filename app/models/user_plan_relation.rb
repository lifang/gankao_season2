# encoding: utf-8
class UserPlanRelation < ActiveRecord::Base
  belongs_to :user
  belongs_to :study_plan
end
