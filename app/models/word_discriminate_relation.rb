#encoding: utf-8
class WordDiscriminateRelation < ActiveRecord::Base
  belongs_to :word
  belongs_to :discriminate
end
