const userID = "aa";
const userPW = "1234";

export const login = async (ctx) => {
    const { ID, PW } = ctx.request.body;

    if (!ID || !PW) {
        ctx.status = 200;
        ctx.body = {
            type: "fail",
            message: "입력값이 부족합니다.",
        };
    } else if (ID !== userID || PW !== userPW) {
        ctx.status = 200;
        ctx.body = {
            type: "fail",
            message: "아이디/비밀번호 가 틀렸습니다.",
        };
    } else if (ID === userID && PW === userPW) {
        ctx.status = 200;
        ctx.body = {
            type: "success",
            message: "로그인 성공",
        };
    }
};
