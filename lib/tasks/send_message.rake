# encoding: utf-8
namespace :send do
  desc "send message"
  require 'net/https'
  require 'uri'
  require 'open-uri'
  task(:message => :environment) do
    i=0
 
    (0..10).each do |i|
      puts "ddddddd --#{Time.now}"
      sleep 2
    end
    #    send_message_qq("等待你走向大众的日子，朋友和微博一起来吧！--#{Time.now}","25D9D224988859EB546CA27DB26F21A3","9859909C27F26B8749D5D30B79570AC1",1)
  end
end
