# encoding: utf-8
class Collection < ActiveRecord::Base
  belongs_to :user

  require 'rexml/document'
  include REXML
  COLLECTION_PATH = "/collections"

  def set_collection_url(path, url)
    if self.collection_url.nil?
      self.collection_url = self.generate_collection_url("", path, url)
      self.save
    end
  end

  #创建收藏文件
  def generate_collection_url(str, path, url)
    unless File.directory?(Constant::FRONT_PUBLIC_PATH + path)
      Dir.mkdir(Constant::FRONT_PUBLIC_PATH + path)
    end
    f=File.new(Constant::FRONT_PUBLIC_PATH + url,"w+")
    f.chmod(0777)
    f.write("#{str.force_encoding('UTF-8')}")
    f.close
    return url
  end

  def open_xml
    dir = "#{Rails.root}/public"
    file=File.open(dir + self.collection_url)
    doc=Document.new(file)
    file.close
    return doc
  end

  #添加题目xml
  def add_problem(doc, problem_xml)
    str = doc.to_s.split("<problems/>")
    if doc.elements["collection"].elements["problems"].children.blank?
      doc = str[0] + "<problems>" + problem_xml + "</problems>" + str[1]
    else
      str = doc.to_s.split("</problems>")
      doc = str[0] + problem_xml + "</problems>" + str[1] if str[1]
    end
    return doc
  end

  #删除试题
  def delete_problem(problem_id, doc)
    doc.delete_element("/collection/problems/problem[@id='#{problem_id}']") if doc.elements["/collection/problems/problem[@id='#{problem_id}']"]
    return doc
  end

  #查询试题
  def search(doc, tag, category)
    doc.root.elements["problems"].each_element do |problem|
      if problem.elements["category"].text.to_i != category.to_i
        doc.delete_element(problem.xpath)
      end
    end unless category.nil? or category == ""
    unless tag.nil? or tag == ""
      tags = tag.strip.split(" ")
      doc.root.elements["problems"].each_element do |problem|
        is_include = false
        problem.elements["questions"].each_element do |question|
          if !question.elements["tags"].nil? and !question.elements["tags"].text.nil? and question.elements["tags"].text != ""
            question_tag = question.elements["tags"].text.split(" ")
            tags.each { |t| is_include = true  if question_tag.include?(t) }
          end
          break if is_include
        end
        if is_include == false
          doc.delete_element(problem.xpath)
        end
      end
    end
    return doc
  end

  #当前题目是否已经收藏到错题集
  def problem_in_collection(problem_id, collection_doc)
    problem = collection_doc.elements["collection"].elements["problems"].elements["problem[@id='#{problem_id}']"]
    return problem
  end
  
  #当前题点是否已经收藏到错题集
  def question_in_collection(problem, question_id)
    question = problem.elements["questions"].elements["question[@id='#{question_id}']"]
    return question
  end

  #更新当前提点的答案
  def update_question(answer_text, question_path, collection_xml)
    que = collection_xml.elements[question_path]
    if que.elements["user_answer"]
      true_num = (((que.attributes["error_percent"].to_i.to_f)/100) * (que.attributes["repeat_num"].to_i)).round
      que.attributes["repeat_num"] = que.attributes["repeat_num"].to_i + 1
      que.attributes["error_percent"] = ((true_num.to_f/(que.attributes["repeat_num"].to_i))*100).round
    else
      que.add_attribute("repeat_num", "1")
      que.add_attribute("error_percent", "0")
    end
    que.add_element("user_answer").add_text("#{answer_text}")
    return collection_xml
    #    self.generate_collection_url(collection_xml.to_s, Constant::FRONT_PUBLIC_PATH, self.collection_url)
  end
  
  #如果当前题目有题点已经收藏过，就只收藏题点
  def add_question(question, answer_text, collection_problem, collection_xml)
    question.add_element("user_answer").add_text("#{answer_text}")
    question.add_attribute("repeat_num", "1")
    question.add_attribute("error_percent", "0")
    questions = collection_xml.elements["#{collection_problem.xpath}/questions"]
    questions.elements.add(question)
    return collection_xml
    #    self.generate_collection_url(collection_xml.to_s, Constant::FRONT_PUBLIC_PATH, self.collection_url)
  end

  #如果当前题目没有做过笔记，则将题目加入到笔记
  def auto_add_problem(paper_xml, question_id, problem_path, answer_text, collection_xml)
    paper_problem = paper_xml.elements["#{problem_path}"]
    paper_problem.elements["questions"].each_element do |question|
      if question.attributes["id"].to_i != question_id.to_i
        paper_xml.delete_element(question.xpath)
      end
    end if paper_problem
    add_audio_to_title(paper_xml, paper_problem)
    last_question = paper_problem.elements["questions"].elements["question[@id='#{question_id.to_i}']"]
    last_question.add_element("user_answer").add_text("#{answer_text}")
    last_question.add_attribute("repeat_num", "1")
    last_question.add_attribute("error_percent", "0")
    collection_xml.elements["/collection/problems"].elements.add(paper_problem)
    return collection_xml
    #    self.generate_collection_url(collection_xml.to_s, Constant::FRONT_PUBLIC_PATH, self.collection_url)
  end

  #根据问题的路径取出block中的音频文件
  def add_audio_to_title(paper_xml, problem)
    block_audio = ""
    block_path = problem.xpath.split("/problems")[0]
    block = paper_xml.elements["#{block_path}"]
    if !block.nil? and !block.elements["base_info"].elements["description"].nil? and
        block.elements["base_info"].elements["description"].text.to_s.html_safe =~ /<mp3>/
      block_audio = block.elements["base_info"].elements["description"].text.to_s.html_safe.split("<mp3>")[1]
      unless problem.elements["title"].nil?
        problem.elements["title"].text = problem.elements["title"].text + "<mp3>" + block_audio + "<mp3>"
      else
        problem.add_element("title").add_text("<mp3>#{block_audio}<mp3>")
      end
    end
  end

  #自动阅卷保存错题
  def self.auto_add_collection(answer_xml, paper_xml, user_id)
    collection = Collection.find_or_create_by_user_id(user_id)
    path = COLLECTION_PATH + "/" + Time.now.to_date.to_s
    url = path + "/#{collection.id}.js"
    collection.set_collection_url(path, url)
    already_hash = {}
    last_problems = ""
    file = File.open(Constant::FRONT_PUBLIC_PATH + collection.collection_url)
    last_problems = file.readlines.join
    unless last_problems == ""
      already_hash = ActiveSupport::JSON.decode((JSON(last_problems.gsub("collections = ", ""))).to_json)
    end
    file.close

    collection_xml = Document.new("<collection><problems></problems></collection>")
    answer_questions = answer_xml.elements["exam"].elements["paper"].elements["questions"]
    paper_xml.root.elements["blocks"].each_element do |block|
      block.elements["problems"].each_element do |problem|
        problem.elements["questions"].each_element do |question|
          if question.attributes["correct_type"].to_i != Problem::QUESTION_TYPE[:CHARACTER] and
              question.attributes["correct_type"].to_i != Problem::QUESTION_TYPE[:SINGLE_CALK]
            answer_question = answer_questions.elements["question[@id='#{question.attributes["id"]}']"]
            if answer_question.nil? or (answer_question.attributes["score"].to_f != question.attributes["score"].to_f)
              collection_problem = collection.problem_in_collection(problem.attributes["id"], collection_xml)
              answer = (answer_question.nil? or answer_question.elements["answer"].nil?) ? ""
              : answer_question.elements["answer"].text
              if collection_problem
                collection_question = collection.question_in_collection(collection_problem, question.attributes["id"])
                if collection_question
                  collection_xml = collection.update_question(answer, collection_question.xpath, collection_xml)
                else
                  collection_xml = collection.add_question(question, answer, collection_problem, collection_xml)
                end
              else
                collection_xml = collection.auto_add_problem(paper_xml, question.attributes["id"], problem.xpath,
                  answer, collection_xml)
              end
            end
          end
        end unless problem.elements["questions"].nil?
      end
    end
    problem_arr = (Hash.from_xml(collection_xml.to_s))["collection"]["problems"]["problem"]
    unless already_hash.empty?
      problem_arr.each do |problem|
        unless already_hash["problems"]["problem"].include?(problem)
          already_hash["problems"]["problem"] << problem
        end
      end
    end
    puts already_hash["problems"]["problem"].length
    collection_js = "collections = " + already_hash.to_json.to_s
    path_url = collection.collection_url.split("/")
    collection.generate_collection_url(collection_js, "/" + path_url[1] + "/" + path_url[2], collection.collection_url)
  end

end
