# encoding: utf-8
class SpecialsController < ApplicationController
  
  def index
    category_id = "#{params[:category]}"=="" ? 2 : params[:category]
    @category = Category.find_by_id(category_id.to_i)
    @title="#{@category.name}真题专项训练"
    @meta_keywords="#{@category.name}真题打包下载"
    @meta_description="将2006年12月至今所有#{@category.name}真题，并按照听力、阅读、翻译、完形等专项汇编，以便进行有针对性的训练。提供在线听力录音，在线答题，实时核对，完整的解析和相关词汇表。"
    @specials = Examination.paginate_by_sql(["select e.id, t.name, e.id examination_id, etr.id etr_id
        from examination_tag_relations etr
        inner join examinations e on e.id = etr.examination_id
        inner join tags t on t.id = etr.tag_id where e.types = ? and e.status = ? and e.category_id = ?",
        Examination::TYPES[:SPECIAL], Examination::STATUS[:GOING], params[:category].to_i],
      :per_page => 10, :page => params[:page])
    special_ids = []
    @exam_user_hash = {}
    @specials.each { |sim| special_ids << sim.id }
    @exam_users = ExamUser.find_by_sql(["select id, examination_id, is_submited, answer_sheet_url from exam_users where user_id = ?
      and examination_id in (?)", cookies[:user_id].to_i, special_ids])
    @exam_users.each { |eu| @exam_user_hash[eu.examination_id] = [eu.id,eu.is_submited,eu.answer_sheet_url] }
  end


  def join
    category_id = "#{params[:category]}"=="" ? 2 : params[:category]
    if cookies[:user_id].nil?
      redirect_to "/logins?last_url=#{Constant::SERVER_PATH}/specials?category=#{category_id}"
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
      redirect_to "/exam_users/#{@exam_user.id}?category=#{category_id}&type=specials"
    else
      flash[:notice]="当前考试未指定试卷"
      redirect_to request.referer
    end
  end

end
