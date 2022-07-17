const fs = require("fs");
require('dotenv').config({path:'../.env'});
const TelegramBot = require("node-telegram-bot-api");
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
import {updateWallet,getTotalBalance,runDistribute} from './helper/blockChainFunctions'


// 1.프라이빗하게 실행해야 하기때문에 인증된 유저만 호출가능하게끔 admin check 필요






// 요기서 봇 핸들링
// 일단 기존 코드 넣고 추가 ts적용 예정
bot.on("message", async (msg:any) => {
    const count = fs.readdirSync("./wallets").length;
    const text = msg.text.split(" ");
    const _id = msg.from.id;
    const chatId = msg.chat.id;


    // 봇에서 text 인풋에 따라 상호작용할때 else if를 쓰고 케이스를 정하는게 옳은지는 생각해봐야할 듯
    if (text[0] == "현황") {
    } else if (text[0] =='요청1'){
    } else if (text[0] =='요청2'){
    } else if (text[0] =='요청3'){
    } else if (text[0] =='요청4'){
    }

})





runDistribute(3,5)

