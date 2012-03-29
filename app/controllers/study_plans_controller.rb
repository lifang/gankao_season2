# encoding: utf-8
class StudyPlansController < ApplicationController
  before_filter :sign?, :except => ["index","renren"]
  layout "application", :except => ['done_plans']

  def index
    category_id = "#{params[:category]}"=="" ? 2 : params[:category]
    @category = Category.find_by_id(category_id.to_i)
    @title = "#{@category.name}复习计划"
    @meta_keywords = "#{@category.name}复习方法,#{@category.name}必过挑战"
    @meta_description = "30日的复习计划，包含背词和真题，通过一月努力可以帮助提供#{@category.name}的应试能力。"
    @study_plan = StudyPlan.find(:first, :conditions => ["category_id = ?", params[:category].to_i])
    @free_count = Order.must_count
    if cookies[:user_id]
      @user_plan = UserPlanRelation.find(:first,
        :conditions => ["user_id = ? and study_plan_id = ? ", cookies[:user_id].to_i, @study_plan.id]) if @study_plan
      redirect_to "/study_plans/done_plans?category=#{params[:category].to_i}" unless @user_plan.nil? or @user_plan.status == false
    end
  end

  def show
    category_id = "#{params[:category]}"=="" ? 2 : params[:category]
    @study_plan = StudyPlan.find(:first, :conditions => ["category_id = ?", category_id])
    plan_date = @study_plan.study_date.nil? ? Constant::STUDY_DATE : (@study_plan.study_date - 1)
    upr = UserPlanRelation.find_by_user_id_and_study_plan_id(cookies[:user_id].to_i, @study_plan.id)
    new_record = false
    if upr.nil?
      if Order.must_count <= 0 and !is_vip?(category_id)
        flash[:notice] = "今天的免费名额已经抢光喽，您可以[<a class='link_c' href='/users/charge_vip?category=#{params[:category]}'>升级为正式用户</a>]！"
      else
        new_record = true
        UserPlanRelation.create(:user_id => cookies[:user_id].to_i, :study_plan_id => @study_plan.id,
          :created_at => Time.now.to_date, :ended_at => Time.now.to_date + plan_date.days,
          :status => StudyPlan::STATUS[:NOMAL], :num => 1)
      end
    elsif upr.status == false and upr.num < StudyPlan::CAN_JOIN_TIME
      new_record = true
      upr.update_attributes(:num => StudyPlan::CAN_JOIN_TIME, :status => StudyPlan::STATUS[:NOMAL],
        :created_at => Time.now.to_date, :ended_at => Time.now.to_date + plan_date.days)
    else
      flash[:notice] = "您已经没有机会再参加学习计划了！"
    end
    if new_record
      notice_str = "感谢您参与必过挑战"
      if !is_vip?(category_id)
        order=Order.first(:conditions =>["user_id = ? and category_id = ? and status = #{Order::STATUS[:NOMAL]}",
            cookies[:user_id].to_i, params[:category].to_i])
        if order.nil? || order.types==Order::TYPES[:TRIAL_SEVEN] || order.types==Order::TYPES[:COMPETE]
          Order.create(:user_id => cookies[:user_id].to_i,:category_id => category_id, :total_price => 0,
            :types => Order::TYPES[:MUST], :status => Order::STATUS[:NOMAL], :remark => "参加学习计划",
            :start_time => Time.now,:end_time => (Time.now + Constant::DATE_LONG[:vip].days))
          order.update_attributes(:status=>Order::STATUS[:INVALIDATION]) unless order.nil?
        end
        cookies.delete(:user_role)
        user_role?(cookies[:user_id])
        notice_str += "，同时您也免费升级为#{categry_name}的正式用户了！"
      end
      categry_name = Category.find(category_id).name
      send_message = "我参加了赶考网的#{categry_name}必过挑战学习计划，请大家监督我的学习成果，我会坚持到最后的胜利！"
      send_message(send_message, cookies[:user_id])
      flash[:notice] = notice_str
      redirect_to "/study_plans/done_plans?category=#{category_id}"
    else
      redirect_to "/study_plans?category=#{category_id}"
    end    
  end



  def done_plans
    category_id = "#{params[:category]}"=="" ? 2 : params[:category]
    @category = Category.find_by_id(category_id.to_i)
    @title = "#{@category.name}复习计划"
    @meta_keywords = "#{@category.name}复习方法,#{@category.name}必过挑战"
    @meta_description = "30日的复习计划，包含背词和真题，通过一月努力可以帮助提高#{@category.name}的应试能力。"
    plan_task = UserPlanRelation.find_by_sql("select up.created_at,up.ended_at,up.id, sp.study_date from user_plan_relations up
      inner join study_plans sp on up.study_plan_id=sp.id where
      up.user_id=#{cookies[:user_id]} and sp.category_id=#{category_id} limit 1 ")
    @pra_exer=[0,0]
    month_action=[]
    @day_all=[]
    unless plan_task.blank?
      days=plan_task[0]
      created_at = days.created_at.to_datetime
      end_time = days.ended_at.to_datetime
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

  #从应用快捷登录
  def renren
    puts request.path
    category = params[:category].nil? ? "2" : params[:category]
    @user= User.where(:id=>params[:user_id])[0]
    @code_id = @user.nil? ? "error" : @user.code_id.nil? ? "gankao" : @user.code_id
    if @code_id != "error" && @code_id == params[:code_id]
      cookies[:user_name] ={:value =>@user.username, :path => "/", :secure  => false}
      cookies[:user_id] ={:value =>@user.id, :path => "/", :secure  => false}
      get_role
      ActionLog.login_log(cookies[:user_id])
      redirect_to "/study_plans?category=#{category}"
    else
      render :inline=>"用户验证失败，为了保证用户的帐号安全，此次访问被系统拒绝。给您带来的不便，请您谅解。"
      return false
    end
  end

end
