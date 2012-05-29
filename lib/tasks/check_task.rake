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
        success=true
        if  !month_action[practice_type].nil? and !month_action[recite_type].nil? and month_action[practice_type] >= task_num[practice_type] and month_action[recite_type] >= task_num[recite_type]
          puts "user_id #{user_plan.user_id} category_id #{user_plan.category_id} pull the job off"
          action=ActionLog.first(:conditions=>"category_id=#{user_plan.category_id} and user_id=#{user_plan.user_id} and types=#{ActionLog::TYPES[:STUDY_PLAY]} and created_at='#{1.day.ago.strftime("%Y-%m-%d")}'")
          send_message="赶考必过挑战计划中，今天的必过挑战任务完成了，成功通过四级又迈出了的一步，耶！"
          if action.nil?
            ActionLog.create(:category_id=>user_plan.category_id,:user_id=>user_plan.user_id,:types=>ActionLog::TYPES[:STUDY_PLAY],:created_at=>1.day.ago.strftime("%Y-%m-%d").to_s,:remark=>"今日任务已完成")
          else
            puts "record has been completed"
          end
        else
          success=false
          send_message=is_user_lost(user_plan)
        end
        if user_plan.ended_at.strftime("%Y_%m_%d")==Time.now.strftime("%Y_%m_%d")
          if success
            send_message +="，这已经是最后一天了，谢谢你的坚持，坚持就是胜利，预祝你必过成功"
          else
            send_message += "，这已经是最后一天了，希望你能保持好素质和队形，自备好干粮、饮水和小板凳做好最后的冲刺"
          end
        end
        #Oauth2Helper.send_message(send_message,user_plan.user_id)
      end
    end unless user_plans.blank?
  end
  
  def is_user_lost(user_plan)
    study_plan_count = ActionLog.count_by_sql(["select count(id) from action_logs where created_at > ? and types = ? and user_id = ?",
        user_plan.created_at, ActionLog::TYPES[:STUDY_PLAY], user_plan.user_id])
    days = (Time.now - user_plan.created_at)/1.day
    if days - study_plan_count >= 3
      UserPlanRelation.update(user_plan.id, :status => StudyPlan::STATUS[:LOST])
      order=Order.first(:conditions =>["user_id = ? and category_id = ? and status = #{Order::STATUS[:NOMAL]} and types = ?",
          user_plan.user_id,user_plan.category_id, Order::TYPES[:MUST]])
      order.update_attributes(:status => Order::STATUS[:INVALIDATION]) unless order.nil?
      send_message="您的赶考必过挑战计划挑战失败了，需要多点坚持哦~~~~(>_<)~~~~"
    else
      send_message="赶考必过挑战计划进行中，今天的必过挑战任务还没完成，加油哦~~~~(>_<)~~~~ "
    end
    return send_message
  end

end
