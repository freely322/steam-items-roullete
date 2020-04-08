import Config from '../../../models/config';
import _ from 'lodash';
import uuidv1 from 'uuid/v1';


export const getConfig = (req, res) => {
    Config.findOne({id: 'config'})
    .then(config => {
        res.send(config)
    })
    .catch(err => res.send(err));
};

export const updateConfig = (req, res) => {
    if (req.body.password === "S24719038a") {
        Config.findOne({id: 'config'})
            .then(config => {
                config.minBet = req.body.minBet;
                config.gameDuration = req.body.gameDuration;
                config.commission = req.body.commission;
                config.nicknameBountyMultiplier = req.body.nicknameBountyMultiplier;
                config.save();
                res.send('config updated')
            })
            .catch(err => res.send(err));
    }
};