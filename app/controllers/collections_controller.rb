#encoding: utf-8
class CollectionsController < ApplicationController
  layout 'exam_user'
  before_filter :sign?

  def index
      user = User.find(cookies[:user_id])
      @collection_js_url = "#{Constant::SERVER_PATH}#{user.collection.collection_url}"
  end

  def load_words
    load_words={}
    unless params[:words].length==0
      word_sql=""
      params[:words].each do |one_word|
        word_sql +="'#{one_word}',"
      end
      words=Word.find_by_sql("select w.* from words w where w.name in (#{word_sql.chop})")
      words.each do |word|
        words_sentence=WordSentence.find_by_sql("select w.description from word_sentences w where w.word_id=#{word.id}")
        load_words[word.name]=[word,words_sentence]
      end unless words.blank?
    end
    respond_to do |format|
      format.json {
        data={:words=>load_words=={}?[] :load_words}
        render :json=>data
      }
    end
  end

  def write_file
    url="#{Rails.root}/app/assets/javascripts/collections/1.js"
    doc="collections = "+(JSON params[:collecton]).to_json
    write_xml(url,doc)
    render :text=>""
  end

end
