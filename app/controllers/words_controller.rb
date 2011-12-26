# encoding: utf-8
class WordsController < ApplicationController
  def index
    @already_recited = ActionLog.return_log_by_types({"types" => ActionLog::TYPES[:RECITE],
        "user_id" => cookies[:user_id].to_i})
    level_word_count = Word.recite_words
    user_word_count = UserWordRelation.user_words(cookies[:user_id].to_i)
    @leaving_count = level_word_count + user_word_count
  end

  def recite_word
    @already_recited = ActionLog.return_log_by_types({"types" => ActionLog::TYPES[:RECITE],
        "user_id" => cookies[:user_id].to_i})
    @word = Word.find(:first,
      :conditions => ["level < #{Word::WORD_LEVEL[:THIRD]} and category_id = #{params[:category].to_i}"],
      :limit => 1, :order => "id", :offset => @already_recited.total_num)
  end

  def recollection
    @already_recited = ActionLog.return_log_by_types({"types" => ActionLog::TYPES[:RECITE],
        "user_id" => cookies[:user_id].to_i})
    @word = Word.find(params[:id])
  end

  def use
    @already_recited = ActionLog.return_log_by_types({"types" => ActionLog::TYPES[:RECITE],
        "user_id" => cookies[:user_id].to_i})
    @word = Word.find(params[:id])
  end
  
end
