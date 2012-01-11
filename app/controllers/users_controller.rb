# encoding: utf-8
class UsersController < ApplicationController
 layout 'user'
  def delete_user
    cookies.delete(:user_id)
    cookies.delete(:user_name)
    redirect_to "/"
  end

  def show
    
  end

  def info
    @email=Notice.find_by_sql("select * from notices where send_types=#{Notice::SEND_TYPE[:SINGLE]} and target_id=#{cookies[:user_id]}")
    @mess=Notice.find_by_sql("select * from notices where send_types=#{Notice::SEND_TYPE[:SYSTEM]} and TO_DAYS(ended_at)>TO_DAYS('#{Time.now}')")
  end


  def record
    ay_sql = "(select o.created_at created_at, c.name name, o.remark remark, o.total_price total_price from orders o
           left join categories c on c.id = o.category_id
           where o.user_id = ?)
           union
           (select co.created_at created_at, ca.name name, co.remark remark, co.price total_price from competes co
           left join categories ca on ca.id = co.category_id
           where co.user_id = ? ) order by created_at desc "
    return Order.paginate_by_sql([pay_sql, self.id, self.id], :per_page => 10, :page => page)
  end
end
