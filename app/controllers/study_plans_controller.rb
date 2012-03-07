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
    
    order=Order.first(:conditions =>["user_id = ? and category_id = ? and status = #{Order::STATUS[:NOMAL]}",
        cookies[:user_id].to_i, params[:category].to_i])
    if order.nil? || order.types==Order::TYPES[:TRIAL_SEVEN] || order.types==Order::TYPES[:COMPETE]
      Order.create(:user_id => cookies[:user_id].to_i,:category_id => params[:category].to_i, :total_price => 0,
        :types => Order::TYPES[:OTHER], :status => Order::STATUS[:NOMAL], :remark => "参加学习计划",
        :start_time => Time.now,:end_time => (Time.now + Constant::DATE_LONG[:vip].days))
      order.update_attributes(:status=>Order::STATUS[:INVALIDATION]) unless order.nil?
    end
    cookies.delete(:user_role)
    user_role?(cookies[:user_id])
    Oauth2Helper.send_message(send_message,cookies[:user_id])
    flash[:notice] = "感谢您参与学习计划，同时您也免费升级为网站的正式用户了！"
    redirect_to "/study_plans/done_plans?category=#{params[:category].to_i}"
  end

  def plan_status
    category_id = params[:category].nil? ? 2 : params[:category].to_i
    plan_task=UserPlanRelation.find_by_sql("select up.created_at,up.ended_at from user_plan_relations up inner join study_plans sp on up.study_plan_id=sp.id where
     up.user_id=#{cookies[:user_id]} and sp.category_id=#{category_id} limit 1 ")
    which_day,practise,exercise=0
    month_action=[]
    day_index=[]
    created_at,end_at=Time.now.strftime("%Y_%m_%d")
    day_all={}
    unless plan_task.blank?
      days=plan_task[0]
      end_at=days.ended_at.nil?? days.created_at.to_datetime : days.ended_at.to_datetime
      created_at=days.created_at.to_datetime
      created_at.step(end_at, 1) do |date|
        day_index << date.strftime("%Y_%m_%d")
        day_all["#{date.strftime("%Y_%m")}"].nil??day_all["#{date.strftime("%Y_%m")}"]=[date.day] :day_all["#{date.strftime("%Y_%m")}"]<<date.day
      end
      month_action=StudyPlan.check_actions(cookies[:user_id].to_i,params[:category],params[:start].to_datetime,params[:end].to_datetime)
      task_num=StudyPlan.check_tasks(category_id,cookies[:user_id])
      practise= task_num[0]
      exercise=task_num[1]
      day_status={}
      end_time=params[:end].to_datetime
      unless day_all["#{end_time.strftime("%Y_%m")}"].blank?
        ind=day_index.index(Time.now.strftime("%Y_%m_%d"))
        which_day=ind.nil? ? 0 : ind+1
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
    category_id = params[:category].nil? ? 2 : params[:category].to_i
    check=StudyPlan.pass_task(cookies[:user_id],category_id )
    @message=check[0]
    @over=check[1]
    respond_to do |format|
      format.js
    end
  end

end
