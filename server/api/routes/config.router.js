import Express from 'express'
import * as configHandler from "../handlers/config.handler";

const router = Express.Router();
router.get('/config', configHandler.getConfig);
router.post('/config/updateConfig', configHandler.updateConfig);
module.exports = router;
