import './threejs-override.js'
import { Game } from './Game/Game.js'
import { installMomoProfile } from './Game/MomoProfile.js'
import { installMomoHud } from './Game/MomoBrand.js'
installMomoProfile()
installMomoHud()
import consoleLog from './data/consoleLog.js'

if(import.meta.env.VITE_LOG)
    console.log(
        ...consoleLog
    )

if(import.meta.env.VITE_GAME_PUBLIC)
    window.game = new Game()
else
    new Game()