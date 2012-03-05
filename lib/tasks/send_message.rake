# encoding: utf-8
namespace :send do
  desc "send message"
  require 'net/https'
  require 'uri'
  require 'open-uri'
  task(:message => :environment) do
    #qq添加说说
    def send_message_qq(con,openid,access_token,user_id)
      send_parms={
        :access_token=>access_token,:openid=>openid,:oauth_consumer_key=>Oauth2Helper::APPID,
        :format=>"json",:third_source=>1,:con=>con
      }
      url="graph.qq.com"
      http = Net::HTTP.new(url, 443)
      http.use_ssl = true
      http.verify_mode = OpenSSL::SSL::VERIFY_NONE
      request = Net::HTTP::Post.new("/shuoshuo/add_topic")
      request.set_form_data(send_parms)
      info=http.request(request).body
      puts info
      if info["ret"]==0
        p "#{user_id} user send success"
      else
        p "#{user_id} user send fail"
      end
    end
    send_message_qq("这是测试的自动程序，请勿回复--#{Time.now}","9F19372D2446F73D30468056BECCE7C6","032C7D6BB31950A28397E637ECED413E",1)
  end
end
