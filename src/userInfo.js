const userInfoArr = [
    {
        userID: "aa",
        userPW: "1234",
        userName: "김도현",
    },
    {
        userID: "bb",
        userPW: "1234",
        userName: "구태훈",
    },
];

export const compareUserInfo = (id, pw) => {
    const target = userInfoArr.find(
        (userInfo) => userInfo.userID === id && userInfo.userPW === pw
    );

    if (target === undefined) {
        return {
            status: 200,
            type: "fail",
            message: "아이디/비밀번호가 틀렸습니다.",
        };
    } else {
        return {
            status: 200,
            type: "success",
            message: "로그인 성공",
            userID: id,
        };
    }
};
