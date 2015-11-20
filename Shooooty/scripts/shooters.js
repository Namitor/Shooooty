function sleep(numberMillis) {
    var now = new Date();
    var exitTime = now.getTime() + numberMillis;
    while (true) {
        now = new Date();
        if (now.getTime() > exitTime)
            return;
    }
}
//

function shoot_bullet(start_right, start_top, content, total_time) {
    var temp_time = new Date().getTime();
    $("body").append("<div class='bullet_item' id='bullet" + temp_time + "'>" + content + "</div>");
    var bullet = $("#bullet" + temp_time);
    bullet.css({
        top: start_top,
        left: window.innerWidth - start_right,
        color: '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16)
    });
    bullet.animate({left: -$(this).width()}, total_time, "linear", function () {
        $(this).remove();
    });
}

function machine_gun(bullets, scroll_time) {
    var last_timestamp = bullets[0].timestamp * 1000;
    for (var i = 0; i < bullets.length; i++) {
        var content = bullets[i].content;
        //console.log(bullets[i]);
        var timestamp = bullets[i].timestamp * 1000;
        setTimeout("shoot_bullet(-100, "
            + Math.random() * SCREEN_HEIGHT / 2 + ",'"
            + content + "', "
            + scroll_time + ")",
            timestamp - last_timestamp);
        last_timestamp = timestamp;
    }
}

function get_bullets(page_url, user_id) {
    $.post("http://project-curtain.avosapps.com/getData", {
            page_url: page_url,
            user_id: user_id
        },
        function (data, status) {
            //console.log(data);
            var jsonroot = JSON.parse(data);
            if (jsonroot.code == 0) {
                //console.log(jsonroot);
                machine_gun(jsonroot.contents, 12000);
            }
        }
    );
}


