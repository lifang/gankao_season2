# encoding: utf-8
module RemotePaginateHelper
  @@pagination_options = {
    :class => 'pagination',
    :prev_label   => '«',
    :next_label   => '»',
    :inner_window => 4, # links around the current page
    :outer_window => 1, # links around beginning and end
    :separator    => ' ', # single space is friendly to spiders and non-graphic browsers
    :param_name   => :page,
    :update => nil, #ajax所要更新的html元素的id
    :suffix => '' ,#url的后缀，主要是为了补全REST所需要的url
    :url_suffix => "",
    :parameters => ""
    #add end
  }
  mattr_reader :pagination_options

  def will_paginate_remote(entries = @entries, p = nil ,options = {})
    total_pages = entries.total_pages
    #:parameters
    if total_pages > 1
      options = options.symbolize_keys.reverse_merge(pagination_options)
      page, param = entries.current_page, options.delete(:param_name)
      inner_window, outer_window = options.delete(:inner_window).to_i, options.delete(:outer_window).to_i
      update =  options.delete(:update)
      suffix =  options.delete(:url_suffix)
      if options[:url].nil?
        url = request.env['PATH_INFO']
      else
        url = options[:url]
        options.delete(:url)
      end
      url += suffix if suffix
      url = url + "?" + p
      min = page - inner_window
      max = page + inner_window
      if max > total_pages then min -= max - total_pages
      elsif min < 1  then max += 1 - min
      end

      current   = min..max
      beginning = 1..(1 + outer_window)
      tail      = (total_pages - outer_window)..total_pages
      visible   = [beginning, current, tail].map(&:to_a).flatten.sort.uniq
      links, prev = [], 0

      visible.each do |n|
        next if n < 1
        break if n > total_pages

        unless n - prev > 1
          prev = n
          text = (n==page ? n : n)
          puts
          links << page_link_remote_or_span((n != page ? n : nil), 'current', text, param, update, url)
        else
          prev = n - 1
          links << '...'
          redo
        end
      end

      links.unshift page_link_remote_or_span(entries.previous_page, 'disabled', options.delete(:prev_label), param, update, url)
      links.push    page_link_remote_or_span(entries.next_page,     'disabled', options.delete(:next_label), param, update, url)

      last_links = content_tag(:div, links.join(options.delete(:separator)), options)
      return last_links.gsub("&lt;", "<").gsub("&gt;", ">").gsub("&quot;", "\"").gsub("&amp;amp;", "\&").html_safe
    end
  end
  protected
  def page_link_remote_or_span(page, span_class, text, param, update, url)
    unless page
      content_tag(:span, text, :class => span_class)
    else
      #link_to_remote text, :update => update, :url => "#{url}?#{param.to_sym}=#{page}", :method=>:get
      link_to "#{text}", "#{url}&#{param.to_sym}=#{page}", :remote => true
    end
  end
end
