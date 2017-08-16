var pg_config = {
    status: {
        200: "Berhasil",
        301: "Invalid account or password",
        302: "API pihak ketiga error",
        303: "API facebook error",
        400: "Error",
        401: "Belum login",
        402: "Tidak ada karakter",
        403: "Event belum dimulai",
        404: "Event berakhir",
        405: "Game belum ditemukan",
        406: "Kesalahan parameter",
        407: "Sementara belum ada event"
    },
    state: {
        "-1": "Tugas ini belum diselesaikan,mari login game segera~",
        "0": "Berhasil",
        "1": "Sudah diambil",
        "-2": "cdKey tak cukup",
        "-3": "Server abnormal"
    },
    fb_app_id: 1129581580473410,
    // fb_redirect_uri: 'http://10.10.15.40:8020/chest/src/index.html',
    // fb_login_url: 'http://172.16.1.171:8680/fb/login',
    // api_url: 'http://172.16.1.171:8680'
    fb_redirect_uri: 'http://pkid.pocketgamesol.com/activity/chest/index.html',
    fb_login_url: 'http://52.221.145.234:8680/fb/login',
    api_url: 'http://52.221.145.234:8680'
};

var actId = 100007;
var appId = 10085;
$(document).ready(function () {
    if (isLogin() && isChoose()) {
        showMessage();
        checkActivity();
        checkPoint();
    }
    else {
        checkFBLogin();
    }
});


$('.btn-login').on('click', function () {
    var username = $(".username").val();
    var password = md5($(".password").val());
    if (username == "" || password == "") {
        $(".login-tip").show();
        $(".login-tip").text("Login akun dengan tepat");
        return;
    }
    $.ajax({
        type: "GET",
        url: pg_config.api_url + "/sdk/login",
        data: {
            username: username,
            password: password,
            version: 'v3'
        },
        beforeSend: function () {
            $(".loadingBtn").show();
        },
        success: function (result) {
            $(".loadingBtn").hide();
            handleLogin(result);
        },
        error: function (error) {
            console.log(error);
        }
    });
});

function checkFBLogin() {
    if (sessionStorage.facebook == 1) {
        sessionStorage.facebook = 0;
        var FB_CODE = $.trim(getParameterByName("code"));
        if (FB_CODE == "") {
            return;
        }
        var requestURL = pg_config.fb_login_url;
        $.ajax({
            type: "GET",
            async: true,
            url: requestURL,
            data: {
                appId: appId,
                redirectUrl: pg_config.fb_redirect_uri,
                code: FB_CODE
            },
            beforeSend: function () {
                $(".loadingBtn").show();
            },
            success: function (result) {
                $(".loadingBtn").hide();
                handleLogin(result);
            },
            error: function (err) {
                console.log(err);
            }
        });
    }
}

function handleLogin(result) {
    if (result.code == 200) {
        sessionStorage.setItem("facebook", 0);
        var data = result.data;
        localStorage.setItem('userId', data.user.userId);
        localStorage.setItem('username', data.user.userName);
        localStorage.setItem('token', data.token);
        var myTimer = new Date().getTime();
        localStorage.activetime = myTimer;
        hideLogin();
        showChannel();
        loadGameZones();
        showMessage();
        if (localStorage.facebook == 1) {
            window.location.href = pg_config.fb_redirect_uri;
        }
    }
    else {
        $(".login-tip").show();
        $(".login-tip").text(pg_config.status[result.code]);
    }
}

/**
 * loadGameZones
 */
function loadGameZones() {
    var zones = localStorage.getItem("zones");
    if (zones && zones.length > 2) {
        var data = JSON.parse(zones);
        setZones(data);
    } else {
        $.ajax({
            type: "GET",
            url: pg_config.api_url + '/sdk/zones',
            async: false,
            data: {
                appId: appId,
                token: localStorage.token
            },
            success: function (result) {
                if (result.code == 200) {
                    if (result.data == '') {
                        $(".errorTip").show().text("Sedang cari list server");
                    }
                    else {
                        setZones(result.data);
                        localStorage.setItem("zones", JSON.stringify(result.data));
                    }
                } else {
                    alert(pg_config.status[result.code]);
                }
            },
            error: function (err) {
                console.log(JSON.stringify(err));
            }
        });
    }
}


/**
 * load Player
 */
function loadPlayer() {
    localStorage.ZoneId = $(".zoneSelect").val();
    if (localStorage.ZoneId == 'server') {
        $(".errorTip").show().empty().text("Silahkan pilih server");
    } else {
        $.ajax({
            url: pg_config.api_url + '/sdk/players',
            type: "GET",
            data: {
                appId: appId,
                gameZoneId: localStorage.ZoneId,
                token: localStorage.token
            },
            success: function (result) {
                if (result.code == 200) {
                    var data = result.data;
                    if (data == '' || data[0].playerId == '') {
                        localStorage.removeItem("playerId");
                        localStorage.removeItem("playerName");
                        $(".errorTip").show().empty().text("Karakter belum ditemukan");
                    }
                    else {
                        localStorage.setItem("playerId", data[0].playerId);
                        localStorage.setItem("playerName", data[0].playerName);
                        $(".errorTip").empty().hide("");
                    }
                }
                else {
                    $(".errorTip").show().text(pg_config.status[result.code]);
                }
            },
            error: function (err) {
                console.log(JSON.stringify(err));
            }
        });
    }
}

/**
 * 查积分
 */
function checkPoint() {
    $.ajax({
        url: pg_config.api_url + "/act/joinActivity?boxPos=0,1,2,3,4",
        type: "GET",
        data: {
            actId: actId,
            token: localStorage.token,
            conditionId: 26
        },
        beforeSend: loading(),
        success: function (result) {
            hideLoading();
            if (result.code == 200) {
                if (result.data[0].data > 0) {
                    localStorage.setItem("boxPoint", result.data[0].data);
                    var pointWidth = parseInt(result.data[0].data) / 500000 * 100 + '%';
                    $(".progress-bar").animate({width: pointWidth});
                    $(".point-item").show().text(result.data[0].data);
                }
            }
            else {
                console.log(pg_config.status[result.code]);
            }
        },
        error: function (err) {
            console.log(JSON.stringify(err));
        }
    });
}


function isLogin() {
    if (localStorage.userId && localStorage.token) {
        var active = new Date().getTime();
        active -= 3000000;
        if (active < parseInt(localStorage.activetime)) {
            return true;
        } else {
            localStorage.username = "";
            localStorage.token = "";
            return false;
        }
    } else {
        return false;
    }
}

function isChoose() {
    if (localStorage.playerId) {
        {
            return true;
        }
    } else {
        return false;
    }
}

function saveInfo() {
    if (isLogin() && isChoose()) {
        $(".black-bg").hide();
        $(".chooseBox").hide();
        $(".startTime").hide();
        $(".userMessage").show();
        showMessage();
        checkActivity();
        checkPoint();
    }
    else {
        $(".errorTip").show().text("Karakter belum ditemukan");
    }
}

$(".zoneSelect").change(function () {
    localStorage.gamePlayer = $('.zoneSelect option:selected').text();
    loadPlayer();
});

$(".channelLogin").on("click", function () {
    saveInfo();
});


$(".channelLoginCloseBtn").on("click", function () {
    saveInfo();
});


$(".loginBtn").on("click", function () {
    showLogin();
});


//选择区服
$(".changeQf").click(function () {
    showChannel();
    loadGameZones();
});

$(".closeBtn").on("click", function () {
    $(".black-bg").hide();
    $(".box").hide();
    $(".desc-1").hide();
});

//注销
$('.init').on('click', function () {
    localStorage.clear();
    $('.user').text("");
    $('.user-qf').text("");
    $(".zoneSelect").empty();
    $('.userMessage').hide();
    $(".startTime").show();
});


$('.fbBtn').on('click', function () {
    sessionStorage.setItem('facebook', 1);
    var random = Math.random() * 1000;
    var loginURL = "https://www.facebook.com/v2.6/dialog/oauth?client_id=" + pg_config.fb_app_id
        + "&redirect_uri=" + encodeURIComponent(pg_config.fb_redirect_uri) + "&r=" + random;
    window.location.href = loginURL;
});


var showMessage = function () {
    $(".userMessage").show();
    $(".startTime").hide();
    $(".user").html(localStorage.playerName);
    $(".user-qf").html(localStorage.gamePlayer);
};

var showChannel = function () {
    $(".black-bg").show();
    $(".chooseBox").show();
};


var showLogin = function () {
    $(".black-bg").show();
    $('.loginBox').show();
};

var hideLogin = function () {
    $(".black-bg").hide();
    $('.loginBox').hide();
};

var loading = function () {
    $(".black-bg").show();
    $('.loading').show();
};

var hideLoading = function () {
    $(".black-bg").hide();
    $('.loading').hide();
};


/**
 * select list
 * @param list
 */
var recentGameZones = function (list) {
    var dom = '<option selected="selected">server</option>',
        zoneList = null;
    $(".zoneSelect").empty();
    for (var i = 0; i < list.length; i++) {
        zoneList = list[i];
        dom += '<option value="' + zoneList.main_game_zone_id + '" data-thirdZoneId="' + zoneList.third_game_zone_id + '">' + zoneList.third_game_zone_id + '</option>';
    }
    $(".zoneSelect").append(dom);
};


/**
 * save ZonesData
 * @param data
 */
var setZones = function (data) {
    var list = data;
    var openList = [];
    for (var i = 0; i < list.length; i++) {
        openList.push(list[i]);
    }
    recentGameZones(openList);
};


/**
 * faceBook login check
 * @param name
 * @returns {string}
 */
var getParameterByName = function (name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};

