# encoding: utf-8
class WordsController < ApplicationController
  layout "words", :except => "index"
  before_filter :sign?, :except => "index"
  
  def index
    if cookies[:user_id]
      @already_recited = ActionLog.return_log_by_types({"types" => ActionLog::TYPES[:RECITE],
          "user_id" => cookies[:user_id].to_i})
      level_word_count = Word.recite_words
      user_word_count = UserWordRelation.user_words(cookies[:user_id].to_i)
      @leaving_count = level_word_count + user_word_count - @already_recited.total_num
    else
      @leaving_count = Word.recite_words
    end
    render :layout => "application"
  end

  def recite_word
    if is_nomal?(params[:category])
      flash[:notice] = "您的试用期已过，升级为vip用户才能试用。"
      redirect_to "/words?category=#{params[:category]}"
    else
      @already_recited = ActionLog.return_log_by_types({"types" => ActionLog::TYPES[:RECITE],
          "user_id" => cookies[:user_id].to_i})
      @words = Word.current_recite_words(params[:category].to_i, cookies[:user_id].to_i,
        @already_recited.total_num, params[:type])
      @word_ids = []
      @sentence_hash = []
      unless @words.blank?
        @words.collect { |word| @word_ids << word.id }
        @sentence_hash = Word.all_sentences(@sentence_hash, @word_ids)
      else
        if params[:type] == "old"
          flash[:notice] = "您目前还没有掌握任何单词，抓紧时间背诵哦。"
        else
          flash[:notice] = "您已经掌握了需要掌握的单词啦！"
        end
        redirect_to "/words?category=#{params[:category]}"
      end
    end
    
  end

  def recollection
    @already_recited = ActionLog.return_log_by_types({"types" => ActionLog::TYPES[:RECITE],
        "user_id" => cookies[:user_id].to_i})
    @words = Word.current_recite_words(params[:category].to_i, cookies[:user_id].to_i, 
      @already_recited.total_num, params[:type])
  end

  def use
    @already_recited = ActionLog.return_log_by_types({"types" => ActionLog::TYPES[:RECITE],
        "user_id" => cookies[:user_id].to_i})
    @words = Word.current_recite_words(params[:category].to_i, cookies[:user_id].to_i, 
      @already_recited.total_num, params[:type])
    @word_ids = []
    @sentence_hash = []
    unless @words.blank?
      @words.collect { |word| @word_ids << word.id }
      @sentence_hash = Word.all_sentences(@sentence_hash, @word_ids)
    end
  end

  def hand_man
    @already_recited = ActionLog.return_log_by_types({"types" => ActionLog::TYPES[:RECITE],
        "user_id" => cookies[:user_id].to_i})
    @words = Word.current_recite_words(params[:category].to_i, cookies[:user_id].to_i, 
      @already_recited.total_num, params[:type])
    @word_ids = []
    @sentence_hash = []
    unless @words.blank?
      @words.collect { |word| @word_ids << word.id }
      @sentence_hash = Word.all_sentences(@sentence_hash, @word_ids)
    end
  end

  def word_log
    word_ids = params[:word_id].split(",")
    wrong_ids = (params[:wrong_id].nil? or params[:wrong_id].empty?) ? [] : params[:wrong_id].split(",")
    unless (word_ids - wrong_ids).nil? or (word_ids - wrong_ids).blank? 
      user_word_relation = UserWordRelation.find(:all, :conditions => ["word_id in (?)", (word_ids - wrong_ids)])
      user_word_relation.each do |relation|
        relation.update_attributes(:status => UserWordRelation::STATUS[:RECITE])
      end unless user_word_relation.blank?
      action_log = ActionLog.find(:first,
        :conditions => ["category_id = ? and TO_DAYS(NOW())=TO_DAYS(created_at) and types = ? and user_id = ?",
          params[:category_id].to_i, ActionLog::TYPES[:RECITE], cookies[:user_id].to_i])
      if action_log
        total_num = (word_ids - wrong_ids).length + action_log.total_num
        action_log.update_attributes(:total_num => total_num)
      else
        ActionLog.create(:category_id => params[:category_id].to_i, :user_id => cookies[:user_id].to_i,
          :types => ActionLog::TYPES[:RECITE], :created_at => Time.now.to_date, :total_num => (word_ids - wrong_ids).length)
      end
    end    
    render :text => ""
  end

  
end
