/**
 * Created by jayvee on 15/11/12.
 */
var SCREEN_HEIGHT = window.innerHeight;
var SCREEN_WIDTH = window.innerWidth;
var current_url = window.location.href;
var user_id = '';
var shooter;
var isActive = false;
var start_x = 0;
var start_y = 0;
var end_x = 0;
var end_y = 0;

//get_userid(current_url);//首先获取userid，给全局变量user_id赋值


function start_shooting(page_url, sendResponse_handler) {
    //console.log('url:' + page_url);
    //console.log('userid:' + user_id);

    $.post("http://project-curtain.avosapps.com/init_user", {page_url: page_url}, function (data) {
        var jsonroot = JSON.parse(data);
        user_id = jsonroot['user_id'];
        isActive = true;
        console.log(user_id);
        console.log(isActive);
        sendResponse_handler({result: user_id, status: isActive});
        shooter = setInterval(function () {
            get_bullets(page_url, user_id);
        }, 3000);
    });
}
function stop_shooting(page_url, u_id, sendResponse_handler) {
    clearInterval(shooter);
    isActive = false;
    user_id = '';
    sendResponse_handler({result: user_id, status: isActive})
}


function get_status(page_url, sendResponse_handler) {//popup每次被点开后，用于获取状态
    $.post('http://project-curtain.avosapps.com/getUserNum', {
            page_url: page_url
        },
        function (data, status) {
            var jsonroot = JSON.parse(data);
            var user_num = jsonroot['user_num'];
            console.log(user_num);
            sendResponse_handler({result: user_id, status: isActive, audience_user_num: user_num});

        });
}


function onCloseTab() {//用户关闭了页面后的操作
    if (isActive) {
        clearInterval(shooter);
        $.post('http://project-curtain.avosapps.com/logout', {
                page_url: current_url,
                user_id: user_id
            },
            function (data, status) {
                console.log('logout' + status);
                isActive = false;
                user_id = '';
            });
    }
}


//chrome listener 主要的popup和主页面交互中心
chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
    switch (request.message) {
        case 'get_status':
            get_status(current_url, sendResponse);
            //sendResponse({result: user_id, status: isActive,audience:});
            break;
        case 'start_shooting':
            console.log('start shooting');
            start_shooting(current_url, sendResponse);
            break;
        case 'stop_shooting':
            console.log('stop shooting');
            stop_shooting(current_url, user_id, sendResponse);
            //sendResponse({result: user_id, status: isActive});
            //sendResponse({result: user_id});
            break;
        case 'close_tab':
            onCloseTab();
            break;
        case 'alert_msg':
            alert(request.msg);//不能在popup.html中alert，否则会关掉popup.html，所以通过消息机制进行alert
            break;
        case 'select_range':
            select_range();
            break;
        default:
            break;
    }
    return true;//设为true时，sendResponse可以响应异步返回
});


// 选定窗口范围
function cnvs_getCoordinates(e) {
    x = e.clientX;
    y = e.clientY;
    console.log('x=' + x + '-y=' + y);
}

//Get Mouse Position
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: (evt.pageX - rect.left) * (canvas.width / rect.width),
        y: (evt.pageY - rect.top) * (canvas.height / rect.height)
    }
}

function select_range() {
    if (!document.getElementById("full_curtain")) {
        $("body").prepend("<canvas class='curtain' id='full_curtain'>Your browser does not support the canvas element.</canvas>");
        $("#full_curtain").css({
            left: 0,
            top: 0,
            color: '#22112',
            width: window.innerWidth,
            height: window.innerHeight
        });
    }
    var ele = document.getElementById("full_curtain");
    console.log(ele);
    var ctx = ele.getContext("2d");
    //ctx.beginPath();
    //ctx.lineWidth = 1;
    //ctx.strokeStyle = "red";

    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    // 给遮罩增加一个mousedown监听器
    var isMouseDown = false;
    var obj_curtain = $("#full_curtain");
    var rect_width = 0;
    var rect_height = 0;
    obj_curtain.mousedown(function (e) {
        isMouseDown = true;
        var mousePos = getMousePos(ele, e);
        start_x = mousePos.x;
        start_y = mousePos.y;
        // mousedown后给obj_curtain增加一个mousemove监听器
        obj_curtain.mousemove(function (e) {
            var mousePos = getMousePos(ele, e);
            end_x = mousePos.x;
            end_y = mousePos.y;
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
            ctx.fillStyle = "#0000ff";
            rect_width = end_x-start_x;
            rect_height =  end_y-start_y;
            ctx.fillRect(start_x, start_y, rect_width, rect_height);
        })
    });
    obj_curtain.mouseup(function (e) {
        obj_curtain.remove();
    });
    //ctx.stroke();

}