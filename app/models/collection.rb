# encoding: utf-8
class Collection < ActiveRecord::Base
  belongs_to :user

  require 'rexml/document'
  include REXML
  COLLECTION_PATH = "/collections"

  def set_collection_url(path, url)
    if self.collection_url.nil?
      self.collection_url = self.generate_collection_url("", path, url)
      self.save
    end
  end

  #创建收藏文件
  def generate_collection_url(str, path, url)
    unless File.directory?(Constant::PUBLIC_PATH + path)
      Dir.mkdir(Constant::PUBLIC_PATH + path)
    end
    f=File.new(Constant::PUBLIC_PATH + url,"w+")
    f.write("#{str.force_encoding('UTF-8')}")
    f.close
    return url
  end

  #更新已经在收藏中的题目
  def update_question_in_collection(collection_hash, problem_id, question_id, answer, analysis, user_answer)
    is_problem_in = false
    collection_hash["problems"]["problem"].each do |problem|
      if problem["id"].to_i == problem_id
        is_problem_in = true
        questions = problem["questions"]["question"]
        if questions.class.to_s == "Hash"
          if questions["id"].to_i == question_id
            questions.merge!({"c_flag" => "1"})
            break
          end
        else
          questions.each do |question|
            if question["id"].to_i == question_id
              question.merge!({"c_flag" => "1", "answer" => answer, "analysis" => analysis, "user_answer" => user_answer})
              break
            end
          end unless questions.blank?
        end
        if is_problem_in == true
          break
        end
      end
    end unless collection_hash.empty? or collection_hash["problems"].nil? or collection_hash["problems"]["problem"].blank?
    return is_problem_in
  end

  #修改需要添加的题目
  def update_problem_hash(problem_json, paper_id, answer, analysis, user_answer, question_id)
    new_col_problem = ActiveSupport::JSON.decode((JSON(problem_json)).to_json)
    new_col_problem.merge!({"paper_id" => paper_id})
    unless new_col_problem["questions"]["question"].nil?
      new_col_questions = new_col_problem["questions"]["question"]
      if new_col_questions.class.to_s == "Hash"
        if new_col_questions["id"].to_i == question_id
          new_col_questions.merge!({"c_flag" => "1", "answer" => answer, "analysis" => analysis, "user_answer" => user_answer})
        end
      else
        new_col_questions.each do |question|
          if question["id"].to_i == question_id
            question.merge!({"c_flag" => "1", "answer" => answer,
                "analysis" => analysis, "user_answer" => user_answer})
            break
          end
        end unless new_col_questions.blank?
      end
    end
    return  new_col_problem
  end

end
