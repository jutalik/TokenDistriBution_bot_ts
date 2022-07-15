import Caver from 'caver-js'
import {ethers} from 'ethers'
import fs from 'fs'
import {lpAddress,perAddress,ILpABI,IKlaySwapABI,tokenAbi,klaySwapFactoryAddress } from './asset'
require('dotenv').config({path:'../../.env'});
const caver = new Caver(process.env.EN_NODE_URI)
const PER = new caver.klay.Contract(tokenAbi, perAddress);


// interface createdWallet {
//     address: string
//     priv: string    
// }

/**
 * @title _TransferInfo 
 * @description transfer TX를 실행시키기 위한 정보들
 */
interface _TransferInfo {
    from_address: string
    from_privKey: string
    toAddress: string
    sendValue: string
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
class Wallet {
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
export const createWallet = (_path:number):string[] => {
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


export const _perTransfer = async (TxInfo:_TransferInfo) => {
    console.log(TxInfo.from_address)
    console.log(TxInfo.from_privKey)
    console.log(TxInfo.toAddress)
    console.log(TxInfo.sendValue)
  }

export const _klayTransfer = async (TxInfo:_TransferInfo) => {
    console.log(TxInfo.from_address)
    console.log(TxInfo.from_privKey)
    console.log(TxInfo.toAddress)
    console.log(TxInfo.sendValue)
  }

export const writeFile = async (walletStruct:Wallet, _pathNumb:number):Promise<void> => {
    // 이동해야함
    fs.writeFileSync(`./wallets/${_pathNumb}.json`, JSON.stringify(walletStruct))
    fs.writeFileSync(`./createdWallet/${_pathNumb}.json`, JSON.stringify(walletStruct))
}


export const runDistribute = (min:number,max:number) => {

    // 랜덤시간 생성하고 인터벌 도는 함수
    function randomInterval(callback:any, min:number, max:number) {
        let timeout:any;
        const randomNum = (max:number, min:number = 0) => Math.random() * (max - min) + min;
        const stop = () => clearTimeout(timeout)
        const tick = () => {
            let time = randomNum(min, max);
            stop();

            timeout = setTimeout(() => {
                tick();
                callback && typeof callback === "function" && callback(stop);
            }, time)
        }    
        tick();
    }  


    // 실행함수
    randomInterval(async (stop:any) => {
        
        // 0시 ~ 5시는 실행안됨
        if (new Date().getHours() > 5) {

            // 
            // function - 랜덤으로 인덱스, 랜덤으로 수량, 랜덤으로 뽑힌 인덱스의 월렛 밸런스가 랜덤수량 이상인지 체크하는 로직 추가
            // if 랜덤으로 뽑힌 월렛밸런스가 밸런스가 부족하다면 다시 재차 랜덤으로 인덱스 뽑기 - (randomValue < 보유Value) == true


            // //전송 로직
            // await _perTransfer(transferInfo)
            // await _klayTransfer(transferInfo)
    
    
        } else {
            console.log('revert 현재시간')
        }
    
    }, min*(1000), max*(1000)) 
    // }, min*(1000*60), max*(1000*60)) 
}

