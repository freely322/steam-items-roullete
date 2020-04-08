import Express from 'express'
import * as gameHandler from "../handlers/game.handler";

const router = Express.Router();
router.get('/games', gameHandler.getAll);
router.get('/games/winners', gameHandler.getWinners);
router.get('/game/:id', gameHandler.getOne);
router.get('/game', gameHandler.getCurrent);
router.post('/bet', gameHandler.placeBet);
module.exports = router;
