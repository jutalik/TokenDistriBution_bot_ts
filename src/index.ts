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
    if (text[0] == "도움말") {
        bot.sendMessage(
            chatId,
            `도움말 - 명령어 리스트\n현황 - 현재 분배 월렛 현황\n월렛리스트 - 분배된 월렛리스트 파일 받기`
          );
    } else if (text[0] =='현황'){
        bot.sendMessage(
            chatId,
            `최신 밸런스 업데이트 중입니다. \n잠시만 기다려주세요 \n다른 명령어를 사용하지 말아주세요`
          );
            let [klayBalance, perBalance] = await getTotalBalance()
          
          await updateWallet() ? 
            console.log(klayBalance)
            
            
          
          :
          bot.sendMessage(
            chatId,
            `error가 발생 했습니다. 조이사에게 문의주세요.`
          )


        bot.sendMessage(
            chatId,
            `도움말 - 명령어 리스트\n현황 - 현재 분배 월렛 현황\n월렛리스트 - 분배된 월렛리스트 파일 받기`
          );
    } else if (text[0] =='월렛리스트'){
        bot.sendMessage(
            chatId,
            `도움말 - 명령어 리스트\n현황 - 현재 분배 월렛 현황\n월렛리스트 - 분배된 월렛리스트 파일 받기`
          );
    }

})





runDistribute(3,5)

