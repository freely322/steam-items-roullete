import Express from 'express'
const steam = require('steam-login');
import { logout, verify, authenticate, getUser, getInventory } from "../handlers/steam.handler";

const router = Express.Router();

router.get('/authenticate', steam.authenticate(), authenticate);

router.get('/verify', steam.verify(), verify);

router.get('/logout', steam.enforceLogin('/'), logout);

router.get('/inventory', getInventory);

router.get('/user', getUser);

module.exports = router;