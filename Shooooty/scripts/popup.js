// chrome tab相关
var current_url;
var current_title;
var user_id = '';
var isAcitive = false;
var cur_user_num = 0;
console.log('popup');
setTimeout('$("#bullet_content").focus()', 2000);
chrome.tabs.query({active: true}, function (tabs) {
    current_url = tabs[0].url;
    current_title = tabs[0].title;
    $("#cur_title").text('当前页面：' + current_title);
    $("#cur_url").text('当前网址：' + current_url);
    chrome.tabs.sendMessage(tabs[0].id, {message: "get_status"}, function (response) {
        if (response != null) {
            user_id = response.result;
            isAcitive = response.status;
            cur_user_num = response.audience_user_num;
            //$("#btn_switch")[0].checked = isAcitive;

            setSwitchStatus('btn_switch', isAcitive);
            console.log('get userid:' + user_id);
            console.log(isAcitive, user_id);
            $("#cur_audience_num").text('当前观众数：' + cur_user_num);
        } else {
            console.log('no response');
            $("#cur_audience_num").text('当前观众数：' + '未能连接');
            setSwitchStatus('btn_switch', isAcitive);
        }
        $("#cur_status").text('是否激活:' + isAcitive);
        $("#bullet_content").focus()
    });
});
function setSwitchStatus(id, isStatusActive) {
    //console.log('set state:' + isStatusActive);
    $("#" + id).bootstrapSwitch('state', isStatusActive, true);
}


//用户操作相关
//boostrap switch初始化
$("#btn_switch").bootstrapSwitch({
    size: "small",
    onText: "激活",
    offText: "未激活",
    onColor: "success",
    indeterminate: "true",
    onSwitchChange: function (event, state) {
        //alert($(this).prop("checked"));
        if ($(this).prop("checked")) {
            $(this).bootstrapSwitch('disabled', true);
            chrome.tabs.query({active: true}, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {message: "start_shooting"}, function (response) {
                    if (response != null) {
                        console.log('started');
                        user_id = response.result;
                        isAcitive = response.status;
                        console.log(isAcitive);
                        $("#cur_status").text('是否激活:' + isAcitive);
                        cur_user_num += 1;
                        $("#cur_audience_num").text('当前观众数：' + cur_user_num)

                    } else {
                        console.log('no response');
                    }
                    //$("#btn_switch").checked = false
                    $("#btn_switch").bootstrapSwitch('disabled', false);
                    setSwitchStatus('btn_switch', isAcitive);
                    //$("#btn_switch").bootstrapSwitch('disabled', false);
                });
            });
        } else {
            $(this).bootstrapSwitch('disabled', true);
            chrome.tabs.query({active: true}, function (tabs) {
                //current_url = tabs[0].url;
                //current_title = tabs[0].title;
                //$("#cur_title").text('当前页面：' + current_title);
                //$("#cur_url").text('当前网址：' + current_url);
                chrome.tabs.sendMessage(tabs[0].id, {message: "stop_shooting"}, function (response) {
                    if (response != null) {
                        console.log('stoped');
                        user_id = response.result;
                        isAcitive = response.status;
                        console.log(isAcitive);
                        $("#cur_status").text('是否激活:' + isAcitive);
                        cur_user_num -= 1;
                        $("#cur_audience_num").text('当前观众数：' + cur_user_num)
                    } else {
                        console.log('no response');
                    }
                    $("#btn_switch").bootstrapSwitch('disabled', false);
                    setSwitchStatus('btn_switch', isAcitive);
                    //$("#btn_switch").bootstrapSwitch('disabled', false);
                });
            });
        }
    }
});

$("#btn_shoot").click(function () {
    //console.log('userid:' + user_id);
    if ($('#btn_switch')[0].checked && user_id != '') {
        //console.log('send:' + $("#bullet_content").val());
        $.post("http://project-curtain.avosapps.com/postBullet", {
                page_url: current_url,
                content: $("#bullet_content").val(),
                user_id: user_id
            },
            function (data, status) {
                console.log(status);
                if (status == 'success') {
                    window.close();
                }
            });
    } else {
        console.log('waiting for activation');
        chrome.tabs.query({active: true}, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {message: "alert_msg", msg: '请先激活弹幕功能'}, function (response) {
                if (response != null) {
                    //console.log('started');
                    user_id = response.result;
                } else {
                    console.log('no response');
                }
            });
        });
    }
});


$("#bullet_content").keydown(function (e) {
    var curKey = e.which;
    if (curKey == 13) {
        $("#btn_shoot").click();
        return false;
    }
});

