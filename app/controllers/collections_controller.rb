#encoding: utf-8
class CollectionsController < ApplicationController
  layout 'exam_user'
  #layout 'collection'
  require 'rexml/document'
  include REXML
  before_filter :sign?, :except => ["index","error"]
  
  def index
    if cookies[:user_id]
      user = User.find(cookies[:user_id])
      if user.collection
        category_id = "#{params[:category]}"=="" ? 2 : params[:category]
        @category = Category.find_by_id(category_id.to_i)
        @title = "#{@category.name}真题收藏"
        @meta_keywords = "自动收藏做错的#{@category.name}真题"
        @meta_description = "自动收藏做错的#{@category.name}真题"
        @collection_js_url = "#{Constant::SERVER_PATH}#{user.collection.collection_url}"
      else
        redirect_to "/collections/error"
      end
    else
      redirect_to "/collections/error"
    end
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
    last_problems = file.read
    unless last_problems.nil? or last_problems.strip == ""
      already_hash = JSON(last_problems.gsub("collections = ", ""))#ActiveSupport::JSON.decode(().to_json)
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

    if params[:exam_user_id]
      exam_user = ExamUser.find(params[:exam_user_id])
      exam_user.update_user_collection(params[:question_id]) if exam_user
    end

    respond_to do |format|
      format.json {
        render :json => {:message => "收藏成功！"}
      }
    end
  end

  def update_collection
    this_problem = JSON params[:problem_json]
    this_question = nil
    unless this_problem["questions"]["question"].nil?
      new_col_questions = this_problem["questions"]["question"]
      if new_col_questions.class.to_s == "Hash"
        this_question = new_col_questions
      else
        new_col_questions.each do |question|
          if question["id"].to_i == params[:question_id].to_i
            this_question = question
            break
          end
        end unless new_col_questions.blank?
      end
    end
    
    Collection.update_collection(cookies[:user_id].to_i, this_problem, 
      params[:problem_id], this_question, params[:question_id],
      params[:paper_id], params[:question_answer], params[:question_analysis], params[:user_answer])
    exam_user = ExamUser.find(params[:exam_user_id])
    exam_user.update_user_collection(params[:question_id]) if exam_user

    if params[:sheet_url]
      doc = get_doc(params[:sheet_url])
      new_str = "_#{params["problem_index"]}_#{params["question_index"]}"
      collection =doc.root.elements["collection"]
      collection.text.nil? ? collection.add_text(new_str) : collection.text="#{collection.text},#{new_str}"
      write_xml(doc, params[:sheet_url])
    end
    
    respond_to do |format|
      format.json {
        render :json => {:message => "收藏成功！"}
      }
    end
  end

  def error
  end


  #收藏主页
  def index1
    begin
      if cookies[:user_id]
        user = User.find(cookies[:user_id])
        if user.collection
          category_id = "#{params[:category]}"=="" ? 2 : params[:category]
          @category = Category.find_by_id(category_id.to_i)
          @title = "#{@category.name}真题收藏"
          @meta_keywords = "自动收藏做错的#{@category.name}真题"
          @meta_description = "自动收藏做错的#{@category.name}真题"
          @collection_url = "#{Rails.root}/public#{user.collection.collection_url}"
          f = File.open(@collection_url)
          @problems = (JSON (f.read)[13..-1])["problems"]["problem"]
          @problems_sum = @problems.length #总大题数
          @group_sum = 5 #设置每组大题数
          @group_index = params[:init_problem].nil? ? 0 : ((params[:init_problem].to_i)/@group_sum)  #设置载入第几组
          @problems = @problems[(@group_index*@group_sum),@group_sum]
          f.close
        else
          redirect_to "/collections/error"
          return false
        end
      else
        redirect_to "/collections/error"
        return false
      end
    rescue
      redirect_to "/collections/error"
      return false
    end
  end

  #读取题目资源
  def ajax_load_problems
    user = User.find(cookies[:user_id])
    collection_url = "#{Rails.root}/public#{user.collection.collection_url}"
    f = File.open(collection_url)
    @problems = (JSON (f.read)[13..-1])["problems"]["problem"]
    @problems_sum = @problems.length #总大题数
    @problems = @problems[params[:group_index].to_i*params[:group_sum].to_i,params[:group_sum].to_i]
    f.close
    object={:group_index=>params[:group_index].to_i,:group_sum=>params[:group_sum].to_i,:problems=>@problems,:problems_sum=>@problems_sum,:init_problem=>params[:init_problem].to_i}
    render :partial=>"/collections/problems",:object=>object
  end


end
