# encoding: utf-8
namespace :send do
  desc "send message"
  task(:message => :environment) do
    include Oauth2Helper
    Oauth2Helper.send_message_kaixin("131182536_d08e03c4cf669dfeb4d68c5be628de70","想一想你")
  end
end
