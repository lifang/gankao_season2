# encoding: utf-8
class StudyPlansController < ApplicationController
  def index
    @study_plan = StudyPlan.find_by_sql(["select * from study_plans sp 
      left join user_plan_relations upr on upr.study_plan_id = sp.id 
      where sp.category_id = ? and upr.user_id = ? limit 1",
        params[:category].to_i, cookies[:user_id].to_i])
  end

  def plan_status
    days=UserPlanRelation.find_by_user_id(1)
    day_all={}
    unless days.nil?
      end_at=days.ended_at.nil?? days.created_at.to_datetime : days.ended_at.to_datetime
      created_at=days.created_at.to_datetime
      if(end_at.month==created_at.month)
        (end_at.day..created_at.day).each do |one_day|
          day_all[created_at.month].nil??day_all[created_at.month]=[one_day] :day_all[created_at.month]<<one_day
        end
      else
        (created_at.day..params[:end].to_datetime.day).each do |one_day|
          day_all[created_at.month].nil??day_all[created_at.month]=[one_day] :day_all[created_at.month]<<one_day
        end
        (params[:start].to_datetime.day..end_at.day).each do |one_day|
          day_all[end_at.month].nil??day_all[end_at.month]=[one_day] :day_all[end_at.month]<<one_day
        end
      end
#      tasks=PlanTask.find_by_sql("select * from plan_tasks where study_plan_id=#{days.study_plan_id} and  ")
    end
   
    respond_to do |format|
      format.json {
        data={:days=>day_all}
        render :json=>data
      }
    end
  end


end
