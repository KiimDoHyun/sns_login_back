const userInfoArr = [
    {
        userID: "aa",
        userPW: "1234",
        userName: "김도현",
        loginType: "normal",
    },
    {
        userID: "bb",
        userPW: "1234",
        userName: "구태훈",
        loginType: "normal",
    },
    {
        userID: 2447397556,
        useName: "김도현",
        loginType: "kakao",
    },
    {
        userID: 117965442533571519980,
        useName: "구태훈",
        loginType: "google",
    },
];

// 내 카카오 로그인시 받는 id: 2447397556

export const compareUserInfo = (id, pw, type) => {
    let resultObj = null;
    if (type === "normal") {
        const target = userInfoArr.find(
            (userInfo) => userInfo.userID === id && userInfo.userPW === pw
        );

        if (target === undefined) {
            resultObj = {
                type: "fail",
                message: "일치하는 사용자 정보가 없습니다.",
                data: { loginType: "normal" },
            };
        } else {
            resultObj = {
                type: "success",
                message: "로그인 성공",
                data: target,
            };
        }
    } else if (type === "kakao" || type === "google") {
        const target = userInfoArr.find(
            (userInfo) =>
                userInfo.userID === id && userInfo.loginType === "kakao"
        );

        if (target === undefined) {
            resultObj = {
                type: "fail",
                message: "등록되지 않은 사용자",
                data: { loginType: type },
            };
        } else {
            resultObj = {
                type: "success",
                message: "등록된 사용자",
                data: target,
            };
        }
    }

    return resultObj;
};

let kakao_access_token = "";
export const kakaoInfo = () => {
    const setToken = (token) => {
        console.log("들어왔다,", token);
        kakao_access_token = token;
    };
    let inner_access_token = kakao_access_token;

    return [inner_access_token, setToken];
};
