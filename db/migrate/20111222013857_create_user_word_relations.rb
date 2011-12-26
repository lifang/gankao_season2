class CreateUserWordRelations < ActiveRecord::Migration
  def change
    create_table :user_word_relations do |t|

      t.timestamps
    end
  end
end
