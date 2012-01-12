# encoding: utf-8
class InviteCode < ActiveRecord::Base
  IS_USED={:YES=>1,:NO=>0} #0未使用 1 已使用
  
end