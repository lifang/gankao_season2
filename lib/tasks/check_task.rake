# encoding: utf-8
namespace :check do
  desc "check task"
  task(:task => :environment) do
    include Oauth2Helper
    user_plans=UserPlanRelation.find_by_sql("select u.*,s.category_id from user_plan_relations u
      inner join study_plans s on u.study_plan_id=s.id")
    user_plans.each do |user_plan|
      time=Time.now
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
        send_message="必过任务计划中，你今天的备考计划还没完成哦"
        if  !month_action[practice_type].nil? and !month_action[recite_type].nil? and month_action[practice_type] >= task_num[practice_type] and month_action[recite_type] >= task_num[recite_type]
          puts "user_id #{user_plan.user_id} category_id #{user_plan.category_id} pull the job off"
          action=ActionLog.first(:conditions=>"category_id=#{user_plan.category_id} and user_id=#{user_plan.user_id} and types=#{ActionLog::TYPES[:STUDY_PLAY]} and created_at='#{1.day.ago.strftime("%Y-%m-%d")}'")
          send_message="今天的必过计划完成了，恭喜你往成功路上有迈出了重要的一步"
          if action.nil?
            ActionLog.create(:category_id=>user_plan.category_id,:user_id=>user_plan.user_id,:types=>ActionLog::TYPES[:STUDY_PLAY],:created_at=>1.day.ago.strftime("%Y-%m-%d").to_s,:remark=>"今日任务已完成")
          else
            puts "record has been completed"
          end
        end
        Oauth2Helper.send_message(send_message,user_plan.user_id,time)
      end
    end unless user_plans.blank?
  end
end
