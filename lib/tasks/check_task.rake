# encoding: utf-8
namespace :check do
  desc "check task"
  task(:task => :environment) do
    include Oauth2Helper
    user_plans=UserPlanRelation.find_by_sql("select u.*,s.category_id from user_plan_relations u
      inner join study_plans s on u.study_plan_id=s.id where TO_DAYS(NOW())<=TO_DAYS(u.ended_at)
      and status = #{StudyPlan::STATUS[:NOMAL]}")
    user_plans.each do |user_plan|
      task_num={}
      month_action={}
      tasks=PlanTask.find_by_sql("select task_types,num, study_plan_id
          from plan_tasks where period_types=#{PlanTask::PERIOD_TYPES[:EVERYDAY]}
          and task_types in (#{PlanTask::TASK_TYPES[:PRACTICE]},#{PlanTask::TASK_TYPES[:RECITE]}) 
          and study_plan_id=#{user_plan.study_plan_id} group by task_types")
      tasks.each do |task|
        task_num["#{task.task_types}"]=task.num
      end unless tasks.blank?
      actions=ActionLog.find_by_sql("select total_num,created_at,types from action_logs where
             types in (#{ActionLog::TYPES[:PRACTICE]},#{ActionLog::TYPES[:RECITE]})
             and category_id=#{user_plan.category_id} and user_id=#{user_plan.user_id}
             and TO_DAYS(NOW())-TO_DAYS(created_at)=1 ")
      actions.each do |action|
        month_action["#{action.types}"]=action.total_num
      end unless actions.blank?
      practice_type="#{ActionLog::TYPES[:PRACTICE]}"
      recite_type="#{ActionLog::TYPES[:RECITE]}"
      if  task_num[practice_type].nil? or task_num[recite_type].nil?
        puts "Please create complete task"
      else
        if user_plan.ended_at.strftime("%Y_%m_%d")==Time.now.strftime("%Y_%m_%d")
          send_message="你参加的赶考网的必过挑战应经是最后一天了，谢谢你的坚持，坚持就是胜利，预祝你必过成功"
        else
          send_message="赶考必过挑战计划中，今天的必过挑战任务还没完成，~~~~(>_<)~~~~ "
        end
        if  !month_action[practice_type].nil? and !month_action[recite_type].nil? and month_action[practice_type] >= task_num[practice_type] and month_action[recite_type] >= task_num[recite_type]
          puts "user_id #{user_plan.user_id} category_id #{user_plan.category_id} pull the job off"
          action=ActionLog.first(:conditions=>"category_id=#{user_plan.category_id} and user_id=#{user_plan.user_id} and types=#{ActionLog::TYPES[:STUDY_PLAY]} and created_at='#{1.day.ago.strftime("%Y-%m-%d")}'")
          send_message="赶考必过挑战计划中，今天的必过挑战任务完成了，成功路上又迈出了的一步，耶！"
          if action.nil?
            ActionLog.create(:category_id=>user_plan.category_id,:user_id=>user_plan.user_id,:types=>ActionLog::TYPES[:STUDY_PLAY],:created_at=>1.day.ago.strftime("%Y-%m-%d").to_s,:remark=>"今日任务已完成")
          else
            puts "record has been completed"
          end
        end
        Oauth2Helper.send_message(send_message,user_plan.user_id)
      end
    end unless user_plans.blank?
    is_user_lost(user_plans)
  end
  
  def is_user_lost(user_plans)
    user_plans.each do |user_plan|
      study_plan_count = ActionLog.count_by_sql(["select count(id) from action_logs
        where created_at > ? and types = ? and user_id = ?", user_plan.created_at,
          ActionLog::TYPES[:STUDY_PLAY], user_plan.user_id])
      days = (user_plan.ended_at - user_plan.created_at)/1.day
      if days - study_plan_count >= 3
        UserPlanRelation.update(user_plan.id, :status => StudyPlan::STATUS[:LOST])
        order=Order.first(:conditions =>["user_id = ? and category_id = ? and status = #{Order::STATUS[:NOMAL]} and types = ?",
            cookies[:user_id].to_i, params[:category].to_i, Order::TYPES[:MUST]])
        order.update_attributes(:status => Order::STATUS[:INVALIDATION])
        send_message="我的赶考必过挑战计划挑战失败了，~~~~(>_<)~~~~"
        Oauth2Helper.send_message(send_message, user_plan.user_id)
      end
    end unless user_plans.blank?
  end

end
