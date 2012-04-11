# encoding: utf-8
class UserPlanRelation < ActiveRecord::Base
  belongs_to :user
  belongs_to :study_plan

  IS_ACTIVITY = {:YES => 1, :NO => 0} #是否参加活动 1 已参加  0 未参加
end
