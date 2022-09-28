export const test = async (ctx) => {
    console.log("들어오니");
    ctx.status = 200;
    ctx.body = {
        type: "success",
        message: "api 통신이 성공했습니다.",
    };
};
