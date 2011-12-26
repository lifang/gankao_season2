# encoding: utf-8
class StudyPlansController < ApplicationController
  def index
    @study_plan = StudyPlan.find_by_sql(["select * from study_plans sp 
      left join user_plan_relations upr on upr.study_plan_id = sp.id 
      where sp.category_id = ? and upr.user_id = ? limit 1",
        params[:category].to_i, cookies[:user_id].to_i])
  end

  def plan_status
    day=UserPlanRelation.find_by_user_id(1)
    @day_all=[]
   unless day.nil?
     end_at=day.ended_at.nil?? day.created_at : day.ended_at.to_datetime.month
     puts end_at
   end
    respond_to do |format|
      format.json {
        data={:days=>@day_all}
        render :json=>data
      }
    end
  end


end
