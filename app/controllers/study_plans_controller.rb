# encoding: utf-8
class StudyPlansController < ApplicationController
  before_filter :sign?, :except => ["index"]
  def index
    category_id = "#{params[:category]}"=="" ? 2 : params[:category]
    @category = Category.find_by_id(category_id.to_i)
    @title = "#{@category.name}复习计划"
    @meta_keywords = "#{@category.name}复习方法,大学英语四级学习计划"
    @meta_description = "30日的复习计划，包含背词和真题，通过一月努力可以帮助提供#{@category.name}的应试能力。"
    @study_plan = StudyPlan.find(:first, :conditions => ["category_id = ?", params[:category].to_i])
    if cookies[:user_id]
      @user_plan = UserPlanRelation.find(:first,
        :conditions => ["user_id = ? and study_plan_id = ? ", cookies[:user_id].to_i, @study_plan.id]) if @study_plan
      unless @user_plan.nil?
        redirect_to "/study_plans/done_plans?category=#{params[:category].to_i}"
      end
    end
  end

  def show
    @study_plan = StudyPlan.find(:first, :conditions => ["category_id = ?", params[:category].to_i])
    UserPlanRelation.create(:user_id => cookies[:user_id].to_i, :study_plan_id => @study_plan.id,
      :created_at => Time.now.to_date, :ended_at => Time.now.to_date + (@study_plan.study_date - 1).days )
    redirect_to "/study_plans/done_plans?category=#{params[:category].to_i}"
  end

  def plan_status
    days=UserPlanRelation.find_by_user_id(cookies[:user_id].to_i)
    day_all={}
    which_day=0
    practise=0
    exercise=0
    month_action={}
    day_all[params[:end].to_datetime.month]=[]
    task_num={}
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
      actions=ActionLog.find_by_sql("select total_num,created_at,types from action_logs where user_id=#{cookies[:user_id].to_i} and types in
                       (#{ActionLog::TYPES[:PRACTICE]},#{ActionLog::TYPES[:RECITE]}) and category_id=#{params[:category]} and created_at>='#{days.created_at}'")
      actions.each do |action|
        month_action["#{action.types}_#{action.created_at.to_datetime.day}"]=action.total_num
      end unless actions.blank?
      tasks=PlanTask.find_by_sql("select task_types,num from plan_tasks where study_plan_id=#{days.study_plan_id} and
            period_types=#{PlanTask::PERIOD_TYPES[:EVERYDAY]} and task_types in (#{PlanTask::TASK_TYPES[:PRACTICE]},#{PlanTask::TASK_TYPES[:RECITE]})")
      unless tasks.blank?
        tasks.each do |task|
          task_num["#{task.task_types}"]=task.num
        end
        practise=task_num["#{PlanTask::TASK_TYPES[:PRACTICE]}"]
        exercise=task_num["#{PlanTask::TASK_TYPES[:RECITE]}"]
      end
      day_status={}
      #      puts day_all[params[:end].to_datetime.month]
      unless day_all[params[:end].to_datetime.month].blank?
        which_day=day_all[params[:end].to_datetime.month].index(Time.now.day).nil? ? 0 :day_all[params[:end].to_datetime.month].index(Time.now.day)+1
        day_all[params[:end].to_datetime.month].each do |day_task|
          status=false
          if !month_action["#{PlanTask::TASK_TYPES[:PRACTICE]}_#{day_task}"].nil? and !month_action["#{PlanTask::TASK_TYPES[:RECITE]}_#{day_task}"].nil? and
              month_action["#{PlanTask::TASK_TYPES[:PRACTICE]}_#{day_task}"]== task_num["#{PlanTask::TASK_TYPES[:PRACTICE]}"] and month_action["#{PlanTask::TASK_TYPES[:RECITE]}_#{day_task}"]== task_num["#{PlanTask::TASK_TYPES[:RECITE]}"]
            status=true
          else
            status=false
          end
          day_status[day_task]=status
        end
      end
    end
    respond_to do |format|
      format.json {
        data={:days=>day_all,:status=>day_status,:which=>[which_day,practise,exercise]}
        render :json=>data
      }
    end
  end

  def done_plans
    category_id = "#{params[:category]}"=="" ? 2 : params[:category]
    @category = Category.find_by_id(category_id.to_i)
    @title = "#{@category.name}复习计划"
    @meta_keywords = "#{@category.name}复习方法,大学英语四级学习计划"
    @meta_description = "30日的复习计划，包含背词和真题，通过一月努力可以帮助提供#{@category.name}的应试能力。"
  end


end
