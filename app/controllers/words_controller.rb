# encoding: utf-8
class WordsController < ApplicationController
  layout "words", :except => "index"
  before_filter :sign?, :except => "index"
  before_filter :get_role, :only => ["index", "recite_word"]
  
  def index
    cookies.delete(:word_ids)
    category_id = "#{params[:category]}"=="" ? 2 : params[:category]
    @category = Category.find_by_id(category_id.to_i)
    @title = "#{@category.name}词汇"
    @meta_keywords = "#{@category.name}词汇表,大学英语四级必考词汇"
    @meta_description = "搜集#{@category.name}必考词汇1000余条，以四步训练帮助掌握词汇的用法和拼写，为应试提供扎实的基础。"
    if cookies[:user_id]
      user_word_relation = UserWordRelation.single_user_word(cookies[:user_id].to_i, category_id.to_i)
      @leaving_count = (user_word_relation.nomal_ids.nil? or user_word_relation.nomal_ids.empty?) ? 0 :
        (user_word_relation.nomal_ids.split(",")).length
      @already_recited = (user_word_relation.recite_ids.nil? or user_word_relation.recite_ids.empty?) ? 0 :
        (user_word_relation.recite_ids.split(",")).length
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
      @words = Word.current_recite_words(cookies[:user_id].to_i, params[:category].to_i, params[:type])
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
    @words = Word.current_recite_words(cookies[:user_id].to_i, params[:category].to_i, params[:type])
  end

  def use
    category_id = "#{params[:category]}"=="" ? 2 : params[:category]
    @category = Category.find_by_id(category_id.to_i)
    @title = "#{@category.name}词汇训练"
    @words = Word.current_recite_words(cookies[:user_id].to_i, params[:category].to_i, params[:type])
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
    unless cookies[:word_ids].nil? or cookies[:word_ids].empty?
      @words = Word.find_by_sql(["select * from words w where id in (?)", cookies[:word_ids].split(",")])
    else
      @words = Word.current_recite_words(cookies[:user_id].to_i, params[:category].to_i, params[:type])
    end
    @word_ids = []
    unless @words.blank?
      @words.collect { |word| @word_ids << word.id }
      cookies[:word_ids] = {:value =>@word_ids.join(","), :path => "/", :secure  => false}
    end
  end

  def word_log
    puts "---------------------------------"
    puts params[:word_id].to_i
    UserWordRelation.add_recite_word(cookies[:user_id].to_i, params[:word_id].to_i, params[:category_id].to_i)
    action_log = ActionLog.find(:first,
      :conditions => ["category_id = ? and TO_DAYS(NOW())=TO_DAYS(created_at) and types = ? and user_id = ?",
        params[:category_id].to_i, ActionLog::TYPES[:RECITE], cookies[:user_id].to_i])
    if action_log
      total_num = action_log.total_num + 1
      action_log.update_attributes(:total_num => total_num)
    else
      ActionLog.create(:category_id => params[:category_id].to_i, :user_id => cookies[:user_id].to_i,
        :types => ActionLog::TYPES[:RECITE], :created_at => Time.now.to_date, :total_num => 1)
    end
    render :text => ""
  end

  
end
