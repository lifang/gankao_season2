# encoding: utf-8
class WordsController < ApplicationController
  def index
    @already_recited = Action_log.return_log_by_types({"type" => ActionLog::TYPES[:RECITE],
        "user_id" => cookies[:user_id].to_i})
    @total_count = Word.recite_words
  end
end
