#encoding: utf-8
class CollectionsController < ApplicationController
  layout 'exam_user'

  before_filter :sign?, :except => "add_collection"
  require 'rexml/document'
  include REXML

  def index
      user = User.find(cookies[:user_id])
      @collection_js_url = "#{Constant::SERVER_PATH}#{user.collection.collection_url}"
  end

  def load_words
    load_words={}
    unless params[:words].length==0
      word_sql=""
      params[:words].each do |one_word|
        word_sql +="'#{one_word}',"
      end
      words=Word.find_by_sql("select w.* from words w where w.name in (#{word_sql.chop})")
      words.each do |word|
        words_sentence=WordSentence.find_by_sql("select w.description from word_sentences w where w.word_id=#{word.id}")
        load_words[word.name]=[word,words_sentence]
      end unless words.blank?
    end
    respond_to do |format|
      format.json {
        data={:words=>load_words=={}?[] :load_words}
        render :json=>data
      }
    end
  end

  def write_file
    url="#{Rails.root}/app/assets/javascripts/collections/1.js"
    doc="collections = "+(JSON params[:collecton]).to_json
    write_xml(url,doc)
    render :text=>""
  end

  def add_collection
    collection = Collection.find_or_create_by_user_id(cookies[:user_id].to_i)
    path = Collection::COLLECTION_PATH + "/" + Time.now.to_date.to_s
    url = path + "/#{collection.id}.js"
    collection.set_collection_url(path, url)
    already_hash = {}
    last_problems = ""
    file = File.open(Constant::PUBLIC_PATH + collection.collection_url)
    last_problems = file.readlines.join
    unless last_problems == "" or last_problems.nil?
      already_hash = ActiveSupport::JSON.decode((JSON(last_problems.gsub("collections = ", ""))).to_json)
    else
      already_hash = {"problems" => {"problem" => []}}
    end
    is_problem_in = collection.update_question_in_collection(already_hash,
      params[:problem_id].to_i, params[:question_id].to_i,
      params[:question_answer], params[:question_analysis], params[:user_answer])
    if is_problem_in == false
      new_col_problem = collection.update_problem_hash(params[:problem_json], params[:paper_id], 
        params[:question_answer], params[:question_analysis], params[:user_answer], params[:question_id].to_i)
      already_hash["problems"]["problem"] << new_col_problem      
    end
    collection_js = "collections = " + already_hash.to_json.to_s
    path_url = collection.collection_url.split("/")
    collection.generate_collection_url(collection_js, "/" + path_url[1] + "/" + path_url[2], collection.collection_url)

    exam_user = ExamUser.find(params[:exam_user_id])
    exam_user.update_user_collection(params[:question_id]) if exam_user

    respond_to do |format|
      format.json {
        render :json => {:message => "收藏成功！"}
      }
    end
  end

end
