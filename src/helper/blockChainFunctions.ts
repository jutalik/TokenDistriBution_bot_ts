import Caver from 'caver-js'
import {ethers} from 'ethers'
import fs from 'fs'
import {lpAddress,perAddress,ILpABI,IKlaySwapABI,tokenAbi,klaySwapFactoryAddress } from './asset'
require('dotenv').config({path:'../../.env'});
const caver = new Caver(process.env.EN_NODE_URI)
const PER = new caver.klay.Contract(tokenAbi, perAddress);


interface createdWallet {
    address: string
    priv: string    
}

/**
 * @description json에 저장할 월렛 클래스형식
 * @param wallet.name :string
 * @param wallet.address :string
 * @param wallet.privKey :string
 * @param wallet.klayBalance :string
 * @param wallet.perBalance :string
 * @param wallet.index :number
 */
export class Wallet {
    name: string
    address: string
    privKey: string
    klayBalance: string
    perBalance: string
    index:number

    constructor(name:string,address:string,privKey:string,klayBalance:string,perBalance:string,index:number){
        this.name = name;
        this.address = address
        this.privKey = privKey
        this.klayBalance = klayBalance
        this.perBalance = perBalance
        this.index = index
    }
}



/**
 * @param _path 월렛생성 패스설정값
 * @return [어드레스,프라이빗키] 스트링 반환
 */
export const createWallet = (_path:string):string[] => {
    let wallet = ethers.Wallet.fromMnemonic(`${process.env.MNEMONIC_WORD}`,`m/44'/60'/0'/0/${_path}`)
    return [wallet.address, wallet.privateKey]
}



export const updateWallet = async ():Promise<boolean> => {
    let count:number = fs.readdirSync('./wallets').length;
    for (let i = 0; i < count; i++) {
        try{ 
            let file = JSON.parse(fs.readFileSync(`./wallets/${i}.json`, "utf8"));
            await PER.methods.balanceOf(file.address).call().then((res:any)=>{
                file.perBalance = res
            })
            await caver.rpc.klay.getBalance(file.address).then((res:any)=>{
                res = caver.utils.hexToNumberString(res)
                file.klayBalance = res
            })           
            fs.writeFileSync(`./wallets/${i}.json`, JSON.stringify(file));
        } catch(e){
            console.log(e)
        }
    }
    return true
}


export const getTotalBalance = async ():Promise<number[]> => {
    let count = fs.readdirSync("./wallets").length;
    let klayBalance = 0;
    let perBalance = 0;
  
    for (let i = 0; i < count; i++) {
      let file = JSON.parse(fs.readFileSync(`./wallets/${i}.json`, "utf8"));
      klayBalance += Number(file.klayBalance);
      perBalance += Number(file.perBalance);
    }
    return [klayBalance / 1000000000000000000, perBalance / 1000000000000000000];
  };

