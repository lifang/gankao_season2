# encoding: utf-8
class StudyPlansController < ApplicationController
  def index
    @study_plan = StudyPlan.find_by_sql(["select * from study_plans sp 
      left join user_plan_relations upr on upr.study_plan_id = sp.id 
      where sp.category_id = ? and upr.user_id = ? limit 1",
        params[:category].to_i, cookies[:user_id].to_i])
  end
end
