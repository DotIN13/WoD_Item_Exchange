// ==UserScript==
// @name         WoD Item Exchange
// @namespace    https://www.wannaexpresso.com
// @version      0.1
// @description  Exchange items among heroes in one view!
// @author       DotIN13
// @include      http*://*.world-of-dungeons.org/wod/spiel/hero/items.php?*
// @include      http*://*.wannaexpresso.com/wod/spiel/hero/items.php?*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var queryData;
    var queryURL;
    if ($('input[name="view"]').val() == "cellar" || $('input[name="view"]').val() == "") {
        window.addEventListener("load", function() {
            $("input[name='ok']").parent().append("<a class='move_item button' href='#'>移动物品</a>", "<div class='move_progress'></div>");
            getSelect();
            $(".move_item").click(function() {
                $(".move_progress").html("开始移动物品。");
                var progress = 0;
                var task = 0;
                $(".send_target").each(function() {
                    if ($(this).val() != 'none')
                        task++;
                })
                $(".send_target").each(function() {
                    if ($(this).val() != 'none')
                    {
                        var target = $(this).val();
                        var params = $(this).parent().siblings().find('a').attr('href').match(/item_instance_id=(\d+)&type=\d&name=([^&]*)/);
                        var data = queryData.replace(/&id=\d+/, "&id=" + params[1]).replace(/&name=[^&]*/, "&name=" + params[2]).replace(/&send_to=[^&]*/, "&send_to=" + target) + "&send_to_exec=√";
                        $(this).parent().parent().remove();
                        $.ajax({
                            type: "POST",
                            url: queryURL,
                            data: data,
                            success: function() {
                                progress++;
                                $(".move_progress").html("已移动" + progress + "/" + task + "个物品。");
                                if (progress == task) {
                                    $(".move_progress").html("已移动全部物品。");
                                }
                            }
                        })
                    }
                })
            })
        });
    }

    function getSelect() {
        $(".move_progress").html("正在获取物品移动下拉菜单...");
        var firstItemURL = null;
        $(".layout_clear .content_table a").each(function(index) {
            firstItemURL = $(this).attr("href");
            if (!$(this).html().match("!")) {
                return false;
            }
        });
        if (firstItemURL) {
            $.ajax({
                type: "GET",
                url: firstItemURL,
            }).done(function(html){
                $('.layout_clear .content_table thead tr.header').add($('.layout_clear .content_table tfoot tr.header')).append("<th>移动物品</th>")
                $(".layout_clear .content_table a").each(function() {
                    if ($(this).html().match("!")) {
                        $(this).parent().parent().append("<td><select class='send_target'> <option value='none'>不移动</option>" + $('select[name="send_to"] optgroup', html).last().prop("outerHTML") + "</select></td>");
                    } else {
                        $(this).parent().parent().append("<td><select class='send_target'> <option value='none'>不移动</option>" + $('select[name="send_to"] optgroup', html).first().prop("outerHTML") + $('select[name="send_to"] optgroup', html).last().prop("outerHTML") + "</select></td>");
                    }
                })
                queryData = $('form', html).serialize();
                queryURL = $('form', html).attr("action");
                $(".move_progress").html("");
            })
        } else {
            $(".move_progress").html("请至少放置一件物品在这间储藏室里。");
        }
    }
})();