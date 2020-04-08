import Game from '../../../models/game';
import Bet from '../../../models/bet';
import Item from "../../../models/item";
import User from "../../../models/user";
import _ from 'lodash';
import moment from 'moment';
import uuidv1 from 'uuid/v1';


export const getAll = (req, res) => {
    Game.find({})
        .populate('bets')
    .then(games => {res.send(games)})
    .catch(err => res.end(err));
};

export const getWinners = (req, res) => {
    try {
    Game.find({
        passed: true,
        $where: `this.time > ${moment().startOf('d').format('x')}`
    })
        .populate({
            path: 'winner',
            model: 'Bet',
        })
        .populate({
            path: 'user',
            model: 'User',
        })
        .exec((err, games) => {
            let winners = [];
            games && games.map(game => {
                game.winner && winners.push({
                    prize: game.prize,
                    user: {
                        avatar: game.user.avatar,
                        nickname: game.user.nickname
                    },
                    chance: game.chance,
                    weight: game.weight,
                    total: game.total
                })
            });
            res.send(winners)
        })
        } catch (e) {
            console.log('Bet error')
        }
};


export const getOne = (req, res) => {
    Game.findOne({ id: req.params.id })
        .populate('bets')
        .then(game => res.send(game))
        .catch(err => res.send(err));
};

export const placeBet = (req, res) => {
    console.log(req.body)
    console.log(req.params)
    console.log(req.query)
    try {
    Game.findOne({passed: false})
        .populate('bets')
        .exec((err, game) => {
            if (err) {
                console.log(err);
                return res.end('bet error')
            }
            if (game) {
                User.findOne({id: req.body.id})
                    .populate('bets')
                    .exec((err, user) => {
                        if (err) {
                            console.log(err);
                            return res.end('bet error')
                        }
                        if (user) {
                            let betItems = req.body.items;
                            if (game.bets.length > 0 && game.bets.filter(bet => bet.user.toString() === user._id.toString()).length !== 0) {
                                Bet.findById(game.bets.filter(bet => bet.user.toString() === user._id.toString())[0]._id, (err, bet) => {
                                    bet.items = [...bet.items, ...betItems];
                                    bet.save();
                                    user.inventory = _.xorBy(user.inventory, betItems, 'id');
                                    user.save();
                                    console.log('bet updated');
                                    res.end('bet updating - success')
                                })
                            } else {
                                Bet.create({
                                    id: uuidv1(),
                                    user: user,
                                    game: game,
                                    items: betItems
                                }, (err, bet) => {
                                    if (user.bets) {
                                        user.bets.push(bet)
                                    } else {
                                        user.bets = [bet]
                                    }
                                    game.bets.push(bet);
                                    user.inventory = _.xorBy(user.inventory, betItems, 'id');
                                    user.games = user.games + 1;
                                    user.save();
                                    game.save();
                                    console.log('bet created');
                                    res.end('bet adding - success');
                                })
                            }
                        }
                    })
            }
        })
    } catch (e) {
        console.log(e);
        res.end('bet error')
    }
};

export const getCurrent = (req, res) => {
    Game.findOne({ passed: false })
        .populate('bets')
        .populate({
            path: 'bets',
            populate: {
                path: 'user',
                model: 'User'
            }
        })
        .then(game => {
            let iterated = {
                time: game.time,
                id: game.id,
                bets: game.bets.map(bet => {
                    return {
                        id: bet.id,
                        user: {
                            avatar: bet.user.avatar,
                            nickname: bet.user.nickname,
                        },
                        items: bet.items
                    }
                })
            };
            res.send(iterated)
        })
        .catch(err => res.end("Can't get current game"));
};
