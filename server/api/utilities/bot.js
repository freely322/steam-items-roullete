import config from "../../../config";
const SteamTotp = require('steam-totp');
const TradeOfferManager = require('steam-tradeoffer-manager');
const SteamCommunity = require('steamcommunity');
const SteamUser = require('steam-user');

export const client = new SteamUser();
export let community = new SteamCommunity();
export const manager = new TradeOfferManager({
  "steam": client,
  "domain": `https://${config.host}`,
  "community": community,
  "pollInterval": 5000,
  "language": 'en'
});

let firstCode = SteamTotp.generateAuthCode(config.steamSecret);

let code = setInterval(() => {
  console.log('Steam guard code: ', SteamTotp.generateAuthCode(config.steamSecret))
}, 1500);

const clientLogOn = () => {
  client.logOn({
    "accountName": "arktrixdub",
    "password": "sk8erdude",
    twoFactorCode: SteamTotp.generateAuthCode(config.steamSecret)
  });
  client.on('loggedOn', () => {
    clearInterval(code);
    console.log('Logged into Steam by bot');
    client.setPersona(SteamUser.EPersonaState.Online);
    client.gamesPlayed(570);
  });
};

export const tryToClientLogOn = () => {
  if (SteamTotp.generateAuthCode(config.steamSecret) !== firstCode) {
    clientLogOn()
  } else {
    setTimeout(tryToClientLogOn, 30000)
  }
};

export const communityLogin = () => {
  community.login(
  {
    "accountName": config.bot.username,
    "password": config.bot.password,
    "twoFactorCode": SteamTotp.generateAuthCode(config.steamSecret),
    "disableMobile": false
  },
  (err, sessionID, cookies, steamguard, oAuthToken) => {
    if (err) {
      console.log(err)
    } else {
      console.log(sessionID);
      console.log(cookies);
      console.log(steamguard);
      console.log(oAuthToken)
    }
  });
};

client.on('webSession', (sessionid, cookies) => {
  manager.setCookies(cookies);
  community.setCookies(cookies);
  manager.apiKey = config.steamAPI;
  setInterval(() => {
    SteamTotp.getTimeOffset((err, offset) => {
      if (err) {
        console.log(err);
      } else {
        let timeNew = SteamTotp.time(offset);
        let confkey = SteamTotp.getConfirmationKey(config.steamIdentitySecret, timeNew, 'conf');
        let allowKey = SteamTotp.getConfirmationKey(config.steamIdentitySecret, timeNew, 'allow');
        community.acceptAllConfirmations(timeNew, confkey, allowKey, function(err, confs) {
          if (err) {
            console.log('Confirmation error: ', err);
            communityLogin();
          } else {
            console.log('All Confirmed. ', confs);
          }
        });
      }
    })
  }, 30000)
});