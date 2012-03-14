# encoding: utf-8
class Advert < ActiveRecord::Base
  belongs_to :region

  def self.ip_advert(ips)
    true_ip=0
    ips.split(".").each_with_index {|ip,index|  true_ip +=(ip.to_i)*(256**(3-index))}
    ip=true_ip.to_s(2)
    ip_t=IpTable.first(:conditions=>["start_at<=? and end_at >= ?",ip,ip])
    sql="select a.content from adverts a inner join regions r on r.id=a.region_id where 1=1"
    unless ip_t.nil?
      sql += " and r.name='#{ip_t.city_name}' order by a.created_at desc "
    else
      sql += " order by a.created_at desc  limit 5"
    end
    return Advert.find_by_sql(sql)
    return 
  end
end