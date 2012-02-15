# encoding: utf-8
class SimilaritiesController < ApplicationController
  before_filter :sign?, :except => "index"
  
  def index
    user_order(params[:category].to_i, cookies[:user_id].to_i) unless cookies[:user_id].nil?
    category_id = "#{params[:category]}"=="" ? 2 : params[:category]
    @category = Category.find_by_id(category_id.to_i)
    @title="#{@category.name}真题"
    @meta_keywords="#{@category.name}真题打包下载"
    @meta_description="汇集2006年12月至今左右#{@category.name}真题，提供在线听力录音，在线答题，实时核对，完整的解析和相关词汇表。"

    sql = "select e.id, e.title, e.is_free from examinations e
        where e.category_id = #{@category.id} and e.types = #{Examination::TYPES[:OLD_EXAM]}"
    if !params[:category_type].nil? and params[:category_type] == Examination::IS_FREE[:YES].to_s
      sql += " and e.is_free = #{Examination::IS_FREE[:YES]}"
    elsif !params[:category_type].nil? and params[:category_type] == Examination::IS_FREE[:NO].to_s
      sql += " and (e.is_free = #{Examination::IS_FREE[:NO]} or e.is_free is null)"
    end
    @similarities = Examination.paginate_by_sql(sql,
      :per_page => 10, :page => params[:page])
    examination_ids = []
    @exam_user_hash = {}
    @similarities.each { |sim| examination_ids << sim.id }
    @exam_users = ExamUser.find_by_sql(["select eu.id, eu.examination_id, eu.is_submited, eu.answer_sheet_url from exam_users eu where eu.user_id = ?
      and eu.examination_id in (?)", cookies[:user_id].to_i, examination_ids])
    @exam_users.each { |eu| @exam_user_hash[eu.examination_id] = [eu.id,eu.is_submited,eu.answer_sheet_url] }
  end

  def join
    category_id = params[:category].nil? ? 2 : params[:category]
    if cookies[:user_id].nil?
      redirect_to "/logins?last_url=#{Constant::SERVER_PATH}/similarities?category=#{category_id}"
      return false
    end

    similarity = Examination.find(params[:id])
    if is_vip?(category_id) or (is_trial?(category_id) and similarity.is_free)
      #设置考试试卷
      papers_arr=[]
      similarity.papers.each do |paper|
        papers_arr << paper
      end
      if papers_arr.length>0
        @paper = papers_arr.sample
        @exam_user = ExamUser.find_by_sql("select * from exam_users where paper_id = #{@paper.id} and examination_id = #{params[:id]} and user_id = #{cookies[:user_id]}")[0]
        if @exam_user.nil?
          @exam_user = ExamUser.create(:user_id=>cookies[:user_id],:examination_id=>params[:id],:paper_id=>@paper.id)
        end
        redirect_to "/exam_users/#{@exam_user.id}?category=#{category_id}&type=similarities"
      else
        flash[:notice]="当前考试未指定试卷。"
        redirect_to "/similarities?category=#{category_id}"
      end
    else
      flash[:notice]="当前试卷为收费卷，升级为vip用户才能试用。"
      redirect_to "/similarities?category=#{category_id}"
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



end
