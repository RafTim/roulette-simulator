class RouletteTable {
        constructor(doubleZero) {
            this.numbers = [];
            for (let i = 0; i < 37; i++) {
                this.numbers.push(i);
            }
            if (doubleZero) {
                this.numbers.push(0);
            }
        }

        roll() {
            return this.numbers[Math.floor(Math.random() * this.numbers.length)];
        }
    }

class Bet {
    constructor(name, amount, numbers) {
        this.amount = amount;
        this.name = name;
        this.numbers = numbers;
        this.roll = -1;
    }

    paymentFactor() {
        return (36 / this.numbers.length);
    }

    payout() {
        if (this.hasWon()) {
            return this.amount * this.paymentFactor();
        }
        return this.amount * -1;
    }

    setRoll(number) {
        this.roll = number;
    }

    hasWon() {
        return this.numbers.includes(this.roll);
    }


    toString() {
        return `${this.name}(${this.amount})`;
    }

}

class MultiBet{
     constructor(bets) {
         this.bets = bets;
     }

     get amount(){
         var sum = 0;
         this.bets.forEach(bet => {
             sum += bet.amount;
         });
         return sum;
     }

     payout(){
         var sum = 0;
         this.bets.forEach(bet => {
             let po = bet.payout();
             if (po > 0){
                 sum += bet.payout();
             }

         });
         return sum;
     }

     netWin(){
         return this.payout() - this.amount;
     }

     hasWon(){
         return this.netWin() > 0;
     }

     setRoll(number){
         this.bets.forEach(bet => {
             bet.setRoll(number);
         });
     }

     toString(){
         var s = "";
         this.bets.forEach(bet => {
             s += `${bet.toString()}`;
         });
         return s;
     }
}

class Sequencer {


    next() {
        return 1;
    }

    reset() {

    }
}

class FibonacciSequencer extends Sequencer {


    constructor() {
        super();
        this.current = 0;
        this.nextV = 1;
    }

    next() {
        let next = this.current + this.nextV;
        this.current = this.nextV;
        this.nextV = next;
        return this.current;
    }

    reset() {
        this.current = 0;
        this.nextV = 1;
    }
}

class FactorSequencer extends Sequencer {

    constructor(factor) {
        super();
        this.factor = factor;
        this.current = 0;
    }

    next() {
        return Math.pow(this.factor,  this.current++);
    }

    reset() {
        this.current = 0;
    }
}

class DalambertSequencer extends Sequencer {

    constructor(factor) {
        super();
        this.factor = factor;
        this.current = 0;
    }

    next(){
        return this.current++ * this.factor;
    }

    reset() {
        this.current = 0;
    }
}

class BetCreator {
    constructor(maxBet, sequencer, bets, resetAfterWin = true) {
        this.maxBet = maxBet;
        let sn = sequencer.split(" ");

        this.sequencerName = sn[sn.length -1];
        this.sequencer = eval(sequencer);
        this.bets = bets;
        this.resetAfterWin = resetAfterWin;
    }

    createBet(results) {

        if (this.resetAfterWin && results.length > 0) {
            for (const resultElement of results[results.length - 1].bets) {
                if (resultElement.hasWon()) {
                    this.sequencer.reset();
                    break;
                }
            }

        }
        let next = this.sequencer.next();

        var bets = [];
        for (const key of Object.keys(this.bets)) {
            let bet = this.bets[key];
            bets.push(new Bet(bet.name, bet.amount * next, bet.numbers));

        }
        let mb = new MultiBet(bets);
        if (mb.amount > this.maxBet){
            this.sequencer.reset();
            return this.createBet(results);
        }

        return mb;
    }
}


function rouletteNumbers(){
    return {
        reds:[2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35],
        allNumbers:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36],
        get blacks(){
            return this.allNumbers.filter(x => !this.reds.includes(x));
        },
        get even(){
            return this.allNumbers.filter(x => x % 2 === 0);
        },
        get odd(){
            return this.allNumbers.filter(x => x % 2 === 1);
        },
        get firstHalf(){
            return this.allNumbers.filter(x => x <= 18);
        },
        get secondHalf(){
            return this.allNumbers.filter(x => x > 18);
        },
        firstCol:  [3,6,9,12,15,18,21,24,27,30,33,36],
        secondCol: [2,5,8,11,14,17,20,23,26,29,32,35],
        thirdCol: [1,4,7,10,13,16,19,22,25,28,31,34],
        firstDozen: [1,2,3,4,5,6,7,8,9,10,11,12],
        secondDozen: [13,14,15,16,17,18,19,20,21,22,23,24],
        thirdDozen: [25,26,27,28,29,30,31,32,33,34,35,36],
        itemClass(number){
            var s = "";
            if (this.thirdCol.includes(number)){
                s += "noPaddingBottom ";
            } else if (number < 36 && this.firstCol.includes(number)){
                s += "noPaddingTop ";
            }
            if (this.reds.includes(number)){
                s += "red-item";
            } else {
                s += "black-item";
            }

            return s;

        }
    }
}

class RouletteData {
    constructor() {
        this.amount = 1;
        this.maxBet = 50
        this.sequencer = '';
        this.bets = {};
        this.resetAfterWin = true;

    }


    showIndicator(name){
            return this.bets.hasOwnProperty(name);
        }

    indicatorNumber(name){
        if (this.showIndicator(name)) return this.bets[name].amount;
        return 0;
    }
    addBet(name, numbers) {
        this.numbers = numbers;
        if (this.bets.hasOwnProperty(name)) {
            this.bets[name].amount += this.amount;
        } else {
            this.bets[name] = {numbers: numbers, amount: this.amount, name: name};
        }
    }



    enterBets(){
        let creator = new BetCreator(this.maxBet, this.sequencer, this.bets, this.resetAfterWin);
        this.bets = {};

        return creator;
    }

}




function pageData() {
    return {
        bankroll: 400,

        simulations: 50,
        rouletteNumbers: rouletteNumbers(),

        rouletteData: new RouletteData(),
        betCreators: [],
        results: [],
        createBets(){
            let bets = [];

            this.betCreators.forEach(betCreator => {
                bets.push(betCreator.createBet(this.results));
            });
            return bets;
        },

        showIndicator(name){
            return this.rouletteData.bets.hasOwnProperty(name)
        },

        indicatorNumber(name){
            if (this.showIndicator(name)) return this.rouletteData.bets[name].amount;
            return 0;
        },
        simulate() {
            this.results = [];
            let table = new RouletteTable();
            console.log(this);

            for (let i = 0; i < this.simulations; i++) {
                let roll = table.roll();
                let bets = this.createBets();
                for (const bet of bets) {
                    if (this.bankroll <= bet.amount) {
                        return;
                    }
                    this.bankroll -= bet.amount;
                    bet.setRoll(roll);
                    if (bet.hasWon()) {
                        this.bankroll += bet.payout();
                    }
                }
                this.results.push({roll: roll, bets: bets, bankroll: this.bankroll});


                if (this.bankroll <= 0) {
                    break;
                }
            }
        },

        reset(){
          this.results = [];
          this.betCreators = [];
          this.rouletteData = new RouletteData();
        },




    };
}


function sequencerOptions() {
    return [
        {
            name: "Fibonacci",
            value: "new FibonacciSequencer()"
        },
        {
            name: "Martingale",
            value: "new FactorSequencer(2)"
        },
        {
            name: "TripleMartingale",
            value: "new FactorSequencer(3)"
        },
        {
            name: "Dalambert",
            value: "new DalambertSequencer(1)"
        }
    ];
}