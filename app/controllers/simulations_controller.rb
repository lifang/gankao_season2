# encoding: utf-8
class SimulationsController < ApplicationController
  layout "application", :except => ['show', 'show_result']
  before_filter :sign?, :except => "index"
  
  def index
    sql = "select e.* from examinations e
          where e.is_published = #{Examination::IS_PUBLISHED[:ALREADY]}
          and e.types = #{Examination::TYPES[:SIMULATION]} and e.status != #{Examination::STATUS[:CLOSED]}
          and e.category_id = ? "
    @simulations = Examination.find_by_sql([sql, params[:category].to_i])
    examination_ids = []
    @exam_user_hash = {}
    if cookies[:user_id]
      @simulations.each { |sim| examination_ids << sim.id }
      exam_users = ExamUser.find_by_sql(
        ["select eu.id, eu.examination_id, eu.is_submited, eu.total_score from exam_users eu where eu.user_id = ?
      and eu.examination_id in (?)", cookies[:user_id].to_i, examination_ids])
      exam_users.each { |eu| @exam_user_hash[eu.examination_id] = eu }
    end
  end

  def do_exam
    @exam_user = ExamUser.find_by_examination_id_and_user_id(params[:id].to_i, cookies[:user_id].to_i)
    @exam_user = ExamUser.create(:user_id => cookies[:user_id].to_i,:examination_id => params[:id].to_i,
      :password => User::DEFAULT_PASSWORD, :is_user_affiremed => ExamUser::IS_USER_AFFIREMED[:YES]) if @exam_user.nil?
    arr = ExamUser.can_answer(cookies[:user_id].to_i, params[:id].to_i)
    if arr[0] == "" and arr[1].any?
      redirect_to "/simulations/#{@exam_user.id}"
    else
      flash[:warn] = arr[0]
      redirect_to request.referer
    end
  end

  def show
    @exam_user = ExamUser.find_by_id(params[:id].to_i)
    if @exam_user
      @examination = Examination.find_by_id(@exam_user.examination_id)
      @exam_user.set_paper(@examination) if @exam_user.paper_id.nil?
      if @exam_user.paper_id
        @paper_url = "#{Constant::BACK_SERVER_PATH}#{@exam_user.paper.paper_js_url}"
        @exam_user.update_info_for_join_exam if @exam_user.started_at.nil? or @exam_user.started_at == ""
        render :layout => "simulations"
      else
        flash[:warn] = "试卷加载错误，请您重新尝试。"
        redirect_to "/simulations?category=#{@examination.category_id}"
      end
    else
      flash[:warn] = "试卷加载错误，请您重新尝试。"
      redirect_to "/simulations?category=#{@examination.category_id}"
    end
  end

  def show_result
    @exam_user = ExamUser.find_by_id(params[:id].to_i)
    if @exam_user
      @examination = Examination.find_by_id(@exam_user.examination_id)
      if @exam_user.paper_id
        @paper_url = "#{Constant::BACK_SERVER_PATH}#{@exam_user.paper.paper_js_url}"
        @answer_url = @paper_url.gsub("paperjs", "answerjs")
        render :layout => "result"
      else
        flash[:warn] = "试卷加载错误，请您重新尝试。"
        redirect_to "/simulations?category=#{@examination.category_id}"
      end
    else
      flash[:warn] = "试卷加载错误，请您重新尝试。"
      redirect_to "/simulations?category=#{@examination.category_id}"
    end
  end

  def get_exam_time
    text = return_exam_time(params[:id].to_i, cookies[:user_id].to_i)
    render :text => text
  end

  def return_exam_time(examnation_id, user_id)
    text = ""
    @examination = Examination.find(examnation_id)
    @exam_user = ExamUser.find_by_examination_id_and_user_id(@examination.id, user_id)
    if @exam_user
      end_time = (@exam_user.ended_at - Time.now) unless @exam_user.ended_at.nil? or @exam_user.ended_at == ""
    end
    if end_time.nil? or end_time == ""
      text = "不限时"
    elsif end_time > 0
      text = end_time
    else
      text = 0.1
    end
    return text
  end

  def five_min_save
    unless params[:arr].nil? or params[:arr] == ""
      @exam_user = ExamUser.find_by_examination_id_and_user_id(params[:id].to_i, cookies[:user_id].to_i)
      questions = params[:arr].split(",")
      question_hash = {}
      0.step(questions.length-1, 3) do |i|
        question_hash[questions[i]] = [questions[i+1], questions[i+2]]
      end if questions.any?
      str=@exam_user.update_answer_url(@exam_user.open_xml, question_hash)
      @exam_user.generate_answer_sheet_url(str, "result")
    end
    render :text => ""
  end

  def save_result
    @exam_user = ExamUser.find_by_examination_id_and_user_id(params[:id].to_i, cookies[:user_id].to_i)
    if @exam_user and (@exam_user.is_submited.nil? or @exam_user.is_submited == false)
      question_hash = {}
      question_ids = params[:all_quesiton_ids].split(",") if params[:all_quesiton_ids]
      question_ids.each do |question_id|
        question_hash[question_id] = [params["answer_" + question_id], "1"]
      end if question_ids
      @exam_user.generate_answer_sheet_url(
        @exam_user.update_answer_url(@exam_user.open_xml, question_hash, params[:block_ids]), "result")
      @exam_user.submited!
      action_log = ActionLog.find(:first, 
        :conditions => ["category_id = ? and types = ? and TO_DAYS(NOW())-TO_DAYS(created_at)=0 and user_id = ?",
          params[:category_id].to_i, ActionLog::TYPES[:EXAM], cookies[:user_id].to_i])
      if action_log
        action_log.increment!(:total_num, 1)
      else
        ActionLog.create(:user_id => cookies[:user_id].to_i, :types => ActionLog::TYPES[:EXAM],
          :category_id => params[:category_id].to_i, :created_at => Time.now.to_date, :total_num => 1)
      end
      flash[:notice] = "您的试卷已经成功提交。"
      render :layout => "simulations"
    else
      flash[:warn] = "您已经交卷。"
      render "error_page", :layout => "simulations"
    end
  end

  def cancel_exam
    @exam_user = ExamUser.find_by_examination_id_and_user_id(params[:id].to_i, cookies[:user_id].to_i)
    @exam_user.destroy
    render :update do |page|
      page.replace_html "remote_div" , :text => ""
    end
  end
  
end
