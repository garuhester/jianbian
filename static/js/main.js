function logout() {
    $.ajax({
        type: 'post',
        url: '/logout',
        success() {
            window.location.reload();
        }
    });
}

$(function() {
    var url = location.href.split('/')[3];
    if (url == 'follow') {
        $('ul#nav li:eq(2) a').addClass('active');
    } else if (url == 'message') {
        $('ul#nav li:eq(3) a').addClass('active');
    } else if (url == 'personal') {
        $('ul#nav li:eq(6) a#per').addClass('active');
    } else if (url == 'write') {
        $('ul#nav li:eq(5) a').addClass('active');
    } else if (url == 'article') {

    } else if (url == 'about') {
        $('ul#nav li:eq(4) a').addClass('active');
    } else {
        $('ul#nav li:eq(1) a').addClass('active');
    }
});

// person-setting
function setting() {
    $('#editprofile').css({ 'display': 'block' });
    $('.editprofile').css({ 'background': 'rgb(247, 247, 247)', 'box-shadow': 'inset 5px 0px 0 0 rgb(116, 181, 255)' });
}

function change(first, second) {
    $('#' + first).css({ 'display': 'block' });
    $('.' + first).css({ 'background': 'rgb(247, 247, 247)', 'box-shadow': 'inset 5px 0px 0 0 rgb(116, 181, 255)'});
    $('#' + second).css({ 'display': 'none' });
    $('.' + second).css({ 'background': '#fff', 'box-shadow': 'none' });
}

function saveProfile() {
    var name = $('#name').val();
    var headImage = $('.headimage')[0].src;
    var gender = $('#gender').val();
    var age = $('#age').val();
    var tel = $('#tel').val();
    var email = $('#email').val();
    var content = $('#content').val();
    $.ajax({
        type: 'post',
        url: '/saveprofile',
        data: {
            name,
            headImage,
            gender,
            age,
            tel,
            email,
            content,
        },
        success(data) {
            if (data.result == 'success') {
                alert("修改成功");
                location.reload();
            } else {
                alert("修改失败");
            }
        }
    });
}

function changePassword() {
    var nowpwd = $('#nowpwd').val();
    var newpwd = $('#newpwd').val();
    var repeatnewpwd = $('#repeatnewpwd').val();
    if (newpwd != repeatnewpwd) {
        alert('两次输入的密码不一致');
    } else {
        $.ajax({
            type: 'post',
            url: '/changepassword',
            data: {
                nowpwd,
                newpwd,
                repeatnewpwd,
            },
            success(data) {
                if (data.result == 'samenowpwd') {
                    alert('当前密码错误');
                } else if (data.result == 'changepasswordsuccess') {
                    alert('更改密码成功，请重新登录');
                    location.reload();
                }
            }
        })
    }
}

function followPerson(obj) {
    var otherid = obj.id;
    $.ajax({
        type: 'post',
        url: '/followperson',
        data: {
            otherid,
        },
        success(data) {
            if (data.result == 0) {
                var re = confirm("登录后才可以关注(#^.^#)");
                if (re) {
                    location.href = "/login";
                }
            } else if (data.result == 1) {
                alert("不能关注自己哦(●'◡'●)");
            } else if (data.result == 3) {
                alert("关注成功！");
                location.reload();
            }
        }
    });
}

function unfollow(obj) {
    var otherid = obj.id;
    $.ajax({
        type: 'post',
        url: '/unfollowperson',
        data: {
            otherid,
        },
        success(data) {
            if (data.result == 1) {
                alert("取消关注成功");
                location.reload();
            }
        }
    })
}

function loadArticle(obj) {
    location.href = "/follow/" + obj.id;
}

var Article = function(aid) {
    var s = document.createElement('style');
    document.body.appendChild(s);
    this.doArticle = function(type, obj) {
        $.ajax({
            type: 'post',
            url: '/doarticle',
            data: {
                aid,
                type,
            },
            success(data) {
                if (data.result == 0) {
                    var re = confirm("登录后才可以关注(#^.^#)");
                    if (re) {
                        location.href = "/login";
                    }
                } else if (data.result == 1) {
                    obj.innerHTML = "<i class='iconfont icon-like_fill'></i>";
                    obj.setAttribute('data-text', '取消喜欢');
                    obj.setAttribute('onclick', 'new Article().undoArticle(1,this)');
                    s.innerText = ".intoarticle .menu .like:after{left:-75px}";
                } else if (data.result == 2) {
                    obj.innerHTML = "<i class='iconfont icon-collection_fill'></i>";
                    obj.setAttribute('data-text', '取消收藏');
                    obj.setAttribute('onclick', 'new Article().undoArticle(0,this)');
                    s.innerText = ".intoarticle .menu .collect:after{left:-75px}";
                }
            }
        });
    }
    this.undoArticle = function(type, obj) {
        $.ajax({
            type: 'post',
            url: '/undoarticle',
            data: {
                aid,
                type,
            },
            success(data) {
                if (data.result == 1) {
                    obj.innerHTML = "<i class='iconfont icon-like'></i>";
                    obj.setAttribute('data-text', '喜欢');
                    obj.className = "like";
                    obj.setAttribute('onclick', 'new Article().doArticle(1,this)');
                    s.innerText = ".intoarticle .menu .like:after{left:-45px}";
                } else if (data.result == 2) {
                    obj.innerHTML = "<i class='iconfont icon-collection'></i>";
                    obj.setAttribute('data-text', '收藏');
                    obj.className = "collect";
                    obj.setAttribute('onclick', 'new Article().doArticle(0,this)');
                    s.innerText = ".intoarticle .menu .collect:after{left:-45px}";
                }
            }
        });
    }
}