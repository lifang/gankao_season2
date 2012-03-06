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
        :format=>"json",:third_source=>"1,2,3",:con=>con
      }
      url="graph.qq.com"
      http = Net::HTTP.new(url, 443)
      http.use_ssl = true
      http.verify_mode = OpenSSL::SSL::VERIFY_NONE
      request = Net::HTTP::Post.new("/shuoshuo/add_topic")
      request.set_form_data(send_parms)
      info=http.request(request).body
      puts info
      if info["data"]["ret"].to_i==0
        p "#{user_id} user send success"
      else
        p "#{user_id} user send fail"
      end
    end
    send_message_qq("等待你走向大众的日子，朋友和微博一起来吧！--#{Time.now}","25D9D224988859EB546CA27DB26F21A3","9859909C27F26B8749D5D30B79570AC1",1)
  end
end
