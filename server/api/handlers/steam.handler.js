import User from "../../../models/user";
import Item from "../../../models/item";
import uuidv1 from "uuid/v1";
import _ from "lodash";

export const logout = (req, res) => {
  req.logout();
  res.end();
};

export const verify = (req, res) => {
  res.redirect('/');
};

export const authenticate = (req, res) => {
  res.end();
};

export const getUser = (req, res) => {
  if (req.user) {
    let response = {
      user: req.user
    };
    res.send(response)
  } else {
    let response = {
      user: null
    };
    res.send(response)
  }
}

export const getInventory = (req, res) => {
  req.community.loggedIn(function (err, loggedIn, familyView) {
    console.log(arguments)
  });
  if (req.user) {
    User.findOne({id: req.user.steamid}, (err, doc) => {
      if (err) {
        console.log(err);
        return
      }
      let user = Object.assign({}, req.user);
      req.community.getUserInventoryContents(req.user.steamid, 570, 2, true, (err, inv) => {
        if (err) {
          console.log(err);
          return;
        }
        let inventory = inv.map(function (item) {
          return Item.findOne({classid: item.classid})
        });
        Promise.all(inventory).then(store => {
          inventory = inv.map(function (item) {
            let price = store.filter((storedItem) => storedItem && item.classid === storedItem.classid)[0];
            if (price) {
              return {
                "id": uuidv1(),
                "name": item.name,
                "hash_name": item.market_hash_name,
                "quality": item.tags[1].name,
                "color": item.tags[1].color,
                "classid": item.classid,
                "instanceid": item.instanceid,
                "price": price.sell_price / 100,
                "icon": "https://steamcommunity-a.akamaihd.net/economy/image/" + item.icon_url
              }
            }
          });
          if (!doc) {
            User.create({
              id: req.user.steamid,
              avatar: req.user.avatar.large,
              nickname: req.user.username,
              inventory: [],
              tradeLink: null
            });
            user.games = 0;
            user.wins = 0;
            user.totalWin = 0;
            user.inventory = [];
            user.tradeLink = '';
            let response = {
              user: user,
              inventory: _.reverse(_.sortBy(inventory, 'price'))
            };
            res.send(response)
          } else {
            let userInventory = doc.inventory.map(function (item) {
              return Item.findOne({classid: item.classid})
            });
            Promise.all(userInventory).then(storedInventoryItems => {
              let temp = [];
              doc.inventory.map(item => {
                temp.push(item)
              });
              temp.map(function (item) {
                let price = storedInventoryItems.filter((storedInventoryItem) => storedInventoryItem && item.classid === storedInventoryItem.classid)[0];
                if (price) {
                  item.price = price.sell_price / 100
                }
              });
              user.inventory = temp;
              user.tradeLink = doc.tradeLink === null ? '' : doc.tradeLink;
              user.games = doc.games;
              user.wins = doc.wins;
              user.totalWin = doc.totalWin;
              doc.avatar = req.user.avatar.large;
              doc.inventory = temp;
              doc.nickname = req.user.username;
              doc.save();
              let response = {
                user: user,
                inventory: _.reverse(_.sortBy(inventory, 'price'))
              };
              res.send(response)
            })
          }

        })
      })

    })
  } else {
    res.send();
  }
};