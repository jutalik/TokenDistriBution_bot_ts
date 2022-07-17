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
            const file = JSON.parse(fs.readFileSync(`./wallets/${i}.json`, "utf8"));
            file.perBalance = await PER.methods.balanceOf(file.address).call();
            file.klayBalance = caver.utils.hexToNumberString(await caver.rpc.klay.getBalance(file.address));
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
    const account = caver.klay.accounts.createWithAccountKey(
        TxInfo.from_address,
        TxInfo.from_privKey,
    );
    console.log('okay1')

    let _input = PER.methods
        .transfer(TxInfo.toAddress, `${caver.utils.convertToPeb(String(TxInfo.sendValue), "KLAY")}`).encodeABI();
    console.log('okay2')


    let spender = await caver.wallet.getKeyring(TxInfo.from_address);
    if (spender == undefined) {
        try {
            spender = caver.wallet.newKeyring(TxInfo.from_address, TxInfo.from_privKey);
        } catch (err) {
            console.log(err);
        }
    }


    let tokenTransferTx = new caver.transaction.smartContractExecution(
        {
            from: account.address,
            to: perAddress,
            input: _input,
            gas: 90000,
        },
    );
    console.log('okay4')
    try {
        await caver.wallet.sign(TxInfo.from_address, tokenTransferTx);
        const receipt = await caver.rpc.klay.sendRawTransaction(
            tokenTransferTx.getRLPEncoding(),
        );
        const TX_HASH = receipt.transactionHash;
        caver.wallet.remove(account.address);
        console.log(`PER 전송 : ${TX_HASH}`)
    } catch (err) {
        console.log(err);
    }
  }

export const _klayTransfer = async (TxInfo:_TransferInfo) => {
    let account = caver.klay.accounts.createWithAccountKey(TxInfo.from_address, TxInfo.from_privKey)
    caver.klay.accounts.wallet.add(account)
    const _SendEA = caver.utils.convertToPeb('1', 'KLAY')

    const valueTransferTx = {
        type: 'VALUE_TRANSFER',
        from: TxInfo.from_address,
        to: TxInfo.toAddress,
        value: _SendEA,
        gas: 25000,
    }

    const valueTxReceipt = await caver.klay.sendTransaction(valueTransferTx)
    console.log(`KLAY 전송 : ${valueTxReceipt.transactionHash}`)
    console.log('=============================')
    caver.wallet.remove(account.address);
  }

export const writeFile = async (walletStruct:Wallet, _pathNumb:number):Promise<void> => {
    // 이동해야함
    fs.writeFileSync(`./wallets/${_pathNumb}.json`, JSON.stringify(walletStruct))
    fs.writeFileSync(`./createdWallet/${_pathNumb}.json`, JSON.stringify(walletStruct))
}

const getInfo = async() => {
    let _count = () => fs.readdirSync("./wallets").length;
    const decimalRandom = () => String(Math.random())
    const balanceRandom = () => String(Math.floor(Math.random() * (6000 - 4000) + 4000))

    let randomWalletNumber = () => Math.floor(Math.random() * (266 - 0) + 0)
    let transferRandom = balanceRandom()
    let _decimalRandom = decimalRandom()
    let walletIndex = randomWalletNumber()
}

export const runDistribute = (min:number,max:number) => {

    // 랜덤시간 생성하고 인터벌 도는 함수
    function randomInterval(callback:(stop: ()=>void)=>Promise<void>, min:number, max:number) {
        let timeout:NodeJS.Timeout;
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
    randomInterval(async (stop:()=>void) => {

        // 0시 ~ 5시는 실행안됨
        if (new Date().getHours() > 5) {

            //
            // function - 랜덤으로 인덱스, 랜덤으로 수량, 랜덤으로 뽑힌 인덱스의 월렛 밸런스가 랜덤수량 이상인지 체크하는 로직 추가
            // if 랜덤으로 뽑힌 월렛밸런스가 밸런스가 부족하다면 다시 재차 랜덤으로 인덱스 뽑기 - (randomValue < 보유Value) == true

            let transferInfo = await getInfo()
            // //전송 로직
            // await _perTransfer(transferInfo)
            // await _klayTransfer(transferInfo)


        } else {
            console.log('revert 현재시간')
        }

    }, min*(1000), max*(1000))
    // }, min*(1000*60), max*(1000*60))
}

