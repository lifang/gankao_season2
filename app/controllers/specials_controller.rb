# encoding: utf-8
class SpecialsController < ApplicationController
  
  def index
    @specials = Examination.paginate_by_sql(["select t.name, e.id examination_id, etr.id etr_id
        from examination_tag_relations etr
        inner join examinations e on e.id = etr.examination_id
        inner join tags t on t.id = etr.tag_id where e.types = ? and e.status = ? and e.category_id = ?",
        Examination::TYPES[:SPECIAL], Examination::STATUS[:GOING], params[:category].to_i],
      :per_page => 10, :page => params[:page])
    special_ids = []
    @exam_user_hash = {}
    @specials.each { |sim| special_ids << sim.id }
    @exam_users = ExamUser.find_by_sql(["select eu.examination_id, eu.is_submited from exam_users eu where eu.user_id = ?
      and eu.examination_id in (?)", cookies[:user_id].to_i, special_ids])
    @exam_users.each { |eu| @exam_user_hash[eu.examination_id] = eu.is_submited }
  end

end
