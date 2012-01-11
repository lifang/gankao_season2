#encoding: utf-8
class ExamRater < ActiveRecord::Base
  require 'rexml/document'
  include REXML
  has_many :rater_user_relations,:dependent => :destroy
  has_many :exam_users, :through=>:rater_user_relations, :foreign_key => "exam_user_id"
  belongs_to :examination


  #选择批阅试卷
  def self.get_paper(examination)
    #    if examination==Constant::EXAMINATION.to_i
    #      exam_users=ExamUser.find_by_sql("select e.id exam_user_id, r.id relation_id, r.is_marked ,
    #    r.exam_rater_id from exam_users e left join rater_user_relations r on r.exam_user_id= e.id
    #    where e.examination_id=#{examination} and e.answer_sheet_url is not null and e.is_submited=1#")
    #    else
    exam_users=ExamUser.find_by_sql("select e.id exam_user_id, r.id relation_id, r.is_marked ,
        r.exam_rater_id from exam_users e inner join orders o on o.user_id = e.user_id
        left join rater_user_relations r   on r.exam_user_id= e.id
        where e.examination_id=#{examination} and e.answer_sheet_url is not null and e.is_submited=1")
    return exam_users
  end


  #筛选题目
  def self.answer_questions(xml,doc)
    xml.elements["blocks"].each_element do  |block|
      block.elements["problems"].each_element do |problem|
        problem.elements["questions"].each_element do |question|
          element=doc.elements["paper/questions/question[@id=#{question.attributes["id"]}]"]
          if question.attributes["correct_type"].to_i ==Question::CORRECT_TYPE[:CHARACTER] or
              question.attributes["correct_type"].to_i == Question::CORRECT_TYPE[:SINGLE_CALK]
            answer = (element.nil? or element.elements["answer"].nil? or element.elements["answer"].text.nil?) ? "": element.elements["answer"].text
            question.add_attribute("user_answer","#{answer}")
          else
            problem.delete_element(question.xpath)
          end
        end unless problem.elements["questions"].nil?
        block.delete_element(problem.xpath) if problem.elements["questions"].nil? or
          problem.elements["questions"].elements.size <= 0
      end unless block.elements["problems"].nil?
      if block.elements["problems"].nil? or block.elements["problems"].elements.size<=0
        xml.delete_element(block.xpath)
      end
    end unless xml.elements["blocks"].nil?
    return [xml.get_elements("/paper/blocks//problems//problem"),xml.elements["base_info/title"]]
  end

end
