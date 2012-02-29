# encoding: utf-8
class UserWordRelation < ActiveRecord::Base
  belongs_to :word

 STATUS = {:NOMAL => 0, :RECITE => 1} #0 未背诵 1 已背诵

  def self.user_words(user_id, category_id)
    return UserWordRelation.count_by_sql(["select count(uwr.id) from user_word_relations uwr
      inner join words w on w.id = uwr.word_id
      where w.category_id = ? and uwr.status = #{STATUS[:NOMAL]} and uwr.user_id = ? ", category_id, user_id])
  end

end
