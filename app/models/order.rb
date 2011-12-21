# encoding: utf-8
class Order< ActiveRecord::Base
  belongs_to :user
  STATUS = {:NOMAL => 1, :INVALIDATION => 0} #1 正常  0 失效
  TYPES = {:CHARGE => 1, :OTHER => 0} #1 付费  0 其它
  TYPE_NAME = {1 => "付费", 0 => "其它"}
end
