import User from '../../../models/user';
import Item from '../../../models/item';
import moment from 'moment';
import {io} from '../apiServer'
import _ from 'lodash'
import { manager, community } from '../utilities/bot';

export const getOne = (req, res) => {
    User.findOne({ _id: req.params.id })
        .then(user => res.send(user))
        .catch(err => res.end(err));
};

export const updateUserTradeLink = (req, res) => {
    User.findOne({ id: req.body.id })
        .then(user => {
            user.tradeLink = req.body.tradeLink;
            user.save((err, result) => {
                res.send({
                    status: 200,
                    message: 'Trade link updated'
                })
            })
        })
        .catch(err => {res.send({status: 404, error: err})});
};

export const addItems = (req, res) => {
    res.status(200).end('Add items request added');
    const appid = 570;
    const contextid = 2;
    console.log(req.body)
    console.log(req.params)
    console.log(req.query)
    let items = req.body.items;
    const id = req.body.id;
    User.findOne({ id: id })
        .then(user => {
            console.log('items to send: ', items);
            if (user.tradeLink) {
                const offer = manager.createOffer(user.tradeLink);
                console.log('user tradelink: ', user.tradeLink);
                manager.getInventoryContents(appid, contextid, true, (err, myInv) => {
                    if (err) {
                        console.log(err);
                    } else {
                        offer.getPartnerInventoryContents(
                          appid,
                          contextid,
                          (err, theirInv) => {
                              if (err) {
                                  console.log(err);
                              } else {
                                  items.map(item => {
                                      const theirItem = theirInv.find(their => their.name === item.name);
                                      offer.addTheirItem(theirItem);
                                  });
                                  console.log("TRADE CURRENT STATE *init : ", offer);
                                  offer.send((err, status) => {
                                      console.log("NEW TRADE ERROR: ", err);
                                      let currentTime = moment();
                                      let check = setInterval(() => {
                                          let newTime = moment();
                                          if (newTime.diff(currentTime, 'm') > 3) {
                                              clearInterval(check);
                                              offer.cancel();
                                              io.to(`${req.body.socket}`).emit('error', 'trade offer failed')
                                          }
                                          offer.update((err) => {
                                              //console.log("TRADE ERROR: ", err);
                                              console.log("TRADE CURRENT STATE: ", offer);
                                              if (offer.state === 3) {

                                                  clearInterval(check);
                                                  user.inventory = [...user.inventory, ...items];
                                                  user.save((err, result) => {
                                                      io.to(`${req.body.socket}`).emit('deposit', items);
                                                  })
                                              }
                                          });
                                      }, 10000);
                                      if (err) {
                                          console.log(err);
                                      } else {
                                          io.to(`${req.body.socket}`).emit('info', `Sent offer. Status: ${status}.`);
                                          // immediatelly add items
                                          user.inventory = [...user.inventory, ...items];
                                          user.save((err, result) => {
                                              io.to(`${req.body.socket}`).emit('deposit', items);
                                          })
                                      }
                                  });
                              }
                          }
                        );
                    }
                });
            } else {
                io.to(`${req.body.socket}`).emit('error', 'Set tradelink, please')
            }
        })
        .catch(err => res.end(err));
};

export const withdrawItems = (req, res) => {
    res.status(200).end('Withdraw items request added');
    const appid = 570;
    const contextid = 2;
    const id = req.body.id;
    let items = req.body.items;
    try {
        User.findOne({ id: id })
        .then(user => {
            if (user.tradeLink) {
                const offer = manager.createOffer(user.tradeLink);
                console.log(offer);
                manager.loadInventory(appid, contextid, true, (err, myInv) => {
                    if (err) {
                        console.log(err);
                    } else {
                        items.map(item => {
                            const myItem = myInv.find(my => my.name === item.name);
                            console.log('Inv', myInv);
                            if (myItem) {
                                offer.addMyItem(myItem);
                            }
                        });

                        offer.send((err, status) => {
                            let currentTime = moment();
                            let check = setInterval(() => {
                                let newTime = moment();
                                if (newTime.diff(currentTime, 'm') > 2) {
                                    clearInterval(check);
                                    io.to(`${req.body.socket}`).emit('error', 'trade offer failed')
                                }
                                offer.update((err) => {
                                    console.log("ERROR", err);
                                    community.acceptConfirmationForObject('aorRc0FPSL31FzB8X9LS/EJUVUc=', offer.id, (err) => {
                                        if (err) {
                                            console.log(err)
                                        }
                                    });
                                    if (offer.state === 3) {
                                        clearInterval(check);
                                        user.inventory = _.xorBy(user.inventory, items, 'id');
                                        user.save((err, result) => {
                                            io.to(`${req.body.socket}`).emit('withdraw', items);
                                        })
                                    }
                                    console.log('OFFER', offer)
                                });
                            }, 10000);
                            if (err) {
                                console.log(err);
                            } else {
                                io.to(`${req.body.socket}`).emit('info', `Sent offer. Status: ${status}.`);
                                console.log(`Sent offer. Status: ${status}.`);
                            }
                        });
                    }
                });
            } else {
                io.to(`${req.body.socket}`).emit('error', 'Set tradelink, please')
            }
        })
        .catch(err => res.send(err));
    } catch (e) {
        console.log(e.message)
    }
};

