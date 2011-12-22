# encoding: utf-8
class ActionLog < ActiveRecord::Base
  belongs_to :user
  belongs_to :category

  TYPES = {:LOGIN => 0, :PRACTICE => 1, :EXAM => 2, :RECITE => 3, :STUDY_PLAY => 4}
  #动作类型： 0 登录  1 真题  2 模考  3 背单词  4 学习计划
  TYPE_NAMES = {0 => "登录", 1 => "真题", 2 => "模考", 3 => "背单词", 4 => "学习计划"}

  def self.return_log_by_types(options={})
    sql = "select count(id) from action_logs "
    unless options.empty?
      sql += "where"
      options.each { |key, value| sql += "#{key} = #{value}" }
    end
    return ActionLog.count_by_sql(sql)
  end
  
end









