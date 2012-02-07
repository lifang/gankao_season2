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
    which_day=0
    practise=0
    exercise=0
    month_action=[]
    day_all={}
    end_at=days.ended_at.nil?? days.created_at.to_datetime : days.ended_at.to_datetime
    created_at=days.created_at.to_datetime
    day_index=[]
    unless days.nil?
      created_at.step(end_at, 1) do |date|
        day_index << date.strftime("%Y_%m_%d")
        day_all["#{date.strftime("%Y_%m")}"].nil??day_all["#{date.strftime("%Y_%m")}"]=[date.day] :day_all["#{date.strftime("%Y_%m")}"]<<date.day
      end
      month_action=StudyPlan.check_actions(cookies[:user_id].to_i,params[:category],params[:start].to_datetime,params[:end].to_datetime)
      task_num=StudyPlan.check_tasks(days.study_plan_id)
      practise= task_num[0]
      exercise=task_num[1]
      day_status={}
      end_time=params[:end].to_datetime
      unless day_all["#{end_time.strftime("%Y_%m")}"].blank?
        which_day=day_index.index(Time.now.strftime("%Y_%m_%d"))
        day_all["#{end_time.strftime("%Y_%m")}"].each do |day_task|
          day_task= day_task<10 ? "0#{day_task}" : "#{day_task}"
          status=false
          if month_action.include?("#{end_time.strftime("%Y_%m")}_#{day_task}")
            status=true
          end
          day_status[day_task]=status
        end
      end
    end
    respond_to do |format|
      format.json {
        data={:days=>day_all,:status=>day_status,:which=>[which_day,practise,exercise],:date=>[created_at,end_at]}
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

  def check_task
    check=StudyPlan.pass_task(cookies[:user_id],params[:category])
    @message=check[0]
    @over=check[1]
    respond_to do |format|
      format.js
    end
  end

end
