GankaoSeason2::Application.routes.draw do
  # The priority is based upon order of creation:
  # first created -> highest priority.

  # Sample of regular route:
  #   match 'products/:id' => 'catalog#view'
  # Keep in mind you can assign values other than :controller and :action

  # Sample of named route:
  #   match 'products/:id/purchase' => 'catalog#purchase', :as => :purchase
  # This route can be invoked with purchase_url(:id => product.id)

  # Sample resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  get "/gankao/index"

  resources :exam_raters do
    collection do
      get :session,:check_paper,:log_out
      post :over_answer
    end
    member do
      post "edit_value"
      get "rater_session","get_score"
      post "rater_login"
      get "reader_papers","answer_paper"
    end
  end
  
  resources :collections do
    collection do
      post :load_words,:write_file, :add_collection, :update_collection,:get_collections,:delete_problem
      get :error,:index1,:ajax_load_problems, :not_vip
    end
  end
  resources :similarities do
    member do
      get :join
    end
  end

  resources :study_plans do
    collection do
      get :done_plans,:renren,:plan_renren
      post :plan_status,:check_task, :join
    end
    member do
      get :action_link
    end
  end
  resources :exam_users do
    collection do
      post :ajax_load_about_words,:ajax_report_error,:ajax_add_collect,:ajax_add_word,:ajax_load_sheets
      get :preview
    end
    member do
      post :ajax_save_question_answer,:ajax_change_status
      get :show_js,:redo_paper
    end
  end
  resources :logins do
    collection do
      get :friend_add_request,:renren_like,:add_user,:charge_vip
      get :follow_me,:login_from_qq,:qq_index,:get_code,:user_code,:logout
      get :request_qq,:respond_qq,:request_sina,:respond_sina,:manage_sina,:watch_weibo,:respond_weibo,:request_renren,:respond_renren
      post :manage_qq,:add_watch_weibo
      get :request_kaixin,:respond_kaixin
      get :request_baidu,:respond_baidu
    end
  end
  resources :specials do
    member do
      get :join
    end
  end
  resources :simulations do
    member do
      get 'do_exam', 'show_result', 'reset_exam', 'end_exam'
      post 'get_exam_time', 'five_min_save', 'save_result', 'cancel_exam'
    end
    collection do
      get 'goto_exam'
    end
  end
  resources :words do
    collection do
      get 'recite_word', 'recollection', 'use', 'hand_man',"renren"
      post 'word_log'
    end
  end
  resources :users do
    collection do
      get :delete_user,:email_info,:mess_info,:record_info,:record,:alipay_exercise,:charge_vip,:renren
      post :delete_mess,:update_users,:alipay_compete,:accredit_check,:check_vip,:ajax_send_fankui
    end
    member do
      get :info,:record
    end
  end

  resources :gankao do
    collection do
      get :goto_plan
    end
  end
  # Sample resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Sample resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Sample resource route with more complex sub-resources
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', :on => :collection
  #     end
  #   end

  # Sample resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end

  # You can have the root of your site routed with "root"
  # just remember to delete public/index.html.
  root :to => 'gankao#index'

  # See how all your routes lay out with "rake routes"

  # This is a legacy wild controller route that's not recommended for RESTful applications.
  # Note: This route will make all actions in every controller accessible via GET requests.
  # match ':controller(/:action(/:id(.:format)))'
end
