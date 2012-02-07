# encoding: utf-8
namespace :check do
  desc "check task"
  task(:task => :environment) do
    user_plans=UserPlanRelation.find_by_sql("select u.*,s.category_id from user_plan_relations u inner join study_plans s on u.study_plan_id=s.id")
    user_plans.each do |user_plan|
      task_num={}
      month_action={}
      tasks=PlanTask.find_by_sql("select task_types,num, study_plan_id from plan_tasks where period_types=#{PlanTask::PERIOD_TYPES[:EVERYDAY]}
         and study_plan_id=#{user_plan.study_plan_id}  and task_types in (#{PlanTask::TASK_TYPES[:PRACTICE]},#{PlanTask::TASK_TYPES[:RECITE]}) group by task_types")
      tasks.each do |task|
        task_num["#{task.task_types}_#{task.study_plan_id}"]=task.num
      end unless tasks.blank?
      actions=ActionLog.find_by_sql("select total_num,created_at,types from action_logs where user_id=#{user_plan.user_id}
           and types in (#{ActionLog::TYPES[:PRACTICE]},#{ActionLog::TYPES[:RECITE]}) and category_id=#{user_plan.category_id} and
                        TO_DAYS(NOW())-TO_DAYS(created_at)=1 group by types ")
      actions.each do |action|
        month_action["#{action.types}_#{user_plan.study_plan_id}"]=action.total_num
      end unless actions.blank?
      puts  month_action
      unless actions.blank?
        practice_action="#{ActionLog::TYPES[:PRACTICE]}_#{user_plan.study_plan_id}"
        recite_action="#{ActionLog::TYPES[:RECITE]}_#{user_plan.study_plan_id}"
        practice=task_num[practice_action].nil? ? 0 : task_num[practice_action]
        recite=task_num[recite_action].nil? ? 0 : task_num[recite_action]
        pracite_a=month_action[practice_action].nil? ? 0 : month_action[practice_action]
        recite_a=month_action[recite_action].nil? ? 0 : month_action[recite_action]
        if  task_num[practice_action].nil? or task_num[recite_action].nil?
          puts "Please create complete task"
        else
          if  !month_action[practice_action].nil? and !month_action[practice_action].nil?  and
              pracite_a >= practice and recite_a >= recite
            puts "user_id #{user_plan.user_id} pull the job off"
            action=ActionLog.first(:conditions=>"category_id=#{user_plan.category_id} and user_id=#{user_plan.user_id} and types=#{ActionLog::TYPES[:STUDY_PLAY]} and created_at=#{1.day.ago.strftime("%Y-%m-%d")}")
            if action.nil?
              ActionLog.create(:category_id=>user_plan.category_id,:user_id=>user_plan.user_id,:types=>ActionLog::TYPES[:STUDY_PLAY],:created_at=>1.day.ago.strftime("%Y-%m-%d").to_s,:remark=>"今日任务已完成")
            else
              puts "record has been completed"
            end
          end
        end
      end
    end unless user_plans.blank?
  end
end
