# encoding: utf-8
namespace :exam_user do
  desc "exam_user notice task"
  task(:notice => :environment) do
    exam_users = ExamUser.find_by_sql("select eu.id, eu.user_id, ex.title, ex.category_id from exam_users eu
      inner join examinations ex on ex.id = eu.examination_id where eu.ended_at < NOW()
      and eu.is_submited = #{ExamUser::IS_SUBMITED[:NO]} and TO_DAYS(NOW())-TO_DAYS(eu.created_at)=1 ")
    puts "exam_user notice start"
    exam_users.each do |user|
        Notice.create(:category_id => user.category_id, :send_types => Notice::SEND_TYPE[:SYSTEM],
          :send_id => Notice::ADMIN_ID, :target_id => user.user_id, 
          :description => "您参加了#{user.title}，但未正确交卷，这样可能享受不到专业老师的批卷，请您及时处理。")
    end unless exam_users.blank?
    puts "exam_user notice end"
  end
end