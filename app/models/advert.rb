# encoding: utf-8
class Advert < ActiveRecord::Base
  belongs_to :region

  def self.ip_advert(ips)
    true_ip=0
    ips.split(".").each_with_index {|ip,index|  true_ip +=(ip.to_i)*(256**(3-index))}
    return true_ip.to_s(2)
  end
end