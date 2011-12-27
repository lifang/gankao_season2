# encoding: utf-8
class PlanTask < ActiveRecord::Base
  belongs_to :study_plan
  TASK_TYPES = {:PRACTICE => 1, :EXAM => 2, :RECITE => 3}  #1真题  3背单词 2 考试
  TYPES_NAME={1=>"做题",3=>"背词",2=>"模拟考试"}
  PERIOD_TYPES = {:EVERYDAY => 0, :PERIOD => 1} #0 每天  1 周期
  PERIOD_NAMES= {0=>"每天  ",1=>"整个周期"}
end
