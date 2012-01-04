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
    @exam_users = ExamUser.find_by_sql(["select eu.examination_id, eu.is_submited from exam_users eu where eu.user_id = ?
      and eu.examination_id in (?)", cookies[:user_id], examination_ids])
    @exam_users.each { |eu| @exam_user_hash[eu.examination_id] = eu.is_submited }
  end

  def join
    puts "----------------------------------------"
    puts params[:category]
    puts params[:id]
    puts cookies[:user_id]
    
  end

end
