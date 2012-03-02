#encoding: utf-8
class Word < ActiveRecord::Base
  
  belongs_to :category
  has_many :word_sentences
  has_many :word_question_relations,:dependent=>:destroy
  has_many :questions,:through=>:word_question_relations, :source => :question
  has_many :word_discriminate_relations,:dependent => :destroy
  has_many :discriminates,:through=>:word_discriminate_relations, :source => :discriminate

  TYPES = {0 => "n.", 1 => "v.", 2 => "pron.", 3 => "adj.", 4 => "adv.",
    5 => "num.", 6 => "art.", 7 => "prep.", 8 => "conj.", 9 => "interj.", 10 => "u = ", 11 => "c = ", 12 => "pl = "}
  #英语单词词性 名词 动词 代词 形容词 副词 数词 冠词 介词 连词 感叹词 不可数名词 可数名词 复数
  WORD_LEVEL = {:FIRST => 1, :SECOND => 2, :THIRD => 3, :FOURTH => 4, :FIFTH => 5, :SIXTH => 6, :SEVENTH => 7,
    :EIGHTH => 8, :NINTH => 9, :TENTH => 10}
  LEVEL = {1 => "一", 2 => "二", 3 => "三", 4 => "四", 5 => "五", 6 => "六",
    7 => "七", 8 => "八", 9 => "九", 10 => "十"}  #单词的等级

  def self.recite_words(category_id)
    return Word.count('id', :conditions => "level < #{WORD_LEVEL[:THIRD]} and category_id = #{category_id}")
  end

  def self.current_recite_words(user_id, category_id, type)
    return_word = []
    user_word_relation = UserWordRelation.find_by_user_id_and_category_id(user_id, category_id)
    if type == "new"
      unless user_word_relation.nomal_ids.nil? or user_word_relation.nomal_ids.empty?
        word_ids =  (user_word_relation.nomal_ids.split(","))[0, 20]
        return_word = Word.find_by_sql(["select * from words where id in (?)", word_ids])
      end
    else
      unless user_word_relation.recite_ids.nil? or user_word_relation.recite_ids.empty?
        word_ids =  (user_word_relation.recite_ids.split(","))
        code_array = []
        if word_ids.length > 20
          chars = (1..word_ids.length).to_a          
          1.upto(20) {code_array << chars[rand(chars.length)]}
          code_array.each { |c| return_word << word_ids[c] }
        else
          code_array = word_ids
        end
        return_word = Word.find_by_sql(["select * from words where id in (?)", code_array])
      end
    end
    return return_word
  end

  def self.all_sentences(sentence_hash, word_ids)
    word_sentences = WordSentence.find(:all, :conditions => ["word_id in (?)", word_ids])
    word_sentences.each { |sentence|
      if sentence_hash[sentence.word_id].nil?
        sentence_hash[sentence.word_id] = [sentence.description]
      else
        sentence_hash[sentence.word_id] << sentence.description
      end
    }
    return sentence_hash
  end

  #显示关于小题的所有的单词
  def self.question_words(words)
    word_list = Word.find(:all, :conditions => ["name in (?)", words])
    if word_list.blank? or word_list.size != words.length
      already_w = []
      word_list.each {|w| already_w << w.name}
      leving_w = words - already_w
      new_words=[]
      leving_w.each {|l_w| new_words << l_w.chop }
      word_list1 = Word.find(:all, :conditions => ["name in (?)", new_words])
      word_list=word_list|word_list1
      if word_list1.blank? or word_list1.size != new_words.length
        new_w=[]
        word_list1.each {|w| new_w << w.name}
        leving = new_words - new_w
        lev=[]
        leving.each {|w| lev << w.chop }
        word_list2 = Word.find(:all, :conditions => ["name in (?)", lev])
        word_list=word_list|word_list2
      end
    end
    load_words=[]
    word_list.each do |word|
      words_sentence=WordSentence.find_by_sql("select w.description from word_sentences w where w.word_id=#{word.id}")
      load_words << [word,words_sentence]
    end unless word_list.blank?
    return load_words
  end

end
