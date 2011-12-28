# encoding: utf-8
class WordsController < ApplicationController
  layout "words", :except => ["index"]
  def index
    @already_recited = ActionLog.return_log_by_types({"types" => ActionLog::TYPES[:RECITE],
        "user_id" => cookies[:user_id].to_i})
    level_word_count = Word.recite_words
    user_word_count = UserWordRelation.user_words(cookies[:user_id].to_i)
    @leaving_count = level_word_count + user_word_count
    render :layout => "application"
  end

  def recite_word
    @already_recited = ActionLog.return_log_by_types({"types" => ActionLog::TYPES[:RECITE],
        "user_id" => cookies[:user_id].to_i})
    @words = Word.find(:all,
      :conditions => ["level < #{Word::WORD_LEVEL[:THIRD]} and category_id = #{params[:category].to_i}"],
      :limit => 20, :order => "id", :offset => @already_recited.total_num)
    @word_ids = []
    @sentence_hash = []
    unless @words.blank?
      @words.collect { |word| @word_ids << word.id  }
      @word_sentences = WordSentence.find(:all, :conditions => ["word_id in (?)", @word_ids])
      @word_sentences.each { |sentence|
        if @sentence_hash[sentence.word_id].nil?
          @sentence_hash[sentence.word_id] = [sentence.description]
        else
          @sentence_hash[sentence.word_id] << sentence.description
        end
        }
    end
#    render :layout => "words"
  end

  def recollection
    @already_recited = ActionLog.return_log_by_types({"types" => ActionLog::TYPES[:RECITE],
        "user_id" => cookies[:user_id].to_i})
    @word = Word.find(params[:id])
#    render :layout => "words"
  end

  def use
    @already_recited = ActionLog.return_log_by_types({"types" => ActionLog::TYPES[:RECITE],
        "user_id" => cookies[:user_id].to_i})
    @word = Word.find(params[:id])
#    render :layout => "words"
  end
  
end
