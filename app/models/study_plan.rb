# encoding: utf-8
class StudyPlan < ActiveRecord::Base
  belongs_to :category
  has_many :plan_tasks
  has_many :user_plan_relations,:dependent => :destroy
  has_many :users,:through=>:user_plan_relations, :source => :user

  def self.pass_task(user_id,category)
    task_num={}
    month_action={}
    user_plan=UserPlanRelation.find_by_user_id(user_id)
    message="未完成任务，离勋章只差一个坚持"
    over=false
    practice_type=PlanTask::TASK_TYPES[:PRACTICE]
    recite_type=PlanTask::TASK_TYPES[:RECITE]
    unless user_plan.nil?
      tasks=PlanTask.find_by_sql("select task_types,num, study_plan_id from plan_tasks where period_types=#{PlanTask::PERIOD_TYPES[:EVERYDAY]}
         and study_plan_id=#{user_plan.study_plan_id}  and task_types in (#{practice_type},#{recite_type}) group by task_types")
      tasks.each do |task|
        task_num["#{task.task_types}_#{task.study_plan_id}"]=task.num
      end unless tasks.blank?
      actions=ActionLog.find_by_sql("select total_num,created_at,types from action_logs where user_id=#{user_plan.user_id}
           and types in (#{practice_type},#{recite_type}) and category_id=#{category} and TO_DAYS(NOW())=TO_DAYS(created_at) group by types ")
      actions.each do |action|
        month_action["#{action.types}_#{user_plan.study_plan_id}"]=action.total_num
      end unless actions.blank?
      unless actions.blank?
        practice_action="#{practice_type}_#{user_plan.study_plan_id}"
        recite_action="#{recite_type}_#{user_plan.study_plan_id}"
        practice=task_num[practice_action].nil? ? 0 : task_num[practice_action]
        recite=task_num[recite_action].nil? ? 0 : task_num[recite_action]
        pracite_a=month_action[practice_action].nil? ? 0 : month_action[practice_action]
        recite_a=month_action[recite_action].nil? ? 0 : month_action[recite_action]
        if  task_num[practice_action].nil? or task_num[recite_action].nil?
          message="请联系管理员创建任务"
        else
          if  !month_action[practice_action].nil? and !month_action[practice_action].nil?  and
              pracite_a >= practice and recite_a >= recite
            over=true
            action=ActionLog.first(:conditions=>"category_id=#{category} and user_id=#{user_plan.user_id} and types=#{ActionLog::TYPES[:STUDY_PLAY]} and created_at=#{Time.now.strftime("%Y-%m-%d")}")
            ActionLog.create(:category_id=>category,:user_id=>user_id,:types=>ActionLog::TYPES[:STUDY_PLAY],:created_at=>Time.now.strftime("%Y-%m-%d").to_s,:remark=>"今日任务已完成") if action.nil?
            message="您已完成任务，恭喜获取勋章"
          end
        end
      end
    end
    return [message,over]
  end

  def self.check_actions(user_id,category,start_time,end_time)
    month_action=[]
    actions=ActionLog.find_by_sql("select total_num,created_at,types from action_logs where user_id=#{user_id}
                        and types=#{ActionLog::TYPES[:STUDY_PLAY]} and category_id=#{category} and
                        created_at>='#{start_time.to_datetime}' and created_at<='#{end_time.to_datetime}' ")
    actions.each do |action|
      month_action << action.created_at.to_datetime.strftime("%Y_%m_%d").to_s
    end unless actions.blank?
    return month_action
  end

  def self.check_tasks(study_plan_id)
    task_num={}
    tasks=PlanTask.find_by_sql("select task_types,num from plan_tasks where study_plan_id=#{study_plan_id} and
            period_types=#{PlanTask::PERIOD_TYPES[:EVERYDAY]} and task_types in (#{PlanTask::TASK_TYPES[:PRACTICE]},#{PlanTask::TASK_TYPES[:RECITE]}) group by task_types")
    tasks.each do |task|
      task_num["#{task.task_types}"]=task.num
    end unless tasks.blank?
    practise=task_num["#{PlanTask::TASK_TYPES[:PRACTICE]}"].nil? ? 0 : task_num["#{PlanTask::TASK_TYPES[:PRACTICE]}"]
    exercise=task_num["#{PlanTask::TASK_TYPES[:RECITE]}"].nil? ? 0 : task_num["#{PlanTask::TASK_TYPES[:RECITE]}"]
    return [practise,exercise]
  end

  
end
