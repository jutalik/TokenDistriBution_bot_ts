
require('dotenv').config({path:'../.env'});
const TelegramBot = require("node-telegram-bot-api");
import {createWallet,updateWallet,getTotalBalance} from './helper/blockChainFunctions'


// console.log(createWallet('0'))



const run = async () => {
    // var res = await updateWallet()
    var klay
    var per
    [klay,per] = await getTotalBalance()

    console.log(klay)
    console.log(per)
}


run()