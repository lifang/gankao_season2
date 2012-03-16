# encoding: utf-8
namespace :iptables do
  desc "exam_user notice task"
  task(:set => :environment) do
    lim = 4000
    (0..100).to_a.each do |i|
      iptables = IpTable.find_by_sql(["select * from ip_tables i where city limit #{lim}, #{lim * i}"])
      unless iptables.blank?
        iptables.each do |ip|
          p_arr = ip.city.split("省")
          if p_arr.length > 0
            ip.province_name = p_arr[0] + "省"
            ip.city_name = (p_arr[1].split("市") > 0) ? (p_arr[1].split("市")[0] + "市") : p_arr[1]
          else
            ip.province_name = ip.city
          end
          ip.save
        end
      end
    end
  end
end