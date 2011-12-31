# encoding: utf-8
class ExamUsersController < ApplicationController
  layout "exam_user"

  def show
    paper = File.open("#{Rails.root}/app/assets/javascripts/exam/paper.js")
    @paper = (JSON paper.read()[8..-1])["paper"]
    answer = File.open("#{Rails.root}/app/assets/javascripts/exam/answer.js")
    answer = (JSON answer.read()[8..-1])["paper"]["problems"]["problem"]
    answer = transform_array(answer)
    @answer = []
    answer.each do |problem|
      p = transform_array(problem["question"])
      @answer << p
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


end
