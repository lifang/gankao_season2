#encoding: utf-8
class Discriminate < ActiveRecord::Base
  has_many :word_discriminate_relations,:dependent => :destroy
  has_many :words,:through=>:word_discriminate_relations, :source => :word
end
