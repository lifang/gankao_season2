# encoding: utf-8
class StudyPlan < ActiveRecord::Base
  belongs_to :category
  has_many :plan_tasks
  has_many :user_plan_relations,:dependent => :destroy
  has_many :users,:through=>:user_plan_relations, :source => :user

  def self.pass_task(user_id,category)
    task_num={}
    month_action={}
    over=false
    user_plan=UserPlanRelation.find_by_sql("select up.created_at,up.ended_at,sp.id,up.user_id from user_plan_relations up inner join study_plans sp on up.study_plan_id=sp.id where
     up.user_id=#{user_id} and sp.category_id=#{category} limit 1 ")[0]
    message="您还未完成今天的学习任务，离勋章只差一步坚持哦！"
    practice_type="#{PlanTask::TASK_TYPES[:PRACTICE]}"
    recite_type="#{PlanTask::TASK_TYPES[:RECITE]}"
    unless user_plan.nil?
      tasks=PlanTask.find_by_sql("select task_types,num, study_plan_id from plan_tasks where period_types=#{PlanTask::PERIOD_TYPES[:EVERYDAY]}
         and study_plan_id=#{user_plan.id}  and task_types in (#{practice_type},#{recite_type}) group by task_types")
      tasks.each do |task|
        task_num["#{task.task_types}"]=task.num
      end unless tasks.blank?
      actions=ActionLog.find_by_sql("select total_num,created_at,types from action_logs where user_id=#{user_plan.user_id}
           and types in (#{practice_type},#{recite_type}) and category_id=#{category} and TO_DAYS(created_at)=TO_DAYS(NOW()) ")
      actions.each do |action|
        month_action["#{action.types}"]=action.total_num
      end unless actions.blank?
      unless actions.blank?
        if  task_num[practice_type].nil? or task_num[recite_type].nil?
          message="请联系管理员创建任务"
        else
          if  !month_action[practice_type].nil? and !month_action[recite_type].nil?  and
              month_action[practice_type].to_i >=  task_num[practice_type].to_i and month_action[recite_type].to_i >= task_num[recite_type].to_i
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
    actions=ActionLog.find_by_sql(["select total_num,created_at,types from action_logs where user_id=#{user_id}
                        and types=#{ActionLog::TYPES[:STUDY_PLAY]} and category_id=#{category} and
                        created_at >= ? and created_at<= ?",start_time.to_datetime, end_time.to_datetime])
    actions.each do |action|
      month_action << action.created_at.strftime("%Y_%m_%d")
    end unless actions.blank?
    return month_action
  end

  def self.check_tasks(category_id,user_id)
    task_num={}
    tasks=ActionLog.find_by_sql("select total_num,types from action_logs where user_id=#{user_id} and
            category_id=#{category_id} and TO_DAYS(created_at)=TO_DAYS(NOW()) group by types")
    tasks.each do |task|
      task_num["#{task.types}"]=task.total_num
    end unless tasks.blank?
    practise=task_num["#{PlanTask::TASK_TYPES[:PRACTICE]}"].nil? ? 0 : task_num["#{PlanTask::TASK_TYPES[:PRACTICE]}"]
    exercise=task_num["#{PlanTask::TASK_TYPES[:RECITE]}"].nil? ? 0 : task_num["#{PlanTask::TASK_TYPES[:RECITE]}"]
    return [practise,exercise]
  end

  
end
