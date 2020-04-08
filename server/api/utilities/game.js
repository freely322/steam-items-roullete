import Timer from "Timer.js";
import moment from "moment";
import Game from "../../../models/game";
import _ from "lodash";
import Chance from "chance";
import User from "../../../models/user";
import Config from "../../../models/config";
import { io } from "../apiServer";

let gameTimer = null;
let tickTimer = null;
let gameDuration = 1;
let gameCommission = 0.05;
let nicknameBountyMultiplier = 1.1;
let timeRemains = moment.duration(gameDuration, 'm');
let id = 0;

export const startTimer = () => {
  gameTimer = Timer();
  tickTimer = Timer();
  tickTimer.every('1 second', () => {
    timeRemains.subtract(1, 's');
    let result = timeRemains;
    let minutes = `${result.minutes()}`;
    let seconds = `${result.seconds()}`;
    if (seconds < 0) {
      seconds = '0'
    }
    if (`${seconds}`.length === 1) {
      seconds = '0' + seconds
    }
    if (`${minutes}`.length === 1) {
      minutes = '0' + minutes
    }
    io.emit('timer', `${minutes}:${seconds}`)
  });

  tickTimer.start();
};

//Game.deleteMany({}).catch(err => console.log(err))
//Bet.deleteMany({}).catch(err => console.log(err))
//Config.deleteMany({}).catch(err => console.log(err))

export const startGame = () => {
  Game.findOne({id: 1}, (err, game) => {
    if (err) {
      return console.log(err)
    }
    if (game) {
      Game.find({}).sort({time: 'desc'}).exec((err, games) => {
        if (err) {
          return console.log(err);
        }
        games.map((game) => {
          if (game.passed === false) {
            game.passed = true;
            game.save()
          }
        });
        id = games[0].id;
        gameCycle(gameDuration, games[0].id)
      })
    } else {
      Game.create({
        id: 1,
        items: [],
        bets: [],
        time: moment().format('x')
      }).then(() => {
        Game.find({}).sort({time: 'desc'}).exec((err, games) => {
          if (err) {
            console.log(err);
            return
          }
          id = games[0].id;
          gameCycle(gameDuration, games[0].id)
        })
      })
    }
  });
};

const calculateWinner = (id) => {
  let bets = [];
  let weights = [];
  let prize = [];
  let winner = null;
  Game.findOne({
    id: id
  })
  .populate('bets')
  .populate({
    path: 'bets',
    populate: {
      path: 'user',
      model: 'User'
    }
  })
  .exec((err, game) => {
    game.bets.map(bet => {
      let betWeight = 0;
      if (bet.items.length > 0) {
        bet.items.map(item => {
          betWeight += +item.price;
          prize.push(item)
        });
        if (/(e4zy\.bet)/gmi.test(bet.user.nickname)) {
          console.log('BOUNTY-BOUNTY-BOUNTY-BOUNTY-BOUNTY-BOUNTY-BOUNTY-BOUNTY-BOUNTY-BOUNTY-BOUNTY-BOUNTY')
          betWeight = betWeight * nicknameBountyMultiplier
        }
        bets.push(bet);
        weights.push(betWeight)
      } else {
        bet.remove()
      }
    });
    prize = _.sortBy(prize, 'price');
    if (bets.length > 0) {
      const chance = new Chance();
      winner = chance.weighted(bets, weights);
      let winnerWeight = 0;
      let totalWeight = 0;
      winner.items.map(item => {
        winnerWeight += item.price
      });
      prize.map(item => {
        totalWeight += item.price
      });
      let commission = [];
      let commissionBufer = totalWeight * gameCommission;
      if (game.bets.length > 1) {
        for (let i = prize.length - 1; i >= 0; i--) {
          if (prize[i].price < commissionBufer) {
            commissionBufer -= prize[i].price;
            commission.push(prize[i])
          }
          if (i === 0 && commission.length === 0) {
            commissionBufer -= prize[i].price;
            commission.push(prize[i])
          }
        }
      }
      let commissionCost = 0;
      commission.map(item => {
        commissionCost += item.price;
      });
      io.emit('Commission', `number of items: ${commission.length}, min commission: ${commissionBufer}, fact commission: ${commissionCost}`);
      prize = _.xorBy(prize, commission, 'id');
      game.winner = winner._id;
      game.user = winner.user;
      game.prize = prize;
      game.chance = (winnerWeight * 100 / totalWeight).toFixed(2);
      game.weight = winnerWeight.toFixed(2);
      game.total = totalWeight.toFixed(2);
      game.save();
      User.findById(winner.user, (err, user) => {
        if (err) {
          console.log(err);
          return
        }
        user.inventory = _.reverse(_.sortBy([...user.inventory, ...prize], 'price'));
        user.wins = user.wins + 1;
        user.totalWin = user.totalWin + totalWeight;
        let winnerData = {
          user: user,
          multiplier: (totalWeight / winnerWeight).toFixed(2)
        };
        io.emit('winner', winnerData);
        user.save();
        let time = moment().format('x');
        setTimeout(() => {
          Game.create({
            id: id + 1,
            time: time
          }, (err) => {
            if (err) {
              return console.log(err);
            }
            io.emit('newGame', `new game #${id + 1} starts`);
            timeRemains = moment.duration(gameDuration, 'm');
            gameTimer.clear();
            id = id + 1;
            gameCycle(gameDuration, id)
          })
        }, 15000)
      })
    } else {
      let time = moment().format('x');
      setTimeout(() => {
        Game.create({
          id: id + 1,
          time: time
        }, (err) => {
          if (err) {
            return console.log(err);
          }
          io.emit('newGame', `new game #${id + 1} starts`);
          timeRemains = moment.duration(gameDuration, 'm');
          gameTimer.clear();
          id = id + 1;
          gameCycle(gameDuration, id)
        })
      }, 15000);
      game.remove();
    }
  })

};

const gameCycle = (duration, id) => {
  console.log('NEW GAME: #', id);
  Config.findOne({id: 'config'})
  .then((config) => {
    if (!config) {
      let options = {
        minBet: 1,
        gameDuration: 2,
        commission: 0.05,
        nicknameBountyMultiplier: 1.1,
        id: "config"
      };
      Config.create(options, (err) => {
        if (err) {
          console.log(err);
          return
        }
        console.log("Config created")
      })
    } else {
      gameDuration = config.gameDuration;
      gameCommission = config.commission;
      nicknameBountyMultiplier = config.nicknameBountyMultiplier
    }
    gameTimer.bind(`${duration} minutes`, () => {
      Game.findOne({
        id: id
      })
      .populate('bets')
      .exec((err, game) => {
        game.passed = true;
        if (game.bets.length > 0) {
          calculateWinner(id)
        } else {
          let time = moment().format('x');
          Game.create({
            id: id + 1,
            duration: config.gameDuration,
            time: time
          }, (err) => {
            if (err) {
              console.log(err);
              return
            }
            io.emit('newGame', `new game #${id + 1} starts`);
            timeRemains = moment.duration(config.gameDuration, 'm');
            gameTimer.clear();
            id = id + 1;
            gameCycle(config.gameDuration, id)
          })
        }
        game.save()
      })
    });
    gameTimer.start()
  }).catch(err => console.log(err));
};