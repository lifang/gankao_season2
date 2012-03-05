class ApplicationController < ActionController::Base
  protect_from_forgery
  include Constant
  include ApplicationHelper
  include RemotePaginateHelper
  require 'rexml/document'
  include REXML

  def open_file(url)
    file=File.open(url)
    doc=Document.new(file).root
    file.close
    return doc
  end

  
  # START -------XML文件操作--------require 'rexml/document'----------include REXML----------
  #将XML文件生成document对象
  def get_doc(url)
    file = File.new(url)
    doc = Document.new(file).root
    file.close
    return doc
  end

  #处理XML节点
  #参数解释： element为doc.elements[xpath]产生的对象，content为子内容，attributes为属性
  def manage_element(element, content={}, attributes={})
    content.each do |key, value|
      arr, ele = "#{key}".split("/"), element
      arr.each do |a|
        ele = ele.elements[a].nil? ? ele.add_element(a) : ele.elements[a]
      end
      ele.text.nil? ? ele.add_text("#{value}") : ele.text="#{value}"
    end
    attributes.each do |key, value|
      element.attributes["#{key}"].nil? ? element.add_attribute("#{key}", "#{value}") : element.attributes["#{key}"] = "#{value}"
    end
    return element
  end

  #将document对象生成xml文件
  def write_xml(doc, url)
    file = File.new(url, File::CREAT|File::TRUNC|File::RDWR, 0644)
    file.write(doc.to_s)
    file.close
  end

  # END -------XML文件操作----------
    
  def sign?
    deny_access unless signed_in?
  end

  def close_file(url)
    file = File.open(url)
    file.close
  end



  # START -------新浪微博API----------
  #主方法
  def sina_api(request)
    uri = URI.parse("https://api.weibo.com")
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.verify_mode = OpenSSL::SSL::VERIFY_NONE
    response = http.request(request).body
  end

  #获取用户信息
  def sina_get_user(access_token,uid)
    request = Net::HTTP::Get.new("/2/users/show.json?access_token=#{access_token}&uid=#{uid}")
    sina_api(request)
  end

  #发送微博
  def sina_send_message(access_token,message)
    request = Net::HTTP::Post.new("/2/statuses/update.json")
    request.set_form_data({"access_token" =>access_token, "status" => message})
    sina_api(request)
  end
  #END -------新浪微博API----------

end