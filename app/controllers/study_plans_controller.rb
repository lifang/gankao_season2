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
      month_action={}
      actions=ActionLog.find_by_sql("select total_num,created_at,types from action_logs where user_id=1 and types in (#{ActionLog::TYPES[:PRACTICE]},#{ActionLog::TYPES[:RECITE]}) and category_id=#{params[:category]} and created_at>='#{days.created_at}'")
      tasks=PlanTask.find_by_sql("select task_types,num from plan_tasks where study_plan_id=#{days.study_plan_id} and  period_types=#{PlanTask::PERIOD_TYPES[:EVERYDAY]} and task_types in (#{PlanTask::TASK_TYPES[:PRACTICE]},#{PlanTask::TASK_TYPES[:RECITE]})")
      actions.each do |action|
        month_action["#{action.types}_#{action.created_at.to_datetime.day}"]=action.total_num
      end
      day_status={}
      day_all[params[:end].to_datetime.month].each do |day_task|
        status=false
        tasks.each do |task|
          if task.task_types==0
            types=1
          else
            types=3
          end
          if !month_action["#{types}_#{day_task}"].nil?
            if month_action["#{types}_#{day_task}"]==task.num
              status=true
            else
              status=false
            end
          end
        end
        day_status[day_task]=status
      end
    end
    respond_to do |format|
      format.json {
        data={:days=>day_all,:status=>day_status}
        render :json=>data
      }
    end
  end


end
