# encoding: utf-8
class ExamUsersController < ApplicationController
  layout "exam_user"
  before_filter :sign? ,:except=>["preview","ajax_load_about_words"]
  def show
    #读取试题
    begin
      eu = ExamUser.find(params[:id])
      @paper_id = eu.paper_id
      p = Paper.find(@paper_id)
      paper = File.open("#{Constant::BACK_PUBLIC_PATH}#{p.paper_js_url}")
      @answer_js_url = "#{Constant::BACK_SERVER_PATH}#{p.paper_js_url}".gsub("paperjs/","answerjs/")
      @paper = (JSON paper.read()[8..-1])["paper"]
      #组织 @paper
      @title = @paper["base_info"]["title"]
      @meta_keywords = "在线做题,在线真题听力MP3,实时核对,完整的解析和相关词汇"
      @meta_description = "在线做题，在线真题听力MP3，实时核对，完整的解析和相关词汇。"
      @paper["blocks"]["block"] = @paper["blocks"]["block"].nil? ? [] : (@paper["blocks"]["block"].class==Array) ? @paper["blocks"]["block"] : [@paper["blocks"]["block"]]
      @paper["blocks"]["block"].each do |block|
        if block["problems"]
          block["problems"]["problem"] = (block["problems"]["problem"].nil?) ? [] : ((block["problems"]["problem"].class==Array) ? block["problems"]["problem"] : [block["problems"]["problem"]])
          block["problems"]["problem"].each do |problem|
            problem["questions"]["question"] = problem["questions"]["question"].nil? ? [] : (problem["questions"]["question"].class==Array) ? problem["questions"]["question"] : [problem["questions"]["question"]] if problem["questions"]
          end
        end
      end
      #生成考生答卷
      s_url = ExamUser.find(params[:id]).answer_sheet_url
      @sheet_url = "#{Constant::PUBLIC_PATH}#{s_url}"
      @sheet_url = create_sheet(sheet_outline,params[:id]) unless (s_url && File.exist?(@sheet_url))
      @sheet = get_doc("#{@sheet_url}")
      close_file("#{@sheet_url}")
    rescue
      flash[:warn] = "试卷加载错误，请您重新尝试。"
      redirect_to request.referer
    end
  end

  #将变量转化为数组
  def transform_array(obj)
    result = [];
    if obj
      if obj.class==Array
        result = obj
      else
        result << obj
      end
    end
    return result
  end

  #ajax载入相关词汇
  def ajax_load_about_words
    words = params["words"].split(";")
    word_index=0
    data={}
    words.each do |word|
      @word = Word.find_by_sql("select * from words where name = '#{word}'")
      if @word.length>0
        @word = @word[0]
        sentences=[]
        @word.word_sentences.each do |sentence|
          sentences << sentence.description
        end
        sentences = sentences.join(";")
        data[word_index]={:name=>@word.name,:category_id=>@word.category_id,:en_mean=>@word.en_mean,:ch_mean=>@word.ch_mean,:types=>Word::TYPES[@word.types],:phonetic=>@word.phonetic,:enunciate_url=>@word.enunciate_url,:sentences=>sentences}
        word_index += 1
      end
    end
    if word_index==0
      data={"error"=>"抱歉，无法查询到相关词汇信息"}
    end
    respond_to do |format|
      format.json {
        render :json=>data
      }
    end
  end

  def ajax_report_error
    find_arr = ReportError.find_by_sql("select id from report_errors where user_id=#{params["post"]["user_id"]} and question_id=#{params["post"]["question_id"]} and error_type=#{params["post"]["error_type"]}")
    if find_arr.length>0
      data={:message=>"您已经提交过此错误，感谢您的支持。"}
    else
      reporterror = ReportError.new(params["post"])
      if reporterror.save
        data={:message=>"错误报告提交成功"}
      else
        data={:message=>"错误报告提交失败"}
      end
    end
    respond_to do |format|
      format.json {
        render :json=>data
      }
    end
  end

  def sheet_outline(collection_str = "")
    outline = "<?xml version='1.0' encoding='UTF-8'?>"
    outline += "<sheet init='0' status='0'>"
    outline += "<collection>"
    outline += "#{collection_str}"
    outline += "</collection>"
    outline += "</sheet>"
    return outline
  end
  
  #创建答卷
  def create_sheet(sheet_outline,exam_user_id)
    dir = "#{Rails.root}/public/sheets"
    Dir.mkdir(dir) unless File.directory?(dir)
    dir = "#{dir}/#{Time.now.strftime("%Y%m%d")}"
    Dir.mkdir(dir) unless File.directory?(dir)
    file_name = "/#{exam_user_id}.xml"
    url = dir + file_name
    unless File.exist?(url)
      ExamUser.find(exam_user_id).update_attribute("answer_sheet_url","/sheets/#{Time.now.strftime("%Y%m%d")}#{file_name}")
      f=File.new(url,"w+")
      f.write("#{sheet_outline.force_encoding('UTF-8')}")
      f.close
    end
    return url
  end

  #考生保存答案
  def ajax_save_question_answer
    if params[:sheet_url]!="" && params[:sheet_url]!=nil
      url=params[:sheet_url]
      doc = get_doc(url)
      ele_str = "_#{params[:problem_index]}_#{params[:question_index]}"
      doc.attributes["init"].nil? ? doc.add_attribute("init", "#{params[:problem_index]}") : (doc.attributes["init"] = "#{params[:problem_index]}")
      question = doc.elements[ele_str].nil? ? doc.add_element(ele_str) : doc.elements[ele_str]
      question.text.nil? ? question.add_text(params[:answer]) : question.text=params[:answer]
      manage_element(question,{},{"question_type"=>params[:question_type], "correct_type"=>params[:correct_type]})
      write_xml(doc, url)
      #更新action_logs , total_num+1
      log = ActionLog.find_by_sql("select * from action_logs where user_id=#{cookies[:user_id]} and types=#{ActionLog::TYPES[:PRACTICE]} and category_id=#{params[:category_id]} and TO_DAYS(NOW())=TO_DAYS(created_at)")[0]
      log = ActionLog.create(:user_id=>cookies[:user_id],:types=>ActionLog::TYPES[:PRACTICE],:category_id=>params[:category_id],:total_num=>0) unless log
      log.update_attribute("total_num",log.total_num+1)
    end
    respond_to do |format|
      format.json {
        render :json=>""
      }
    end
  end

  #重做卷子
  def redo
    url=params[:sheet_url]
    doc = get_doc(url)
    collection = ""
    collection = doc.root.elements["collection"].text if doc.root.elements["collection"]
    f=File.new(url,"w+")
    f.write("#{sheet_outline(collection).force_encoding('UTF-8')}")
    f.close
    ExamUser.find(params[:id]).update_attribute("is_submited",false)
    redirect_to "/exam_users/#{params[:id]}?category=#{params[:category]}&type=#{params[:type]}"
  end

  #改变答卷状态（即做完了最后一题）
  def ajax_change_status
    if params[:sheet_url]!="" && params[:sheet_url]!=nil
      ExamUser.find(params[:id]).update_attribute("is_submited",true)
      url=params[:sheet_url]
      doc = get_doc(url)
      doc.attributes["status"] = "1"
      doc.attributes["init"] = "0"
      write_xml(doc, url)
    end
    respond_to do |format|
      format.json {
        render :json=>""
      }
    end  
  end

  #添加收藏(题面后小题)
  def ajax_add_collect
    if params[:sheet_url]!="" && params[:sheet_url]!=nil
      #解析参数
      this_problem = JSON params["problem"]
      problem_id = this_problem["id"]
      this_question = this_problem["questions"]["question"][params["question_index"].to_i]
      question_id = this_question["id"]
      Collection.update_collection(cookies[:user_id].to_i, this_problem, problem_id, this_question, question_id,
        params["paper_id"], params["addition"]["answer"], params["addition"]["analysis"], params["user_answer"])
      #在sheet中记录小题的收藏状态
      doc = get_doc(params[:sheet_url])
      new_str = "_#{params["problem_index"]}_#{params["question_index"]}"
      collection =doc.root.elements["collection"]
      collection.text.nil? ? collection.add_text(new_str) : collection.text="#{collection.text},#{new_str}"
      write_xml(doc, params[:sheet_url])
    end
    respond_to do |format|
      format.json {
        render :json=>""
      }
    end
  end

  #预览
  def preview
    paper = File.open("#{Constant::BACK_PUBLIC_PATH}/preview/paperjs/#{params[:paper]}.js")
    @answer_js_url = "#{Constant::BACK_SERVER_PATH}/preview/answerjs/#{params[:paper]}.js"
    @paper = (JSON paper.read()[8..-1])["paper"]
    #组织 @paper
    @paper["blocks"]["block"] = @paper["blocks"]["block"].nil? ? [] : (@paper["blocks"]["block"].class==Array) ? @paper["blocks"]["block"] : [@paper["blocks"]["block"]]
    @paper["blocks"]["block"].each do |block|
      if block["problems"]
        block["problems"]["problem"] = (block["problems"]["problem"].nil?) ? [] : ((block["problems"]["problem"].class==Array) ? block["problems"]["problem"] : [block["problems"]["problem"]])
        block["problems"]["problem"].each do |problem|
          problem["questions"]["question"] = problem["questions"]["question"].nil? ? [] : (problem["questions"]["question"].class==Array) ? problem["questions"]["question"] : [problem["questions"]["question"]] if problem["questions"]
        end
      end
    end
  end

  

end
