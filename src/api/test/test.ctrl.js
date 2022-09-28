export const test = async (ctx) => {
    ctx.status = 200;
    ctx.body = {
        type: "success",
        message: "api 통신이 성공했습니다.",
        data: {
            loginType: ctx.state.user.loginType,
        },
    };
};
