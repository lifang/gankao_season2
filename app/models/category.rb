#encoding: utf-8
class Category < ActiveRecord::Base
#  has_many :problems
#  has_many :papers
#  has_many :examinations
  has_many :category_manages
  has_one :study_plan
  has_many :notices
  has_many :words
  #判断分类是否存在
  FAURTH = 2
  SIXTH = 3
  TYPES = {"2" => "english_fourth_level", "3" => "english_sixth_level"}   # :FOURTH_LEVEL 四级； :SIXTH_LEVEL 六级
  TYPE_IDS = {:english_fourth_level => 2, :english_sixth_level => 3} # :FOURTH_LEVEL 四级； :SIXTH_LEVEL 六级
  NAME = {"2" =>"英语四级", "3"=>"英语六级"}


end