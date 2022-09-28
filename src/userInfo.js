const userInfoArr = [
    {
        userID: "aa",
        userPW: "1234",
        userName: "김도현",
        type: "normal",
    },
    {
        userID: "bb",
        userPW: "1234",
        userName: "구태훈",
        type: "normal",
    },
    {
        userID: 2447397556,
        type: "kakao",
    },
    {
        userID: 117965442533571519980,
        type: "google",
    },
];

// 내 카카오 로그인시 받는 id: 2447397556

export const compareUserInfo = (id, pw, type) => {
    let resultObj = {};
    if (type === "normal") {
        const target = userInfoArr.find(
            (userInfo) => userInfo.userID === id && userInfo.userPW === pw
        );

        if (target === undefined) {
            resultObj = {
                status: 200,
                type: "fail",
                message: "아이디/비밀번호가 틀렸습니다.",
            };
        } else {
            resultObj = {
                status: 200,
                type: "success",
                message: "로그인 성공",
                userID: id,
            };
        }
    } else if (type === "kakao") {
        const target = userInfoArr.find(
            (userInfo) => userInfo.userID === id && userInfo.type === "kakao"
        );

        if (target === undefined) {
            resultObj = {
                status: 200,
                type: "fail",
                message: "카카오 로그인에 실패했습니다.",
            };
        } else {
            resultObj = {
                status: 200,
                type: "success",
                message: "로그인 성공",
                userID: id,
            };
        }
    }

    return resultObj;
};
