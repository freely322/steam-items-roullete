import https from "https";
import Item from "../../../models/item";

export const parseItems = (i, total) => {
  setTimeout(() => {
    if (i * 100 < total) {
      setTimeout(() => {
        https.get(`https://steamcommunity.com/market/search/render/?start=${i * 100}&count=100&search_descriptions=0&sort_column=default&sort_dir=desc&1=english&currency=1&cc=us&appid=570&norender=1`, (resp) => {
          let data = '';
          resp.on('data', (chunk) => {
            data += chunk;
          });
          resp.on('end', () => {
            try {
              data = JSON.parse(data);
              if (data.success) {
                if (data.total_count > total) {
                  total = data.total_count
                }
                data.results.map(item => {
                  Item.find({classid: item.asset_description.classid}, (err, items) => {
                    if (err) {
                      return console.log(err)
                    }
                    if (items.length === 0) {
                      Item.create({
                        classid: item.asset_description.classid,
                        instanceid: item.asset_description.instanceid,
                        sell_price: item.sell_price,
                        name: item.name,
                        hash_name: item.hash_name,
                        sell_listings: item.sell_listings
                      })
                    } else {
                      if (items[0].sell_price !== item.sell_price) {
                        items[0].sell_price = item.sell_price;
                        items[0].save()
                      }
                    }
                  })
                });
                parseItems(i + 1, total)
              } else {
                parseItems(i, total)
              }
            } catch (e) {
              console.log('Error while parsing JSON');
              setTimeout(() => {parseItems(i, total)}, 30000)
            }
          });
        })
      }, Math.random() * 30000)
    } else {
      parseItems(0, 1)
    }
  }, 0)
};