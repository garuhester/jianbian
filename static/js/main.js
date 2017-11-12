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
        $('ul#nav li:eq(5) a#per').addClass('active');
    } else if (url == 'write') {
        $('ul#nav li:eq(4) a').addClass('active');
    } else if (url == 'article') {} else {
        $('ul#nav li:eq(1) a').addClass('active');
    }
});

// person-setting
function setting() {
    $('#editprofile').css({ 'display': 'block' });
    $('.editprofile').css({ 'background': 'rgb(247, 247, 247)', 'border-left': '0.3rem solid rgb(116, 181, 255)' });
}

function change(first, second) {
    $('#' + first).css({ 'display': 'block' });
    $('.' + first).css({ 'background': 'rgb(247, 247, 247)', 'border-left': '0.3rem solid rgb(116, 181, 255)' });
    $('#' + second).css({ 'display': 'none' });
    $('.' + second).css({ 'background': '#fff', 'border-left': 'none' });
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

// function changeHeadImage() {
//     $('#imgchoose').trigger('click');
//     $('#imgchoose').on('change', function() {
//         console.log(1);
//         console.log($('#imgchoose').file);
//     });
// }