# encoding: utf-8
class StudyPlansController < ApplicationController
  before_filter :sign?, :except => ["index"]
  layout "application", :except => ['done_plans']

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
    send_message="我参加了赶考网的英语必过学习计划，请大家监督我的学习成果，我会坚持到最后的胜利！"
    Oauth2Helper.send_message(send_message,cookies[:user_id])
    flash[:notice] = "感谢您参与学习计划，同时您也免费升级为网站的正式用户了！"
    redirect_to "/study_plans/done_plans?category=#{params[:category].to_i}"
  end



  def done_plans
    category_id = "#{params[:category]}"=="" ? 2 : params[:category]
    @category = Category.find_by_id(category_id.to_i)
    @title = "#{@category.name}复习计划"
    @meta_keywords = "#{@category.name}复习方法,大学英语四级学习计划"
    @meta_description = "30日的复习计划，包含背词和真题，通过一月努力可以帮助提高#{@category.name}的应试能力。"
    plan_task=UserPlanRelation.find_by_sql("select up.created_at,up.ended_at
     from user_plan_relations up inner join study_plans sp on up.study_plan_id=sp.id where
     up.user_id=#{cookies[:user_id]} and sp.category_id=#{category_id} limit 1 ")
    @pra_exer=[0,0]
    month_action=[]
    created_at,end_time=Time.now.to_datetime
    @day_all=[]
    unless plan_task.blank?
      days = plan_task[0]
      created_at=days.created_at.nil? ? created_at : days.created_at.to_datetime
      end_time=days.ended_at.nil? ? (created_at+29.days) :
        (((days.ended_at.to_datetime-created_at)/1.days).to_i==29 ? days.ended_at.to_datetime : (created_at+29.days))
      created_at.step(end_time, 1) do |date|
        @day_all << date.strftime("%Y_%m_%d")
      end
      month_action=StudyPlan.check_actions(cookies[:user_id].to_i,params[:category],created_at,end_time)
      @pra_exer=StudyPlan.check_tasks(category_id,cookies[:user_id])
      @day_status={}
      unless @day_all.blank?
        @day_all.each do |day_task|
          status=false
          if month_action.include?("#{day_task}")
            status=true
          end
          @day_status[day_task]=status
        end
      end
    end
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
