#encoding: utf-8
class User < ActiveRecord::Base
  has_many :user_role_relations,:dependent=>:destroy
  has_many :roles,:through=>:user_role_relations,:foreign_key=>"role_id"
  has_many :category_manages,:dependent=>:destroy
  has_one :user_action_log
  has_many :user_plan_relations,:dependent => :destroy
  has_many :study_plans,:through=>:user_plan_relations, :source => :study_plan
  has_many :send_notices, :foreign_key => "send_id", :source => :notice
  has_many :recive_notices, :foreign_key => "target_id", :source => :notice
  has_many :collections
  has_one :user_word_relation
  has_many :feedbacks

  attr_accessor :password
  validates:password, :confirmation=>true,:length=>{:within=>6..20}, :allow_nil => true

  FROM = {"sina" => "新浪微博", "renren" => "人人网", "qq" => "腾讯网"}
  TIME_SORT = {:ASC => 0, :DESC => 1}   #用户列表按创建时间正序倒序排列

  DEFAULT_PASSWORD = "123456"


  def has_password?(submitted_password)
		encrypted_password == encrypt(submitted_password)
	end
  
  def encrypt_password
    self.encrypted_password=encrypt(password)
  end

  private
  def encrypt(string)
    self.salt = make_salt if new_record?
    secure_hash("#{salt}--#{string}")
  end

  def make_salt
    secure_hash("#{Time.new.utc}--#{password}")
  end

  def secure_hash(string)
    Digest::SHA2.hexdigest(string)
  end

end

