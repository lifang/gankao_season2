# encoding: utf-8
class Paper < ActiveRecord::Base

  require 'rexml/document'
  include REXML
  
  has_many :examination_paper_relations,:dependent=>:destroy
  has_many :examinations, :through=>:examination_paper_realations, :source => :examination

  default_scope :order => "papers.created_at desc"


end
