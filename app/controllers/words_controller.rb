# encoding: utf-8
class WordsController < ApplicationController
  layout "words", :except => "index"
  before_filter :sign?, :except => "index"
  before_filter :get_role, :only => ["index", "recite_word"]
  
  def index
    category_id = "#{params[:category]}"=="" ? 2 : params[:category]
    @category = Category.find_by_id(category_id.to_i)
    @title = "#{@category.name}词汇"
    @meta_keywords = "#{@category.name}词汇表,大学英语四级必考词汇"
    @meta_description = "搜集#{@category.name}必考词汇1000余条，以四步训练帮助掌握词汇的用法和拼写，为应试提供扎实的基础。"
    if cookies[:user_id]
      @already_recited = ActionLog.return_log_by_types({"types" => ActionLog::TYPES[:RECITE],
          "user_id" => cookies[:user_id].to_i, "category_id" => category_id.to_i})
      @user_words = UserWordRelation.count_by_sql(["select count(uwr.id) from user_word_relations uwr
      inner join words w on w.id = uwr.word_id where w.category_id = ?
      and uwr.status = #{UserWordRelation::STATUS[:RECITE]}
      and uwr.user_id = ?", category_id.to_i, cookies[:user_id].to_i])
      level_word_count = Word.recite_words(category_id.to_i)
      user_word_count = UserWordRelation.user_words(cookies[:user_id].to_i, category_id.to_i)
      @leaving_count = level_word_count + user_word_count - @already_recited.total_num
    else
      @leaving_count = Word.recite_words(category_id.to_i)
    end
    render :layout => "application"
  end

  def recite_word
    category_id = "#{params[:category]}"=="" ? 2 : params[:category]
    @category = Category.find_by_id(category_id.to_i)
    @title = "#{@category.name}词汇训练"
    if is_nomal?(params[:category])
      flash[:notice] = "您的试用期已结束。[<a class='link_c' href='/users/charge_vip?category=#{params[:category]}'>升级为正式用户</a>]"
      redirect_to "/words?category=#{params[:category]}"
    else
      @already_recited = ActionLog.return_log_by_types({"types" => ActionLog::TYPES[:RECITE],
          "user_id" => cookies[:user_id].to_i, "category_id" => category_id.to_i})
      @words = Word.current_recite_words(cookies[:user_id].to_i, params[:category].to_i,
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
    category_id = "#{params[:category]}"=="" ? 2 : params[:category]
    @category = Category.find_by_id(category_id.to_i)
    @title = "#{@category.name}词汇训练"
    @already_recited = ActionLog.return_log_by_types({"types" => ActionLog::TYPES[:RECITE],
        "user_id" => cookies[:user_id].to_i, "category_id" => params[:category].to_i})
    @words = Word.current_recite_words(cookies[:user_id].to_i, params[:category].to_i,
      @already_recited.total_num, params[:type])
  end

  def use
    category_id = "#{params[:category]}"=="" ? 2 : params[:category]
    @category = Category.find_by_id(category_id.to_i)
    @title = "#{@category.name}词汇训练"
    @already_recited = ActionLog.return_log_by_types({"types" => ActionLog::TYPES[:RECITE],
        "user_id" => cookies[:user_id].to_i, "category_id" => params[:category].to_i})
    @words = Word.current_recite_words(cookies[:user_id].to_i, params[:category].to_i,
      @already_recited.total_num, params[:type])
    @word_ids = []
    @sentence_hash = []
    unless @words.blank?
      @words.collect { |word| @word_ids << word.id }
      @sentence_hash = Word.all_sentences(@sentence_hash, @word_ids)
    end
  end

  def hand_man
    category_id = "#{params[:category]}"=="" ? 2 : params[:category]
    @category = Category.find_by_id(category_id.to_i)
    @title = "#{@category.name}词汇训练"
    @already_recited = ActionLog.return_log_by_types({"types" => ActionLog::TYPES[:RECITE],
        "user_id" => cookies[:user_id].to_i, "category_id" => params[:category].to_i})
    @words = Word.current_recite_words(cookies[:user_id].to_i, params[:category].to_i,
      @already_recited.total_num, params[:type])
  end

  def word_log
    word_ids = params[:word_id].split(",")
    wrong_ids = (params[:wrong_id].nil? or params[:wrong_id].empty?) ? [] : params[:wrong_id].split(",")
    right_ids = (params[:right_id].nil? or params[:right_id].empty?) ? [] : params[:right_id].split(",")
    leving_ids = (word_ids - wrong_ids)&right_ids
    unless leving_ids.nil? or leving_ids.blank?
      user_word_relation = UserWordRelation.find(:all, :conditions => ["word_id in (?)", leving_ids])
      user_word_relation.each do |relation|
        relation.update_attributes(:status => UserWordRelation::STATUS[:RECITE])
      end unless user_word_relation.blank?
      action_log = ActionLog.find(:first,
        :conditions => ["category_id = ? and TO_DAYS(NOW())=TO_DAYS(created_at) and types = ? and user_id = ?",
          params[:category_id].to_i, ActionLog::TYPES[:RECITE], cookies[:user_id].to_i])
      if action_log
        total_num = leving_ids.length + action_log.total_num
        action_log.update_attributes(:total_num => total_num)
      else
        ActionLog.create(:category_id => params[:category_id].to_i, :user_id => cookies[:user_id].to_i,
          :types => ActionLog::TYPES[:RECITE], :created_at => Time.now.to_date, :total_num => leving_ids.length)
      end
    end
    render :text => ""
  end

  
end
