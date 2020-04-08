module.exports = {
    host: process.env.NODE_ENV === "production" ? "www.E4ZY.bet" : (process.env.HOST || '127.0.0.1'),
    port: process.env.PORT || 8080,
    APIPort: process.env.NODE_ENV === "production" ? +process.env.PORT : +process.env.PORT + 1,
    steamRealm: process.env.NODE_ENV === "production" ? `https://www.E4ZY.bet/` : `http://${process.env.HOST}:${process.env.PORT}/`,
    steamVerify: process.env.NODE_ENV === "production" ? `https://www.E4ZY.bet/verify` : `http://${process.env.HOST}:${process.env.PORT}/`,
    steamAPI: "73A7C7BDDEEED818A72D09BB685EB955",
    steamSecret: 'L3V9V7YW8qlCvxWPswL/wt6T/VM=',
    steamIdentitySecret: 'aorRc0FPSL31FzB8X9LS/EJUVUc=',
    admins: ["76561198819485065", "76561198305435447", "76561199026058014"],
    bot: {
        username: 'arktrixdub',
        password: 'sk8erdude'
    },
    secret: 'a secret 1932791982',
    dbLink: process.env.NODE_ENV === "production" ? 'mongodb://heroku_2h8g157d:okbqjsf59rat7rrk6phpdfuk8v@ds335668.mlab.com:35668/heroku_2h8g157d' : 'mongodb://localhost:27017/bot-manager',
    app:{
        title:"E4ZY.BET",
        description:'E4ZY.BET',
        head:{
            titleTemplate:'E4ZY.BET',
            meta:[
                {charset:"utf-8"}
            ]
        }
    }
};
