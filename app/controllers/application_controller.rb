class ApplicationController < ActionController::Base
  protect_from_forgery
  include Constant
  include ApplicationHelper
  require 'rexml/document'
  include REXML

  def open_file(url)
    file=File.open(url)
    doc=Document.new(file).root
    file.close
    return doc
  end


  def write_xml(url,doc)
    file = File.new(url, File::CREAT|File::TRUNC|File::RDWR, 0644)
    file.write(doc)
    file.close
  end

  def sign?
    deny_access unless signed_in?
  end

end
