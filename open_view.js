(function ($) {
    var openViewUrl = function (url, callback) {
            console.log(url);
            //商品不存在
            if (url.indexOf('detailplugin/expired.html')>-1){
                location.replace(getUrl('/Taobao/detail_expired.html'));
                return;
            }
            if (url == 'share') {
                tipsShare();
                return;
            }
            if (window.loading) return;
            var data = $.extend({}, twxConf.shop, { shopUrl: url });
            window.loading = true;
            // $.rpost('/Taobao/checkShowUrl', data, function (rs) {
            //     window.loading = false;
            //     if (rs.status == 'success') {
            //         if (callback && callback(rs.url) === false) return;
                    location.href = getUrl(url);
            //         return;
            //     }
            //     openTbApp(url);//不支持的链接，提示浏览器打开或直接调起浏览器
            // }, 'json');
        },
        //拦截部分api请求转换成页面跳转
        api2url = function (params) {
            var api = params.api.toLowerCase(), url = '';
            if (api == 'mtop.taobao.buyerresourcemtopwriteservice.applycoupon' || api == 'mtop.taobao.shop.geb.coupon.apply') {
                var data = JSON.parse(params.data);
                url = 'https://market.m.taobao.com/apps/aliyx/coupon/detail.html?seller_id=' + twxConf.shop.sellerId + '&activity_id=' + data.uuid;
            } else if (api == 'mtop.mediaplatform.video.alert') {
                //直播
                var data = JSON.parse(params.data);
                url = 'https://h5.m.taobao.com/taolive/video.html?id=' + data.feedId;
            } else if (api == 'mtop.tmall.shop.addFavor') {
                //关注
                return true;//不做跳转
            }
            url && openViewUrl(url);
            return !!url;
        },
        getUrl = function (_url, checkMin) {
            //处理url，判断是否需要添加额外参数
            _url = setUrlParam(_url, { tn: twxConf.setting.tn, eurl: twxConf.shop.eurl, mac: twxConf.machine });
            if (window.MiniProgram && _url.indexOf('/minitwx.php') < 0 && checkMin !== false) {
                var arg = getUrlParam(_url);
                _url = window.API_URL + '&q=' + encodeURIComponent(_url);
                arg && (_url = setUrlParam(_url, arg));
            }
            _url = _url.indexOf('http') == 0 ? _url : window.location.origin + _url;
            return _url;
        },
        getUrlParam = function (url, name) {
            var query = url.substr(url.indexOf('?') + 1), param = {};
            if (!query) return null;
            if (name) {
                var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)'),//构造一个含有目标参数的正则表达式对象
                    r = query.match(reg);//匹配目标参数
                if (r != null) return unescape(r[2]);//返回参数值
                return null;
            }
            for (var i = query.split("&"), a = 0; a < i.length; a++) {
                i[a] = i[a].split("=");
                try {
                    param[i[a][0]] = decodeURIComponent(i[a][1])
                } catch (e) {
                    param[i[a][0]] = i[a][1]
                }
            }
            return param;
        },
        setUrlParam = function (url, data) {
            var _d = {};
            $.each(data, function (k, v) {
                if (!k || !v || getUrlParam(url, k)) return;
                _d[k] = v;
            });
            if (!_d) return url;
            return url + (url.indexOf('?') > -1 ? '&' : '?') + $.param(_d);
        },
        openTbApp = function (url, jmp) {
            if (window.MiniProgram) return;
            var ua = navigator.userAgent.toLowerCase();
            if (twxConf.setting.tsllqkg || (!jmp && /(iphone|ipad|ipod|ios|oppo|vivo)/i.test(ua))) {
                tipsBrowser();
                return;
            }
            if (/(android|adr)/i.test(ua) && !/(oppo|vivo)/i.test(ua) && twxConf.setting.azmrdqkg) {
                window.location.href = getUrl('/jump?key=' + twxConf.jumpKey + '&go=' + encodeURIComponent(url));
                return;
            }
            tipsBrowser();
        },
        tipsBrowser = function (shadeClose) {
            var img = twxConf.gcdn + '/images/tipsbrowser.png',
                $div = $('<div>', {
                    style: 'position:fixed;left:0;top:0;z-index:999999999;width:100%;height:100%;background:url(' + img + ') no-repeat right top rgba(0,0,0,0.8);background-size:contain;',
                    click: function () {
                        shadeClose === false || $(this).remove();
                    }
                });
            setTimeout(function () {
                $('body').append($div);
            }, 200);
        },
        tipsShare = function () {
            var img = twxConf.gcdn + '/css/img/new-arrow.png',
                $div = $('<div>', {
                    style: 'position:fixed;left:0;top:0;z-index:999999999;right:0;bottom:0;padding:10px;background:rgba(0,0,0,0.8);',
                    html: [
                        '<div style="height:80px;background: url(' + img + ') no-repeat right top;background-size:70px 80px"></div>',
                        '<div style="float:right;width:162px;height:80px;margin:15px 50px 0 0;font-size:18px;color:#ffffff;text-align:center;">点击右上角<br>分享至朋友圈或好友</div>',
                    ].join(''),
                    click: function () {
                        $(this).remove();
                    }
                });
            setTimeout(function () {
                $('body').append($div);
            }, 200);
        },
        checkMiniProgram = function () {
            if (!window.MiniProgram) return;
            window.API_URL = '/minitwx.php?mac=' + twxConf.machine + '&eurl=' + twxConf.shop.eurl;
            $(function () {
                $('.new-user,.new-love,.new-share,.activity,.wxpay').hide();
                $('#goRegister,#goWebSite').on('click', function () {
                    $('<div>', {
                        style: 'position:fixed;left:0;top:0;z-index:9999999;width:100%;height:100%;background:rgba(0,0,0,0.8);',
                        click: function () {
                            $(this).remove();
                        },
                        html: $('<div>', {
                            style: 'position:fixed;left:0;top:0;bottom:0;right:0;margin:auto;width:80%;height:120px;background:#fff;padding:15px;font-size:16px;text-align:center;color:#000;border-radius:3px;',
                            html: '请长按网址复制链接后使用浏览器访问<br/><textarea style="font-size:12px;height:50px;margin-top:10px;border:0;display:block;width: 100%;resize:none;text-align:center;">' + $(this).attr('href') + '</textarea>',
                            click: function () {
                                return false;
                            }
                        }),
                    }).appendTo('body');
                    return false;
                });
            });
        };
    checkMiniProgram();//小程序处理

    $.rpost = function () {
        var arg = arguments;
        arg[0] = getUrl(arg[0]);
        $.post.apply($, arg);
    };
    window.twxConf = $.extend({}, window.twxConf || {}, {
        getUrl: getUrl,
        api2url: api2url,
        openView: openViewUrl,
        openTbApp: openTbApp,
        getUrlParam: getUrlParam,
    });
    $(function () {
        !window.MiniProgram && twxConf.setting.sgRedPacket && $('<script>', {
            src: twxConf.setting.sgRedPacket
        }).appendTo('body');//分享有礼插入html
    });
})(window.jQuery);
