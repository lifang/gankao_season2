# encoding: utf-8
class SimilaritiesController < ApplicationController
  
  def index
    @category = Category.find_by_id(params[:category].to_i)
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
    @exam_users = ExamUser.find_by_sql(["select eu.id,eu.examination_id, eu.is_submited,eu.answer_sheet_url from exam_users eu where eu.user_id = ?
      and eu.examination_id in (?)", cookies[:user_id].to_i, examination_ids])
    @exam_users.each { |eu| @exam_user_hash[eu.examination_id] = [eu.id,eu.is_submited,eu.answer_sheet_url] }
  end

  def join
    category_id = params[:category].nil? ? 2 : params[:category]
    if cookies[:user_id].nil?
      redirect_to "/logins?last_url=#{Constant::SERVER_PATH}/similarities?category=#{category_id}"
      return false
    end
    #设置考试试卷
    papers_arr=[]
    Examination.find(params[:id]).papers.each do |paper|
      papers_arr << paper
    end
    if papers_arr.length>0
      @paper = papers_arr.sample
      @exam_user = ExamUser.find_by_sql("select * from exam_users where user_id = #{cookies[:user_id]} and examination_id = #{params[:id]} and paper_id = #{@paper.id}")[0]
      if @exam_user.nil?
        @exam_user = ExamUser.create(:user_id=>cookies[:user_id],:examination_id=>params[:id],:paper_id=>@paper.id)
      end
      redirect_to "/exam_users/#{@exam_user.id}?category=#{category_id}&type=similarities"
    else
      flash[:notice]="当前考试未指定试卷"
      redirect_to request.referer
    end
  end

end
