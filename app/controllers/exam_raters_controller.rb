#encoding: utf-8
class ExamRatersController < ApplicationController
  layout 'rater'

  def rater_session #阅卷老师登陆页面
    @rater=ExamRater.find(:first,:conditions =>["id = #{params[:id].to_i} and examination_id = #{params[:examination].to_i}"])
    if @rater.nil?
      render :inline=>"您访问的页面不存在。"
    else
      @examination=Examination.find(params[:examination])
      render "/exam_raters/session"
    end
  end

  def rater_login  #阅卷老师登陆
    @rater=ExamRater.find(params[:id])
    @examination=Examination.find(params[:examination_id])
    if @rater.author_code==params[:author_code]
      cookies[:rater_id]={:value =>@rater.id, :path => "/", :secure  => false}
      cookies[:rater_name]={:value =>@rater.name, :path => "/", :secure  => false}
      flash[:success]="登陆成功"
      redirect_to  "/exam_raters/#{params[:examination_id]}/reader_papers?rater_id=#{@rater.id}"
    else
      flash[:error]="阅卷码不正确，请核对！"
      render "/exam_raters/session"
    end
  end

  def reader_papers  #答卷批阅状态显示
    
    auth_rater=ExamRater.find(:first,:conditions =>["id = #{cookies[:rater_id].to_i} and examination_id = #{params[:id].to_i}"])
    if auth_rater.nil?
      redirect_to "/exam_raters/#{params[:rater_id]}/rater_session?examination=#{params[:id]}"
    else
      @examination=Examination.find(params[:id].to_i)
      @user=User.find(@examination.creater_id)
      @exam_paper_total =ExamRater.get_paper(params[:id].to_i)
      @exam_score_total =0
      @exam_paper_marked =0
      @marked_now=0
      @rater_id=cookies[:rater_id]
      @exam_paper_total.each do |e|
        @marked_now +=1 if e.exam_rater_id==cookies[:rater_id].to_i and e.is_marked!=1
        @exam_score_total +=1 unless e.relation_id
        @exam_paper_marked +=1 if e.is_marked==1
      end unless @exam_paper_total.blank?
    end
  end

  def check_paper  #选择要批阅的答卷
    @exam_user=RaterUserRelation.find_by_sql("select * from rater_user_relations
      where exam_rater_id=#{cookies[:rater_id].to_i} and is_marked=0")
    if @exam_user.blank?||@exam_user==[]
      examination=params[:examination_id].to_i
      #      if examination==Constant::EXAMINATION.to_i
      #        @exam_user= ExamUser.find_by_sql("select eu.id from exam_users eu left join rater_user_relations r
      #        on r.exam_user_id = eu.id where eu.answer_sheet_url is not null and
      #        eu.is_submited=1 and eu.examination_id = #{examination} and r.exam_user_id is null order by rand() limit 1#")
      #      else
      @exam_user= ExamUser.find_by_sql("select eu.id from exam_users eu left join rater_user_relations r
        on r.exam_user_id = eu.id inner join orders o on o.user_id = eu.user_id where eu.answer_sheet_url is not null and
        eu.is_submited=1 and eu.examination_id = #{examination} and r.exam_user_id is null and 
       o.types in (#{Order::TYPES[:CHARGE]},#{Order::TYPES[:OTHER]},#{Order::TYPES[:ACCREDIT]}) and o.category_id=#{Category::TYPE_IDS[:english_fourth_level]}
        and o.status=#{Order::STATUS[:NOMAL]} group by o.types order by rand() limit 1")
      #      end
      id=@exam_user[0].id
    else
      id=@exam_user[0].exam_user_id
    end
    unless @exam_user.blank?
      redirect_to "/exam_raters/#{id}/answer_paper?rater_id=#{cookies[:rater_id]}"
    else
      flash[:notice] = "当场考试试卷已经全部阅完。"
      redirect_to request.referer
    end
  end

  def answer_paper #批阅答卷
    @exam_user=ExamUser.find(params[:id])
    if @exam_user.nil?
      render :inline=>"您访问的页面不存在。"
    else
      doc=open_file(Constant::PUBLIC_PATH + @exam_user.answer_sheet_url)
      xml=open_file(Constant::PUBLIC_PATH + "/paper/#{doc.elements[1].attributes["id"]}.xml")
      @xml=ExamRater.answer_questions(xml,doc)
      @reading= RaterUserRelation.find(:first, :conditions => ["exam_rater_id=#{cookies[:rater_id]} and is_marked=0"])
      if @xml[0].blank?
        flash[:notice] = "感谢您的参与，当前试卷没有需要批改的试卷。"
      else
        if @reading.nil?
          @reading=RaterUserRelation.create(:exam_rater_id => cookies[:rater_id],
            :exam_user_id => @exam_user.id, :started_at =>Time.now,:is_marked=>0)
        end
      end
    end
  end

  def over_answer #批阅完成，给答卷添加成绩
    score_reason=params[:score_reason]
    @exam_relation=RaterUserRelation.find(params[:id])
    @exam_relation.update_attributes(:rate_time=>((Time.now-@exam_relation.started_at)/60+1).to_i)
    @exam_user=ExamUser.find(@exam_relation.exam_user_id)
    #   begin
    url="#{Rails.root}/public/#{@exam_user.answer_sheet_url}"
    doc=open_file(url)
    xml=open_file(Constant::PUBLIC_PATH + "/paper/#{doc.elements[1].attributes["id"]}.xml")
    score=0.0
    only_xml=ExamRater.answer_questions(xml,doc)[0]
    collection = Collection.find_or_create_by_user_id(@exam_user.user_id)
    path =  "/collections/" + Time.now.to_date.to_s
    collection_url = path + "/#{collection.id}.js"
    collection.set_collection_url(path, collection_url)
    already_hash = {"problems" => {"problem" => []}}
    last_problems = ""
    file = File.open(Constant::PUBLIC_PATH + collection.collection_url)
    last_problems = file.readlines.join
    unless last_problems.nil? or last_problems.strip == ""
      already_hash = JSON(last_problems.gsub("collections = ", ""))#ActiveSupport::JSON.decode(().to_json)
    end
    file.close
    only_xml.each_with_index do |problem,pro_index|
      problem.get_elements("questions//question").each_with_index do |question,que_index|
        single_score=score_reason["#{pro_index}_#{que_index}"][0].to_f
        reason=score_reason["#{pro_index}_#{que_index}"][1]
        result_question = doc.elements["/exam/paper/questions/question[@id='#{question.attributes["id"]}']"]
        if result_question.nil?
          Collection.auto_add_collection(" ", problem, @exam_user.user_id,question)
        else
          result_question.attributes["score"] = single_score
          if question.attributes["score"].to_f!=single_score
            problem.add_attribute("paper_id",doc.elements[1].attributes["id"])
            already_hash=Collection.auto_add_collection(result_question.elements["answer"].text, problem,question,already_hash)
          else
            problem.delete_element(question.xpath)
          end
          score += single_score
          result_question.add_attribute("score_reason","#{reason}")
        end
      end
    end
    collection_js="collections = " + already_hash.to_json.to_s
    path_url = collection.collection_url.split("/")
    collection.generate_collection_url(collection_js, "/" + path_url[1] + "/" + path_url[2], collection.collection_url)
    all_score=0.0
    old_file=open_file(Constant::PUBLIC_PATH + "/paper/#{doc.elements[1].attributes["id"]}.xml")
    old_file.elements["blocks"].each_element do  |block|
      block_score = 0.0
      block.elements["problems"].each_element do |problem|
        problem.elements["questions"].each_element do |question|
          result_question = doc.elements["/exam/paper/questions/question[@id=#{question.attributes["id"]}]"]
          original_score  = result_question.attributes["score"].to_f
          all_score += original_score
          block_score += original_score
        end unless problem.elements["questions"].nil?
      end
      unless doc.elements["/exam/paper/blocks"].nil?
        answer_block = doc.elements["/exam/paper/blocks/block[@id=#{block.attributes["id"]}]"]
        answer_block.attributes["score"] = block_score
      end
    end
    doc.elements["paper"].elements["rate_score"].text = score
    @exam_user.update_attributes(:total_score=>all_score)
    self.write_xml(doc,url)
    @exam_relation.toggle!(:is_marked)
    notice="提交成功"
    #    rescue
    #      notice="提交失败"
    #    end
    respond_to do |format|
      format.json {
        data={:examination_id=>@exam_user.examination_id,:rater_id=>@exam_relation.exam_rater_id,:notice=>notice}
        render :json=>data
      }
    end
    
  end

  def log_out #退出
    cookies.delete(:rater_id)
    cookies.delete(:examination_id)
    cookies.delete(:rater_name)
    render :inline=>"<script>window.close();</script>"
  end

end
