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

     get name(){
         if (this.bets.length > 0){
             return this.bets[0].name;
         }
         return "";
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

class ConditionalBet extends MultiBet {

  constructor(bets, onPreviousCondition, consecutiveAmount, conditionAmountPercent) {
      super(bets);
      this.bets = bets;
      this.onPreviousCondition = onPreviousCondition;
      this.consecutiveAmount = consecutiveAmount;
      this.conditionAmountPercent = conditionAmountPercent;

      this.conditionalFilter();
  }

  conditionalFilter() {
    let playBet = true;

    if (this.onPreviousCondition !== false && this.onPreviousCondition !== "") {
      playBet = false;
      switch(this.onPreviousCondition) {
        case "Win":
          playBet = (new Win().shouldStart(winStreak));
          console.log('should play: ' + (playBet ? 'true' : 'false'));
          break;
        case "Lose":
          playBet = (new Lose().shouldStart(loseStreak));
          break;
        case "ConsecutiveWin":
          playBet = (new ConsecutiveWin(this.consecutiveAmount).shouldStart(winStreak));
          break;
        case "ConsecutiveLose":
          playBet = (new ConsecutiveLose(this.consecutiveAmount).shouldStart(loseStreak));
          break;
        case "ResultAmountPercentFromPreviousBet":
          // to do
          //playBet = (new ResultAmountPercentFromPreviousBet(results).shouldStart());
          break;
      }
    }

    if(!playBet) {
      console.log("should not play bet " + this.toString() + ' - onPreviousCondition: ' + this.onPreviousCondition);
      this.bets = [];
    }
  }

  get name(){
      if (this.bets.length > 0){
          return this.bets[0].name;
      }
      return "";
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

    constructor(offset = 0) {
        this.offset = offset;
    }

    next() {
        // to do : offset
        return 1 + this.offset;
    }

    currentNumber() {
      return 1;
    }

    reset() {

    }
}

class WithoutSequencer extends Sequencer {


    constructor(offset = 0) {
        super(offset);
    }
}

class FibonacciSequencer extends Sequencer {


    constructor(offset = 0) {
        super(offset);
        this.current = 0;
        this.nextV = 1;
    }

    currentNumber() {
      return this.current;
    }

    next() {
        // to do: offset
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

    constructor(factor, offset = 0) {
        super(offset);
        this.factor = factor;
        this.current = 0;
    }

    currentNumber() {
      return Math.pow(this.factor,  this.current);
    }

    next() {
        // to do: offset
        return Math.pow(this.factor,  this.current++);
    }

    reset() {
        this.current = 0;
    }
}

class DalambertSequencer extends Sequencer {

    constructor(factor, offset = 0) {
        super(offset);
        this.factor = factor;
        this.current = 0;
    }

    currentNumber() {
      return this.current;
    }

    next(){
        // to do: offset
        return this.current++ * this.factor;
    }

    reset() {
        this.current = 0;
    }
}

var winStreak = 0;
var loseStreak = 0;

class BetCreator {
    constructor(maxBet, sequencer, bets, resetAfterWin = true, sequenceOffset = 0, sequenceStepper = 1, sequenceStepperStreak = "loseStreak", onPreviousCondition = false, consecutiveAmount = 1, conditionAmountPercent = 100, amountUnit = "unit") {
        this.maxBet = maxBet;
        let sn = sequencer.split(" ");

        this.sequenceOffset = sequenceOffset;
        this.sequencerName = sn[sn.length -1];
        this.sequencer = eval(sequencer);
        this.sequenceStepper = sequenceStepper;
        this.sequenceStepperStreak = sequenceStepperStreak;
        this.bets = bets;
        this.resetAfterWin = resetAfterWin;
        this.onPreviousCondition = onPreviousCondition;
        this.consecutiveAmount = consecutiveAmount;
        this.conditionAmountPercent = conditionAmountPercent;
        this.amountUnit = amountUnit;
    }

    createBet(results) {

        if (results.length > 0) {
              for (const resultElement of results[results.length - 1].bets) {
                  for (const key of Object.keys(this.bets)) {
                      if (resultElement.name === key) {
                          if (this.resetAfterWin && resultElement.hasWon()) {
                            this.sequencer.reset();
                          }

                          if (resultElement.hasWon()) {
                            winStreak++;
                            loseStreak = 0;
                          }
                          else {
                            winStreak = 0;
                            loseStreak++;
                          }
                      }
                  }
              }
        }

        let next = this.sequencer.currentNumber();
        if (next === 0 || (this[this.sequenceStepperStreak] > 0 && this[this.sequenceStepperStreak] % this.sequenceStepper === 0) || this.sequenceStepper === 0 || this.sequenceStepper === 1) {
          next = this.sequencer.next();
        }

        var bets = [];
        for (const key of Object.keys(this.bets)) {
            let bet = this.bets[key];
            bets.push(new Bet(bet.name, bet.amount * next, bet.numbers));
        }
        let mb = new ConditionalBet(bets, this.onPreviousCondition, this.consecutiveAmount, this.conditionAmountPercent);
        if (mb.amount > this.maxBet){
            this.sequencer.reset();
            return this.createBet(results);
        }

        return mb;
    }
}

class StartCondition {
  constructor(name) {
      this.name = name;
  }

  shouldStart(){
      return true;
  }
}


//Win / Lose / ConcecutiveLose / ConsecutiveWin / ResultAmountPercentFromPreviousBet
class ConsecutiveWin extends StartCondition {
  constructor(wins) {
      super("ConsecutiveWin (" + wins + ")");
      this.wins = wins;
  }

  shouldStart(currentWins){
      return currentWins >= this.wins;
  }
}

class Win extends ConsecutiveWin {
  constructor(ignore) {
      super("Win");
      this.wins = 1;
  }
}

class ConsecutiveLose extends StartCondition {
  constructor(loses) {
      super("ConsecutiveLose (" + loses + ")");
      this.loses = loses;
  }

  shouldStart(currentLoses){
      return currentLoses >= this.loses;
  }
}

class Lose extends ConsecutiveLose {
  constructor(ignore) {
      super("Lose");
      this.loses = 1;
  }
}

// z.b. für 3 bet entry
class AmountPercentFromPreviousBetResult extends StartCondition {
  constructor(percent) {
      super("AmountPercentFromPreviousBetResult (" + percent + "%)");
      this.percent = percent;
  }

  shouldStart(results) {
    // to do: fix
      return results[results.length-1].bets[results[results.length-1].bets.length-1].payout()  >= results[results.length-1].bets[results[results.length-1].bets.length-1].amount / 100 * percent;
  }
}

class StopCondition {
    constructor(name) {
        this.name = name;
    }

    shouldStop(startBankroll, bankroll, results){
        return false;
    }
}

class Bankrupt extends StopCondition{
    constructor(ignore) {
        super("Bancrupt");
    }

    shouldStop(startBankroll, bankroll, results){
        return bankroll <= 0;
    }
}

class MaxRolls extends StopCondition{
    constructor(maxRolls) {
        super("MaxRolls(" + maxRolls + ")");
        this.maxRolls = maxRolls;
    }

    shouldStop(startBankroll, bankroll, results){
        return results.length >= this.maxRolls;
    }
}

class MinWin extends StopCondition{
    constructor(minWin) {
        super("MinWin(" + minWin + ")");
        this.minWin = minWin;
    }

    shouldStop(startBankroll, bankroll, results){
        return  bankroll - startBankroll >= this.minWin;
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
        this.sequenceStepper = 1; // next() every x
        this.sequenceStepperStreak = "loseStreak"; // next() every x wins/loses

        this.bets = {};
        this.resetAfterWin = true;
        this.sequenceOffset = 0;
        this.onPreviousCondition = false; // false / win / lose / concecutiveLose / consecutiveWin / amountPercentFromPreviousBetResult
        this.consecutiveAmount = 1;
        this.conditionAmountPercent = 0;
        this.amountUnit = "unit"; // unit / percentFromPreviousBet / percentFromPreviousResult
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
            //this.bets[name] = {numbers: numbers, amount: this.amount, name: name, onPreviousCondition: this.onPreviousCondition, consecutiveAmount: this.consecutiveAmount, conditionAmountPercent: this.conditionAmountPercent};
            this.bets[name] = {numbers: numbers, amount: this.amount, name: name};
        }
    }



    enterBets(){
        let creator = new BetCreator(this.maxBet, this.sequencer, this.bets, this.resetAfterWin, this.sequenceOffset, this.sequenceStepper, this.sequenceStepperStreak, this.onPreviousCondition, this.consecutiveAmount, this.conditionAmountPercent, this.amountUnit);
        this.bets = {};

        return creator;
    }

}




function pageData() {
    return {
        bankroll: 400,

        simulations: 10,
        rouletteNumbers: rouletteNumbers(),

        rouletteData: new RouletteData(),
        betCreators: [],
        results: [],
        stopConditions: [],
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
            this.betCreators.forEach(c => {
                c.sequencer.reset();
            });
            let table = new RouletteTable();
            var broll = this.bankroll;

            let simulation = 1;
            let betEnd = false;
            let totalResult = 0;
            while (simulation <= this.simulations) {
                let roll = table.roll();
                let bets = this.createBets();
                for (const bet of bets) {
                    if (broll <= bet.amount) {
                        betEnd = true;
                        break;
                    }
                    broll -= bet.amount;
                    bet.setRoll(roll);
                    if (bet.hasWon()) {
                        totalResult += bet.netWin();
                        broll += bet.payout();
                        this.betCreators.forEach(c => {
                            c.sequencer.reset();
                        });
                    }
                    else {
                      totalResult -= bet.amount;
                    }
                }
                this.results.push({roll: roll, bets: bets, bankroll: broll, simulation: simulation, totalResult: totalResult});
                for (const con of this.stopConditions) {
                    if (con.shouldStop(this.bankroll, broll, this.results)) {
                        betEnd = true;
                        break;
                    }
                }

                if (betEnd) {
                  this.betCreators.forEach(c => {
                      c.sequencer.reset();
                  });
                  broll = this.bankroll;
                  betEnd = false;
                  simulation++;
                }

                // zur sicherheit
                if (simulation > 100) {
                  break;
                }


            }
        },

        reset(){
          this.results = [];
          this.betCreators = [];
          this.rouletteData = new RouletteData();
          loseStreak = 0;
          winStreak = 0;
        },




    };
}

function sequencerOptions(sequenceOffset = 0) {
    return [
        {
            name: "NoSequence",
            value: "new WithoutSequencer("+sequenceOffset+")"
        },
        {
            name: "Fibonacci",
            value: "new FibonacciSequencer("+sequenceOffset+")"
        },
        {
            name: "Martingale",
            value: "new FactorSequencer(2,"+sequenceOffset+")"
        },
        {
            name: "TripleMartingale",
            value: "new FactorSequencer(3,"+sequenceOffset+")"
        },
        {
            name: "Dalambert",
            value: "new DalambertSequencer(1,"+sequenceOffset+")"
        },
    ];
}
