/**
 * Created by jo.chan on 2017/8/8.
 */

/**
 * checkActivity
 * @returns {*}
 */
function checkActivity() {
    var d = $.Deferred();
    $.ajax({
        url: pg_config.api_url + "/act/checkActivity",
        type: "GET",
        data: {
            actId: actId,
            token: localStorage.token
        },
        success: function (result) {
            if (result.code == 200) {
            }
            else {
                console.log(pg_config.status[result.code]);
            }
        },
        error: function (err) {
            console.log(JSON.stringify(err));
        }
    });
    return d.promise();
}

/**检查每日每周是否达成任务
 * join Day or week Activity
 * @param conditionId
 * @param boxPos
 * @param dataNum
 * @param dataPoint
 * @returns {*}
 */
function joinActivity(conditionId, boxPos, dataNum, dataPoint) {
    var d = $.Deferred();
    $.ajax({
        url: pg_config.api_url + "/act/joinActivity",
        type: "GET",
        data: {
            actId: actId,
            token: localStorage.token,
            conditionId: conditionId,
            boxPos: boxPos
        },
        beforeSend: loading(),
        success: function (result) {
            hideLoading();
            if (result.code == 200) {
                handleJoin(result, conditionId, boxPos, dataNum, dataPoint);
                d.resolve();
            }
            else if (result.code == 401) {
                showLogin();
                console.log(pg_config.status[result.code]);
            }
            else {
                console.log(pg_config.status[result.code]);
            }
        },
        error: function (err) {
            console.log(JSON.stringify(err));
        }
    });
    return d.promise();
}


/**领取每日每周积分
 * get Day or Week Point
 * @param conditionId
 * @returns {*}
 */
function getReward(conditionId) {
    var d = $.Deferred();
    var pointUrl = pg_config.api_url + "/act/getReward";
    $.ajax({
        url: pointUrl,
        type: "GET",
        data: {
            actId: actId,
            token: localStorage.token,
            conditionId: conditionId
        },
        beforeSend: loading(),
        success: function (result) {
            hideLoading();
            if (result.code == 200) {
                hideWeekTipBox();
                handleDayWeekReward(result, conditionId);
                d.resolve();
            }
            else {
                console.log(pg_config.status[result.code]);
            }
        },
        error: function (err) {
            console.log(JSON.stringify(err));
        }
    });
    return d.promise();
}


/**
 * 获取宝箱奖励
 * @param rewardIndex
 * @returns {*}
 */
function getBoxReward(rewardIndex) {
    var d = $.Deferred();
    var pointUrl = pg_config.api_url + "/act/getReward";
    $.ajax({
        url: pointUrl,
        type: "GET",
        data: {
            actId: actId,
            token: localStorage.token,
            conditionId: '26',
            rewardIndex: rewardIndex
        },
        beforeSend: loading(),
        success: function (result) {
            hideLoading();
            if (result.code == 200) {
                handleGetReward(result, rewardIndex);
                d.resolve();
            }
            else {
                console.log(pg_config.status[result.code]);
            }
        },
        error: function (err) {
            console.log(JSON.stringify(err));
        }
    });
    return d.promise();
}


/**同步请求
 * promiseAjax
 * @param conditionId
 */
function chestAjax(conditionId) {
    $.when(joinActivity(conditionId))
        .then(function () {
            console.log("join:");
            getReward(conditionId).then(function () {
                console.log("reward:");
            });
        });
}


/**
 *检查积分达成回调
 * @param result
 * @param conditionId 宝箱id
 * @param boxPos 宝箱索引
 * @param dataNum 宝箱标识符
 * @param dataPoint 宝箱积分
 */
function handleJoin(result, conditionId, boxPos, dataNum, dataPoint) {
    if (result.data[0].state == 0) {
        if (conditionId >= 21 && conditionId <= 25) {
            $(".sureButton").attr("data-conditionId", conditionId);
            showWeekTip(result);
        }
        else if (conditionId == 26) {
            localStorage.setItem('allPoint', result.data[0].data);
            hanleShowBox(boxPos, dataNum, dataPoint);
        }
    }
    else if (result.data[0].state == 1) {
        if (conditionId >= 21 && conditionId <= 25) {
            $(".desc-1").hide();
            tip('Akumulasi poin sudah diambil,masuk game biar menerima tugas lagi~');
        }
        else if (conditionId == 26) {
            if (boxPos == 4) {
                $(".desc-1").hide();
                $(".black-bg").show();
                $(".goToFb-box").show();
            }
            else if (boxPos >= 0 && boxPos <= 3) {
                $(".desc-1").hide();
                tip('Setiap pemain ada 1 kesempatan untuk membuka box !Kamu sudah mendapat hadiah, tidak bisa membuka lagi');
            }
        }
    }
    else if (result.data[0].state == 2) {
        if (conditionId >= 16 && conditionId <= 25) {
            $(".desc-1").hide();
            tip('Setiap gamer mendapat 1 kesempatan untuk membuat box!Kamu sudah mendapat hadiah, tidak bisa mendapat lagi.Tunggu sampai kali selanjutnya ya~~');
        }
        else if (conditionId == 26) {
            if (boxPos >= 0 && boxPos <= 3) {
                $(".desc-1").hide();
                localStorage.setItem('cdKey', result.data[0].cdkey.cdKey);
                localStorage.setItem('name', result.data[0].cdkey.name);
                showAwardTip();
            }
        }
    }
    else {
        tip(pg_config.state[result.data[0].state]);
    }
}

/**
 *领取积分回调
 * @param result
 * @param conditionId
 */
function handleDayWeekReward(result, conditionId) {
    if (result.data[0].state == 0) {
        var total = parseInt(result.data[0].total) / 500000 * 100;
        var widthPoint = total + '%';
        $(".progress-bar").animate({width: widthPoint});
        $(".point-item").show().text(result.data[0].total);
        tip("Selamat kamu sudah mendapat   " + result.data[0].data + " poin");
    }
    else if (result.data[0].state == 1) {
        if (conditionId >= 16 && conditionId <= 20) {
            tip('Tugas hari ini sudah diselesaikan,kembali pada besok ya!');
        }
        else if (conditionId >= 21 && conditionId <= 25) {
            tip('Akumulasi poin sudah diambil, masuk game biar menerima tugas lagi');
        }
    }
    else {
        tip(pg_config.state[result.data[0].state]);
    }
}


/**
 *宝箱奖励回调
 * @param result
 * @param rewardIndex
 */
function handleGetReward(result, rewardIndex) {
    if (result.data[0].state == 0) {
        $(".desc-1").hide();
        if (rewardIndex == 20 || rewardIndex == 21) {
            $(".black-bg").show();
            $(".playTip-box").hide();
            $(".playTip-main").hide();
            $(".goToFb-box").show();
        }
        else if (rewardIndex >= 0 && rewardIndex <= 19) {
            localStorage.setItem('cdKey', result.data[0].data.cdkey);
            localStorage.setItem('name', result.data[0].data.name);
            showAwardTip();
            desc2TipHide();
        }
    }
    else {
        $(".desc-1").hide();
        tip(pg_config.state[result.data[0].state]);
    }
}


/**
 * 宝箱盒子不同奖励的展示
 *  hanle is black or canGet button
 * @param boxPos
 * @param dataNum
 * @param dataPoint
 */
function hanleShowBox(boxPos, dataNum, dataPoint) {
    var allPoint = parseInt(localStorage.getItem("allPoint"));
    if (allPoint >= dataPoint) {
        $(".boxBtn").css('background', "url('img/alert-chestBtn.png') no-repeat center").removeAttr("disabled");
        alertShowBox(boxPos, dataNum);
    }
    else {
        tip('Belum mencapai');
    }
}

/**
 * 宝箱盒子不同奖励的展示
 * show award box
 * @param boxPos
 * @param dataNum
 */
var alertShowBox = function (boxPos, dataNum) {
    if (dataNum == 1) {
        $(".black-bg").show();
        $(".alert-chest-box").show();
        var data = picData[boxPos];
        $('.alert-chest-box .chestbox-ul li').each(function (index) {
            $(this).find("button").attr('data-index', data.ids[index]);
            $(this).css('background', "url(" + data.pic[index] + ") no-repeat center");
            $(this).find("span").text(data.desc[index]);
            $('.box-word p').find("span").text(data.point[0]);
        });
    }
    else if (dataNum == 2) {
        $(".black-bg").show();
        $(".alert-chest-box1").show();
    }
    else if (dataNum == 3) {
        $(".black-bg").show();
        $(".award-main").show();
    }
};


$(".dayBtn").on("click", function () {
    var conditionId = $(this).attr('data-conditionId');
    chestAjax(conditionId);
});


$(".weekBtn").on("click", function () {
    var conditionId = $(this).attr('data-conditionId');
    joinActivity(conditionId);
});

$(".sureButton").on("click", function () {
    var conditionId = $(this).attr('data-conditionId');
    $(".black-bg").hide();
    getReward(conditionId);
});

$(".notButton").on("click", function () {
    hideWeekTipBox();
});

$(".nav li span").on("click", function () {
    $(".nav li span.on").removeClass('on');
    $(this).addClass('on');
});

var hideWeekTipBox = function () {
    $(".black-bg").hide();
    $(".playTip-box").hide();
    $(".playTip-main").hide();
    $(".ambilTip-box-2").hide();
    $(".desc-4").hide();
};

//weekTip
function showWeekTip(result) {
    showTipBox();
    $(".ambilTip-box-1").hide();
    desc2TipHide();
    $(".ambilTip-box-2").show();
    $(".desc-4").show();
    $(".desc-4 p").text("Saat ini kamu memiliki  " + result.data[0].data + "  ,yakin ambil semua?");
}

//tipbox show
function showTipBox() {
    $(".black-bg").show();
    $(".playTip-box").show();
    $(".playTip-main").show();
    $(".ambilTip-box-2").hide();
}

//pubilc tip
var tip = function (tip) {
    showTipBox();
    $(".ambilTip-box-1").show();
    $(".desc-2").show();
    $(".desc-2 p").text(tip);
};

//public tip
var desc2TipHide = function () {
    $(".ambilTip-box-1").hide();
    $(".desc-2").hide();
};

var picData = [
    {
        pic: ['img/qt-1.jpg', 'img/qt-2.jpg', 'img/qt-3.jpg', 'img/qt-4.png', 'img/qt-5.jpg'],
        desc: ['Kantung Uang L x4', 'Fragmen EXP Lv.Atas x1', 'Tiket Alam Gaib x1', 'Kupon Raid x50', 'Kartu EXP Fusion x10'],
        ids: [0, 1, 2, 3, 4],
        point: [1000]
    },
    {
        pic: ['img/by-1.jpg', 'img/by-2.jpg', 'img/by-3.jpg', 'img/by-4.jpg', 'img/by-5.jpg'],
        desc: ['Tiket Alam Gaib Lv.Atas x5', 'Batu Murni Kualifikasi x100', 'Buah Pokemon x500', 'Kartu EXP Fusion x250', 'Lapras x1'],
        ids: [5, 6, 7, 8, 9],
        point: [10000]
    },
    {
        pic: ['img/hj-1.png', 'img/hj-2.jpg', 'img/hj-3.jpg', 'img/hj-4.jpg', 'img/hj-5.jpg'],
        desc: ['Koin Bersinar x200', 'Batu Evolusi Mega x200', 'Berlian x1500', 'Kartu Terobos x666', 'Sylveon x1'],
        ids: [10, 11, 12, 13, 14],
        point: [30000]
    }
];


/**
 * 点击宝箱领取按钮,检查积分是否达成
 * index lqBtn
 */
$('.lqBtn').on("click", function () {
    var dataNum = $(this).attr('data-num');
    var boxPos = $(this).attr('data-index');
    var dataPoint = $(this).attr('data-point');
    joinActivity(26, boxPos, dataNum, dataPoint);
});


/**
 * 积分达成,询问玩家是否是否确认打开
 * alert-Bg boxBtn click
 */
$(".boxBtn").on("click", function () {
    var dataIndex = $(this).attr('data-index');
    $(".yesButton").attr("data-index", dataIndex);
    var rewardIndex = $(this).attr('data-index');
    if (rewardIndex >= 0 && rewardIndex <= 14) {
        $(".alert-chest-box").hide();
    } else if (rewardIndex >= 15 && rewardIndex <= 19) {
        $(".alert-chest-box1").hide();
    } else if (rewardIndex == 20 || rewardIndex == 21) {
        $(".award-main").hide();
    }
    $(".black-bg").show();
    showTipBox();
    $(".ambilTip-box-1").show();
    $(".desc-1").show();
    $(".desc-2").hide();
});


/**
 * 确认打开,领取奖励,
 * yesButton box reward
 */
$(".yesButton").on("click", function () {
    var rewardIndex = $(this).attr('data-index');
    getBoxReward(rewardIndex);
});


/**
 * 不领取积分,继续存积分,回每日每周任务
 * back day&week homework
 */
$(".backPointButton").on("click", function () {
    $(".black-bg").hide();
    $(".playTip-box").hide();
    $(".playTip-main").hide();
    $(".award-main").hide();
    $(".desc-1").hide();
    desc2TipHide();
    $("html,body").animate({scrollTop: $(".title-3").offset().top}, 800);
});


/**
 * click chestBox
 */
$(".showBoxBtn").on("click", function () {
    $(".boxBtn").css('background', "url('img/notChestBtn.png') no-repeat center").attr('disabled', "true");
    var dataIndex = $(this).attr('data-index');
    var dataNum = $(this).attr('data-num');
    alertShowBox(dataIndex, dataNum);
});


$(".nav-box a").on("click", function () {
    var id = $(this).attr("data-id");
    $("html,body").animate({scrollTop: $(id).offset().top}, 800);
});


var showAwardTip = function () {
    $(".black-bg").show();
    $(".playTip-box").hide();
    $(".awardTip-box").show();
    $(".awardTip-main").show();
    $(".jhm-p").text(localStorage.getItem("cdKey"));
    $(".jl-p").text(localStorage.getItem("name"));
};


