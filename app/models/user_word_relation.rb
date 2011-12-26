# encoding: utf-8
class UserWordRelation < ActiveRecord::Base

  def self.user_words(user_id)
    return UserWordRelation.count(:id, :conditions => ["user_id = ?", user_id])
  end

end
