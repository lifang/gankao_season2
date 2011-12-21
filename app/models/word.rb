#encoding: utf-8
class Word < ActiveRecord::Base
  require 'net/https'
  require 'uri'
  require 'mechanize'
  require 'hpricot'
  require 'open-uri'
  require 'rubygems'
  require 'fileutils'
  require 'rexml/document'
  include REXML
  
  belongs_to :category
  has_many :word_sentences
  has_many :word_question_relations,:dependent=>:destroy
  has_many :questions,:through=>:word_question_relations, :source => :question
  has_many :word_discriminate_relations,:dependent => :destroy
  has_many :discriminates,:through=>:word_discriminate_relations, :source => :discriminate  

  TYPES = {0 => "n.", 1 => "v.", 2 => "pron.", 3 => "adj.", 4 => "adv.",
    5 => "num.", 6 => "art.", 7 => "prep.", 8 => "conj.", 9 => "interj.", 10 => "u = ", 11 => "c = ", 12 => "pl = "}
  #英语单词词性 名词 动词 代词 形容词 副词 数词 冠词 介词 连词 感叹词 不可数名词 可数名词 复数
  LEVEL = {1 => "一", 2 => "二", 3 => "三", 4 => "四", 5 => "五", 6 => "六",
    7 => "七", 8 => "八", 9 => "九", 10 => "十"}  #单词的等级
  
end
